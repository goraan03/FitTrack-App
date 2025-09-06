import db from "../../connection/DbConnectionPool";
import { RowDataPacket } from "mysql2";
import { RawWeeklyEventRow } from "../../../Domain/types/training_enrollments/RawWeeklyEventRow";
import { ITrainingEnrollmentsRepository } from "../../../Domain/repositories/training_enrollments/ITrainingEnrollmentsRepository";

export class TrainingEnrollmentRepository implements ITrainingEnrollmentsRepository {
  async getWeeklySchedule(userId: number, weekStart: Date, weekEnd: Date): Promise<RawWeeklyEventRow[]> {
    const query = `
      SELECT e.term_id as termId, t.start_at as startAt, t.duration_min as dur, t.type,
             p.title as programTitle, CONCAT(u.ime,' ',u.prezime) as trainerName
      FROM training_enrollments e
      JOIN training_terms t ON t.id=e.term_id
      JOIN programs p ON p.id=t.program_id
      JOIN users u ON u.id=t.trainer_id
      WHERE e.user_id=? AND t.start_at>=? AND t.start_at<? AND e.status='enrolled' AND t.canceled=0
      ORDER BY t.start_at
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query, [userId, weekStart, weekEnd]);
    return rows as RawWeeklyEventRow[];
  }
}