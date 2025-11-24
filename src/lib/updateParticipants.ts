import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { newParticipants, NewParticipant } from '../data/newParticipants.js';

// Load environment variables from .env file
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error('❌ Error: Firebase configuration is missing! Ensure VITE_FIREBASE_* env vars are set.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadFacultyMap(): Promise<Record<string, string>> {
  const snapshot = await getDocs(collection(db, 'faculties'));
  const map: Record<string, string> = {};
  snapshot.forEach((d) => {
    const data = d.data() as { name?: string };
    const name = (data?.name ?? d.id).toString();
    map[name.toLowerCase()] = d.id; // map by case-insensitive name
    map[d.id.toLowerCase()] = d.id; // also map by id if used as code
  });
  return map;
}

async function loadAllEventIds(): Promise<string[]> {
  const snapshot = await getDocs(collection(db, 'events'));
  const ids: string[] = [];
  snapshot.forEach((d) => ids.push(d.id));
  if (ids.length === 0) {
    throw new Error('No events found. Cannot assign events to participants.');
  }
  return ids;
}

async function clearParticipants() {
  const snapshot = await getDocs(collection(db, 'participants'));
  const deletes = snapshot.docs.map((d) => deleteDoc(doc(db, 'participants', d.id)));
  await Promise.all(deletes);
  return snapshot.size;
}

function validateDataset(dataset: NewParticipant[]) {
  if (!Array.isArray(dataset)) {
    throw new Error('Dataset is not an array.');
  }
  for (const [i, p] of dataset.entries()) {
    if (!p.name || !p.faculty) {
      throw new Error(`Dataset entry at index ${i} is missing required fields (name, faculty).`);
    }
  }
}

async function run() {
  console.log('👥 Updating participants collection...');

  validateDataset(newParticipants);

  const facultyMap = await loadFacultyMap();
  const allEventIds = await loadAllEventIds();

  console.log('• Faculties loaded:', Object.keys(facultyMap).length);
  console.log('• Events loaded:', allEventIds.length);

  const deleted = await clearParticipants();
  console.log(`✓ Cleared ${deleted} existing participant(s)`);

  let created = 0;
  for (const p of newParticipants) {
    const facultyKey = p.faculty.trim().toLowerCase();
    const facultyId = facultyMap[facultyKey];
    if (!facultyId) {
      throw new Error(`Faculty not found in Firestore for participant "${p.name}": "${p.faculty}"`);
    }

    const participantDoc = {
      name: p.name,
      facultyId,
      alias: p.alias ?? undefined,
      events: allEventIds, // enable ALL events for each participant
    } as const;

    await addDoc(collection(db, 'participants'), participantDoc);
    created += 1;
  }

  console.log(`✅ Inserted ${created} participant(s).`);
  console.log('\nNote: Active participants may reference old IDs. Use the Admin panel to set new active participants after this update.');
}

run()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Update failed:', err);
    process.exit(1);
  });
