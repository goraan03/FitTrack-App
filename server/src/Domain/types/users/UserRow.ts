import { RowDataPacket } from "mysql2";

export type UserRow = RowDataPacket & {
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