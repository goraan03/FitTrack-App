import { authValidType } from "../../../Domain/types/auth/authValidType";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validacijaPodatakaAuth(korisnickoIme?: string, lozinka?: string): authValidType {
  if (!korisnickoIme || !lozinka) {
    return { uspesno: false, poruka: "Korisničko ime (email) i lozinka su obavezni." };
  }

  if (!emailRegex.test(korisnickoIme)) {
    return { uspesno: false, poruka: "Unesite ispravan email." };
  }

  if (korisnickoIme.length < 3) {
    return { uspesno: false, poruka: "Korisničko ime mora imati najmanje 3 karaktera." };
  }

  if (lozinka.length < 6) {
    return { uspesno: false, poruka: "Lozinka mora imati najmanje 6 karaktera." };
  }

  if (lozinka.length > 20) {
    return { uspesno: false, poruka: "Lozinka moze imati najvise 20 karaktera." };
  }

  return { uspesno: true };
}

export function validateOtp(code?: string) {
  if (!code) return { uspesno: false, poruka: "Kod je obavezan." };
  if (!/^\d{6}$/.test(code)) return { uspesno: false, poruka: "Kod mora imati tačno 6 cifara." };
  return { uspesno: true };
}

export function validateChallengeId(challengeId?: string) {
  if (!challengeId) return { uspesno: false, poruka: "challengeId je obavezan." };
  if (!/^\d+$/.test(challengeId)) return { uspesno: false, poruka: "challengeId nije ispravan." };
  return { uspesno: true };
}