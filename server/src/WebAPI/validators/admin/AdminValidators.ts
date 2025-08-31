const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export function validateCreateTrainer(body: any): { ok: boolean; message?: string } {
  const { korisnickoIme, lozinka, ime, prezime, datumRodjenja, pol } = body || {};
  if (!korisnickoIme || !emailRegex.test(korisnickoIme)) return { ok: false, message: 'Neispravan email' };
  if (!lozinka || String(lozinka).length < 6) return { ok: false, message: 'Lozinka mora imati najmanje 6 karaktera' };
  if (!ime || !prezime) return { ok: false, message: 'Ime i prezime su obavezni' };
  if (datumRodjenja && !dateRegex.test(datumRodjenja)) return { ok: false, message: 'Datum rođenja mora biti YYYY-MM-DD' };
  if (pol !== 'musko' && pol !== 'zensko') return { ok: false, message: 'Pol mora biti "musko" ili "zensko"' };
  return { ok: true };
}

export function validateUpdateUser(body: any): { ok: boolean; message?: string } {
  const { ime, prezime, datumRodjenja, pol } = body || {};
  if (!ime || !prezime) return { ok: false, message: 'Ime i prezime su obavezni' };
  if (datumRodjenja && datumRodjenja !== null) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datumRodjenja)) return { ok: false, message: 'Datum rođenja mora biti YYYY-MM-DD ili null' };
  }
  if (pol !== 'musko' && pol !== 'zensko') return { ok: false, message: 'Pol mora biti "musko" ili "zensko"' };
  return { ok: true };
}