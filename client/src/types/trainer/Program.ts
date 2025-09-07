import type { Level } from "./Exercise";

export type ProgramListItem = {
  id: number;
  title: string;
  level: Level;
  isPublic: boolean;
};

export type ProgramExerciseItem = {
  exerciseId: number;
  position: number;
  name: string;
  sets: number | null;
  reps: string | null;
  tempo: string | null;
  restSec: number | null;
  notes: string | null;
};

export type ProgramDetails = {
  id: number;
  title: string;
  description: string | null;
  level: Level;
  exercises: ProgramExerciseItem[];
};

export type UpsertProgram = {
  title: string;
  description?: string | null;
  level: Level;
  isPublic?: boolean;
};