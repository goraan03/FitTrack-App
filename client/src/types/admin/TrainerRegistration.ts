export type TrainerRegistration = {
  korisnickoIme: string;
    lozinka: string;
    ime: string;
    prezime: string;
    datumRodjenja?: string;
    pol: 'musko' | 'zensko';
};