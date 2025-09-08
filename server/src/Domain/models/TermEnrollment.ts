export class TermEnrollment {
  public constructor(
    public id: number = 0,
    public term_id: number = 0,
    public user_id: number = 0,
    public status: 'confirmed' | 'canceled_by_user' | 'canceled_by_trainer' | 'completed',
    public rating: number | null = null,
    public feedback: string | null = null,
    public attended_at: Date | null = null,
    public created_at: Date | null = null
  ) {}
}