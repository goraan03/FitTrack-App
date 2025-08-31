export class User {
  public constructor(
    public id: number = 0,
    public korisnickoIme: string = '',
    public lozinka: string = '',
    public uloga: string = 'klijent',
    public ime: string = '',
    public prezime: string = '',
    public datumRodjenja: Date | null = null,
    public pol: 'musko' | 'zensko' | '' = '',
    public blokiran: boolean = false
  ) {}
}