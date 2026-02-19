import db from "../../connection/DbConnectionPool";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { RawWeeklyEventRow } from "../../../Domain/types/training_enrollments/RawWeeklyEventRow";
import {
  ITrainingEnrollmentsRepository,
  HistoryRow,
  UpcomingSessionRow,
  RatingsTrendPointRow,
} from "../../../Domain/repositories/training_enrollments/ITrainingEnrollmentsRepository";

export class TrainingEnrollmentRepository implements ITrainingEnrollmentsRepository {
  async getWeeklySchedule(userId: number, weekStart: Date, weekEnd: Date): Promise<RawWeeklyEventRow[]> {
    const query = `
      SELECT e.term_id as termId, t.start_at as startAt, t.duration_min as dur, t.type, t.program_id as programId,
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

  async findByUserAndTerm(userId: number, termId: number): Promise<{ id: number; status: string } | null> {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT id, status FROM training_enrollments WHERE term_id=? AND user_id=? LIMIT 1",
      [termId, userId]
    );
    if (!(rows as any[]).length) return null;
    const r: any = rows[0];
    return { id: r.id, status: r.status };
  }

  async createEnrollment(termId: number, userId: number): Promise<number> {
    const [res] = await db.execute<ResultSetHeader>(
      "INSERT INTO training_enrollments (term_id, user_id) VALUES (?,?)",
      [termId, userId]
    );
    return res.insertId || 0;
  }

  async reactivateEnrollment(enrollmentId: number): Promise<void> {
    await db.execute<ResultSetHeader>(
      "UPDATE training_enrollments SET status='enrolled', rating=NULL, feedback=NULL WHERE id=?",
      [enrollmentId]
    );
  }

  async cancelEnrollment(enrollmentId: number): Promise<void> {
    await db.execute<ResultSetHeader>(
      "UPDATE training_enrollments SET status='canceled_by_user' WHERE id=?",
      [enrollmentId]
    );
  }

  async getActiveEnrollmentWithTerm(userId: number, termId: number): Promise<{ enrollmentId: number; termStartAt: Date } | null> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT e.id as enrollmentId, t.start_at as startAt
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       WHERE e.user_id=? AND e.term_id=? AND e.status='enrolled'
       LIMIT 1`,
      [userId, termId]
    );
    if (!(rows as any[]).length) return null;
    const r: any = rows[0];
    return { enrollmentId: r.enrollmentId, termStartAt: new Date(r.startAt) };
  }

  async listHistory(userId: number): Promise<HistoryRow[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT e.id, e.status, e.rating, e.feedback, t.start_at as startAt, 
              p.title as programTitle, CONCAT(u.ime,' ',u.prezime) as trainerName
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       JOIN programs p ON p.id=t.program_id
       JOIN users u ON u.id=t.trainer_id
       WHERE e.user_id=? AND t.start_at < NOW()
       ORDER BY t.start_at DESC
       LIMIT 100`,
      [userId]
    );
    return (rows as any[]).map(r => ({
      id: r.id,
      startAt: new Date(r.startAt),
      programTitle: r.programTitle,
      trainerName: r.trainerName,
      status: r.status,
      rating: r.rating ?? null,
      feedback: r.feedback ?? null
    }));
  }

  async getRatingsStats(userId: number): Promise<{ total: number; avgRating: number | null }> {
    const [srows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total, AVG(rating) as avgRating 
       FROM training_enrollments 
       WHERE user_id=? AND rating IS NOT NULL`,
      [userId]
    );
    const total = Number((srows as any[])[0]?.total || 0);
    const avgRating = (srows as any[])[0]?.avgRating != null ? Number((srows as any[])[0].avgRating) : null;
    return { total, avgRating };
  }

  async getCompletedCount(userId: number): Promise<number> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       WHERE e.user_id=? AND e.status='enrolled' AND t.start_at < NOW()`,
      [userId]
    );
    return Number((rows as any[])[0]?.cnt || 0);
  }

  async getTotalPrograms(userId: number): Promise<number> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT p.id) AS totalPrograms
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       JOIN programs p ON p.id=t.program_id
       WHERE e.user_id=? AND e.status='enrolled'`,
      [userId]
    );
    return Number((rows as any[])[0]?.totalPrograms || 0);
  }

  async getTotalCompletedMinutes(userId: number): Promise<number> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(t.duration_min),0) AS totalMin
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       WHERE e.user_id=? AND e.status='enrolled' AND t.start_at < NOW()`,
      [userId]
    );
    return Number((rows as any[])[0]?.totalMin || 0);
  }

  async listUpcomingSessions(userId: number, limit: number): Promise<UpcomingSessionRow[]> {
    const lim = Math.max(1, Math.min(100, Number(limit || 10))); // bezbedno
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT t.id,
              p.title AS programName,
              p.title AS title,
              t.type,
              t.start_at AS startsAt,
              t.duration_min AS durationMin,
              t.enrolled_count,
              t.capacity,
              CONCAT(tr.ime,' ',tr.prezime) AS trainerName
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       JOIN programs p ON p.id=t.program_id
       JOIN users tr ON tr.id=t.trainer_id
       WHERE e.user_id=? AND e.status='enrolled' AND t.canceled=0 AND t.start_at >= NOW()
       ORDER BY t.start_at ASC
       LIMIT ${lim}`,
      [userId]
    );
    return (rows as any[]).map(r => ({
      id: r.id,
      title: r.title,
      programName: r.programName,
      type: r.type,
      startsAt: new Date(r.startsAt),
      durationMin: Number(r.durationMin || 0),
      enrolledCount: Number(r.enrolled_count || 0),
      capacity: Number(r.capacity || 0),
      trainerName: r.trainerName,
    }));
  }

  async getRatingsTrend(userId: number): Promise<RatingsTrendPointRow[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT DATE_FORMAT(t.start_at, '%Y-%m-01') AS d, AVG(e.rating) AS avg
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       WHERE e.user_id=? AND e.rating IS NOT NULL
       GROUP BY d
       ORDER BY d ASC`,
      [userId]
    );
    return (rows as any[]).map(r => ({
      date: new Date(r.d),
      avg: Number(r.avg),
    }));
  }


    async setRating(termId: number, userId: number, rating: number): Promise<void> {
    await db.execute<ResultSetHeader>(
      `UPDATE training_enrollments 
       SET rating=? 
       WHERE term_id=? AND user_id=? AND status='enrolled'`,
      [rating, termId, userId]
    );
  }

  async getEnrolledUsers(termId: number): Promise<Array<{user_id: number; ime: string; prezime: string}>> {
    const [rows] = await db.query<any[]>(
      `SELECT u.id as user_id, u.ime, u.prezime
       FROM training_enrollments te
       INNER JOIN users u ON te.user_id = u.id
       WHERE te.term_id = ? AND te.status IN ('enrolled', 'attended')`,
      [termId]
    );
    return rows;
  }

  async markSessionCompleted(termId: number, userId: number): Promise<void> {
    await db.execute(
      `UPDATE training_enrollments 
       SET session_completed = 1, status = 'attended', attended_at = NOW()
       WHERE term_id = ? AND user_id = ?`,
      [termId, userId]
    );
  }
}