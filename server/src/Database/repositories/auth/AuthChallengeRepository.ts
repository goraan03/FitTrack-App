import { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../../connection/DbConnectionPool';
import { AuthChallenge, IAuthChallengeRepository } from '../../../Domain/repositories/auth/IAuthChallengeRepository';

export class AuthChallengeRepository implements IAuthChallengeRepository {
  async create(userId: number, codeHash: string, expiresAt: Date): Promise<number> {
    const [res] = await db.execute<ResultSetHeader>(
      `INSERT INTO auth_challenges (user_id, code_hash, expires_at) VALUES (?, ?, ?)`,
      [userId, codeHash, expiresAt]
    );
    return res.insertId;
  }

  async getById(id: number): Promise<AuthChallenge | null> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT 
         id, 
         user_id as userId, 
         code_hash as codeHash, 
         expires_at as expiresAt, 
         consumed_at as consumedAt, 
         attempts, 
         created_at as createdAt
       FROM auth_challenges 
       WHERE id = ?`,
      [id]
    );
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
  }

  async markConsumed(id: number): Promise<void> {
    await db.execute(`UPDATE auth_challenges SET consumed_at = NOW() WHERE id = ?`, [id]);
  }

  async incrementAttempts(id: number): Promise<void> {
    await db.execute(`UPDATE auth_challenges SET attempts = attempts + 1 WHERE id = ?`, [id]);
  }
}