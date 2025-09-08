export class ProgramAssignment {
  public constructor(
    public program_id: number = 0,
    public client_id: number = 0,
    public assigned_at: Date | null = null,
    public status: 'active' | 'paused' | 'completed' | 'canceled'
  ) {}
}