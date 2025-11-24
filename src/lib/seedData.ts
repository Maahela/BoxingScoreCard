import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  getDocs,
  deleteDoc,
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

async function seedData() {
  console.log('🌱 Starting data seeding...');

  try {
    console.log(
      '⚠️  WARNING: This will clear existing data and create fresh seed data.'
    );
    console.log('If you want to keep existing scores, stop now (Ctrl+C).');
    console.log('Starting in 3 seconds...\n');

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Clear all existing data first
    console.log('🗑️ Clearing existing data...');
    const collections = [
      'scores',
      'participants',
      'events',
      'templates',
      'faculties',
      'invigilators',
      'activeParticipants',
      'pins',
    ];

    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      console.log(
        `✓ Cleared ${querySnapshot.docs.length} documents from ${collectionName}`
      );
    }
    console.log('✅ All collections cleared!\n');

    // 1. Create PINs for authentication
    console.log('Creating PINs...');
    await setDoc(doc(db, 'pins', 'admin-pin'), {
      pin: '123456',
      role: 'admin',
      name: 'Admin User',
    });

    await setDoc(doc(db, 'pins', 'display-pin'), {
      pin: '999999',
      role: 'display',
      name: 'Display Screen',
    });

    // 2. Create Faculties with fixed IDs
    console.log('Creating faculties...');
    const faculties = [
      { id: 'fmf', name: 'FMF', colorHex: '#3B82F6', order: 0 },
      { id: 'fos', name: 'FOS', colorHex: '#EF4444', order: 1 },
      { id: 'ucfm', name: 'UCFM', colorHex: '#10B981', order: 2 },
      { id: 'fon', name: 'FON', colorHex: '#F59E0B', order: 3 },
      { id: 'ucsc', name: 'UCSC', colorHex: '#8B5CF6', order: 4 },
      { id: 'fot', name: 'FOT', colorHex: '#EC4899', order: 5 },
    ];

    const facultyIds: Record<string, string> = {};
    for (const faculty of faculties) {
      const { id, ...facultyData } = faculty;
      await setDoc(doc(db, 'faculties', id), facultyData);
      facultyIds[faculty.name] = id;
      console.log(`✓ Created faculty: ${faculty.name}`);
    }

    // 3. Create Templates (ALL TOTAL 100 POINTS)
    console.log('Creating templates...');
    const templates = [
      {
        name: 'Shadow Boxing',
        layout: 'detailed',
        criteria: [
          { id: 'head_position', label: 'Head Position', maxPoints: 10 },
          { id: 'boxing_stance', label: 'Boxing Stance', maxPoints: 10 },
          {
            id: 'leg_position_distance',
            label: 'Leg Position and Distance',
            maxPoints: 10,
          },
          { id: 'defense', label: 'Defense', maxPoints: 10 },
          { id: 'correct_punches', label: 'Correct Punches', maxPoints: 25 },
          {
            id: 'punches_combination',
            label: 'Punches Combination',
            maxPoints: 20,
          },
          { id: 'endurance', label: 'Endurance', maxPoints: 15 },
        ],
      },
      {
        name: 'Punching Bag',
        layout: 'detailed',
        criteria: [
          { id: 'power', label: 'Power', maxPoints: 20 },
          { id: 'speed', label: 'Speed', maxPoints: 20 },
          {
            id: 'technique_tactics',
            label: 'Technique & Tactics',
            maxPoints: 30,
          },
          {
            id: 'combination_punches',
            label: 'Combination Punches',
            maxPoints: 20,
          },
          { id: 'endurance', label: 'Endurance', maxPoints: 10 },
        ],
      },
      {
        name: 'Skipping',
        layout: 'detailed',
        criteria: [
          { id: 'coordination', label: 'Coordination', maxPoints: 20 },
          { id: 'balance', label: 'Balance', maxPoints: 10 },
          { id: 'endurance', label: 'Endurance', maxPoints: 20 },
          { id: 'speed', label: 'Speed', maxPoints: 10 },
          { id: 'continuity', label: 'Continuity', maxPoints: 30 },
          { id: 'skill_variation', label: 'Skill Variation', maxPoints: 10 },
        ],
      },
      {
        name: 'Boxing Combat',
        layout: 'detailed',
        criteria: [
          {
            id: 'stance_balance',
            label: 'Stance and Balance',
            maxPoints: 10,
          },
          {
            id: 'punching_technique_tactics',
            label: 'Punching Technique & Tactics',
            maxPoints: 20,
          },
          { id: 'defense', label: 'Defense', maxPoints: 10 },
          { id: 'footwork', label: 'Footwork', maxPoints: 5 },
          {
            id: 'combination_punching',
            label: 'Combination Punching',
            maxPoints: 10,
          },
          { id: 'endurance', label: 'Endurance', maxPoints: 10 },
          {
            id: 'distance_management',
            label: 'Distance Management',
            maxPoints: 10,
          },
          {
            id: 'reading_the_opponent',
            label: 'Reading the Opponent',
            maxPoints: 5,
          },
          { id: 'domination', label: 'Domination', maxPoints: 10 },
          {
            id: 'protecting_the_head',
            label: 'Protecting the Head',
            maxPoints: 10,
          },
        ],
      },
    ];

    const templateIds: Record<string, string> = {};
    for (const template of templates) {
      const docRef = await addDoc(collection(db, 'templates'), template);
      templateIds[template.name] = docRef.id;
      console.log(`✓ Created template: ${template.name}`);
    }

    // 4. Create Events
    console.log('Creating events...');
    const events = [
      {
        name: 'Shadow Boxing',
        shortName: 'Shadow',
        templateId: templateIds['Shadow Boxing'],
        order: 0,
        isCombat: false,
        phase: 1,
        participantsRequired: 2,
      },
      {
        name: 'Punching Bag',
        shortName: 'Bag',
        templateId: templateIds['Punching Bag'],
        order: 1,
        isCombat: false,
        phase: 1,
        participantsRequired: 2,
      },
      {
        name: 'Skipping',
        shortName: 'Skip',
        templateId: templateIds['Skipping'],
        order: 2,
        isCombat: false,
        phase: 1,
        participantsRequired: 1,
      },
      {
        name: 'Boxing Combat',
        shortName: 'Combat',
        templateId: templateIds['Boxing Combat'],
        order: 3,
        isCombat: true,
        phase: 2,
        participantsRequired: 2,
      },
    ];

    const eventIds: Record<string, string> = {};
    for (const event of events) {
      const docRef = await addDoc(collection(db, 'events'), event);
      eventIds[event.name] = docRef.id;
      console.log(`✓ Created event: ${event.name}`);
    }

    // 5. Create Invigilators
    console.log('Creating invigilators...');
    const invigilators = [
      {
        name: 'Judge 1 - Shadow Boxing',
        pin: '111111',
        eventsAssigned: [eventIds['Shadow Boxing']],
        active: true,
      },
      {
        name: 'Judge 2 - Punching Bag',
        pin: '222222',
        eventsAssigned: [eventIds['Punching Bag']],
        active: true,
      },
      {
        name: 'Judge 3 - Skipping',
        pin: '333333',
        eventsAssigned: [eventIds['Skipping']],
        active: true,
      },
      {
        name: 'Judge 4 - Combat',
        pin: '444444',
        eventsAssigned: [eventIds['Boxing Combat']],
        active: true,
      },
      {
        name: 'Judge 5 - Combat Judge 2',
        pin: '555555',
        eventsAssigned: [eventIds['Boxing Combat']],
        active: true,
      },
    ];

    const invigilatorIds: Record<string, string> = {};
    for (const invigilator of invigilators) {
      const docRef = await addDoc(collection(db, 'invigilators'), invigilator);
      invigilatorIds[invigilator.name] = docRef.id;

      // Also add PIN document
      await setDoc(doc(db, 'pins', `inv-${docRef.id}`), {
        pin: invigilator.pin,
        role: 'invigilator',
        invigilatorId: docRef.id,
        name: invigilator.name,
        eventsAssigned: invigilator.eventsAssigned,
      });

      console.log(
        `✓ Created invigilator: ${invigilator.name} (PIN: ${invigilator.pin})`
      );
    }

    // 6. Create Participants
    console.log('Creating participants...');
    const participants = [
      // FMF - Participant 1 (All Phase 1 + Combat + Skipping)
      {
        name: 'John Doe',
        facultyId: facultyIds['FMF'],
        alias: 'Thunder',
        events: [
          eventIds['Skipping'],
          eventIds['Shadow Boxing'],
          eventIds['Punching Bag'],
          eventIds['Boxing Combat'],
        ],
      },
      // FMF - Participant 2 (All Phase 1 except Skipping + Combat)
      {
        name: 'Jane Smith',
        facultyId: facultyIds['FMF'],
        alias: 'Lightning',
        events: [
          eventIds['Shadow Boxing'],
          eventIds['Punching Bag'],
          eventIds['Boxing Combat'],
        ],
      },
      // FOS - Participant 1 (All Phase 1 + Combat + Skipping)
      {
        name: 'Mike Johnson',
        facultyId: facultyIds['FOS'],
        alias: 'The Bull',
        events: [
          eventIds['Skipping'],
          eventIds['Shadow Boxing'],
          eventIds['Punching Bag'],
          eventIds['Boxing Combat'],
        ],
      },
      // FOS - Participant 2 (All Phase 1 except Skipping + Combat)
      {
        name: 'Sarah Williams',
        facultyId: facultyIds['FOS'],
        alias: 'Viper',
        events: [
          eventIds['Shadow Boxing'],
          eventIds['Punching Bag'],
          eventIds['Boxing Combat'],
        ],
      },
      // UCFM - Participant 1 (All Phase 1 + Combat + Skipping)
      {
        name: 'Alex Brown',
        facultyId: facultyIds['UCFM'],
        alias: 'Rocket',
        events: [
          eventIds['Skipping'],
          eventIds['Shadow Boxing'],
          eventIds['Punching Bag'],
          eventIds['Boxing Combat'],
        ],
      },
      // UCFM - Participant 2 (All Phase 1 except Skipping + Combat)
      {
        name: 'Emily Davis',
        facultyId: facultyIds['UCFM'],
        alias: 'Phoenix',
        events: [
          eventIds['Shadow Boxing'],
          eventIds['Punching Bag'],
          eventIds['Boxing Combat'],
        ],
      },
      // FON - Participant 1 (All Phase 1 + Combat + Skipping)
      {
        name: 'Chris Wilson',
        facultyId: facultyIds['FON'],
        alias: 'Titan',
        events: [
          eventIds['Skipping'],
          eventIds['Shadow Boxing'],
          eventIds['Punching Bag'],
          eventIds['Boxing Combat'],
        ],
      },
      // FON - Participant 2 (All Phase 1 except Skipping + Combat)
      {
        name: 'Lisa Martinez',
        facultyId: facultyIds['FON'],
        alias: 'Blaze',
        events: [
          eventIds['Shadow Boxing'],
          eventIds['Punching Bag'],
          eventIds['Boxing Combat'],
        ],
      },
      // UCSC - Participant 1 (All Phase 1 + Combat + Skipping)
      {
        name: 'David Lee',
        facultyId: facultyIds['UCSC'],
        alias: 'Hawk',
        events: [
          eventIds['Skipping'],
          eventIds['Shadow Boxing'],
          eventIds['Punching Bag'],
          eventIds['Boxing Combat'],
        ],
      },
      // UCSC - Participant 2 (All Phase 1 except Skipping + Combat)
      {
        name: 'Rachel Green',
        facultyId: facultyIds['UCSC'],
        alias: 'Storm',
        events: [
          eventIds['Shadow Boxing'],
          eventIds['Punching Bag'],
          eventIds['Boxing Combat'],
        ],
      },
      // FOT - Participant 1 (All Phase 1 + Combat + Skipping)
      {
        name: 'Thomas Anderson',
        facultyId: facultyIds['FOT'],
        alias: 'Apex',
        events: [
          eventIds['Skipping'],
          eventIds['Shadow Boxing'],
          eventIds['Punching Bag'],
          eventIds['Boxing Combat'],
        ],
      },
      // FOT - Participant 2 (All Phase 1 except Skipping + Combat)
      {
        name: 'Sophia Roberts',
        facultyId: facultyIds['FOT'],
        alias: 'Cobra',
        events: [
          eventIds['Shadow Boxing'],
          eventIds['Punching Bag'],
          eventIds['Boxing Combat'],
        ],
      },
    ];

    const participantIds: string[] = [];
    for (const participant of participants) {
      const docRef = await addDoc(collection(db, 'participants'), participant);
      participantIds.push(docRef.id);
      console.log(
        `✓ Created participant: ${participant.name} (${participant.alias})`
      );
    }

    // 7. Create Dummy Scores for all events
    console.log('Creating dummy scores...');
    const dummyScores = [
      // Shadow Boxing - All 8 Participants
      {
        eventId: eventIds['Shadow Boxing'],
        templateId: templateIds['Shadow Boxing'],
        participantId: participantIds[0], // FMF - Thunder
        facultyId: facultyIds['FMF'],
        invigilatorId: invigilatorIds['Judge 1 - Shadow Boxing'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'head_position', score: 10 },
          { criteriaId: 'boxing_stance', score: 10 },
          { criteriaId: 'leg_position_distance', score: 2 },
          { criteriaId: 'defense', score: 7 },
          { criteriaId: 'correct_punches', score: 20 },
          { criteriaId: 'punches_combination', score: 20 },
          { criteriaId: 'endurance', score: 2 },
        ],
        total: 71,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Shadow Boxing'],
        templateId: templateIds['Shadow Boxing'],
        participantId: participantIds[1], // FMF - Lightning
        facultyId: facultyIds['FMF'],
        invigilatorId: invigilatorIds['Judge 1 - Shadow Boxing'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'head_position', score: 10 },
          { criteriaId: 'boxing_stance', score: 3 },
          { criteriaId: 'leg_position_distance', score: 10 },
          { criteriaId: 'defense', score: 10 },
          { criteriaId: 'correct_punches', score: 10 },
          { criteriaId: 'punches_combination', score: 10 },
          { criteriaId: 'endurance', score: 10 },
        ],
        total: 63,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Shadow Boxing'],
        templateId: templateIds['Shadow Boxing'],
        participantId: participantIds[2], // FOS - The Bull
        facultyId: facultyIds['FOS'],
        invigilatorId: invigilatorIds['Judge 1 - Shadow Boxing'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'head_position', score: 8 },
          { criteriaId: 'boxing_stance', score: 9 },
          { criteriaId: 'leg_position_distance', score: 10 },
          { criteriaId: 'defense', score: 8 },
          { criteriaId: 'correct_punches', score: 18 },
          { criteriaId: 'punches_combination', score: 22 },
          { criteriaId: 'endurance', score: 9 },
        ],
        total: 84,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Shadow Boxing'],
        templateId: templateIds['Shadow Boxing'],
        participantId: participantIds[3], // FOS - Viper
        facultyId: facultyIds['FOS'],
        invigilatorId: invigilatorIds['Judge 1 - Shadow Boxing'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'head_position', score: 9 },
          { criteriaId: 'boxing_stance', score: 8 },
          { criteriaId: 'leg_position_distance', score: 9 },
          { criteriaId: 'defense', score: 9 },
          { criteriaId: 'correct_punches', score: 19 },
          { criteriaId: 'punches_combination', score: 20 },
          { criteriaId: 'endurance', score: 8 },
        ],
        total: 82,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Shadow Boxing'],
        templateId: templateIds['Shadow Boxing'],
        participantId: participantIds[4], // UCFM - Rocket
        facultyId: facultyIds['UCFM'],
        invigilatorId: invigilatorIds['Judge 1 - Shadow Boxing'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'head_position', score: 10 },
          { criteriaId: 'boxing_stance', score: 10 },
          { criteriaId: 'leg_position_distance', score: 10 },
          { criteriaId: 'defense', score: 10 },
          { criteriaId: 'correct_punches', score: 25 },
          { criteriaId: 'punches_combination', score: 25 },
          { criteriaId: 'endurance', score: 10 },
        ],
        total: 100,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Shadow Boxing'],
        templateId: templateIds['Shadow Boxing'],
        participantId: participantIds[5], // UCFM - Phoenix
        facultyId: facultyIds['UCFM'],
        invigilatorId: invigilatorIds['Judge 1 - Shadow Boxing'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'head_position', score: 9 },
          { criteriaId: 'boxing_stance', score: 9 },
          { criteriaId: 'leg_position_distance', score: 9 },
          { criteriaId: 'defense', score: 9 },
          { criteriaId: 'correct_punches', score: 22 },
          { criteriaId: 'punches_combination', score: 23 },
          { criteriaId: 'endurance', score: 9 },
        ],
        total: 90,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Shadow Boxing'],
        templateId: templateIds['Shadow Boxing'],
        participantId: participantIds[6], // FON - Titan
        facultyId: facultyIds['FON'],
        invigilatorId: invigilatorIds['Judge 1 - Shadow Boxing'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'head_position', score: 9 },
          { criteriaId: 'boxing_stance', score: 10 },
          { criteriaId: 'leg_position_distance', score: 10 },
          { criteriaId: 'defense', score: 9 },
          { criteriaId: 'correct_punches', score: 23 },
          { criteriaId: 'punches_combination', score: 24 },
          { criteriaId: 'endurance', score: 10 },
        ],
        total: 95,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Shadow Boxing'],
        templateId: templateIds['Shadow Boxing'],
        participantId: participantIds[7], // FON - Blaze
        facultyId: facultyIds['FON'],
        invigilatorId: invigilatorIds['Judge 1 - Shadow Boxing'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'head_position', score: 10 },
          { criteriaId: 'boxing_stance', score: 9 },
          { criteriaId: 'leg_position_distance', score: 10 },
          { criteriaId: 'defense', score: 10 },
          { criteriaId: 'correct_punches', score: 24 },
          { criteriaId: 'punches_combination', score: 23 },
          { criteriaId: 'endurance', score: 9 },
        ],
        total: 95,
        timestamp: Date.now(),
      },
      // Shadow Boxing - UCSC
      {
        eventId: eventIds['Shadow Boxing'],
        templateId: templateIds['Shadow Boxing'],
        participantId: participantIds[8], // UCSC - Hawk
        facultyId: facultyIds['UCSC'],
        invigilatorId: invigilatorIds['Judge 1 - Shadow Boxing'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'head_position', score: 9 },
          { criteriaId: 'boxing_stance', score: 8 },
          { criteriaId: 'leg_position_distance', score: 9 },
          { criteriaId: 'defense', score: 8 },
          { criteriaId: 'correct_punches', score: 21 },
          { criteriaId: 'punches_combination', score: 22 },
          { criteriaId: 'endurance', score: 9 },
        ],
        total: 86,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Shadow Boxing'],
        templateId: templateIds['Shadow Boxing'],
        participantId: participantIds[9], // UCSC - Storm
        facultyId: facultyIds['UCSC'],
        invigilatorId: invigilatorIds['Judge 1 - Shadow Boxing'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'head_position', score: 10 },
          { criteriaId: 'boxing_stance', score: 9 },
          { criteriaId: 'leg_position_distance', score: 10 },
          { criteriaId: 'defense', score: 9 },
          { criteriaId: 'correct_punches', score: 23 },
          { criteriaId: 'punches_combination', score: 24 },
          { criteriaId: 'endurance', score: 10 },
        ],
        total: 95,
        timestamp: Date.now(),
      },
      // Shadow Boxing - FOT
      {
        eventId: eventIds['Shadow Boxing'],
        templateId: templateIds['Shadow Boxing'],
        participantId: participantIds[10], // FOT - Apex
        facultyId: facultyIds['FOT'],
        invigilatorId: invigilatorIds['Judge 1 - Shadow Boxing'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'head_position', score: 10 },
          { criteriaId: 'boxing_stance', score: 10 },
          { criteriaId: 'leg_position_distance', score: 9 },
          { criteriaId: 'defense', score: 10 },
          { criteriaId: 'correct_punches', score: 24 },
          { criteriaId: 'punches_combination', score: 25 },
          { criteriaId: 'endurance', score: 10 },
        ],
        total: 98,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Shadow Boxing'],
        templateId: templateIds['Shadow Boxing'],
        participantId: participantIds[11], // FOT - Cobra
        facultyId: facultyIds['FOT'],
        invigilatorId: invigilatorIds['Judge 1 - Shadow Boxing'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'head_position', score: 9 },
          { criteriaId: 'boxing_stance', score: 10 },
          { criteriaId: 'leg_position_distance', score: 10 },
          { criteriaId: 'defense', score: 9 },
          { criteriaId: 'correct_punches', score: 23 },
          { criteriaId: 'punches_combination', score: 24 },
          { criteriaId: 'endurance', score: 9 },
        ],
        total: 94,
        timestamp: Date.now(),
      },
      // Punching Bag - All Faculties
      {
        eventId: eventIds['Punching Bag'],
        templateId: templateIds['Punching Bag'],
        participantId: participantIds[0], // FMF - Thunder
        facultyId: facultyIds['FMF'],
        invigilatorId: invigilatorIds['Judge 2 - Punching Bag'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'power', score: 18 },
          { criteriaId: 'speed', score: 15 },
          { criteriaId: 'technique_tactics', score: 25 },
          { criteriaId: 'combination_punches', score: 18 },
          { criteriaId: 'endurance', score: 8 },
        ],
        total: 84,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Punching Bag'],
        templateId: templateIds['Punching Bag'],
        participantId: participantIds[1], // FMF - Lightning
        facultyId: facultyIds['FMF'],
        invigilatorId: invigilatorIds['Judge 2 - Punching Bag'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'power', score: 16 },
          { criteriaId: 'speed', score: 18 },
          { criteriaId: 'technique_tactics', score: 22 },
          { criteriaId: 'combination_punches', score: 15 },
          { criteriaId: 'endurance', score: 7 },
        ],
        total: 78,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Punching Bag'],
        templateId: templateIds['Punching Bag'],
        participantId: participantIds[4], // UCFM - Rocket
        facultyId: facultyIds['UCFM'],
        invigilatorId: invigilatorIds['Judge 2 - Punching Bag'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'power', score: 19 },
          { criteriaId: 'speed', score: 17 },
          { criteriaId: 'technique_tactics', score: 28 },
          { criteriaId: 'combination_punches', score: 19 },
          { criteriaId: 'endurance', score: 9 },
        ],
        total: 92,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Punching Bag'],
        templateId: templateIds['Punching Bag'],
        participantId: participantIds[5], // UCFM - Phoenix
        facultyId: facultyIds['UCFM'],
        invigilatorId: invigilatorIds['Judge 2 - Punching Bag'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'power', score: 17 },
          { criteriaId: 'speed', score: 16 },
          { criteriaId: 'technique_tactics', score: 24 },
          { criteriaId: 'combination_punches', score: 17 },
          { criteriaId: 'endurance', score: 8 },
        ],
        total: 82,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Punching Bag'],
        templateId: templateIds['Punching Bag'],
        participantId: participantIds[2], // FOS - The Bull
        facultyId: facultyIds['FOS'],
        invigilatorId: invigilatorIds['Judge 2 - Punching Bag'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'power', score: 20 },
          { criteriaId: 'speed', score: 14 },
          { criteriaId: 'technique_tactics', score: 26 },
          { criteriaId: 'combination_punches', score: 16 },
          { criteriaId: 'endurance', score: 9 },
        ],
        total: 85,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Punching Bag'],
        templateId: templateIds['Punching Bag'],
        participantId: participantIds[3], // FOS - Viper
        facultyId: facultyIds['FOS'],
        invigilatorId: invigilatorIds['Judge 2 - Punching Bag'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'power', score: 15 },
          { criteriaId: 'speed', score: 19 },
          { criteriaId: 'technique_tactics', score: 23 },
          { criteriaId: 'combination_punches', score: 18 },
          { criteriaId: 'endurance', score: 7 },
        ],
        total: 82,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Punching Bag'],
        templateId: templateIds['Punching Bag'],
        participantId: participantIds[6], // FON - Titan
        facultyId: facultyIds['FON'],
        invigilatorId: invigilatorIds['Judge 2 - Punching Bag'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'power', score: 18 },
          { criteriaId: 'speed', score: 16 },
          { criteriaId: 'technique_tactics', score: 27 },
          { criteriaId: 'combination_punches', score: 17 },
          { criteriaId: 'endurance', score: 9 },
        ],
        total: 87,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Punching Bag'],
        templateId: templateIds['Punching Bag'],
        participantId: participantIds[7], // FON - Blaze
        facultyId: facultyIds['FON'],
        invigilatorId: invigilatorIds['Judge 2 - Punching Bag'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'power', score: 17 },
          { criteriaId: 'speed', score: 18 },
          { criteriaId: 'technique_tactics', score: 25 },
          { criteriaId: 'combination_punches', score: 16 },
          { criteriaId: 'endurance', score: 8 },
        ],
        total: 84,
        timestamp: Date.now(),
      },
      // Punching Bag - UCSC
      {
        eventId: eventIds['Punching Bag'],
        templateId: templateIds['Punching Bag'],
        participantId: participantIds[8], // UCSC - Hawk
        facultyId: facultyIds['UCSC'],
        invigilatorId: invigilatorIds['Judge 2 - Punching Bag'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'power', score: 16 },
          { criteriaId: 'speed', score: 17 },
          { criteriaId: 'technique_tactics', score: 26 },
          { criteriaId: 'combination_punches', score: 16 },
          { criteriaId: 'endurance', score: 8 },
        ],
        total: 83,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Punching Bag'],
        templateId: templateIds['Punching Bag'],
        participantId: participantIds[9], // UCSC - Storm
        facultyId: facultyIds['UCSC'],
        invigilatorId: invigilatorIds['Judge 2 - Punching Bag'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'power', score: 18 },
          { criteriaId: 'speed', score: 18 },
          { criteriaId: 'technique_tactics', score: 27 },
          { criteriaId: 'combination_punches', score: 18 },
          { criteriaId: 'endurance', score: 9 },
        ],
        total: 90,
        timestamp: Date.now(),
      },
      // Punching Bag - FOT
      {
        eventId: eventIds['Punching Bag'],
        templateId: templateIds['Punching Bag'],
        participantId: participantIds[10], // FOT - Apex
        facultyId: facultyIds['FOT'],
        invigilatorId: invigilatorIds['Judge 2 - Punching Bag'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'power', score: 19 },
          { criteriaId: 'speed', score: 19 },
          { criteriaId: 'technique_tactics', score: 29 },
          { criteriaId: 'combination_punches', score: 19 },
          { criteriaId: 'endurance', score: 10 },
        ],
        total: 96,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Punching Bag'],
        templateId: templateIds['Punching Bag'],
        participantId: participantIds[11], // FOT - Cobra
        facultyId: facultyIds['FOT'],
        invigilatorId: invigilatorIds['Judge 2 - Punching Bag'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'power', score: 18 },
          { criteriaId: 'speed', score: 17 },
          { criteriaId: 'technique_tactics', score: 28 },
          { criteriaId: 'combination_punches', score: 18 },
          { criteriaId: 'endurance', score: 9 },
        ],
        total: 90,
        timestamp: Date.now(),
      },
      // Skipping - One per faculty (first participant of each faculty)
      {
        eventId: eventIds['Skipping'],
        templateId: templateIds['Skipping'],
        participantId: participantIds[0], // FMF - Thunder
        facultyId: facultyIds['FMF'],
        invigilatorId: invigilatorIds['Judge 3 - Skipping'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'coordination', score: 4 },
          { criteriaId: 'balance', score: 1 },
          { criteriaId: 'endurance', score: 10 },
          { criteriaId: 'speed', score: 10 },
          { criteriaId: 'continuity', score: 10 },
          { criteriaId: 'skill_variation', score: 10 },
        ],
        total: 45,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Skipping'],
        templateId: templateIds['Skipping'],
        participantId: participantIds[4], // UCFM - Rocket
        facultyId: facultyIds['UCFM'],
        invigilatorId: invigilatorIds['Judge 3 - Skipping'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'coordination', score: 20 },
          { criteriaId: 'balance', score: 2 },
          { criteriaId: 'endurance', score: 20 },
          { criteriaId: 'speed', score: 2 },
          { criteriaId: 'continuity', score: 16 },
          { criteriaId: 'skill_variation', score: 0 },
        ],
        total: 60,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Skipping'],
        templateId: templateIds['Skipping'],
        participantId: participantIds[2], // FOS - The Bull
        facultyId: facultyIds['FOS'],
        invigilatorId: invigilatorIds['Judge 3 - Skipping'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'coordination', score: 15 },
          { criteriaId: 'balance', score: 8 },
          { criteriaId: 'endurance', score: 18 },
          { criteriaId: 'speed', score: 8 },
          { criteriaId: 'continuity', score: 25 },
          { criteriaId: 'skill_variation', score: 8 },
        ],
        total: 82,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Skipping'],
        templateId: templateIds['Skipping'],
        participantId: participantIds[6], // FON - Titan
        facultyId: facultyIds['FON'],
        invigilatorId: invigilatorIds['Judge 3 - Skipping'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'coordination', score: 18 },
          { criteriaId: 'balance', score: 9 },
          { criteriaId: 'endurance', score: 19 },
          { criteriaId: 'speed', score: 9 },
          { criteriaId: 'continuity', score: 28 },
          { criteriaId: 'skill_variation', score: 9 },
        ],
        total: 92,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Skipping'],
        templateId: templateIds['Skipping'],
        participantId: participantIds[8], // UCSC - Hawk
        facultyId: facultyIds['UCSC'],
        invigilatorId: invigilatorIds['Judge 3 - Skipping'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'coordination', score: 17 },
          { criteriaId: 'balance', score: 8 },
          { criteriaId: 'endurance', score: 17 },
          { criteriaId: 'speed', score: 8 },
          { criteriaId: 'continuity', score: 26 },
          { criteriaId: 'skill_variation', score: 9 },
        ],
        total: 85,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Skipping'],
        templateId: templateIds['Skipping'],
        participantId: participantIds[10], // FOT - Apex
        facultyId: facultyIds['FOT'],
        invigilatorId: invigilatorIds['Judge 3 - Skipping'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'coordination', score: 19 },
          { criteriaId: 'balance', score: 10 },
          { criteriaId: 'endurance', score: 20 },
          { criteriaId: 'speed', score: 10 },
          { criteriaId: 'continuity', score: 29 },
          { criteriaId: 'skill_variation', score: 10 },
        ],
        total: 98,
        timestamp: Date.now(),
      },
      // Boxing Combat - All Faculties
      {
        eventId: eventIds['Boxing Combat'],
        templateId: templateIds['Boxing Combat'],
        participantId: participantIds[0], // FMF - Thunder
        facultyId: facultyIds['FMF'],
        invigilatorId: invigilatorIds['Judge 4 - Combat'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'stance_balance', score: 9 },
          { criteriaId: 'punching_technique_tactics', score: 18 },
          { criteriaId: 'defense', score: 9 },
          { criteriaId: 'footwork', score: 4 },
          { criteriaId: 'combination_punching', score: 9 },
          { criteriaId: 'endurance', score: 9 },
          { criteriaId: 'distance_management', score: 9 },
          { criteriaId: 'reading_the_opponent', score: 4 },
          { criteriaId: 'domination', score: 9 },
          { criteriaId: 'protecting_the_head', score: 9 },
        ],
        total: 89,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Boxing Combat'],
        templateId: templateIds['Boxing Combat'],
        participantId: participantIds[1], // FMF - Lightning
        facultyId: facultyIds['FMF'],
        invigilatorId: invigilatorIds['Judge 4 - Combat'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'stance_balance', score: 8 },
          { criteriaId: 'punching_technique_tactics', score: 17 },
          { criteriaId: 'defense', score: 8 },
          { criteriaId: 'footwork', score: 4 },
          { criteriaId: 'combination_punching', score: 8 },
          { criteriaId: 'endurance', score: 8 },
          { criteriaId: 'distance_management', score: 8 },
          { criteriaId: 'reading_the_opponent', score: 4 },
          { criteriaId: 'domination', score: 8 },
          { criteriaId: 'protecting_the_head', score: 8 },
        ],
        total: 81,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Boxing Combat'],
        templateId: templateIds['Boxing Combat'],
        participantId: participantIds[4], // UCFM - Rocket
        facultyId: facultyIds['UCFM'],
        invigilatorId: invigilatorIds['Judge 4 - Combat'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'stance_balance', score: 10 },
          { criteriaId: 'punching_technique_tactics', score: 19 },
          { criteriaId: 'defense', score: 10 },
          { criteriaId: 'footwork', score: 5 },
          { criteriaId: 'combination_punching', score: 10 },
          { criteriaId: 'endurance', score: 10 },
          { criteriaId: 'distance_management', score: 10 },
          { criteriaId: 'reading_the_opponent', score: 5 },
          { criteriaId: 'domination', score: 10 },
          { criteriaId: 'protecting_the_head', score: 10 },
        ],
        total: 99,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Boxing Combat'],
        templateId: templateIds['Boxing Combat'],
        participantId: participantIds[5], // UCFM - Phoenix
        facultyId: facultyIds['UCFM'],
        invigilatorId: invigilatorIds['Judge 4 - Combat'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'stance_balance', score: 9 },
          { criteriaId: 'punching_technique_tactics', score: 18 },
          { criteriaId: 'defense', score: 9 },
          { criteriaId: 'footwork', score: 4 },
          { criteriaId: 'combination_punching', score: 9 },
          { criteriaId: 'endurance', score: 9 },
          { criteriaId: 'distance_management', score: 9 },
          { criteriaId: 'reading_the_opponent', score: 4 },
          { criteriaId: 'domination', score: 9 },
          { criteriaId: 'protecting_the_head', score: 9 },
        ],
        total: 89,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Boxing Combat'],
        templateId: templateIds['Boxing Combat'],
        participantId: participantIds[2], // FOS - The Bull
        facultyId: facultyIds['FOS'],
        invigilatorId: invigilatorIds['Judge 4 - Combat'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'stance_balance', score: 8 },
          { criteriaId: 'punching_technique_tactics', score: 16 },
          { criteriaId: 'defense', score: 8 },
          { criteriaId: 'footwork', score: 4 },
          { criteriaId: 'combination_punching', score: 8 },
          { criteriaId: 'endurance', score: 8 },
          { criteriaId: 'distance_management', score: 8 },
          { criteriaId: 'reading_the_opponent', score: 3 },
          { criteriaId: 'domination', score: 8 },
          { criteriaId: 'protecting_the_head', score: 8 },
        ],
        total: 79,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Boxing Combat'],
        templateId: templateIds['Boxing Combat'],
        participantId: participantIds[3], // FOS - Viper
        facultyId: facultyIds['FOS'],
        invigilatorId: invigilatorIds['Judge 4 - Combat'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'stance_balance', score: 9 },
          { criteriaId: 'punching_technique_tactics', score: 17 },
          { criteriaId: 'defense', score: 9 },
          { criteriaId: 'footwork', score: 4 },
          { criteriaId: 'combination_punching', score: 9 },
          { criteriaId: 'endurance', score: 9 },
          { criteriaId: 'distance_management', score: 9 },
          { criteriaId: 'reading_the_opponent', score: 4 },
          { criteriaId: 'domination', score: 9 },
          { criteriaId: 'protecting_the_head', score: 9 },
        ],
        total: 88,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Boxing Combat'],
        templateId: templateIds['Boxing Combat'],
        participantId: participantIds[6], // FON - Titan
        facultyId: facultyIds['FON'],
        invigilatorId: invigilatorIds['Judge 4 - Combat'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'stance_balance', score: 10 },
          { criteriaId: 'punching_technique_tactics', score: 20 },
          { criteriaId: 'defense', score: 10 },
          { criteriaId: 'footwork', score: 5 },
          { criteriaId: 'combination_punching', score: 10 },
          { criteriaId: 'endurance', score: 10 },
          { criteriaId: 'distance_management', score: 10 },
          { criteriaId: 'reading_the_opponent', score: 5 },
          { criteriaId: 'domination', score: 10 },
          { criteriaId: 'protecting_the_head', score: 10 },
        ],
        total: 100,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Boxing Combat'],
        templateId: templateIds['Boxing Combat'],
        participantId: participantIds[7], // FON - Blaze
        facultyId: facultyIds['FON'],
        invigilatorId: invigilatorIds['Judge 4 - Combat'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'stance_balance', score: 9 },
          { criteriaId: 'punching_technique_tactics', score: 18 },
          { criteriaId: 'defense', score: 9 },
          { criteriaId: 'footwork', score: 5 },
          { criteriaId: 'combination_punching', score: 9 },
          { criteriaId: 'endurance', score: 9 },
          { criteriaId: 'distance_management', score: 9 },
          { criteriaId: 'reading_the_opponent', score: 4 },
          { criteriaId: 'domination', score: 9 },
          { criteriaId: 'protecting_the_head', score: 9 },
        ],
        total: 90,
        timestamp: Date.now(),
      },
      // Boxing Combat - UCSC
      {
        eventId: eventIds['Boxing Combat'],
        templateId: templateIds['Boxing Combat'],
        participantId: participantIds[8], // UCSC - Hawk
        facultyId: facultyIds['UCSC'],
        invigilatorId: invigilatorIds['Judge 4 - Combat'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'stance_balance', score: 9 },
          { criteriaId: 'punching_technique_tactics', score: 17 },
          { criteriaId: 'defense', score: 8 },
          { criteriaId: 'footwork', score: 4 },
          { criteriaId: 'combination_punching', score: 9 },
          { criteriaId: 'endurance', score: 9 },
          { criteriaId: 'distance_management', score: 8 },
          { criteriaId: 'reading_the_opponent', score: 4 },
          { criteriaId: 'domination', score: 8 },
          { criteriaId: 'protecting_the_head', score: 9 },
        ],
        total: 85,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Boxing Combat'],
        templateId: templateIds['Boxing Combat'],
        participantId: participantIds[9], // UCSC - Storm
        facultyId: facultyIds['UCSC'],
        invigilatorId: invigilatorIds['Judge 4 - Combat'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'stance_balance', score: 9 },
          { criteriaId: 'punching_technique_tactics', score: 19 },
          { criteriaId: 'defense', score: 9 },
          { criteriaId: 'footwork', score: 5 },
          { criteriaId: 'combination_punching', score: 10 },
          { criteriaId: 'endurance', score: 10 },
          { criteriaId: 'distance_management', score: 9 },
          { criteriaId: 'reading_the_opponent', score: 5 },
          { criteriaId: 'domination', score: 9 },
          { criteriaId: 'protecting_the_head', score: 9 },
        ],
        total: 94,
        timestamp: Date.now(),
      },
      // Boxing Combat - FOT
      {
        eventId: eventIds['Boxing Combat'],
        templateId: templateIds['Boxing Combat'],
        participantId: participantIds[10], // FOT - Apex
        facultyId: facultyIds['FOT'],
        invigilatorId: invigilatorIds['Judge 4 - Combat'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'stance_balance', score: 10 },
          { criteriaId: 'punching_technique_tactics', score: 20 },
          { criteriaId: 'defense', score: 10 },
          { criteriaId: 'footwork', score: 5 },
          { criteriaId: 'combination_punching', score: 10 },
          { criteriaId: 'endurance', score: 10 },
          { criteriaId: 'distance_management', score: 10 },
          { criteriaId: 'reading_the_opponent', score: 5 },
          { criteriaId: 'domination', score: 10 },
          { criteriaId: 'protecting_the_head', score: 10 },
        ],
        total: 100,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Boxing Combat'],
        templateId: templateIds['Boxing Combat'],
        participantId: participantIds[11], // FOT - Cobra
        facultyId: facultyIds['FOT'],
        invigilatorId: invigilatorIds['Judge 4 - Combat'],
        roundNumber: 1,
        criteriaScores: [
          { criteriaId: 'stance_balance', score: 10 },
          { criteriaId: 'punching_technique_tactics', score: 19 },
          { criteriaId: 'defense', score: 9 },
          { criteriaId: 'footwork', score: 5 },
          { criteriaId: 'combination_punching', score: 10 },
          { criteriaId: 'endurance', score: 10 },
          { criteriaId: 'distance_management', score: 10 },
          { criteriaId: 'reading_the_opponent', score: 5 },
          { criteriaId: 'domination', score: 9 },
          { criteriaId: 'protecting_the_head', score: 10 },
        ],
        total: 97,
        timestamp: Date.now(),
      },
    ];

    for (const score of dummyScores) {
      await addDoc(collection(db, 'scores'), score);
    }
    console.log(`✓ Created ${dummyScores.length} dummy scores`);

    // 7.5. Duplicate combat scores for Judge 5 (two-judge combat system)
    console.log('Creating Judge 5 combat scores...');
    const judge5CombatScores = dummyScores
      .filter(
        (score) =>
          score.eventId === eventIds['Boxing Combat'] &&
          score.invigilatorId === invigilatorIds['Judge 4 - Combat']
      )
      .map((score) => ({
        ...score,
        invigilatorId: invigilatorIds['Judge 5 - Combat Judge 2'],
        // Slightly vary scores to make averaging more realistic
        criteriaScores: score.criteriaScores.map((c) => ({
          ...c,
          score: Math.max(0, c.score + (Math.random() > 0.5 ? 1 : -1)),
        })),
        total:
          score.total +
          (Math.random() > 0.5
            ? Math.floor(Math.random() * 3)
            : -Math.floor(Math.random() * 3)),
      }));

    for (const score of judge5CombatScores) {
      await addDoc(collection(db, 'scores'), score);
    }
    console.log(`✓ Created ${judge5CombatScores.length} Judge 5 combat scores`);

    // 8. Add Skipping Round 2 scores (for testing two-round skipping display)
    console.log('Creating Skipping Round 2 scores...');
    const skippingRound2Scores = [
      {
        eventId: eventIds['Skipping'],
        templateId: templateIds['Skipping'],
        participantId: participantIds[0], // FMF - Thunder
        facultyId: facultyIds['FMF'],
        invigilatorId: invigilatorIds['Judge 3 - Skipping'],
        roundNumber: 2,
        criteriaScores: [
          { criteriaId: 'coordination', score: 16 },
          { criteriaId: 'balance', score: 8 },
          { criteriaId: 'endurance', score: 18 },
          { criteriaId: 'speed', score: 8 },
          { criteriaId: 'continuity', score: 25 },
          { criteriaId: 'skill_variation', score: 8 },
        ],
        total: 83,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Skipping'],
        templateId: templateIds['Skipping'],
        participantId: participantIds[4], // UCFM - Rocket
        facultyId: facultyIds['UCFM'],
        invigilatorId: invigilatorIds['Judge 3 - Skipping'],
        roundNumber: 2,
        criteriaScores: [
          { criteriaId: 'coordination', score: 18 },
          { criteriaId: 'balance', score: 9 },
          { criteriaId: 'endurance', score: 19 },
          { criteriaId: 'speed', score: 9 },
          { criteriaId: 'continuity', score: 28 },
          { criteriaId: 'skill_variation', score: 9 },
        ],
        total: 92,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Skipping'],
        templateId: templateIds['Skipping'],
        participantId: participantIds[2], // FOS - The Bull
        facultyId: facultyIds['FOS'],
        invigilatorId: invigilatorIds['Judge 3 - Skipping'],
        roundNumber: 2,
        criteriaScores: [
          { criteriaId: 'coordination', score: 17 },
          { criteriaId: 'balance', score: 9 },
          { criteriaId: 'endurance', score: 19 },
          { criteriaId: 'speed', score: 9 },
          { criteriaId: 'continuity', score: 27 },
          { criteriaId: 'skill_variation', score: 9 },
        ],
        total: 90,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Skipping'],
        templateId: templateIds['Skipping'],
        participantId: participantIds[6], // FON - Titan
        facultyId: facultyIds['FON'],
        invigilatorId: invigilatorIds['Judge 3 - Skipping'],
        roundNumber: 2,
        criteriaScores: [
          { criteriaId: 'coordination', score: 19 },
          { criteriaId: 'balance', score: 10 },
          { criteriaId: 'endurance', score: 20 },
          { criteriaId: 'speed', score: 10 },
          { criteriaId: 'continuity', score: 29 },
          { criteriaId: 'skill_variation', score: 10 },
        ],
        total: 98,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Skipping'],
        templateId: templateIds['Skipping'],
        participantId: participantIds[8], // UCSC - Hawk
        facultyId: facultyIds['UCSC'],
        invigilatorId: invigilatorIds['Judge 3 - Skipping'],
        roundNumber: 2,
        criteriaScores: [
          { criteriaId: 'coordination', score: 18 },
          { criteriaId: 'balance', score: 9 },
          { criteriaId: 'endurance', score: 18 },
          { criteriaId: 'speed', score: 9 },
          { criteriaId: 'continuity', score: 27 },
          { criteriaId: 'skill_variation', score: 9 },
        ],
        total: 90,
        timestamp: Date.now(),
      },
      {
        eventId: eventIds['Skipping'],
        templateId: templateIds['Skipping'],
        participantId: participantIds[10], // FOT - Apex
        facultyId: facultyIds['FOT'],
        invigilatorId: invigilatorIds['Judge 3 - Skipping'],
        roundNumber: 2,
        criteriaScores: [
          { criteriaId: 'coordination', score: 20 },
          { criteriaId: 'balance', score: 10 },
          { criteriaId: 'endurance', score: 20 },
          { criteriaId: 'speed', score: 10 },
          { criteriaId: 'continuity', score: 30 },
          { criteriaId: 'skill_variation', score: 10 },
        ],
        total: 100,
        timestamp: Date.now(),
      },
    ];

    for (const score of skippingRound2Scores) {
      await addDoc(collection(db, 'scores'), score);
    }
    console.log(
      `✓ Created ${skippingRound2Scores.length} Skipping Round 2 scores`
    );

    // 9. Create Active Participants document
    console.log('Creating active participants document...');
    await setDoc(doc(db, 'activeParticipants', 'current'), {
      skipping: participantIds[0], // FMF - Thunder
      shadowBoxing: participantIds[0], // FMF - Thunder
      punchingBag: participantIds[0], // FMF - Thunder
      combat: {
        participant1: participantIds[0], // FMF - Thunder
        participant2: participantIds[1], // FMF - Lightning
      },
      activeSkippingRound: 1,
      activePhase: 1,
    });
    console.log('✓ Created active participants document');

    console.log('\n✅ Data seeding completed successfully!');
    console.log('\n📌 Login PINs:');
    console.log('  Admin: 123456');
    console.log('  Display: 999999');
    console.log('  Shadow Boxing Judge: 111111');
    console.log('  Punching Bag Judge: 222222');
    console.log('  Skipping Judge: 333333');
    console.log('  Combat Judge: 444444');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Run the seed function
seedData()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
