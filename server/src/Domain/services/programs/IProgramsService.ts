// server/src/Domain/services/programs/IProgramsService.ts
export type PublicProgram = {
  id: number;
  title: string;
  description: string | null;
  level: 'beginner'|'intermediate'|'advanced';
  trainerId: number;
  trainerName: string;
};

export interface IProgramsService {
  listPublic(params: { q?: string; level?: 'beginner'|'intermediate'|'advanced' }):
    Promise<PublicProgram[]>;
}