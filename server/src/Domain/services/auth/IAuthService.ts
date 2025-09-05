import { User } from "../../models/User";

export interface IAuthService {
  startLogin(korisnickoIme: string, lozinka: string): Promise<{ challengeId: string; expiresAt: string; maskedEmail: string }>;
  verifyTwoFactor(challengeId: string, code: string): Promise<{ token: string }>;
  resendTwoFactor(challengeId: string): Promise<{ challengeId: string; expiresAt: string }>;
  prijava(korisnickoIme: string, lozinka: string): Promise<User>;
  registracija(
    korisnickoIme: string,
    uloga: string,
    lozinka: string,
    ime: string,
    prezime: string,
    datumRodjenja: string,
    pol: string
  ): Promise<User>;
}