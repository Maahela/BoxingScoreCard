// Demo Configuration - Customize this for your competition

export const DEMO_CONFIG = {
  // Competition Details
  competition: {
    name: 'Interfaculty Boxing Freshers 2024',
    shortName: 'Boxing 2024',
  },

  // Sample Faculties (customize colors and names)
  faculties: [
    { name: 'UCSC', colorHex: '#3B82F6', order: 0 },
    { name: 'Management', colorHex: '#EF4444', order: 1 },
    { name: 'Technology', colorHex: '#10B981', order: 2 },
    { name: 'Science', colorHex: '#F59E0B', order: 3 },
  ],

  // Scoring Templates - ALL EVENTS TOTAL 100 POINTS
  templates: [
    {
      name: 'Shadow Boxing',
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
  ],

  // Authentication PINs (CHANGE THESE FOR PRODUCTION!)
  pins: {
    admin: '123456',
    display: '999999',
    judges: {
      shadowBoxing: '111111',
      punchingBag: '222222',
      skipping: '333333',
      combat: '444444',
    },
  },

  // Sample Participants
  participants: [
    // UCSC
    {
      name: 'John Doe',
      faculty: 'UCSC',
      alias: 'Thunder',
      weightClass: '75kg',
    },
    {
      name: 'Jane Smith',
      faculty: 'UCSC',
      alias: 'Lightning',
      weightClass: '60kg',
    },
    // Management
    {
      name: 'Mike Johnson',
      faculty: 'Management',
      alias: 'The Bull',
      weightClass: '80kg',
    },
    {
      name: 'Sarah Williams',
      faculty: 'Management',
      alias: 'Viper',
      weightClass: '65kg',
    },
    // Technology
    {
      name: 'Alex Brown',
      faculty: 'Technology',
      alias: 'Rocket',
      weightClass: '70kg',
    },
    {
      name: 'Emily Davis',
      faculty: 'Technology',
      alias: 'Phoenix',
      weightClass: '58kg',
    },
    // Science
    {
      name: 'Chris Wilson',
      faculty: 'Science',
      alias: 'Titan',
      weightClass: '85kg',
    },
    {
      name: 'Lisa Martinez',
      faculty: 'Science',
      alias: 'Blaze',
      weightClass: '63kg',
    },
  ],
};

// Enable demo mode (shows fake scoring for testing)
export const DEMO_MODE = false;
