import db from "../../connection/DbConnectionPool";
import { RowDataPacket } from "mysql2";
import {
  ITrainerQueriesRepository,
  TrainerWeeklyTermRow,
  PendingRatingRow,
} from "../../../Domain/repositories/trainer/ITrainerQueriesRepository";

type WeeklyRow = RowDataPacket & {
  termId: number; startAt: Date; dur: number; type: string; title: string; enrolledCount: number; capacity: number;
};

type StatsRow = RowDataPacket & { totalTerms: number; totalMinutes: number; enrolledSum: number };
type AvgRow = RowDataPacket & { avgRating: number | null };

type PendingRow = RowDataPacket & {
  termId: number; startAt: Date; durationMin: number; title: string; userId: number; userName: string;
};

type CountRow = RowDataPacket & { c: number };
type MinutesRow = RowDataPacket & { totalMinutes: number };
type TrendRow = RowDataPacket & { day: Date; avg: number | null };

export class TrainerQueriesRepository implements ITrainerQueriesRepository {
  async getWeeklyTerms(trainerId: number, weekStart: Date, weekEnd: Date): Promise<TrainerWeeklyTermRow[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT t.id AS termId,
              t.start_at AS startAt,
              t.duration_min AS dur,
              t.type,
              p.title AS title,
              t.enrolled_count AS enrolledCount,
              t.capacity
       FROM training_terms t
       JOIN programs p ON p.id=t.program_id
       WHERE t.trainer_id=? AND t.canceled=0 AND t.start_at>=? AND t.start_at<? 
       ORDER BY t.start_at ASC`,
      [trainerId, weekStart, weekEnd]
    );
    return (rows as WeeklyRow[]).map(r => ({
      termId: r.termId,
      startAt: new Date(r.startAt),
      dur: Number(r.dur || 0),
      type: r.type as any,
      title: r.title,
      enrolledCount: Number(r.enrolledCount || 0),
      capacity: Number(r.capacity || 0),
    }));
  }

  async getWeekStats(trainerId: number, weekStart: Date, weekEnd: Date) {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS totalTerms,
              COALESCE(SUM(t.duration_min),0) AS totalMinutes,
              COALESCE(SUM(t.enrolled_count),0) AS enrolledSum
       FROM training_terms t
       WHERE t.trainer_id=? AND t.canceled=0 AND t.start_at>=? AND t.start_at<?`,
      [trainerId, weekStart, weekEnd]
    );
    const r = (rows as StatsRow[])[0];
    return {
      totalTerms: Number(r?.totalTerms || 0),
      totalMinutes: Number(r?.totalMinutes || 0),
      enrolledSum: Number(r?.enrolledSum || 0),
    };
  }

  async getAvgRatingAllTime(trainerId: number): Promise<number | null> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT AVG(e.rating) AS avgRating
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       WHERE t.trainer_id=? AND e.rating IS NOT NULL`,
      [trainerId]
    );
    const r = (rows as AvgRow[])[0];
    return r?.avgRating != null ? Number(r.avgRating) : null;
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
       JOIN training_enrollments e ON e.term_id=t.id AND e.status='enrolled'
       JOIN users u ON u.id=e.user_id
       WHERE t.trainer_id=?
         AND t.canceled=0
         AND (t.start_at + INTERVAL t.duration_min MINUTE) <= NOW()
         AND e.rating IS NULL
       ORDER BY t.start_at ASC, userName ASC`,
      [trainerId]
    );
    return (rows as PendingRow[]).map(r => ({
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
       JOIN training_enrollments e ON e.term_id=t.id AND e.status='enrolled'
       JOIN users u ON u.id=e.user_id
       WHERE t.trainer_id=? 
         AND t.id=?
         AND t.canceled=0
         AND (t.start_at + INTERVAL t.duration_min MINUTE) <= NOW()
         AND e.rating IS NULL
       ORDER BY userName ASC`,
      [trainerId, termId]
    );
    return (rows as PendingRow[]).map(r => ({
      termId: r.termId,
      startAt: new Date(r.startAt),
      durationMin: Number(r.durationMin || 0),
      title: r.title,
      userId: r.userId,
      userName: r.userName,
    }));
  }

  // ---- NOVO: za MyProfile ----

  async getCompletedTermsCount(trainerId: number): Promise<number> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS c
       FROM training_terms t
       WHERE t.trainer_id=? AND t.canceled=0
         AND (t.start_at + INTERVAL t.duration_min MINUTE) <= NOW()`,
      [trainerId]
    );
    const r = (rows as CountRow[])[0];
    return Number(r?.c || 0);
  }

  async getTotalCompletedMinutes(trainerId: number): Promise<number> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(t.duration_min),0) AS totalMinutes
       FROM training_terms t
       WHERE t.trainer_id=? AND t.canceled=0
         AND (t.start_at + INTERVAL t.duration_min MINUTE) <= NOW()`,
      [trainerId]
    );
    const r = (rows as MinutesRow[])[0];
    return Number(r?.totalMinutes || 0);
  }

  async getProgramsCount(trainerId: number): Promise<number> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS c FROM programs WHERE trainer_id=?`,
      [trainerId]
    );
    const r = (rows as CountRow[])[0];
    return Number(r?.c || 0);
  }

  async getRatingsTrend(trainerId: number): Promise<{ date: Date; avg: number | null }[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT DATE(t.start_at) AS day, AVG(e.rating) AS avg
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       WHERE t.trainer_id=? AND e.rating IS NOT NULL
       GROUP BY DATE(t.start_at)
       ORDER BY day ASC`,
      [trainerId]
    );
    return (rows as TrendRow[]).map(r => ({ date: new Date(r.day), avg: r.avg != null ? Number(r.avg) : null }));
  }
}