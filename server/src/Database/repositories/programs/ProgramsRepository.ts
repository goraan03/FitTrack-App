import db from "../../connection/DbConnectionPool";
import { RowDataPacket } from "mysql2";
import { IProgramsRepository } from "../../../Domain/repositories/programs/IProgramsRepository";
import { Program } from "../../../Domain/models/Program";

export class ProgramsRepository implements IProgramsRepository {
  async listPublic(params: { q?: string; level?: 'beginner'|'intermediate'|'advanced' }): Promise<Program[]> {
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

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT p.id, p.title, p.description, p.level, p.trainer_id as trainerId,
              CONCAT(u.ime,' ',u.prezime) as trainerName
       FROM programs p
       JOIN users u ON u.id = p.trainer_id
       WHERE ${where.join(" AND ")}
       ORDER BY p.created_at DESC
       LIMIT 200`,
      args
    );

    return rows.map(
      (r: any) => new Program(r.id, r.title, r.description || null, r.level, r.trainerId, r.trainerName)
    );
  }
}
