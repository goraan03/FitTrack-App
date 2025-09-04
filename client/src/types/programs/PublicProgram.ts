export type PublicProgram = {
  id: number;
  title: string;
  description: string | null;
  level: 'beginner'|'intermediate'|'advanced';
  trainerId: number;
  trainerName: string;
};