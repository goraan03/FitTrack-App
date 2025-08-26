export type Role = 'klijent' | 'trener' | 'admin';

export interface AuthUser {
  id: number;
  korisnickoIme: string;
  uloga: Role;
}