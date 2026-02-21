import db from "../../connection/DbConnectionPool";
import { ResultSetHeader, Connection, RowDataPacket } from "mysql2/promise";

export interface WorkoutLogItem {
  exerciseId: number;
  setNumber: number;
  plannedReps?: string;
  actualReps: number;
  plannedWeight?: number;
  actualWeight: number;
}

export class WorkoutRepository {
  async hasSessionForTerm(termId: number): Promise<boolean> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT 1 AS ok FROM workout_sessions WHERE term_id = ? LIMIT 1`,
      [termId]
    );
    return (rows as any[]).length > 0;
  }

  async saveSession(data: {
    termId: number;
    trainerId: number;
    clientId: number;
    startTime: Date;
    endTime: Date;
    notes?: string;
    logs: WorkoutLogItem[];
  }): Promise<number> {
    const conn = (await (db as any).getConnection()) as Connection;
    try {
      await conn.beginTransaction();

      // 1. Ubaci sesiju
      const [sessionRes] = await conn.execute<ResultSetHeader>(
        `INSERT INTO workout_sessions (term_id, trainer_id, client_id, start_time, end_time, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.termId, data.trainerId, data.clientId, data.startTime, data.endTime, data.notes ?? null]
      );
      const sessionId = sessionRes.insertId;

      // 2. Ubaci logove vežbi
      if (data.logs.length > 0) {
        const values: string[] = [];
        const args: any[] = [];
        for (const log of data.logs) {
          values.push("(?, ?, ?, ?, ?, ?, ?)");
          args.push(
            sessionId,
            log.exerciseId,
            log.setNumber,
            log.plannedReps ?? null,
            log.actualReps,
            log.plannedWeight ?? null,
            log.actualWeight
          );
        }
        await conn.execute(
          `INSERT INTO workout_exercise_logs 
           (session_id, exercise_id, set_number, planned_reps, actual_reps, planned_weight, actual_weight) 
           VALUES ${values.join(",")}`,
          args
        );
      }

      await conn.commit();
      return sessionId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      await conn.end();
    }
  }
}
