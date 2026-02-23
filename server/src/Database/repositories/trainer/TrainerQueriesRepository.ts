import db from "../../connection/DbConnectionPool";
import { RowDataPacket } from "mysql2";
import { ITrainerQueriesRepository } from "../../../Domain/repositories/trainer/ITrainerQueriesRepository";
import { TrainerWeeklyTermRow } from "../../../Domain/services/trainer/ITrainerService";
import { PendingRatingRow } from "../../../Domain/types/trainerqueries/PendingRatingRow";

export class TrainerQueriesRepository implements ITrainerQueriesRepository {

  async getWeeklyTerms(trainerId: number, weekStart: Date, weekEnd: Date): Promise<TrainerWeeklyTermRow[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT 
        tt.id as termId,
        tt.start_at as startAt,
        tt.duration_min as dur,
        tt.type,
        p.title,
        tt.enrolled_count as enrolledCount,
        tt.capacity,
        tt.program_id as programId,
        CASE 
          WHEN COUNT(ws.id) > 0 THEN 1
          ELSE COALESCE(MAX(te.session_completed), 0)
        END as completed,
        ec.user_id as enrolledClientId,
        CONCAT(cu.ime, ' ', cu.prezime) as enrolledClientName
      FROM training_terms tt
      LEFT JOIN programs p ON tt.program_id = p.id
      LEFT JOIN training_enrollments te ON tt.id = te.term_id
      LEFT JOIN workout_sessions ws ON ws.term_id = tt.id
      LEFT JOIN (
        SELECT term_id, MIN(user_id) as user_id FROM training_enrollments WHERE status = 'enrolled' GROUP BY term_id
      ) ec ON ec.term_id = tt.id
      LEFT JOIN users cu ON cu.id = ec.user_id
      WHERE tt.trainer_id = ?
        AND tt.start_at >= ?
        AND tt.start_at < ?
        AND tt.canceled = 0
      GROUP BY tt.id, ec.user_id, cu.ime, cu.prezime
      ORDER BY tt.start_at`,
      [trainerId, weekStart, weekEnd]
    );
    return (rows as any[]).map(r => ({
      termId: r.termId,
      startAt: new Date(r.startAt),
      dur: Number(r.dur || 0),
      type: r.type,
      title: r.title || null,
      programId: r.programId || null,
      enrolledCount: Number(r.enrolledCount || 0),
      capacity: Number(r.capacity || 0),
      completed: Number(r.completed || 0),
      enrolledClientId: r.enrolledClientId || null,
      enrolledClientName: r.enrolledClientName || null,
    }));
  }

  async getWeekStats(trainerId: number, from: Date, to: Date): Promise<{ totalTerms: number; totalMinutes: number; enrolledSum: number; }> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS totalTerms,
              COALESCE(SUM(t.duration_min),0) AS totalMinutes,
              COALESCE(SUM(t.enrolled_count),0) AS enrolledSum
       FROM training_terms t
       WHERE t.trainer_id=?
         AND t.canceled=0
         AND t.start_at BETWEEN ? AND ?`,
      [trainerId, from, to]
    );
    const r: any = (rows as any[])[0] || {};
    return {
      totalTerms: Number(r.totalTerms || 0),
      totalMinutes: Number(r.totalMinutes || 0),
      enrolledSum: Number(r.enrolledSum || 0),
    };
  }

  async getAvgRatingAllTime(trainerId: number): Promise<number | null> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT AVG(e.rating) AS avgRating
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       WHERE t.trainer_id=?
         AND e.rating IS NOT NULL`,
      [trainerId]
    );
    const r: any = (rows as any[])[0] || {};
    return r.avgRating != null ? Number(r.avgRating) : null;
  }

  async listPendingRatings(trainerId: number): Promise<PendingRatingRow[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT t.id AS termId,
              t.start_at AS startAt,
              t.duration_min AS durationMin,
              p.title AS title,
              u.id AS userId,
              CONCAT(u.ime,' ',u.prezime) AS userName
       FROM training_terms t
       JOIN programs p ON p.id=t.program_id
       JOIN training_enrollments e ON e.term_id=t.id
       JOIN users u ON u.id=e.user_id
       WHERE t.trainer_id=?
         AND t.canceled=0
         AND e.status='enrolled'
         AND e.rating IS NULL
         AND DATE_ADD(t.start_at, INTERVAL t.duration_min MINUTE) < NOW()
       ORDER BY t.start_at DESC`,
      [trainerId]
    );
    return (rows as any[]).map(r => ({
      termId: r.termId,
      startAt: new Date(r.startAt),
      durationMin: Number(r.durationMin || 0),
      title: r.title,
      userId: r.userId,
      userName: r.userName,
    }));
  }

  async listUnratedParticipantsForTerm(trainerId: number, termId: number): Promise<PendingRatingRow[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT t.id AS termId,
              t.start_at AS startAt,
              t.duration_min AS durationMin,
              p.title AS title,
              u.id AS userId,
              CONCAT(u.ime,' ',u.prezime) AS userName
       FROM training_terms t
       JOIN programs p ON p.id=t.program_id
       JOIN training_enrollments e ON e.term_id=t.id
       JOIN users u ON u.id=e.user_id
       WHERE t.trainer_id=?
         AND t.id=?
         AND t.canceled=0
         AND e.status='enrolled'
         AND e.rating IS NULL`,
      [trainerId, termId]
    );
    return (rows as any[]).map(r => ({
      termId: r.termId,
      startAt: new Date(r.startAt),
      durationMin: Number(r.durationMin || 0),
      title: r.title,
      userId: r.userId,
      userName: r.userName,
    }));
  }

  async getCompletedTermsCount(trainerId: number): Promise<number> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt
       FROM training_terms t
       WHERE t.trainer_id=?
         AND t.canceled=0
         AND DATE_ADD(t.start_at, INTERVAL t.duration_min MINUTE) < NOW()`,
      [trainerId]
    );
    const r: any = (rows as any[])[0] || {};
    return Number(r.cnt || 0);
  }

  async getTotalCompletedMinutes(trainerId: number): Promise<number> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(t.duration_min),0) AS total
       FROM training_terms t
       WHERE t.trainer_id=?
         AND t.canceled=0
         AND DATE_ADD(t.start_at, INTERVAL t.duration_min MINUTE) < NOW()`,
      [trainerId]
    );
    const r: any = (rows as any[])[0] || {};
    return Number(r.total || 0);
  }

  async getProgramsCount(trainerId: number): Promise<number> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt FROM programs WHERE trainer_id=?`,
      [trainerId]
    );
    const r: any = (rows as any[])[0] || {};
    return Number(r.cnt || 0);
  }

  async getRatingsTrend(trainerId: number): Promise<{ date: Date; avg: number | null }[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT DATE(e.created_at) AS d, AVG(e.rating) AS a
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       WHERE t.trainer_id=?
         AND e.rating IS NOT NULL
       GROUP BY DATE(e.created_at)
       ORDER BY d ASC`,
      [trainerId]
    );
    return (rows as any[]).map(r => ({ date: new Date(r.d), avg: r.a != null ? Number(r.a) : null }));
  }

  async getTermsBetweenDetailed(trainerId: number, from: Date, to: Date) {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT t.id,
              t.start_at AS startAt,
              t.duration_min AS durationMin,
              t.type AS type,
              t.capacity,
              t.enrolled_count AS enrolledCount,
              t.canceled,
              t.program_id AS programId,
              p.title AS programTitle,
              CASE 
                WHEN COUNT(ws.id) > 0 THEN 1
                ELSE COALESCE(MAX(te.session_completed), 0)
              END AS completed,
              ec.user_id AS enrolledClientId,
              CONCAT(cu.ime, ' ', cu.prezime) AS enrolledClientName
       FROM training_terms t
       LEFT JOIN programs p ON p.id=t.program_id
       LEFT JOIN training_enrollments te ON te.term_id = t.id
       LEFT JOIN workout_sessions ws ON ws.term_id = t.id
       LEFT JOIN (
         SELECT term_id, MIN(user_id) as user_id FROM training_enrollments WHERE status = 'enrolled' GROUP BY term_id
       ) ec ON ec.term_id = t.id
       LEFT JOIN users cu ON cu.id = ec.user_id
       WHERE t.trainer_id=?
         AND t.start_at BETWEEN ? AND ?
         AND t.canceled = 0
       GROUP BY t.id, ec.user_id, cu.ime, cu.prezime
       ORDER BY t.start_at ASC`,
      [trainerId, from, to]
    );
    return (rows as any[]).map(r => ({
      id: r.id,
      startAt: new Date(r.startAt),
      durationMin: Number(r.durationMin || 0),
      type: r.type,
      capacity: Number(r.capacity || 0),
      enrolledCount: Number(r.enrolledCount || 0),
      canceled: !!r.canceled,
      programId: r.programId || null,
      completed: Number(r.completed || 0) === 1,
      programTitle: r.programTitle || null,
      enrolledClientId: r.enrolledClientId || null,
      enrolledClientName: r.enrolledClientName || null,
    }));
  }

  async listMyClients(trainerId: number) {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id,
              korisnickoIme AS email,
              ime AS firstName,
              prezime AS lastName,
              pol AS gender,
              datumRodjenja AS birthDate
       FROM users
       WHERE uloga='klijent' AND assigned_trener_id=?`,
      [trainerId]
    );
    return (rows as any[]).map(r => ({
      id: r.id,
      firstName: r.firstName || null,
      lastName: r.lastName || null,
      email: r.email,
      gender: r.gender || null,
      birthDate: r.birthDate ? new Date(r.birthDate) : null,
    }));
  }

  async isClientAssignedToTrainer(clientId: number, trainerId: number): Promise<boolean> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT 1 AS ok FROM users WHERE id=? AND uloga='klijent' AND assigned_trener_id=? LIMIT 1`,
      [clientId, trainerId]
    );
    return (rows as any[]).length > 0;
  }
}
