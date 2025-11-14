import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
} from 'firebase/firestore';

// Initialize Firebase with your config
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

async function seedData() {
  console.log('🌱 Starting data seeding...');

  try {
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

    // 2. Create Faculties
    console.log('Creating faculties...');
    const faculties = [
      { name: 'UCSC', colorHex: '#3B82F6', order: 0 },
      { name: 'Management', colorHex: '#EF4444', order: 1 },
      { name: 'Technology', colorHex: '#10B981', order: 2 },
      { name: 'Science', colorHex: '#F59E0B', order: 3 },
    ];

    const facultyIds: Record<string, string> = {};
    for (const faculty of faculties) {
      const docRef = await addDoc(collection(db, 'faculties'), faculty);
      facultyIds[faculty.name] = docRef.id;
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
      },
      {
        name: 'Punching Bag',
        shortName: 'Bag',
        templateId: templateIds['Punching Bag'],
        order: 1,
        isCombat: false,
      },
      {
        name: 'Skipping',
        shortName: 'Skip',
        templateId: templateIds['Skipping'],
        order: 2,
        isCombat: false,
      },
      {
        name: 'Boxing Combat',
        shortName: 'Combat',
        templateId: templateIds['Boxing Combat'],
        order: 3,
        isCombat: true,
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
      // UCSC
      {
        name: 'John Doe',
        facultyId: facultyIds['UCSC'],
        alias: 'Thunder',
        events: Object.values(eventIds),
      },
      {
        name: 'Jane Smith',
        facultyId: facultyIds['UCSC'],
        alias: 'Lightning',
        events: Object.values(eventIds),
      },
      // Management
      {
        name: 'Mike Johnson',
        facultyId: facultyIds['Management'],
        alias: 'The Bull',
        events: Object.values(eventIds),
      },
      {
        name: 'Sarah Williams',
        facultyId: facultyIds['Management'],
        alias: 'Viper',
        events: Object.values(eventIds),
      },
      // Technology
      {
        name: 'Alex Brown',
        facultyId: facultyIds['Technology'],
        alias: 'Rocket',
        events: Object.values(eventIds),
      },
      {
        name: 'Emily Davis',
        facultyId: facultyIds['Technology'],
        alias: 'Phoenix',
        events: Object.values(eventIds),
      },
      // Science
      {
        name: 'Chris Wilson',
        facultyId: facultyIds['Science'],
        alias: 'Titan',
        events: Object.values(eventIds),
      },
      {
        name: 'Lisa Martinez',
        facultyId: facultyIds['Science'],
        alias: 'Blaze',
        events: Object.values(eventIds),
      },
    ];

    for (const participant of participants) {
      await addDoc(collection(db, 'participants'), participant);
      console.log(
        `✓ Created participant: ${participant.name} (${participant.alias})`
      );
    }

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
