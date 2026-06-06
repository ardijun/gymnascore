/**
 * GymnaScore Type Definitions
 * Represents components of the Gymnastics End-to-End Scoring System
 */

export type UserRole = 'Admin' | 'Head_Judge' | 'D_Judge' | 'E_Judge' | 'Coach';

export interface Account {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  name: string;
  role: 'superadmin' | 'panitia' | 'juri' | 'peserta';
  subRole?: 'D' | 'E' | 'Neutral';
  athleteId?: string; // For peserta role only - links to specific athlete
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  apparatusAssignment?: string; // e.g. 'FX', 'PH', 'SR', 'VT', 'PB', 'HB', 'BB', 'UB'
}

export type Gender = 'Men' | 'Women';

export interface Athlete {
  id: string;
  name: string;
  club: string;
  ageCategory: string; // e.g. 'Senior', 'Junior U16', 'Novice'
  gender: Gender;
}

export interface Apparatus {
  id: string;
  name: string; // e.g., 'Floor Exercise', 'Pommel Horse', 'Still Rings', 'Vault', 'Parallel Bars', 'Horizontal Bar', 'Balance Beam', 'Uneven Bars'
  code: string; // e.g., 'FX', 'PH', 'SR', 'VT', 'PB', 'HB', 'BB', 'UB'
  gender: Gender;
}

export interface ScoreDQuery {
  id: string;
  athleteId: string;
  apparatusCode: string;
  judgeId: string;
  difficultyValue: number; // DV (Difficulty Value)
  compositionRequirements: number; // CR (0.0 to 2.0 max)
  connectionValue: number; // CV (Connection Value)
  submittedAt: string;
}

export interface ScoreEQuery {
  id: string;
  athleteId: string;
  apparatusCode: string;
  judgeId: string;
  executionReduction: number; // Combined execution deductions (0 to 10 scale)
  artistryDeduction: number; // For balance beam / floor (0 to 2.0)
  submittedAt: string;
}

export interface LiveScoreboardEntry {
  rank: number;
  athleteId: string;
  athleteName: string;
  club: string;
  ageCategory: string; // e.g., 'Senior Elite', 'Junior'
  gender: Gender;
  apparatusCode: string;
  apparatusName: string;
  scoreD: number; // e.g., 5.400
  scoreE: number; // e.g., 8.650 (10.000 minus deductions)
  penalties: number; // Neutral deductions, e.g., 0.1
  totalScore: number; // D + E - penalties
  status: 'In_Progress' | 'Pending_Verification' | 'Official';
  lastUpdated: string;
}

export interface ActiveApparatusEvent {
  apparatusCode: string;
  apparatusName: string;
  currentAthleteName: string;
  currentAthleteClub: string;
  status: 'Warm_up' | 'Routine' | 'Scoring' | 'Idle';
  activeJudgesCount: number;
  lastScoreSubmitted?: number;
}

export interface Competition {
  id: string;
  name: string;
  location: string;
  date: string;
  status: 'Upcoming' | 'Active' | 'Completed';
}

export interface CompetitionParticipant {
  id: string;
  competitionId: string;
  athleteId: string;
  registeredAt: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOCKOUT' | 'UNLOCKED' | 'ACCOUNT_CREATED' | 'ACCOUNT_DELETED' | 'PASSWORD_CHANGED' | 'SYSTEM_RESET' | 'GLOBAL_LOCK_TOGGLED' | 'CYBER_ATTACK_SIMULATION';
  username: string;
  details: string;
  action: string;
  ipAddress: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  bodyText: string;
  footerText: string;
  backgroundColor: string;
  borderColor: string;
  accentColor: string;
  includeScore: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  athleteId: string;
  athleteName: string;
  club: string;
  competitionName: string;
  competitionDate: string;
  totalScore: number;
  templateId: string;
  issuedAt: string;
}

