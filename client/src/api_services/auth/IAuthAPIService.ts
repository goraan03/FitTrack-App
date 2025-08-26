import type { AuthResponse } from "../../types/auth/AuthResponse";
import type { LoginStep1Response } from "../../types/auth/LoginStep1Response";
import type { Resend2FAResponse } from "../../types/auth/Resend2FAResponse";

export interface IAuthAPIService {
  prijava(korisnickoIme: string, lozinka: string): Promise<LoginStep1Response>;
  verify2fa(challengeId: string, code: string): Promise<AuthResponse>;
  resend2fa(challengeId: string): Promise<Resend2FAResponse>;

  registracija(podaci: {
    korisnickoIme: string;
    lozinka: string;
    ime: string;
    prezime: string;
    datumRodjenja?: string;
    pol: string;
  }): Promise<AuthResponse>;
}