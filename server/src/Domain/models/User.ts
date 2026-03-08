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
    public blokiran: boolean = false,
    public assigned_trener_id: number | null = null,
    public trial_started_at: Date | null = null,
    public trial_ends_at: Date | null = null,
    public current_plan_id: number | null = null,
    public pending_plan_id: number | null = null,
    public billing_anchor_date: Date | null = null,
    public billing_status: 'trial' | 'active' | 'past_due' | 'suspended' | 'none' = 'none',
    public billing_customer_code: number | null = null
  ) {}
}