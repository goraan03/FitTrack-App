export type TrainingType = 'INDIVIDUAL' | 'GROUP';

export interface RatingsPoint {
  date: string; // ISO
  avg: number;  // 1-10
}

export interface UpcomingSession {
  id: number;
  title: string;
  programName: string;
  type: TrainingType;
  startsAt: string;   // ISO
  durationMin: number;
  isFull: boolean;
  trainerName: string;
}

export interface ClientProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  address?: string;
  avatarUrl?: string | null;
  isBlocked: boolean;
  stats: {
    sessionsCompleted: number;
    avgRating: number | null;
    totalPrograms: number;
    totalHours: number;
  };
  upcomingSessions: UpcomingSession[];
  ratingsTrend: RatingsPoint[];
}