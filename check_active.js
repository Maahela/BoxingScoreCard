import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const snapshot = await getDocs(collection(db, 'activeParticipants'));
console.log('\nÌ≥ã Active Participants Collection:');
snapshot.docs.forEach(doc => {
  console.log('Document ID:', doc.id);
  console.log('Data:', JSON.stringify(doc.data(), null, 2));
});

if (snapshot.empty) {
  console.log('‚ùå No activeParticipants documents found!');
}

process.exit(0);
