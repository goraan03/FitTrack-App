export type AdminUser = {
  id: number;
  korisnickoIme: string;
  uloga: 'klijent' | 'trener' | 'admin';
  ime: string;
  prezime: string;
  datumRodjenja: string | null;
  pol: 'musko' | 'zensko' | '';
  blokiran: boolean;
};