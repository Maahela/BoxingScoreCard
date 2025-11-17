import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Validate configuration
if (!firebaseConfig.projectId) {
  console.error('❌ Error: Firebase configuration is missing!');
  console.error(
    'Make sure your .env file exists with all VITE_FIREBASE_* variables.'
  );
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearAllData() {
  console.log('🧹 Starting database cleanup...\n');

  const collections = [
    'pins',
    'faculties',
    'participants',
    'events',
    'templates',
    'invigilators',
    'scores',
    'assignments',
    'aggregates',
  ];

  for (const collectionName of collections) {
    try {
      console.log(`Clearing ${collectionName}...`);
      const snapshot = await getDocs(collection(db, collectionName));
      const deletePromises = snapshot.docs.map((document) =>
        deleteDoc(doc(db, collectionName, document.id))
      );
      await Promise.all(deletePromises);
      console.log(
        `✓ Deleted ${snapshot.size} documents from ${collectionName}`
      );
    } catch (error) {
      console.error(`✗ Error clearing ${collectionName}:`, error);
    }
  }

  console.log('\n✅ Database cleanup completed!');
  console.log('You can now run: npm run seed');
  process.exit(0);
}

clearAllData().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
