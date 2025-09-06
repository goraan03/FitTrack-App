import { TrainingType } from "../../types/training_enrollments/TrainingType";

export type TrainerWeeklyEvent = {
  id: number;
  title: string;
  day: number;       // 0..6
  start: string;     // "HH:mm"
  end: string;       // "HH:mm"
  type: TrainingType;
  cancellable: boolean;
};

export type PendingTerm = {
  termId: number;
  startAt: string;
  programTitle: string;
  count: number;
};

export type PendingParticipant = { userId: number; userName: string };

export type TrainerDashboard =
  { stats: { totalTerms: number; scheduledHours: number; avgRating: number | null; enrolledThisWeek: number; },
    events: TrainerWeeklyEvent[],
    pendingRatings: PendingTerm[]
  };

export interface ITrainerService {
  getDashboard(trainerId: number, weekStartISO?: string): Promise<TrainerDashboard>;
  getUnratedParticipants(trainerId: number, termId: number): Promise<{ termId: number; programTitle: string; participants: PendingParticipant[] }>;
  rateParticipant(trainerId: number, termId: number, userId: number, rating: number): Promise<void>;
}