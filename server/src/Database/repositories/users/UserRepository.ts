import { IUserRepository } from "../../../Domain/repositories/users/IUserRepository";
import { User } from "../../../Domain/models/User";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";
import { toMysqlDate } from "../../../utils/date/DateUtils";

type UserRow = RowDataPacket & {
  id: number;
  korisnickoIme: string;
  lozinka: string;
  uloga: string;
  ime: string | null;
  prezime: string | null;
  datumRodjenja: string | null;
  pol: 'musko' | 'zensko' | null;
  blokiran: 0 | 1 | null;
  assigned_trener_id?: number | null;
};

type CountRow = RowDataPacket & { count: number };

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
      row.assigned_trener_id ?? null
    );
  }

  async create(user: User): Promise<User> {
    try {
      const query = `
        INSERT INTO users (korisnickoIme, lozinka, uloga, ime, prezime, datumRodjenja, pol) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        user.korisnickoIme,
        user.lozinka,
        user.uloga,
        user.ime,
        user.prezime,
        user.datumRodjenja ? toMysqlDate(user.datumRodjenja) : null,
        user.pol,
      ]);

      if (result.insertId) {
        return new User(
          result.insertId,
          user.korisnickoIme,
          user.lozinka,
          user.uloga,
          user.ime,
          user.prezime,
          user.datumRodjenja,
          user.pol,
          false
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
      const query = `SELECT * FROM users WHERE id = ?`;
      const [rows] = await db.execute<UserRow[]>(query, [id]);

      if (rows.length > 0) {
        return this.mapRow(rows[0]);
      }
      return new User();
    } catch {
      return new User();
    }
  }

  async getByUsername(korisnickoIme: string): Promise<User> {
    try {
      const query = `SELECT * FROM users WHERE korisnickoIme = ?`;
      const [rows] = await db.execute<UserRow[]>(query, [korisnickoIme]);

      if (rows.length > 0) {
        return this.mapRow(rows[0]);
      }
      return new User();
    } catch (error) {
      console.error("user get by username:", error);
      return new User();
    }
  }

  async getAll(): Promise<User[]> {
    try {
      const query = `SELECT * FROM users ORDER BY id ASC`;
      const [rows] = await db.execute<UserRow[]>(query);
      return rows.map((row) => this.mapRow(row));
    } catch {
      return [];
    }
  }

  async update(user: User): Promise<User> {
    try {
      const query = `
        UPDATE users 
        SET korisnickoIme = ?, lozinka = ?, ime = ?, prezime = ?, datumRodjenja = ?, pol = ?
        WHERE id = ?
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        user.korisnickoIme,
        user.lozinka,
        user.ime,
        user.prezime,
        user.datumRodjenja ? toMysqlDate(user.datumRodjenja) : null,
        user.pol,
        user.id,
      ]);

      if (result.affectedRows > 0) {
        return user;
      }
      return new User();
    } catch {
      return new User();
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const query = `DELETE FROM users WHERE id = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } catch {
      return false;
    }
  }

  async exists(id: number): Promise<boolean> {
    try {
      const query = `SELECT COUNT(*) as count FROM users WHERE id = ?`;
      const [rows] = await db.execute<CountRow[]>(query, [id]);
      return Number(rows[0]?.count ?? 0) > 0;
    } catch {
      return false;
    }
  }

  async updateBasicInfo(input: {
    id: number;
    ime: string;
    prezime: string;
    datumRodjenja: Date | null;
    pol: 'musko' | 'zensko';
  }): Promise<boolean> {
    const query = `
      UPDATE users 
      SET ime = ?, prezime = ?, datumRodjenja = ?, pol = ?
      WHERE id = ?
    `;
    const [result] = await db.execute<ResultSetHeader>(query, [
      input.ime,
      input.prezime,
      input.datumRodjenja ? toMysqlDate(input.datumRodjenja) : null,
      input.pol,
      input.id,
    ]);
    return result.affectedRows > 0;
  }

  async setBlocked(id: number, blokiran: boolean): Promise<boolean> {
    const query = `UPDATE users SET blokiran = ? WHERE id = ?`;
    const [result] = await db.execute<ResultSetHeader>(query, [blokiran ? 1 : 0, id]);
    return result.affectedRows > 0;
  }

  async updateAssignedTrainer(userId: number, trainerId: number): Promise<void> {
    const query = `UPDATE users SET assigned_trener_id=? WHERE id=?`;
    await db.execute<ResultSetHeader>(query, [trainerId, userId]);
  }

  async listTrainers(): Promise<{ id: number; name: string; email: string }[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT id, CONCAT(ime,' ',prezime) as name, korisnickoIme as email FROM users WHERE uloga='trener' ORDER BY ime, prezime"
    );
    return (rows as any[]).map(r => ({
      id: r.id,
      name: r.name,
      email: r.email
    }));
  }
  
  async getAssignedTrainerId(userId: number): Promise<number | null> {
    const query = `SELECT assigned_trener_id FROM users WHERE id = ?`;
    const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);
    const row = rows[0] as RowDataPacket | undefined;
    return row?.assigned_trener_id ?? null;
  }
}