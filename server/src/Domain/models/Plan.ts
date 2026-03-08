export class Plan {
  public constructor(
    public id: number = 0,
    public name: 'STARTER' | 'GROWTH' | 'PRO' | 'UNLIMITED' = 'STARTER',
    public max_clients: number = 0,
    public price_eur: number = 0,
    public tier: number = 1
  ) {}
}