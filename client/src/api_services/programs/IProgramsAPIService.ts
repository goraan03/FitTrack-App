export type PublicProgram = {
  id: number;
  title: string;
  description: string | null;
  level: 'beginner'|'intermediate'|'advanced';
  trainerId: number;
  trainerName: string;
};
export type PublicProgramsResponse = {
  success: boolean;
  message: string;
  data?: PublicProgram[];
};

export interface IProgramsAPIService {
  listPublic(params?: { q?: string; level?: 'beginner'|'intermediate'|'advanced' }): Promise<PublicProgramsResponse>;
}