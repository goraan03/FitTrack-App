import { IUserRepository } from "../../../Domain/repositories/users/IUserRepository";
import { User } from "../../../Domain/models/User";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";
import { toMysqlDate } from "../../../utils/date/DateUtils";

export class UserRepository implements IUserRepository {
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
        user.datumRodjenja ? toMysqlDate(user.datumRodjenja) : null, // ključna promena
        user.pol
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
          user.pol
        );
      }

      return new User();
    } catch (error) {
      console.error('Error creating user:', error);
      return new User();
    }
  }

  async getById(id: number): Promise<User> {
    try {
      const query = `SELECT * FROM users WHERE id = ?`;
      const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

      if (rows.length > 0) {
        const row: any = rows[0];
        return new User(
          row.id, 
          row.korisnickoIme, 
          row.lozinka, 
          row.uloga,
          row.ime,
          row.prezime,
          row.datumRodjenja ? new Date(row.datumRodjenja) : null,
          row.pol
        );
      }

      return new User();
    } catch {
      return new User();
    }
  }

  async getByUsername(korisnickoIme: string): Promise<User> {
    try {
      const query = `
        SELECT * 
        FROM users 
        WHERE korisnickoIme = ?
      `;

      const [rows] = await db.execute<RowDataPacket[]>(query, [korisnickoIme]);

      if (rows.length > 0) {
        const row: any = rows[0];
        return new User(
          row.id, 
          row.korisnickoIme, 
          row.lozinka, 
          row.uloga,
          row.ime,
          row.prezime,
          row.datumRodjenja ? new Date(row.datumRodjenja) : null,
          row.pol
        );
      }

      return new User();
    } catch (error) {
      console.log("user get by username: " + error);
      return new User();
    }
  }

  async getAll(): Promise<User[]> {
    try {
      const query = `SELECT * FROM users ORDER BY id ASC`;
      const [rows] = await db.execute<RowDataPacket[]>(query);

      return rows.map((row: any) => new User(
        row.id, 
        row.korisnickoIme, 
        row.lozinka, 
        row.uloga,
        row.ime,
        row.prezime,
        row.datumRodjenja ? new Date(row.datumRodjenja) : null,
        row.pol
      ));
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
        user.datumRodjenja ? toMysqlDate(user.datumRodjenja) : null, // ključna promena
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
      const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

      return (rows[0] as any).count > 0;
    } catch {
      return false;
    }
  }
}