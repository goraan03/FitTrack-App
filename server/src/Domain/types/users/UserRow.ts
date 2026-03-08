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
  assigned_trener_id: number | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  current_plan_id: number | null;
  pending_plan_id: number | null;
  billing_anchor_date: string | null;
  billing_status: 'trial' | 'active' | 'past_due' | 'suspended' | 'none' | null;
  billing_customer_code: number | null;
};