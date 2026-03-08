import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";
import { IClientRequestsRepository } from "../../../Domain/repositories/client_requests/IClientRequestsRepository";
import { ClientRequest } from "../../../Domain/models/ClientRequest";

type RequestRow = RowDataPacket & {
  id: number;
  client_id: number;
  trainer_id: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  resolved_at: string | null;
  clientName?: string;
  clientEmail?: string;
};

export class ClientRequestsRepository implements IClientRequestsRepository {
  private mapRow(r: RequestRow): ClientRequest {
    return new ClientRequest(
      r.id,
      r.client_id,
      r.trainer_id,
      r.status,
      new Date(r.created_at),
      r.resolved_at ? new Date(r.resolved_at) : null
    );
  }

  async create(clientId: number, trainerId: number): Promise<number> {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO trainer_client_requests (client_id, trainer_id, status)
       VALUES (?, ?, 'pending')
       ON DUPLICATE KEY UPDATE status = 'pending', resolved_at = NULL`,
      [clientId, trainerId]
    );
    return result.insertId;
  }

  async getById(id: number): Promise<ClientRequest | null> {
    const [rows] = await db.execute<RequestRow[]>(
      'SELECT * FROM trainer_client_requests WHERE id = ?', [id]
    );
    return rows.length > 0 ? this.mapRow(rows[0]) : null;
  }

  async getPendingForTrainer(
    trainerId: number
  ): Promise<(ClientRequest & { clientName: string; clientEmail: string })[]> {
    const [rows] = await db.execute<RequestRow[]>(
      `SELECT r.*, CONCAT(u.ime, ' ', u.prezime) AS clientName, u.korisnickoIme AS clientEmail
       FROM trainer_client_requests r
       JOIN users u ON u.id = r.client_id
       WHERE r.trainer_id = ? AND r.status = 'pending'
       ORDER BY r.created_at ASC`,
      [trainerId]
    );
    return rows.map(r => ({
      ...this.mapRow(r),
      clientName:  r.clientName  ?? '',
      clientEmail: r.clientEmail ?? '',
    }));
  }

  async getByClientAndTrainer(clientId: number, trainerId: number): Promise<ClientRequest | null> {
    const [rows] = await db.execute<RequestRow[]>(
      'SELECT * FROM trainer_client_requests WHERE client_id = ? AND trainer_id = ?',
      [clientId, trainerId]
    );
    return rows.length > 0 ? this.mapRow(rows[0]) : null;
  }

  async approve(id: number): Promise<void> {
    await db.execute<ResultSetHeader>(
      `UPDATE trainer_client_requests SET status = 'approved', resolved_at = NOW() WHERE id = ?`,
      [id]
    );
  }

  async reject(id: number): Promise<void> {
    await db.execute<ResultSetHeader>(
      `UPDATE trainer_client_requests SET status = 'rejected', resolved_at = NOW() WHERE id = ?`,
      [id]
    );
  }

  async getStatusForClient(
    clientId: number, trainerId: number
  ): Promise<'pending' | 'approved' | 'rejected' | null> {
    const [rows] = await db.execute<RequestRow[]>(
      'SELECT status FROM trainer_client_requests WHERE client_id = ? AND trainer_id = ?',
      [clientId, trainerId]
    );
    return rows.length > 0 ? rows[0].status : null;
  }
}