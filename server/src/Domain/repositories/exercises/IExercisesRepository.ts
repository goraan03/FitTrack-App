export type ExerciseRow = {
  id: number;
  trainerId: number;
  name: string;
  description: string | null;
  muscleGroup: 'full_body'|'chest'|'back'|'legs'|'shoulders'|'arms'|'core'|'cardio'|'mobility';
  equipment: 'none'|'bodyweight'|'dumbbells'|'barbell'|'kettlebell'|'machine'|'bands'|'other';
  level: 'beginner'|'intermediate'|'advanced';
  videoUrl: string | null;
  createdAt: Date;
};

export interface IExercisesRepository {
  listByTrainer(trainerId: number): Promise<ExerciseRow[]>;
  create(trainerId: number, data: Omit<ExerciseRow,'id'|'trainerId'|'createdAt'>): Promise<number>;
  update(trainerId: number, id: number, data: Partial<Omit<ExerciseRow,'id'|'trainerId'|'createdAt'>>): Promise<void>;
  delete(trainerId: number, id: number): Promise<void>;
  getByIds(trainerId: number, ids: number[]): Promise<ExerciseRow[]>;
}