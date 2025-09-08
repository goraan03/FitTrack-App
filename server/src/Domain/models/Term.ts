export class Term {
  public constructor(
    public id: number = 0,
    public trainer_id: number = 0,
    public program_id: number = 0,
    public type: 'group' | 'individual',
    public start_at: Date | null = null,
    public duration_min: number = 0,
    public capacity: number = 0,
    public enrolled_count: number = 0,
    public canceled: boolean = false,
    public created_at: Date | null = null
  ) {}
}