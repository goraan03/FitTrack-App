import db from "../../connection/DbConnectionPool";
import { RowDataPacket } from "mysql2";
import { AvailableTerm } from "../../../Domain/types/training_terms/AvailableTerm";
import { TrainingType } from "../../../Domain/types/training_enrollments/TrainingType";
import { ITrainingTermsRepository } from "../../../Domain/repositories/training_terms/ITrainingTermsRepository";

function isoToDate(s?: string) { return s ? new Date(s) : null; }

export class TrainingTermsRepository implements ITrainingTermsRepository {
  async getAvailableTerms(
    trainerId: number,
    from: Date,
    to: Date,
    type?: TrainingType,
    programId?: number,
    status?: 'free'|'full',
    userId?: number
  ): Promise<AvailableTerm[]> {
    const where: string[] = ["t.trainer_id=?","t.canceled=0","t.start_at BETWEEN ? AND ?"];
    const args: any[] = [trainerId, from, to];

    if (type) { where.push("t.type=?"); args.push(type); }
    if (programId) { where.push("t.program_id=?"); args.push(programId); }
    if (status==='free') where.push("t.enrolled_count < t.capacity");
    if (status==='full') where.push("t.enrolled_count >= t.capacity");

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT t.id,
              t.start_at as startAt,
              t.duration_min as durationMin,
              t.type,
              t.capacity,
              t.enrolled_count as enrolledCount,
              p.id as programId,
              p.title as programTitle,
              p.level,
              CONCAT(u.ime,' ',u.prezime) as trainerName,
              u.id as trainerId,
              CASE WHEN e.id IS NULL THEN 0 ELSE 1 END as isEnrolled
       FROM training_terms t
       JOIN programs p ON p.id=t.program_id
       JOIN users u ON u.id=t.trainer_id
       LEFT JOIN training_enrollments e
              ON e.term_id = t.id
             AND e.user_id = ?
             AND e.status = 'enrolled'
       WHERE ${where.join(' AND ')}
       ORDER BY t.start_at ASC`,
      [userId, ...args]
    );

    return (rows as any[]).map(r => ({
      id: r.id,
      startAt: new Date(r.startAt).toISOString(),
      durationMin: r.durationMin,
      type: r.type,
      capacity: r.capacity,
      enrolledCount: r.enrolledCount,
      status: (r.enrolledCount >= r.capacity) ? 'full' : 'free',
      isEnrolled: !!Number(r.isEnrolled),
      program: { id: r.programId, title: r.programTitle, level: r.level },
      trainer: { id: r.trainerId, name: r.trainerName }
    }));
  }
}