import db from "../../connection/DbConnectionPool";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IExercisesRepository } from "../../../Domain/repositories/exercises/IExercisesRepository";
import { ExerciseRow } from "../../../Domain/types/exercises/ExerciseRow";

export class ExercisesRepository implements IExercisesRepository {
  async listByTrainer(trainerId: number): Promise<ExerciseRow[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id,
              trainer_id AS trainerId,
              name,
              description,
              muscle_group AS muscleGroup,
              equipment,
              level,
              video_url AS videoUrl,
              created_at AS createdAt
       FROM exercises
       WHERE trainer_id=?
       ORDER BY created_at DESC`,
      [trainerId]
    );
    return (rows as any[]).map(r => ({
      id: r.id,
      trainerId: r.trainerId,
      name: r.name,
      description: r.description,
      muscleGroup: r.muscleGroup,
      equipment: r.equipment,
      level: r.level,
      videoUrl: r.videoUrl,
      createdAt: new Date(r.createdAt),
    }));
  }

  async create(trainerId: number, data: Omit<ExerciseRow,'id'|'trainerId'|'createdAt'>): Promise<number> {
    const [res] = await db.execute<ResultSetHeader>(
      `INSERT INTO exercises (trainer_id,name,description,muscle_group,equipment,level,video_url)
       VALUES (?,?,?,?,?,?,?)`,
      [trainerId, data.name, data.description ?? null, data.muscleGroup, data.equipment ?? 'none', data.level ?? 'beginner', data.videoUrl ?? null]
    );
    return (res as ResultSetHeader).insertId;
  }

  async update(trainerId: number, id: number, data: Partial<Omit<ExerciseRow,'id'|'trainerId'|'createdAt'>>): Promise<void> {
    const fields: string[] = [];
    const args: any[] = [];
    if (data.name != null) { fields.push('name=?'); args.push(data.name); }
    if (data.description !== undefined) { fields.push('description=?'); args.push(data.description); }
    if (data.muscleGroup != null) { fields.push('muscle_group=?'); args.push(data.muscleGroup); }
    if (data.equipment != null) { fields.push('equipment=?'); args.push(data.equipment); }
    if (data.level != null) { fields.push('level=?'); args.push(data.level); }
    if (data.videoUrl !== undefined) { fields.push('video_url=?'); args.push(data.videoUrl); }
    if (!fields.length) return;
    args.push(trainerId, id);
    await db.execute<ResultSetHeader>(`UPDATE exercises SET ${fields.join(', ')} WHERE trainer_id=? AND id=?`, args);
  }

  async delete(trainerId: number, id: number): Promise<void> {
    await db.execute<ResultSetHeader>(`DELETE FROM exercises WHERE trainer_id=? AND id=?`, [trainerId, id]);
  }

  async getByIds(trainerId: number, ids: number[]): Promise<ExerciseRow[]> {
    if (!ids.length) return [];
    const placeholders = ids.map(()=> '?').join(',');
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id,
              trainer_id AS trainerId,
              name,
              description,
              muscle_group AS muscleGroup,
              equipment,
              level,
              video_url AS videoUrl,
              created_at AS createdAt
       FROM exercises
       WHERE trainer_id=?
         AND id IN (${placeholders})`,
      [trainerId, ...ids]
    );
    return (rows as any[]).map(r => ({
      id: r.id,
      trainerId: r.trainerId,
      name: r.name,
      description: r.description,
      muscleGroup: r.muscleGroup,
      equipment: r.equipment,
      level: r.level,
      videoUrl: r.videoUrl,
      createdAt: new Date(r.createdAt),
    }));
  }
}