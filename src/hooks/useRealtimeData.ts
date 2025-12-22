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
import type { Assignment } from '@/types';

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

// Hook for current assignment (to know which round is active)
export function useCurrentAssignment() {
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(
    null
  );

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Assignment>(
      'assignments',
      (data) => {
        // Look for first assignment with status pending or in-progress and highest roundNumber
        const candidates = data.filter((a) =>
          ['pending', 'in-progress'].includes((a as any).status)
        );
        if (candidates.length === 0) {
          setCurrentAssignment(null);
          return;
        }
        const sorted = candidates.sort(
          (a, b) => (b as any).roundNumber - (a as any).roundNumber
        );
        setCurrentAssignment(sorted[0] as Assignment);
      }
    );

    return () => unsubscribe();
  }, []);

  return { currentAssignment };
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
  const { currentAssignment } = useCurrentAssignment();
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

    // Apply combat two-judge averaging before calculating totals
    events.forEach((event) => {
      if (event.name === 'Boxing Combat') {
        scoresByFacultyEvent.forEach((eventScores) => {
          const combatScores = eventScores.get(event.id);
          if (!combatScores || combatScores.length === 0) return;

          // Group by participant and judge
          const scoresByParticipant = new Map<string, Score[]>();
          combatScores.forEach((score) => {
            if (!scoresByParticipant.has(score.participantId)) {
              scoresByParticipant.set(score.participantId, []);
            }
            scoresByParticipant.get(score.participantId)!.push(score);
          });

          // Average scores from two judges per participant
          const averagedScores: Score[] = [];
          scoresByParticipant.forEach((participantScores) => {
            const scoresByJudge = new Map<string, Score[]>();
            participantScores.forEach((s) => {
              if (!scoresByJudge.has(s.invigilatorId)) {
                scoresByJudge.set(s.invigilatorId, []);
              }
              scoresByJudge.get(s.invigilatorId)!.push(s);
            });

            const latestScores = Array.from(scoresByJudge.values())
              .map((arr) => arr.sort((a, b) => b.timestamp - a.timestamp)[0])
              .filter(Boolean);

            if (latestScores.length >= 2) {
              const [score1, score2] = latestScores.slice(0, 2);
              averagedScores.push({
                ...score1,
                total: (score1.total + score2.total) / 2,
                invigilatorId: 'averaged',
              });
            } else if (latestScores.length === 1) {
              averagedScores.push(latestScores[0]);
            }
          });

          eventScores.set(event.id, averagedScores);
        });
      }
    });

    // Calculate totals for each faculty
    scoresByFacultyEvent.forEach((eventScores, facultyId) => {
      const facultyTotal = totalsMap.get(facultyId);
      if (!facultyTotal) return;

      eventScores.forEach((eventScoresList, eventId) => {
        const event = events.find((e) => e.id === eventId);
        if (!event) return;

        // Special handling for Skipping (Phase 1 two rounds)
        if (event.name === 'Skipping') {
          // group scores by round
          const r1 = eventScoresList.find((s) => s.roundNumber === 1);
          const r2 = eventScoresList.find((s) => s.roundNumber === 2);

          let eventScore = 0;
          let avgInfo = { total: 0, count: 0, average: 0 };

          // If both rounds exist, compute final skipping average
          if (r1 && r2) {
            const final = ((r1.total || 0) + (r2.total || 0)) / 2;
            eventScore = final;
            avgInfo = {
              total: (r1.total || 0) + (r2.total || 0),
              count: 2,
              average: final,
            };
          } else {
            // Only one round present: show appropriate round depending on current assignment round
            const currentRound = currentAssignment?.roundNumber || 1;
            if (currentRound === 1 && r1) {
              eventScore = r1.total || 0;
              avgInfo = {
                total: r1.total || 0,
                count: 1,
                average: r1.total || 0,
              };
            } else if (currentRound === 2 && r2) {
              eventScore = r2.total || 0;
              avgInfo = {
                total: r2.total || 0,
                count: 1,
                average: r2.total || 0,
              };
            } else {
              eventScore = 0;
              avgInfo = { total: 0, count: 0, average: 0 };
            }
          }

          facultyTotal.eventTotals[eventId] = eventScore;
          facultyTotal.eventAverages[eventId] = avgInfo;

          if (event.phase === 1) {
            facultyTotal.phase1Total += eventScore;
          } else if (event.phase === 2) {
            facultyTotal.phase2Total += eventScore;
          }
          return;
        }

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
