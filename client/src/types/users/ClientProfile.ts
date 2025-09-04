//Razdeliti ovaj fajl

import type { ClientProfileStats } from "../../models/client/ClientProfileStats";

export type TrainingType = "INDIVIDUAL" | "GROUP";
export type Gender = "male" | "female" | "other" | null;

export interface RatingsPoint {
  date: string;          // ISO
  avg: number | null;    // API često može da vrati null, pa ga dozvolimo
}

export interface UpcomingSession {
  id: number;
  title: string;
  programName: string;
  type: TrainingType;
  startsAt: string;      // ISO
  durationMin: number;
  isFull: boolean;
  trainerName: string;
}

export interface ClientProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender?: Gender;             // dozvoljen null i undefined
  age?: number | null;
  address?: string | null;
  avatarUrl?: string | null;
  isBlocked: boolean;
  stats: ClientProfileStats;
  upcomingSessions: UpcomingSession[];
  ratingsTrend: RatingsPoint[];
}