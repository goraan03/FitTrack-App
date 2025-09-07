export type PendingParticipant = { userId: number; userName: string };

export type TrainerDashboard = {
  stats: {
    totalTerms: number;
    scheduledHours: number;
    avgRating: number | null;
    enrolledThisWeek: number;
  };
  events: {
    id: number;
    title: string;
    day: number;       // 0..6
    start: string;     // HH:mm
    end: string;       // HH:mm
    type: string;      // 'group' | 'individual' | ...
    cancellable: boolean;
  }[];
  pendingRatings: { termId: number; startAt: string; programTitle: string; count: number }[];
};

export type TrainerProfile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string | null;
  age: number | null;
  address: string | null;
  avatarUrl: string | null;
  isBlocked: boolean;
  stats: {
    sessionsCompleted: number;
    avgRating: number | null;
    totalPrograms: number;
    totalHours: number;
  };
  ratingsTrend: { date: string; avg: number | null }[];
};

export interface ITrainerService {
  getDashboard(trainerId: number, weekStartISO?: string): Promise<TrainerDashboard>;
  getUnratedParticipants(trainerId: number, termId: number): Promise<{ termId: number; programTitle: string; participants: PendingParticipant[] }>;
  rateParticipant(trainerId: number, termId: number, userId: number, rating: number): Promise<void>;
  getMyProfile(trainerId: number): Promise<TrainerProfile>;
}