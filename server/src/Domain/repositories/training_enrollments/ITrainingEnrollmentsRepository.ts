import { RawWeeklyEventRow } from "../../types/training_enrollments/RawWeeklyEventRow";

export interface ITrainingEnrollmentsRepository {
  getWeeklySchedule(userId: number, weekStart: Date, weekEnd: Date): Promise<RawWeeklyEventRow[]>;
}