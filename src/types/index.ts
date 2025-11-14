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
  eventTotals: Record<string, number>;
  totalScore: number;
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
