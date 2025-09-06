import { TrainingType } from "../../types/training_enrollments/TrainingType";

export type TrainerWeeklyTermRow = {
  termId: number;
  startAt: Date;
  dur: number;
  type: TrainingType;
  title: string;
  enrolledCount: number;
  capacity: number;
};

export type PendingRatingRow = {
  termId: number;
  startAt: Date;
  durationMin: number;
  title: string;
  userId: number;
  userName: string;
};

export interface ITrainerQueriesRepository {
  getWeeklyTerms(
    trainerId: number,
    weekStart: Date,
    weekEnd: Date
  ): Promise<TrainerWeeklyTermRow[]>;

  getWeekStats(
    trainerId: number,
    weekStart: Date,
    weekEnd: Date
  ): Promise<{ totalTerms: number; totalMinutes: number; enrolledSum: number }>;

  getAvgRatingAllTime(trainerId: number): Promise<number | null>;

  listPendingRatings(trainerId: number): Promise<PendingRatingRow[]>;

  listUnratedParticipantsForTerm(
    trainerId: number,
    termId: number
  ): Promise<PendingRatingRow[]>;
}