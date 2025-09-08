import { jwtDecode } from "jwt-decode";
import type { JwtTokenClaims } from "../../types/auth/JwtTokenClaims";

export const decodeJWT = (token: string): JwtTokenClaims | null => {
  try {
    const decoded = jwtDecode<JwtTokenClaims>(token);
    if (decoded.id && decoded.korisnickoIme && decoded.uloga) {
      return {
        id: decoded.id,
        korisnickoIme: decoded.korisnickoIme,
        uloga: decoded.uloga
      };
    }
    return null;
  } catch {
    return null;
  }
};