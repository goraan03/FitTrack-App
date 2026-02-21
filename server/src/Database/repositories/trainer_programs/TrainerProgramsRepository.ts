import db from "../../connection/DbConnectionPool";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { ITrainerProgramsRepository, ProgramRow, ProgramExerciseRow, ProgramAssignedClientRow } from "../../../Domain/repositories/trainer_programs/ITrainerProgramsRepository";

export class TrainerProgramsRepository implements ITrainerProgramsRepository {
  async listByTrainer(trainerId: number): Promise<ProgramRow[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, trainer_id AS trainerId, title, description, level, is_public AS isPublic, created_at AS createdAt 
       FROM programs 
       WHERE trainer_id=? 
       ORDER BY created_at DESC`,
      [trainerId]
    );
    const programs = (rows as any[]).map(r => ({
      id: r.id,
      trainerId: r.trainerId,
      title: r.title,
      description: r.description,
      level: r.level,
      isPublic: !!r.isPublic,
      createdAt: new Date(r.createdAt),
      assignedClientIds: [] as number[],
    }));

    if (!programs.length) return programs;

    const ids = programs.map(p => p.id);
    const [assignRows] = await db.execute<RowDataPacket[]>(
      `SELECT program_id AS programId, client_id AS clientId
       FROM client_programs
       WHERE program_id IN (${ids.map(() => '?').join(',')})`,
      ids
    );
    const map = new Map<number, number[]>();
    for (const r of assignRows as any[]) {
      const arr = map.get(r.programId) || [];
      arr.push(Number(r.clientId));
      map.set(Number(r.programId), arr);
    }
    programs.forEach(p => {
      const assigned = map.get(p.id);
      if (assigned) p.assignedClientIds = assigned;
    });

    return programs;
  }

  async create(trainerId: number, data: Omit<ProgramRow,'id'|'trainerId'|'createdAt'>): Promise<number> {
    const [res] = await db.execute<ResultSetHeader>(
      `INSERT INTO programs (trainer_id,title,description,level,is_public,created_at) VALUES (?,?,?,?,?,NOW())`,
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
       FROM programs 
       WHERE id=? 
       LIMIT 1`,
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
      `SELECT pe.program_id AS programId, pe.exercise_id AS exerciseId, pe.position, pe.sets, pe.reps, pe.tempo, pe.rest_sec AS restSec, pe.notes, e.name 
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
      notes: r.notes ?? null,
      name: r.name,
    }));
    return { program, exercises };
  }

  async replaceProgramExercises(trainerId: number, programId: number, items: ProgramExerciseRow[]): Promise<void> {
    const program = await this.getById(programId);
    if (!program || program.trainerId !== trainerId) throw new Error('NOT_ALLOWED');

    // Transactional replace
    const conn = await (db as any).getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute(`DELETE FROM program_exercises WHERE program_id=?`, [programId]);
      if (items.length) {
        const values: string[] = [];
        const args: any[] = [];
        for (const it of items) {
          values.push("(?,?,?,?,?,?,?,?)");
          args.push(
            programId,
            it.exerciseId,
            it.position,
            it.sets ?? null,
            it.reps ?? null,
            it.tempo ?? null,
            it.restSec ?? null,
            it.notes ?? null
          );
        }
        await conn.execute(
          `INSERT INTO program_exercises (program_id,exercise_id,position,sets,reps,tempo,rest_sec,notes) VALUES ${values.join(",")}`,
          args
        );
      }

      await conn.commit();
    } catch (err) {
      try { await conn.rollback(); } catch {}
      throw err;
    } finally {
      conn.release();
    }
  }

  async assignToClient(programId: number, clientId: number): Promise<void> {
    await db.execute<ResultSetHeader>(
      `INSERT INTO client_programs (program_id, client_id, status, assigned_at)
       VALUES (?, ?, 'active', NOW())
       ON DUPLICATE KEY UPDATE status='active', assigned_at=NOW()`,
      [programId, clientId]
    );
  }

  async listAssignedClients(trainerId: number, programId: number): Promise<ProgramAssignedClientRow[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT u.id AS id,
              u.ime AS firstName,
              u.prezime AS lastName,
              u.korisnickoIme AS email,
              cp.status AS status,
              cp.assigned_at AS assignedAt
       FROM client_programs cp
       JOIN users u ON u.id = cp.client_id
       JOIN programs p ON p.id = cp.program_id
       WHERE cp.program_id = ?
         AND p.trainer_id = ?
         AND u.uloga = 'klijent'
         AND u.assigned_trener_id = ?
       ORDER BY cp.assigned_at DESC`,
      [programId, trainerId, trainerId]
    );

    return (rows as any[]).map(r => ({
      id: Number(r.id),
      firstName: r.firstName || '',
      lastName: r.lastName || '',
      email: r.email,
      status: r.status,
      assignedAt: new Date(r.assignedAt),
    }));
  }
}
