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
  ActiveParticipants,
  AuditLog,
  ScoreBackup,
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
export async function addScore(
  score: Omit<Score, 'id'>,
  userInfo?: {
    userId: string;
    userName: string;
    userRole: 'invigilator' | 'admin';
  }
): Promise<string> {
  try {
    const id = await addDocument<Score>('scores', score);

    // Log the score creation in audit logs
    if (userInfo) {
      await logAudit({
        action: 'create',
        collectionName: 'scores',
        documentId: id,
        userId: userInfo.userId,
        userName: userInfo.userName,
        userRole: userInfo.userRole,
        timestamp: Date.now(),
        details: {
          eventId: score.eventId,
          participantId: score.participantId,
          facultyId: score.facultyId,
          newData: {
            total: score.total,
            roundNumber: score.roundNumber,
          },
        },
      });
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
  invigilatorId: string
): Promise<boolean> {
  try {
    const scoresRef = collection(db, 'scores');
    const q = query(
      scoresRef,
      where('eventId', '==', eventId),
      where('invigilatorId', '==', invigilatorId)
    );
    const querySnapshot = await getDocs(q);

    // Check if any score matches one of the participant IDs
    const hasScore = querySnapshot.docs.some((doc) => {
      const scoreData = doc.data();
      return participantIds.includes(scoreData.participantId);
    });

    return hasScore;
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
      } as ActiveParticipants);
    }
  });
}

// Audit Log helpers
export async function logAudit(
  auditData: Omit<AuditLog, 'id'>
): Promise<string> {
  try {
    const id = await addDocument<AuditLog>('auditLogs', auditData);
    return id;
  } catch (error) {
    console.error('Error logging audit:', error);
    throw error;
  }
}

export async function getAuditLogs(filters?: {
  action?: AuditLog['action'];
  userId?: string;
  startDate?: number;
  endDate?: number;
}): Promise<AuditLog[]> {
  const constraints: QueryConstraint[] = [orderBy('timestamp', 'desc')];

  if (filters?.action) {
    constraints.push(where('action', '==', filters.action));
  }
  if (filters?.userId) {
    constraints.push(where('userId', '==', filters.userId));
  }
  if (filters?.startDate) {
    constraints.push(where('timestamp', '>=', filters.startDate));
  }
  if (filters?.endDate) {
    constraints.push(where('timestamp', '<=', filters.endDate));
  }

  return getDocuments<AuditLog>('auditLogs', ...constraints);
}

// Backup/Restore helpers
export async function exportScoresBackup(
  exportedBy: string
): Promise<ScoreBackup> {
  const scores = await getDocuments<Score>('scores');
  const events = await getDocuments<Event>('events');
  const faculties = await getDocuments<Faculty>('faculties');

  const backup: ScoreBackup = {
    version: '1.0',
    timestamp: Date.now(),
    exportedBy,
    scores,
    metadata: {
      totalScores: scores.length,
      events: events.map((e) => e.id),
      faculties: faculties.map((f) => f.id),
    },
  };

  return backup;
}

export async function downloadBackup(exportedBy: string): Promise<void> {
  const backup = await exportScoresBackup(exportedBy);

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scores-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Log the backup
  await logAudit({
    action: 'create',
    collectionName: 'backups',
    documentId: `backup-${backup.timestamp}`,
    userId: exportedBy,
    userName: exportedBy,
    userRole: 'admin',
    timestamp: Date.now(),
    details: {
      reason: 'Scores backup downloaded',
    },
  });
}

export async function restoreScoresFromBackup(
  backup: ScoreBackup,
  restoredBy: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const score of backup.scores) {
    try {
      const { id, ...scoreData } = score;
      await addDoc(collection(db, 'scores'), scoreData);
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Failed to restore score ${score.id}: ${error}`);
    }
  }

  // Log the restore
  await logAudit({
    action: 'restore',
    collectionName: 'scores',
    documentId: `restore-${Date.now()}`,
    userId: restoredBy,
    userName: restoredBy,
    userRole: 'admin',
    timestamp: Date.now(),
    details: {
      reason: `Restored ${results.success} scores from backup`,
      oldData: {
        backupTimestamp: backup.timestamp,
        totalScores: backup.scores.length,
      },
      newData: results,
    },
  });

  return results;
}

export async function uploadAndRestoreBackup(
  file: File,
  restoredBy: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string) as ScoreBackup;

        // Validate backup structure
        if (
          !backup.version ||
          !backup.scores ||
          !Array.isArray(backup.scores)
        ) {
          reject(new Error('Invalid backup file format'));
          return;
        }

        const results = await restoreScoresFromBackup(backup, restoredBy);
        resolve(results);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read backup file'));
    reader.readAsText(file);
  });
}
