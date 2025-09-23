import { Program } from "../../models/Program";

export type ProgramExerciseDetails = {
  exerciseId: number;
  position: number;
  name: string;
  description: string | null;
  videoUrl: string | null;
};

export type ProgramDetailsForClient = {
  id: number;
  title: string;
  description: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  trainerId: number;
  trainerName: string;
  exercises: ProgramExerciseDetails[];
};

export interface IProgramsRepository {
  listPublic(params: {q?: string; level?: 'beginner' | 'intermediate' | 'advanced'; trainerId?: number;}): Promise<Program[]>;
  listVisibleForClient(params: {clientId: number; trainerId: number; q?: string; level?: 'beginner' | 'intermediate' | 'advanced';}): Promise<Program[]>;

  getDetailsVisibleForClient(programId: number, trainerId: number, clientId: number): Promise<ProgramDetailsForClient | null>;
}