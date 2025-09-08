import { TrainerWeeklyTermRow } from "../../services/trainer/ITrainerService";
import { PendingRatingRow } from "../../types/trainerqueries/PendingRatingRow";

export interface ITrainerQueriesRepository {
  getWeeklyTerms(trainerId: number, weekStart: Date, weekEnd: Date): Promise<TrainerWeeklyTermRow[]>;
  getWeekStats(trainerId: number, from: Date, to: Date): Promise<{ totalTerms: number; totalMinutes: number; enrolledSum: number }>;
  getAvgRatingAllTime(trainerId: number): Promise<number | null>;
  listPendingRatings(trainerId: number): Promise<PendingRatingRow[]>;
  listUnratedParticipantsForTerm(trainerId: number, termId: number): Promise<PendingRatingRow[]>;
  getCompletedTermsCount(trainerId: number): Promise<number>;
  getTotalCompletedMinutes(trainerId: number): Promise<number>;
  getProgramsCount(trainerId: number): Promise<number>;
  getRatingsTrend(trainerId: number): Promise<{ date: Date; avg: number | null }[]>;
  getTermsBetweenDetailed(trainerId: number, from: Date, to: Date): Promise<{id: number; startAt: Date; durationMin: number; type: 'individual'|'group'; capacity: number; enrolledCount: number; canceled: boolean; programTitle: string;}[]>;
  listMyClients(trainerId: number): Promise<{ id: number; firstName: string | null; lastName: string | null; email: string; gender: string | null; birthDate: Date | null }[]>;
  isClientAssignedToTrainer(clientId: number, trainerId: number): Promise<boolean>;
}