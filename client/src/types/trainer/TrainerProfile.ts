import type { RatingsPoint } from "../client/RatingsPoint";

export interface TrainerProfileStats {
  sessionsCompleted: number;
  avgRating: number | null;
  totalPrograms: number;
  totalHours: number;
}

export interface TrainerProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string | null;
  age: number | null;
  address: string | null;
  avatarUrl: string | null;
  isBlocked: boolean;

  stats: TrainerProfileStats;
  ratingsTrend: RatingsPoint[];
}