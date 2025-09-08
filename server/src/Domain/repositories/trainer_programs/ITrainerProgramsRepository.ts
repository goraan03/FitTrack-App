export type ProgramRow = {
  id: number;
  trainerId: number;
  title: string;
  description: string | null;
  level: 'beginner'|'intermediate'|'advanced';
  isPublic: boolean;
  createdAt: Date;
};

export type ProgramExerciseRow = {
  programId: number;
  exerciseId: number;
  position: number;
  sets: number | null;
  reps: string | null;
  tempo: string | null;
  restSec: number | null;
  notes: string | null;
  name?: string;
};

export interface ITrainerProgramsRepository {
  listByTrainer(trainerId: number): Promise<ProgramRow[]>;
  create(trainerId: number, data: Omit<ProgramRow,'id'|'trainerId'|'createdAt'>): Promise<number>;
  update(trainerId: number, id: number, data: Partial<Omit<ProgramRow,'id'|'trainerId'|'createdAt'>>): Promise<void>;
  getById(id: number): Promise<ProgramRow | null>;
  getDetails(trainerId: number, programId: number): Promise<{ program: ProgramRow; exercises: ProgramExerciseRow[] }>;
  replaceProgramExercises(trainerId: number, programId: number, items: ProgramExerciseRow[]): Promise<void>;
  assignToClient(programId: number, clientId: number): Promise<void>;
}