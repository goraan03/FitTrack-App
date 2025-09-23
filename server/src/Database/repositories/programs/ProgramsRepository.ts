import db from "../../connection/DbConnectionPool";
import { RowDataPacket } from "mysql2";
import { IProgramsRepository, ProgramDetailsForClient, ProgramExerciseDetails } from "../../../Domain/repositories/programs/IProgramsRepository";
import { Program } from "../../../Domain/models/Program";

export class ProgramsRepository implements IProgramsRepository {
  async listPublic(params: {
    q?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    trainerId?: number;
  }): Promise<Program[]> {
    const where: string[] = ["p.is_public = 1"];
    const args: any[] = [];

    if (params.q) {
      where.push("(p.title LIKE ? OR p.description LIKE ?)");
      args.push(`%${params.q}%`, `%${params.q}%`);
    }

    if (params.level) {
      where.push("p.level = ?");
      args.push(params.level);
    }

    if (params.trainerId) {
      where.push("p.trainer_id = ?");
      args.push(params.trainerId);
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT p.id, p.title, p.description, p.level, p.trainer_id as trainerId, CONCAT(u.ime,' ',u.prezime) as trainerName
       FROM programs p
       JOIN users u ON u.id = p.trainer_id
       WHERE ${where.join(" AND ")}
       ORDER BY p.created_at DESC
       LIMIT 200`,
      args
    );

    return (rows as any[]).map(
      (r) => new Program(
        r.id,
        r.title,
        r.description || null,
        r.level,
        r.trainerId,
        r.trainerName
      )
    );
  }

  async listVisibleForClient(params: {
    clientId: number;
    trainerId: number;
    q?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<Program[]> {
    const where: string[] = ["p.trainer_id = ?"];
    const args: any[] = [params.trainerId];

    if (params.q) {
      where.push("(p.title LIKE ? OR p.description LIKE ?)");
      args.push(`%${params.q}%`, `%${params.q}%`);
    }

    if (params.level) {
      where.push("p.level = ?");
      args.push(params.level);
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT p.id, p.title, p.description, p.level, p.trainer_id AS trainerId, CONCAT(u.ime,' ',u.prezime) AS trainerName
       FROM programs p
       JOIN users u ON u.id = p.trainer_id
       LEFT JOIN client_programs cp ON cp.program_id = p.id AND cp.client_id = ?
       WHERE ${where.join(' AND ')} AND (p.is_public = 1 OR cp.client_id IS NOT NULL)
       ORDER BY p.created_at DESC
       LIMIT 200`,
      [params.clientId, ...args]
    );

    return (rows as any[]).map(
      (r) => new Program(
        r.id,
        r.title,
        r.description || null,
        r.level,
        r.trainerId,
        r.trainerName
      )
    );
  }

  async getDetailsVisibleForClient(programId: number, trainerId: number, clientId: number): Promise<ProgramDetailsForClient | null> {
    const [pRows] = await db.execute<RowDataPacket[]>(
      `SELECT p.id, p.title, p.description, p.level, p.trainer_id AS trainerId, CONCAT(u.ime,' ',u.prezime) AS trainerName
       FROM programs p
       JOIN users u ON u.id = p.trainer_id
       LEFT JOIN client_programs cp ON cp.program_id = p.id AND cp.client_id = ?
       WHERE p.id = ? AND p.trainer_id = ? AND (p.is_public = 1 OR cp.client_id IS NOT NULL)
       LIMIT 1`,
      [clientId, programId, trainerId]
    );
    if (!(pRows as any[]).length) return null;
    const base: any = pRows[0];

    const [eRows] = await db.execute<RowDataPacket[]>(
      `SELECT pe.exercise_id AS exerciseId, pe.position, e.name, e.description, e.video_url AS videoUrl
       FROM program_exercises pe
       JOIN exercises e ON e.id = pe.exercise_id
       WHERE pe.program_id = ?
       ORDER BY pe.position ASC`,
      [programId]
    );

    const exercises: ProgramExerciseDetails[] = (eRows as any[]).map(r => ({
      exerciseId: Number(r.exerciseId),
      position: Number(r.position || 0),
      name: r.name,
      description: r.description ?? null,
      videoUrl: r.videoUrl ?? null,
    }));

    return {
      id: Number(base.id),
      title: base.title,
      description: base.description ?? null,
      level: base.level,
      trainerId: Number(base.trainerId),
      trainerName: base.trainerName,
      exercises,
    };
  }
}