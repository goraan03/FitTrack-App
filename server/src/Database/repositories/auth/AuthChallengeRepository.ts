import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";
import { IAuthChallengeRepository } from "../../../Domain/repositories/auth/IAuthChallengeRepository";
import { AuthChallenge } from "../../../Domain/models/AuthChallenge";

export class AuthChallengeRepository implements IAuthChallengeRepository {
  async create(userId: number, codeHash: string, expiresAt: Date): Promise<number> {
    try {
      const query = `
        INSERT INTO auth_challenges (user_id, code_hash, expires_at)
        VALUES (?, ?, ?)
      `;

      const [res] = await db.execute<ResultSetHeader>(query, [
        userId,
        codeHash,
        expiresAt,
      ]);

      return res.insertId;
    } catch {
      return 0;
    }
  }

  async getById(id: number): Promise<AuthChallenge | null> {
    try {
      const query = `
        SELECT 
          id,
          user_id       AS userId,
          code_hash     AS codeHash,
          expires_at    AS expiresAt,
          consumed_at   AS consumedAt,
          attempts,
          created_at    AS createdAt
        FROM auth_challenges
        WHERE id = ?
      `;

      const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
      if (rows.length === 0) return null;

      const r = rows[0] as any;

      return {
        id: r.id,
        userId: r.userId,
        codeHash: r.codeHash,
        expiresAt: new Date(r.expiresAt),
        consumedAt: r.consumedAt ? new Date(r.consumedAt) : null,
        attempts: r.attempts,
        createdAt: new Date(r.createdAt),
      };
    } catch {
      return null;
    }
  }

  async markConsumed(id: number): Promise<void> {
    const query = `UPDATE auth_challenges SET consumed_at = NOW() WHERE id = ?`;
    await db.execute(query, [id]);
  }

  async incrementAttempts(id: number): Promise<void> {
    const query = `UPDATE auth_challenges SET attempts = attempts + 1 WHERE id = ?`;
    await db.execute(query, [id]);
  }
}