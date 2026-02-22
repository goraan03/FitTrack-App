import type { ClientProfileStats } from "../../models/client/ClientProfileStats";

export type TrainingType = "INDIVIDUAL" | "GROUP";
export type Gender = "male" | "female" | "other" | "musko" | "zensko" | null;

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
  dateOfBirthISO?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  isBlocked: boolean;
  assignedTrainerId: number | null;
  stats: ClientProfileStats;
  upcomingSessions: UpcomingSession[];
  ratingsTrend: RatingsPoint[];
}

export type UpdateMyProfileRequest = {
  firstName: string;
  lastName: string;
  gender: "musko" | "zensko" | null;
  address: string | null;
  dateOfBirthISO: string | null; // "YYYY-MM-DD" ili null
};
