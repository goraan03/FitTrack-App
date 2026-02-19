import { RawWeeklyEventRow } from "../../types/training_enrollments/RawWeeklyEventRow";
import { TrainingType } from "../../types/training_enrollments/TrainingType";

export type HistoryRow = {
  id: number;
  startAt: Date;
  programTitle: string;
  trainerName: string;
  status: string;
  rating: number | null;
  feedback: string | null;
};

export type UpcomingSessionRow = {
  id: number;
  title: string;
  programName: string;
  type: TrainingType;
  startsAt: Date;
  durationMin: number;
  enrolledCount: number;
  capacity: number;
  trainerName: string;
};

export type RatingsTrendPointRow = {
  date: Date;
  avg: number;
};

export interface ITrainingEnrollmentsRepository {
  getWeeklySchedule(userId: number, weekStart: Date, weekEnd: Date): Promise<RawWeeklyEventRow[]>;

  findByUserAndTerm(userId: number, termId: number): Promise<{ id: number; status: string } | null>;
  createEnrollment(termId: number, userId: number): Promise<number>;
  reactivateEnrollment(enrollmentId: number): Promise<void>;
  cancelEnrollment(enrollmentId: number): Promise<void>;
  getActiveEnrollmentWithTerm(userId: number, termId: number): Promise<{ enrollmentId: number; termStartAt: Date } | null>;

  listHistory(userId: number): Promise<HistoryRow[]>;
  getRatingsStats(userId: number): Promise<{ total: number; avgRating: number | null }>;

  getCompletedCount(userId: number): Promise<number>;
  getTotalPrograms(userId: number): Promise<number>;
  getTotalCompletedMinutes(userId: number): Promise<number>;
  listUpcomingSessions(userId: number, limit: number): Promise<UpcomingSessionRow[]>;
  getRatingsTrend(userId: number): Promise<RatingsTrendPointRow[]>;

  setRating(termId: number, userId: number, rating: number): Promise<void>;

  getEnrolledUsers(termId: number): Promise<Array<{user_id: number; ime: string; prezime: string}>>;
  markSessionCompleted(termId: number, userId: number): Promise<void>;
}