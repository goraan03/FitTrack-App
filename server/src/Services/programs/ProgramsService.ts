// server/src/Services/programs/ProgramsService.ts
import db from "../../Database/connection/DbConnectionPool";
import { IProgramsService, PublicProgram } from "../../Domain/services/programs/IProgramsService";
import { RowDataPacket } from "mysql2";

export class ProgramsService implements IProgramsService {
  async listPublic(params: { q?: string; level?: 'beginner'|'intermediate'|'advanced' }): Promise<PublicProgram[]> {
    const where: string[] = ["p.is_public = 1"];
    const args: any[] = [];
    if (params.q) { where.push("(p.title LIKE ? OR p.description LIKE ?)"); args.push(`%${params.q}%`, `%${params.q}%`); }
    if (params.level) { where.push("p.level = ?"); args.push(params.level); }

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
    return rows.map((r:any)=>({
      id: r.id,
      title: r.title,
      description: r.description || null,
      level: r.level,
      trainerId: r.trainerId,
      trainerName: r.trainerName
    }));
  }
}