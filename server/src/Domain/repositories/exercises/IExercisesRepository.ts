import { ExerciseRow } from "../../types/exercises/ExerciseRow";

export interface IExercisesRepository {
  listByTrainer(trainerId: number): Promise<ExerciseRow[]>;
  create(trainerId: number, data: Omit<ExerciseRow,'id'|'trainerId'|'createdAt'>): Promise<number>;
  update(trainerId: number, id: number, data: Partial<Omit<ExerciseRow,'id'|'trainerId'|'createdAt'>>): Promise<void>;
  delete(trainerId: number, id: number): Promise<void>;
  getByIds(trainerId: number, ids: number[]): Promise<ExerciseRow[]>;
}