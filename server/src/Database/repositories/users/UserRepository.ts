import { IUserRepository } from "../../../Domain/repositories/users/IUserRepository";
import { User } from "../../../Domain/models/User";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";
import { toMysqlDate } from "../../../utils/date/DateUtils";
import { UserRow } from "../../../Domain/types/users/UserRow";
import { CountRow } from "../../../Domain/types/users/CountRow";

export class UserRepository implements IUserRepository {
  private mapRow(row: UserRow): User {
    return new User(
      row.id,
      row.korisnickoIme,
      row.lozinka,
      row.uloga,
      row.ime ?? '',
      row.prezime ?? '',
      row.datumRodjenja ? new Date(row.datumRodjenja) : null,
      (row.pol as 'musko' | 'zensko' | null) ?? '',
      !!row.blokiran,
      row.assigned_trener_id ?? null,
      row.trial_started_at ? new Date(row.trial_started_at) : null,
      row.trial_ends_at ? new Date(row.trial_ends_at) : null,
      row.current_plan_id ?? null,
      row.pending_plan_id ?? null,
      row.billing_anchor_date ? new Date(row.billing_anchor_date) : null,
      row.billing_status ?? 'none',
      row.billing_customer_code ?? null
    );
  }

  async create(user: User): Promise<User> {
    try {
      const [result] = await db.execute<ResultSetHeader>(
        `INSERT INTO users (korisnickoIme, lozinka, uloga, ime, prezime, datumRodjenja, pol, assigned_trener_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.korisnickoIme,
          user.lozinka,
          user.uloga,
          user.ime,
          user.prezime,
          user.datumRodjenja ? toMysqlDate(user.datumRodjenja) : null,
          user.pol,
          user.assigned_trener_id ?? null,
        ]
      );
      if (result.insertId) {
        return new User(
          result.insertId, user.korisnickoIme, user.lozinka, user.uloga,
          user.ime, user.prezime, user.datumRodjenja, user.pol, false,
          user.assigned_trener_id ?? null
        );
      }
      return new User();
    } catch (error) {
      console.error("Error creating user:", error);
      return new User();
    }
  }

  async getById(id: number): Promise<User> {
    try {
      const [rows] = await db.execute<UserRow[]>('SELECT * FROM users WHERE id = ?', [id]);
      return rows.length > 0 ? this.mapRow(rows[0]) : new User();
    } catch { return new User(); }
  }

  async getByUsername(korisnickoIme: string): Promise<User> {
    try {
      const [rows] = await db.execute<UserRow[]>(
        'SELECT * FROM users WHERE korisnickoIme = ?', [korisnickoIme]
      );
      return rows.length > 0 ? this.mapRow(rows[0]) : new User();
    } catch (error) {
      console.error("user get by username:", error);
      return new User();
    }
  }

  async getAll(): Promise<User[]> {
    try {
      const [rows] = await db.execute<UserRow[]>('SELECT * FROM users ORDER BY id ASC');
      return rows.map(row => this.mapRow(row));
    } catch { return []; }
  }

  async update(user: User): Promise<User> {
    try {
      const [result] = await db.execute<ResultSetHeader>(
        `UPDATE users
         SET korisnickoIme = ?, lozinka = ?, ime = ?, prezime = ?, datumRodjenja = ?, pol = ?
         WHERE id = ?`,
        [
          user.korisnickoIme, user.lozinka, user.ime, user.prezime,
          user.datumRodjenja ? toMysqlDate(user.datumRodjenja) : null,
          user.pol, user.id,
        ]
      );
      return result.affectedRows > 0 ? user : new User();
    } catch { return new User(); }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const [result] = await db.execute<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch { return false; }
  }

  async exists(id: number): Promise<boolean> {
    try {
      const [rows] = await db.execute<CountRow[]>(
        'SELECT COUNT(*) as count FROM users WHERE id = ?', [id]
      );
      return Number(rows[0]?.count ?? 0) > 0;
    } catch { return false; }
  }

  async updateBasicInfo(input: {
    id: number; ime: string; prezime: string;
    datumRodjenja: Date | null; pol: 'musko' | 'zensko';
  }): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE users SET ime = ?, prezime = ?, datumRodjenja = ?, pol = ? WHERE id = ?`,
      [
        input.ime, input.prezime,
        input.datumRodjenja ? toMysqlDate(input.datumRodjenja) : null,
        input.pol, input.id,
      ]
    );
    return result.affectedRows > 0;
  }

  async setBlocked(id: number, blokiran: boolean): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      'UPDATE users SET blokiran = ? WHERE id = ?', [blokiran ? 1 : 0, id]
    );
    return result.affectedRows > 0;
  }

  async updateAssignedTrainer(userId: number, trainerId: number): Promise<void> {
    await db.execute<ResultSetHeader>(
      'UPDATE users SET assigned_trener_id = ? WHERE id = ?', [trainerId, userId]
    );
  }

  async listTrainers(): Promise<{ id: number; name: string; email: string }[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, CONCAT(ime,' ',prezime) as name, korisnickoIme as email
       FROM users WHERE uloga = 'trener' ORDER BY ime, prezime`
    );
    return (rows as any[]).map(r => ({ id: r.id, name: r.name, email: r.email }));
  }

  async getAssignedTrainerId(userId: number): Promise<number | null> {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT assigned_trener_id FROM users WHERE id = ?', [userId]
    );
    return (rows[0] as any)?.assigned_trener_id ?? null;
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await db.execute(
      'UPDATE users SET lozinka = ? WHERE id = ?', [hashedPassword, userId]
    );
  }

  // ─── Billing ──────────────────────────────────────────────────────────────

  async startTrial(userId: number, trialStartedAt: Date, trialEndsAt: Date): Promise<void> {
    await db.execute<ResultSetHeader>(
      `UPDATE users
       SET trial_started_at = ?, trial_ends_at = ?, billing_status = 'trial'
       WHERE id = ? AND trial_started_at IS NULL`,
      [
        toMysqlDate(trialStartedAt),
        toMysqlDate(trialEndsAt),
        userId,
      ]
    );
  }

  async setBillingStatus(userId: number, status: User['billing_status']): Promise<void> {
    await db.execute<ResultSetHeader>(
      'UPDATE users SET billing_status = ? WHERE id = ?', [status, userId]
    );
  }

  async setCurrentPlan(userId: number, planId: number, anchorDate: Date): Promise<void> {
    await db.execute<ResultSetHeader>(
      `UPDATE users
       SET current_plan_id = ?, billing_anchor_date = ?, billing_status = 'active', pending_plan_id = NULL
       WHERE id = ?`,
      [planId, toMysqlDate(anchorDate), userId]
    );
  }

  async setPendingPlan(userId: number, planId: number | null): Promise<void> {
    await db.execute<ResultSetHeader>(
      'UPDATE users SET pending_plan_id = ? WHERE id = ?', [planId, userId]
    );
  }

  async applyPendingPlan(userId: number): Promise<void> {
    await db.execute<ResultSetHeader>(
      `UPDATE users
       SET current_plan_id = pending_plan_id, pending_plan_id = NULL
       WHERE id = ? AND pending_plan_id IS NOT NULL`,
      [userId]
    );
  }

  async getClientCountForTrainer(trainerId: number): Promise<number> {
    const [rows] = await db.execute<CountRow[]>(
      `SELECT COUNT(*) as count FROM users
       WHERE assigned_trener_id = ? AND uloga = 'klijent'`,
      [trainerId]
    );
    return Number(rows[0]?.count ?? 0);
  }

  async getBillingInfo(userId: number): Promise<{
    billing_status: User['billing_status'];
    trial_ends_at: Date | null;
    current_plan_id: number | null;
    pending_plan_id: number | null;
    billing_customer_code: number | null;
    billing_anchor_date: Date | null;
  } | null> {
    const [rows] = await db.execute<UserRow[]>(
      `SELECT billing_status, trial_ends_at, current_plan_id, pending_plan_id,
              billing_customer_code, billing_anchor_date
       FROM users WHERE id = ?`,
      [userId]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      billing_status: r.billing_status ?? 'none',
      trial_ends_at: r.trial_ends_at ? new Date(r.trial_ends_at) : null,
      current_plan_id: r.current_plan_id ?? null,
      pending_plan_id: r.pending_plan_id ?? null,
      billing_customer_code: r.billing_customer_code ?? null,
      billing_anchor_date: r.billing_anchor_date ? new Date(r.billing_anchor_date) : null,
    };
  }
}