import type { Role } from './AuthUser';

export interface JwtTokenClaims {
  id: number;
  korisnickoIme: string;
  uloga: Role;
  exp?: number;
  iat?: number;
}