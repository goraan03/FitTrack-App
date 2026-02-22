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
  startPasswordReset(korisnickoIme: string): Promise<{ challengeId: string; expiresAt: string; maskedEmail: string }>;
  verifyPasswordResetOtp(challengeId: string, code: string): Promise<void>;
  resetPassword(challengeId: string, newPassword: string): Promise<void>;
  startChangePassword(userId: number): Promise<{ challengeId: string; expiresAt: string; maskedEmail: string }>;
  verifyChangePasswordOtp(userId: number, challengeId: string, code: string): Promise<void>;
  finishChangePassword(userId: number, challengeId: string, newPassword: string): Promise<void>;
}