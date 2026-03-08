export class ClientRequest {
  public constructor(
    public id: number = 0,
    public client_id: number = 0,
    public trainer_id: number = 0,
    public status: 'pending' | 'approved' | 'rejected' = 'pending',
    public created_at: Date = new Date(),
    public resolved_at: Date | null = null
  ) {}
}