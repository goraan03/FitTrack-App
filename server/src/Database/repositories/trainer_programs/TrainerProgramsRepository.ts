import db from "../../connection/DbConnectionPool";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ITrainerProgramsRepository, ProgramRow, ProgramExerciseRow } from "../../../Domain/repositories/trainer_programs/ITrainerProgramsRepository";

export class TrainerProgramsRepository implements ITrainerProgramsRepository {

  async listByTrainer(trainerId: number): Promise<ProgramRow[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id,
              trainer_id AS trainerId,
              title,
              description,
              level,
              is_public AS isPublic,
              created_at AS createdAt
       FROM programs
       WHERE trainer_id=?
       ORDER BY created_at DESC`,
      [trainerId]
    );
    return (rows as any[]).map(r => ({
      id: r.id,
      trainerId: r.trainerId,
      title: r.title,
      description: r.description,
      level: r.level,
      isPublic: !!r.isPublic,
      createdAt: new Date(r.createdAt),
    }));
  }

  async create(trainerId: number, data: Omit<ProgramRow,'id'|'trainerId'|'createdAt'>): Promise<number> {
    const [res] = await db.execute<ResultSetHeader>(
      `INSERT INTO programs (trainer_id,title,description,level,is_public,created_at)
       VALUES (?,?,?,?,?,NOW())`,
      [trainerId, data.title, data.description ?? null, data.level, data.isPublic ? 1 : 0]
    );
    return (res as ResultSetHeader).insertId;
  }

  async update(trainerId: number, id: number, data: Partial<Omit<ProgramRow,'id'|'trainerId'|'createdAt'>>): Promise<void> {
    const fields: string[] = [];
    const args: any[] = [];
    if (data.title != null) { fields.push('title=?'); args.push(data.title); }
    if (data.description !== undefined) { fields.push('description=?'); args.push(data.description); }
    if (data.level != null) { fields.push('level=?'); args.push(data.level); }
    if (data.isPublic != null) { fields.push('is_public=?'); args.push(data.isPublic ? 1 : 0); }
    if (!fields.length) return;
    args.push(trainerId, id);
    await db.execute<ResultSetHeader>(
      `UPDATE programs SET ${fields.join(', ')} WHERE trainer_id=? AND id=?`,
      args
    );
  }

  async getById(id: number): Promise<ProgramRow | null> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, trainer_id AS trainerId, title, description, level, is_public AS isPublic, created_at AS createdAt
       FROM programs WHERE id=? LIMIT 1`,
      [id]
    );
    if (!(rows as any[]).length) return null;
    const r: any = rows[0];
    return {
      id: r.id,
      trainerId: r.trainerId,
      title: r.title,
      description: r.description,
      level: r.level,
      isPublic: !!r.isPublic,
      createdAt: new Date(r.createdAt),
    };
  }

  async getDetails(trainerId: number, programId: number): Promise<{ program: ProgramRow; exercises: ProgramExerciseRow[] }> {
    const program = await this.getById(programId);
    if (!program || program.trainerId !== trainerId) throw new Error('NOT_ALLOWED');

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT pe.program_id AS programId,
              pe.exercise_id AS exerciseId,
              pe.position,
              pe.sets,
              pe.reps,
              pe.tempo,
              pe.rest_sec AS restSec,
              pe.notes,
              e.name
       FROM program_exercises pe
       JOIN exercises e ON e.id=pe.exercise_id
       WHERE pe.program_id=?
       ORDER BY pe.position ASC`,
      [programId]
    );
    const exercises: ProgramExerciseRow[] = (rows as any[]).map(r => ({
      programId: r.programId,
      exerciseId: r.exerciseId,
      position: Number(r.position || 0),
      sets: r.sets != null ? Number(r.sets) : null,
      reps: r.reps,
      tempo: r.tempo,
      restSec: r.restSec != null ? Number(r.restSec) : null,
      notes: r.notes,
      name: r.name,
    }));
    return { program, exercises };
  }

  async replaceProgramExercises(trainerId: number, programId: number, items: ProgramExerciseRow[]): Promise<void> {
    const program = await this.getById(programId);
    if (!program || program.trainerId !== trainerId) throw new Error('NOT_ALLOWED');

    await db.execute<ResultSetHeader>(`DELETE FROM program_exercises WHERE program_id=?`, [programId]);
    if (!items.length) return;

    const values: string[] = [];
    const args: any[] = [];
    for (const it of items) {
      values.push("(?,?,?,?,?,?,?)");
      args.push(programId, it.exerciseId, it.position, it.sets ?? null, it.reps ?? null, it.tempo ?? null, it.restSec ?? null);
    }
    await db.execute<ResultSetHeader>(
      `INSERT INTO program_exercises (program_id,exercise_id,position,sets,reps,tempo,rest_sec)
       VALUES ${values.join(",")}`,
      args
    );

    if (items.some(x => x.notes != null)) {
      for (const it of items) {
        if (it.notes != null) {
          await db.execute<ResultSetHeader>(
            `UPDATE program_exercises SET notes=? WHERE program_id=? AND exercise_id=? AND position=?`,
            [it.notes, programId, it.exerciseId, it.position]
          );
        }
      }
    }
  }

  async assignToClient(programId: number, clientId: number): Promise<void> {
    await db.execute<ResultSetHeader>(
      `INSERT INTO client_programs (program_id, client_id, status)
       VALUES (?, ?, 'active')
       ON DUPLICATE KEY UPDATE status='active', assigned_at=NOW()`,
      [programId, clientId]
    );
  }
}