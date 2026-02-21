import type { Level } from "./Exercise";

export type ProgramListItem = {
  id: number;
  title: string;
  level: Level;
  isPublic: boolean;
  assignedClientIds?: number[];
  
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

export type ProgramAssignedClient = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export type ProgramDetails = {
  id: number;
  title: string;
  description: string | null;
  level: Level;
  exercises: ProgramExerciseItem[];
  assignedClients: ProgramAssignedClient[];
};

export type UpsertProgram = {
  title: string;
  description?: string | null;
  level: Level;
  isPublic?: boolean;
};