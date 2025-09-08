import { jwtDecode } from "jwt-decode";
import type { JwtTokenClaims } from "./JwtTokenClaims";

type RoleNorm = 'klijent' | 'trener' | 'admin';

const normalizeRole = (raw: unknown): RoleNorm | null => {
  if (!raw) return null;
  const s = String(raw).toLowerCase();

  if (['klijent', 'client', 'user', 'customer'].includes(s)) return 'klijent';
  if (['trener', 'trainer', 'coach'].includes(s)) return 'trener';
  if (['admin', 'administrator'].includes(s)) return 'admin';

  if (s === '1') return 'klijent';
  if (s === '2') return 'trener';
  if (s === '3') return 'admin';

  return null;
};

export interface AuthContextType {
  user: {
    id: number;
    korisnickoIme: string;
    uloga: 'klijent' | 'trener' | 'admin';
  } | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
const decodeJWT = (token: string): JwtTokenClaims | null => {
  try {
    const d: any = jwtDecode(token);

    // pokušaj raznih claim-ova za rolu
    const rawRole =
      d.uloga ??
      d.role ??
      d.roles?.[0]?.name ??
      d.roles?.[0] ??
      d.authorities?.[0] ??
      d["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      d["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"];

    const uloga = normalizeRole(rawRole);

    const rawId = d.id ?? d.userId ?? d["nameid"] ?? d.sub;
    const korisnickoIme =
      d.korisnickoIme ?? d.username ?? d.name ?? d.email ?? d.sub;

    const idNum = Number(rawId);
    const id = Number.isFinite(idNum) ? idNum : rawId;

    if (rawId && korisnickoIme && uloga) {
      return {
        id,
        korisnickoIme: String(korisnickoIme),
        uloga,
      };
    }

    return null;
  } catch (error) {
    console.error('Greska pri dekodiranju JWT tokena:', error);
    return null;
  }
};