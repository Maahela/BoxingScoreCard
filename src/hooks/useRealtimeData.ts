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
    const unsubscribe = subscribeToCollection<Template>(
      'templates',
      (data) => {
        setTemplates(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { templates, loading };
}

// Hook for calculating faculty totals in realtime
export function useRealtimeFacultyTotals() {
  const { faculties } = useRealtimeFaculties();
  const { scores } = useRealtimeScores();
  const [totals, setTotals] = useState<FacultyTotals[]>([]);

  useEffect(() => {
    if (faculties.length === 0) return;

    const totalsMap = new Map<string, FacultyTotals>();

    faculties.forEach((faculty) => {
      totalsMap.set(faculty.id, {
        facultyId: faculty.id,
        eventTotals: {},
        totalScore: 0,
      });
    });

    scores.forEach((score) => {
      const facultyTotal = totalsMap.get(score.facultyId);
      if (facultyTotal) {
        if (!facultyTotal.eventTotals[score.eventId]) {
          facultyTotal.eventTotals[score.eventId] = 0;
        }
        facultyTotal.eventTotals[score.eventId] += score.total;
        facultyTotal.totalScore += score.total;
      }
    });

    setTotals(Array.from(totalsMap.values()));
  }, [faculties, scores]);

  return { totals, faculties, scores };
}
