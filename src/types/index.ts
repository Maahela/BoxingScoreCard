// Firestore collection types

export type UserRole = 'admin' | 'invigilator' | 'display';

export interface PinAuth {
  pin: string;
  role: UserRole;
  invigilatorId?: string;
  name?: string;
  eventsAssigned?: string[];
}

export interface Faculty {
  id: string;
  name: string;
  colorHex: string;
  order: number;
}

export interface Participant {
  id: string;
  name: string;
  facultyId: string;
  alias?: string;
  weightClass?: string;
  events: string[];
  photoUrl?: string;
}

export interface CriteriaItem {
  id: string;
  label: string;
  maxPoints: number;
}

export interface Template {
  id: string;
  name: string;
  criteria: CriteriaItem[];
  layout: 'detailed' | 'summary';
}

export interface Event {
  id: string;
  name: string;
  shortName: string;
  order: number;
  templateId: string;
  isCombat: boolean;
  phase: 1 | 2; // Phase 1: Shadow/Bag/Skip simultaneous, Phase 2: Combat sequential
  participantsRequired: 1 | 2; // Number of participants per faculty for this event
}

export interface Invigilator {
  id: string;
  name: string;
  pin: string;
  eventsAssigned: string[];
  active: boolean;
}

export interface Assignment {
  id: string;
  eventId: string;
  roundNumber: number;
  facultyOrder: string[];
  currentFacultyIndex: number;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface CriteriaScore {
  criteriaId: string;
  score: number;
}

export interface Score {
  id?: string;
  eventId: string;
  templateId: string;
  participantId: string;
  facultyId: string;
  invigilatorId: string;
  roundNumber: number;
  criteriaScores: CriteriaScore[];
  total: number;
  timestamp: number;
  locked?: boolean;
}

export interface FacultyTotals {
  facultyId: string;
  eventTotals: Record<string, number>; // event averages for events requiring 2 participants
  eventAverages: Record<
    string,
    { total: number; count: number; average: number }
  >; // detailed averaging info
  phase1Total: number; // Sum of Phase 1 event averages
  phase2Total: number; // Sum of Phase 2 event averages
  totalScore: number; // Grand total
}

// UI state types
export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  invigilatorId?: string;
  name?: string;
  eventsAssigned?: string[];
}

export interface ScoreInputState {
  criteriaId: string;
  score: number;
  maxPoints: number;
}
