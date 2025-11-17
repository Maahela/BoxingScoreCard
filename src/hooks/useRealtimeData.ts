import { useEffect, useState } from 'react';
import { subscribeToCollection } from '@/lib/firestoreHelpers';
import type {
  Score,
  Faculty,
  Participant,
  Event,
  Template,
  FacultyTotals,
} from '@/types';
import { where, orderBy } from 'firebase/firestore';

// Hook for realtime scores by event
export function useRealtimeScores(eventId?: string) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const constraints = eventId ? [where('eventId', '==', eventId)] : [];

    const unsubscribe = subscribeToCollection<Score>(
      'scores',
      (data) => {
        setScores(data);
        setLoading(false);
      },
      ...constraints
    );

    return () => unsubscribe();
  }, [eventId]);

  return { scores, loading };
}

// Hook for realtime faculties
export function useRealtimeFaculties() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Faculty>(
      'faculties',
      (data) => {
        setFaculties(data);
        setLoading(false);
      },
      orderBy('order')
    );

    return () => unsubscribe();
  }, []);

  return { faculties, loading };
}

// Hook for realtime participants
export function useRealtimeParticipants(facultyId?: string) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const constraints = facultyId ? [where('facultyId', '==', facultyId)] : [];

    const unsubscribe = subscribeToCollection<Participant>(
      'participants',
      (data) => {
        setParticipants(data);
        setLoading(false);
      },
      ...constraints
    );

    return () => unsubscribe();
  }, [facultyId]);

  return { participants, loading };
}

// Hook for realtime events
export function useRealtimeEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Event>(
      'events',
      (data) => {
        setEvents(data);
        setLoading(false);
      },
      orderBy('order')
    );

    return () => unsubscribe();
  }, []);

  return { events, loading };
}

// Hook for realtime templates
export function useRealtimeTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Template>('templates', (data) => {
      setTemplates(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { templates, loading };
}

// Hook for calculating faculty totals in realtime
export function useRealtimeFacultyTotals() {
  const { faculties } = useRealtimeFaculties();
  const { events } = useRealtimeEvents();
  const { scores } = useRealtimeScores();
  const [totals, setTotals] = useState<FacultyTotals[]>([]);

  useEffect(() => {
    if (faculties.length === 0 || events.length === 0) return;

    const totalsMap = new Map<string, FacultyTotals>();

    faculties.forEach((faculty) => {
      totalsMap.set(faculty.id, {
        facultyId: faculty.id,
        eventTotals: {},
        eventAverages: {},
        phase1Total: 0,
        phase2Total: 0,
        totalScore: 0,
      });
    });

    // Group scores by faculty and event
    const scoresByFacultyEvent = new Map<string, Map<string, Score[]>>();

    scores.forEach((score) => {
      if (!scoresByFacultyEvent.has(score.facultyId)) {
        scoresByFacultyEvent.set(score.facultyId, new Map());
      }
      const facultyScores = scoresByFacultyEvent.get(score.facultyId)!;

      if (!facultyScores.has(score.eventId)) {
        facultyScores.set(score.eventId, []);
      }
      facultyScores.get(score.eventId)!.push(score);
    });

    // Calculate totals for each faculty
    scoresByFacultyEvent.forEach((eventScores, facultyId) => {
      const facultyTotal = totalsMap.get(facultyId);
      if (!facultyTotal) return;

      eventScores.forEach((eventScoresList, eventId) => {
        const event = events.find((e) => e.id === eventId);
        if (!event) return;

        // Calculate sum and count for this event
        const sum = eventScoresList.reduce((acc, s) => acc + s.total, 0);
        const count = eventScoresList.length;

        // For events requiring 2 participants, use average; for 1 participant, use direct score
        let eventScore = sum;
        if (event.participantsRequired === 2 && count > 0) {
          eventScore = sum / count; // Average of 2 participants
        }

        facultyTotal.eventTotals[eventId] = eventScore;
        facultyTotal.eventAverages[eventId] = {
          total: sum,
          count: count,
          average: count > 0 ? sum / count : 0,
        };

        // Add to phase totals
        if (event.phase === 1) {
          facultyTotal.phase1Total += eventScore;
        } else if (event.phase === 2) {
          facultyTotal.phase2Total += eventScore;
        }
      });

      // Grand total = phase1 + phase2
      facultyTotal.totalScore =
        facultyTotal.phase1Total + facultyTotal.phase2Total;
    });

    setTotals(Array.from(totalsMap.values()));
  }, [faculties, events, scores]);

  return { totals, faculties, scores, events };
}
