import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Faculty,
  Participant,
  Event,
  Template,
  Invigilator,
  Score,
  Assignment,
  PinAuth,
  FacultyTotals,
  ActiveParticipants,
} from '@/types';

// Generic CRUD helpers
export async function addDocument<T>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
}

export async function getDocument<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
}

export async function updateDocument(
  collectionName: string,
  id: string,
  data: Partial<DocumentData>
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
}

export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

export async function getDocuments<T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
}

// Realtime listener
export function subscribeToCollection<T>(
  collectionName: string,
  callback: (data: T[]) => void,
  ...constraints: QueryConstraint[]
) {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    callback(data);
  });
}

// PIN Authentication
export async function verifyPin(pin: string): Promise<PinAuth | null> {
  const pinsRef = collection(db, 'pins');
  const q = query(pinsRef, where('pin', '==', pin));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const pinDoc = querySnapshot.docs[0];
  return pinDoc.data() as PinAuth;
}

// Faculty helpers
export async function getFaculties(): Promise<Faculty[]> {
  return getDocuments<Faculty>('faculties', orderBy('order'));
}

export async function addFaculty(
  faculty: Omit<Faculty, 'id'>
): Promise<string> {
  return addDocument<Faculty>('faculties', faculty);
}

// Participant helpers
export async function getParticipants(
  facultyId?: string
): Promise<Participant[]> {
  if (facultyId) {
    return getDocuments<Participant>(
      'participants',
      where('facultyId', '==', facultyId)
    );
  }
  return getDocuments<Participant>('participants');
}

export async function addParticipant(
  participant: Omit<Participant, 'id'>
): Promise<string> {
  return addDocument<Participant>('participants', participant);
}

// Event helpers
export async function getEvents(): Promise<Event[]> {
  return getDocuments<Event>('events', orderBy('order'));
}

export async function addEvent(event: Omit<Event, 'id'>): Promise<string> {
  return addDocument<Event>('events', event);
}

// Template helpers
export async function getTemplates(): Promise<Template[]> {
  return getDocuments<Template>('templates');
}

export async function addTemplate(
  template: Omit<Template, 'id'>
): Promise<string> {
  return addDocument<Template>('templates', template);
}

// Invigilator helpers
export async function getInvigilators(): Promise<Invigilator[]> {
  return getDocuments<Invigilator>('invigilators');
}

export async function addInvigilator(
  invigilator: Omit<Invigilator, 'id'>
): Promise<string> {
  return addDocument<Invigilator>('invigilators', invigilator);
}

// Score helpers
export async function addScore(score: Omit<Score, 'id'>): Promise<string> {
  try {
    // Add the score document first
    const id = await addDocument<Score>('scores', score);

    // Special handling for Skipping event: store round-specific fields and compute final when both rounds available
    try {
      const eventDoc = await getDocument<Event>('events', score.eventId);
      if (eventDoc && eventDoc.name === 'Skipping') {
        // If round 1, update the created doc with skippingRound1Score
        const scoresRef = collection(db, 'scores');
        if (score.roundNumber === 1) {
          const docRef = doc(db, 'scores', id);
          await updateDoc(docRef, { skippingRound1Score: score.total });
        }

        // If round 2, find corresponding round 1 score for same participant AND invigilator to prevent mismatches
        if (score.roundNumber === 2) {
          // Find the matching round 1 score by participantId + invigilatorId (most specific match)
          const q = query(
            scoresRef,
            where('eventId', '==', score.eventId),
            where('participantId', '==', score.participantId),
            where('invigilatorId', '==', score.invigilatorId),
            where('roundNumber', '==', 1)
          );
          const querySnapshot = await getDocs(q);
          let round1Total: number | null = null;
          let round1DocId: string | null = null;
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            round1Total = docSnap.data().total;
            round1DocId = docSnap.id;
          }

          const round2Total = score.total;
          const docRef2 = doc(db, 'scores', id);

          // Update round2 doc with its round value
          const updates: any = { skippingRound2Score: round2Total };

          if (round1Total !== null) {
            const final = (round1Total + round2Total) / 2;
            updates.skippingFinalScore = final;

            // Also update the round1 doc to include skippingRound1Score (if not present)
            if (round1DocId) {
              const round1Ref = doc(db, 'scores', round1DocId);
              const r1Snap = await getDoc(round1Ref);
              if (r1Snap.exists()) {
                const r1Data = r1Snap.data();
                const r1Updates: any = {};
                if (r1Data && r1Data.skippingRound1Score === undefined) {
                  r1Updates.skippingRound1Score = round1Total;
                }
                if (Object.keys(r1Updates).length > 0) {
                  await updateDoc(round1Ref, r1Updates);
                }
              }
            }
          }

          await updateDoc(docRef2, updates);
        }
      }
    } catch (err) {
      // Non-fatal: log and continue
      console.error('Skipping special handling error:', err);
    }

    return id;
  } catch (error) {
    console.error('Error adding score:', error);
    throw error;
  }
}

export async function getScoresByEvent(eventId: string): Promise<Score[]> {
  return getDocuments<Score>('scores', where('eventId', '==', eventId));
}

export async function getScoresByFaculty(facultyId: string): Promise<Score[]> {
  return getDocuments<Score>('scores', where('facultyId', '==', facultyId));
}

export async function checkExistingScore(
  eventId: string,
  participantIds: string[],
  invigilatorId: string,
  facultyId?: string,
  roundNumber?: number
): Promise<boolean> {
  try {
    const scoresRef = collection(db, 'scores');
    const constraints: any[] = [
      where('eventId', '==', eventId),
      where('invigilatorId', '==', invigilatorId),
    ];
    if (roundNumber !== undefined) {
      constraints.push(where('roundNumber', '==', roundNumber));
    }
    const q = query(scoresRef, ...constraints);
    const querySnapshot = await getDocs(q);

    // For multiple participants (combat), check if these SPECIFIC participants have been scored
    if (participantIds.length > 1) {
      // Combat event - check if these exact participants have ALL been scored
      const scoredParticipantIds = querySnapshot.docs.map(
        (doc) => doc.data().participantId
      );

      // Every participant in participantIds must have a score
      return participantIds.every((id) => scoredParticipantIds.includes(id));
    } else {
      // Single participant event
      // For events with 1 participant per faculty (like Skipping), check if ANY participant from this faculty has been scored
      if (facultyId) {
        const hasScoreForFaculty = querySnapshot.docs.some((doc) => {
          const scoreData = doc.data();
          return scoreData.facultyId === facultyId;
        });
        if (hasScoreForFaculty) {
          return true; // Faculty already scored by this invigilator for the given round (if roundNumber used)
        }
      }

      // Otherwise, check if this specific participant has been scored
      const hasScore = querySnapshot.docs.some((doc) => {
        const scoreData = doc.data();
        return participantIds.includes(scoreData.participantId);
      });
      return hasScore;
    }
  } catch (error) {
    console.error('Error checking existing score:', error);
    return false;
  }
}

// Assignment helpers
export async function getCurrentAssignment(): Promise<Assignment | null> {
  const assignments = await getDocuments<Assignment>(
    'assignments',
    where('status', 'in', ['pending', 'in-progress']),
    orderBy('roundNumber', 'desc')
  );
  return assignments[0] || null;
}

export async function addAssignment(
  assignment: Omit<Assignment, 'id'>
): Promise<string> {
  return addDocument<Assignment>('assignments', assignment);
}

// Faculty totals aggregation (client-side)
export async function calculateFacultyTotals(): Promise<FacultyTotals[]> {
  const faculties = await getFaculties();
  const allScores = await getDocuments<Score>('scores');

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

  allScores.forEach((score) => {
    const facultyTotal = totalsMap.get(score.facultyId);
    if (facultyTotal) {
      if (!facultyTotal.eventTotals[score.eventId]) {
        facultyTotal.eventTotals[score.eventId] = 0;
      }
      facultyTotal.eventTotals[score.eventId] += score.total;
      facultyTotal.totalScore += score.total;
    }
  });

  return Array.from(totalsMap.values());
}

// Active Participants helpers
export async function getActiveParticipants(): Promise<ActiveParticipants | null> {
  const docs = await getDocs(collection(db, 'activeParticipants'));
  if (docs.empty) {
    return null;
  }
  const data = docs.docs[0].data();
  return {
    id: docs.docs[0].id,
    skipping: data.skipping || null,
    shadowBoxing: data.shadowBoxing || null,
    punchingBag: data.punchingBag || null,
    combat: {
      participant1: data.combat?.participant1 || null,
      participant2: data.combat?.participant2 || null,
    },
    activeSkippingRound: data.activeSkippingRound || 1,
    activePhase: data.activePhase || 1,
  } as ActiveParticipants;
}

export async function setActiveParticipants(
  data: Omit<ActiveParticipants, 'id'>
): Promise<void> {
  const docs = await getDocs(collection(db, 'activeParticipants'));
  if (docs.empty) {
    await addDoc(collection(db, 'activeParticipants'), data);
  } else {
    const docRef = doc(db, 'activeParticipants', docs.docs[0].id);
    await updateDoc(docRef, data);
  }
}

export function subscribeToActiveParticipants(
  callback: (data: ActiveParticipants | null) => void
) {
  return onSnapshot(collection(db, 'activeParticipants'), (snapshot) => {
    if (snapshot.empty) {
      callback(null);
    } else {
      const docData = snapshot.docs[0].data();
      callback({
        id: snapshot.docs[0].id,
        skipping: docData.skipping || null,
        shadowBoxing: docData.shadowBoxing || null,
        punchingBag: docData.punchingBag || null,
        combat: {
          participant1: docData.combat?.participant1 || null,
          participant2: docData.combat?.participant2 || null,
        },
        activeSkippingRound: docData.activeSkippingRound || 1,
        activePhase: docData.activePhase || 1,
      } as ActiveParticipants);
    }
  });
}

// Utility functions for testing/development
export async function clearAllScores(): Promise<void> {
  try {
    const scoresRef = collection(db, 'scores');
    const querySnapshot = await getDocs(scoresRef);

    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));

    await Promise.all(deletePromises);
    console.log(`Deleted ${querySnapshot.docs.length} scores`);
  } catch (error) {
    console.error('Error clearing scores:', error);
    throw error;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    const collections = [
      'scores',
      'participants',
      'events',
      'templates',
      'faculties',
      'invigilators',
      'activeParticipants',
    ];

    let totalDeleted = 0;

    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(collectionRef);

      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      console.log(
        `Deleted ${querySnapshot.docs.length} documents from ${collectionName}`
      );
      totalDeleted += querySnapshot.docs.length;
    }

    console.log(
      `Total deleted: ${totalDeleted} documents across all collections`
    );
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}

export async function populateDefaultEvents(): Promise<void> {
  try {
    // Check if events already exist
    const existingEvents = await getEvents();
    if (existingEvents.length > 0) {
      console.log('Events already exist, skipping population');
      return;
    }

    const defaultEvents: Array<Omit<Event, 'id'>> = [
      {
        name: 'Shadow Boxing',
        shortName: 'Shadow',
        templateId: '', // Will be set in admin
        order: 1,
        isCombat: false,
        phase: 1,
        participantsRequired: 2,
      },
      {
        name: 'Heavy Bag',
        shortName: 'Bag',
        templateId: '', // Will be set in admin
        order: 2,
        isCombat: false,
        phase: 1,
        participantsRequired: 2,
      },
      {
        name: 'Skipping',
        shortName: 'Skip',
        templateId: '', // Will be set in admin
        order: 3,
        isCombat: false,
        phase: 1,
        participantsRequired: 1,
      },
      {
        name: 'Boxing Combat',
        shortName: 'Combat',
        templateId: '', // Will be set in admin
        order: 4,
        isCombat: true,
        phase: 2,
        participantsRequired: 2,
      },
    ];

    const addPromises = defaultEvents.map((event) => addEvent(event));
    await Promise.all(addPromises);

    console.log(`Successfully added ${defaultEvents.length} default events`);
  } catch (error) {
    console.error('Error populating default events:', error);
    throw error;
  }
}

export async function populateDummyScores(): Promise<void> {
  try {
    // Get all necessary data
    const [participantsData, eventsData, invigilatorsData, templatesData] =
      await Promise.all([
        getDocuments<Participant>('participants'),
        getDocuments<Event>('events'),
        getDocuments<Invigilator>('invigilators'),
        getDocuments<Template>('templates'),
      ]);

    if (
      participantsData.length === 0 ||
      eventsData.length === 0 ||
      invigilatorsData.length === 0
    ) {
      throw new Error(
        'Need at least one participant, event, and invigilator to generate dummy scores'
      );
    }

    const scores: Array<Omit<Score, 'id'>> = [];

    // Generate scores for each event
    for (const event of eventsData) {
      const template = templatesData.find((t) => t.id === event.templateId);
      if (!template) continue;

      // Filter participants assigned to this event
      const eventParticipants = participantsData.filter((p) =>
        p.events.includes(event.id!)
      );

      // Find the invigilator assigned to this event
      const invigilator = invigilatorsData.find((inv) =>
        inv.eventsAssigned?.includes(event.id!)
      );
      if (!invigilator) continue;

      // Group participants by faculty
      const participantsByFaculty = new Map<string, Participant[]>();
      for (const participant of eventParticipants) {
        if (!participantsByFaculty.has(participant.facultyId)) {
          participantsByFaculty.set(participant.facultyId, []);
        }
        participantsByFaculty.get(participant.facultyId)!.push(participant);
      }

      // Score participants according to event requirements
      for (const [_facultyId, facultyParticipants] of participantsByFaculty) {
        // For each faculty, only score up to participantsRequired number of participants
        const participantsToScore = facultyParticipants.slice(
          0,
          event.participantsRequired
        );

        for (const participant of participantsToScore) {
          // Generate random scores for each criteria
          const criteriaScores = template.criteria.map((criteria) => ({
            criteriaId: criteria.id,
            score: Math.floor(Math.random() * (criteria.maxPoints + 1)),
          }));

          const total = criteriaScores.reduce((sum, cs) => sum + cs.score, 0);

          // Round 1 score
          scores.push({
            eventId: event.id!,
            templateId: template.id!,
            participantId: participant.id!,
            facultyId: participant.facultyId,
            invigilatorId: invigilator.id!,
            roundNumber: 1,
            criteriaScores,
            total,
            timestamp: Date.now() - Math.floor(Math.random() * 86400000), // Random time in last 24h
          });

          // For Skipping event, also add Round 2 scores
          if (event.name === 'Skipping') {
            const criteriaScoresR2 = template.criteria.map((criteria) => ({
              criteriaId: criteria.id,
              score: Math.floor(Math.random() * (criteria.maxPoints + 1)),
            }));

            const totalR2 = criteriaScoresR2.reduce(
              (sum, cs) => sum + cs.score,
              0
            );

            scores.push({
              eventId: event.id!,
              templateId: template.id!,
              participantId: participant.id!,
              facultyId: participant.facultyId,
              invigilatorId: invigilator.id!,
              roundNumber: 2,
              criteriaScores: criteriaScoresR2,
              total: totalR2,
              timestamp: Date.now() - Math.floor(Math.random() * 43200000), // Random time in last 12h (after R1)
            });
          }
        }
      }
    }

    // Add all scores to Firestore
    const addPromises = scores.map((score) => addScore(score));
    await Promise.all(addPromises);

    console.log(`Successfully added ${scores.length} dummy scores`);
  } catch (error) {
    console.error('Error populating dummy scores:', error);
    throw error;
  }
}
