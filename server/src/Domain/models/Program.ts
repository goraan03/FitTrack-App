export class Program {
  constructor(
    public id: number,
    public title: string,
    public description: string | null,
    public level: 'beginner' | 'intermediate' | 'advanced',
    public trainerId: number,
    public trainerName: string
  ) {}
}
