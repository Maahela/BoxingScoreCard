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
  Timestamp,
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
    console.log('Adding score:', score);
    const id = await addDocument<Score>('scores', score);
    console.log('Score added successfully with ID:', id);
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
