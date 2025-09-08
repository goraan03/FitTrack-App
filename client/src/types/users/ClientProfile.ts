import type { ClientProfileStats } from "../../models/client/ClientProfileStats";

export type TrainingType = "INDIVIDUAL" | "GROUP";
export type Gender = "male" | "female" | "other" | null;

export interface RatingsPoint {
  date: string; 
  avg: number | null;
}

export interface UpcomingSession {
  id: number;
  title: string;
  programName: string;
  type: TrainingType;
  startsAt: string;
  durationMin: number;
  isFull: boolean;
  trainerName: string;
}

export interface ClientProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender?: Gender;
  age?: number | null;
  address?: string | null;
  avatarUrl?: string | null;
  isBlocked: boolean;
  assignedTrainerId: number | null;
  stats: ClientProfileStats;
  upcomingSessions: UpcomingSession[];
  ratingsTrend: RatingsPoint[];
}