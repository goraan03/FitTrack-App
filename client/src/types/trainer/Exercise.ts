export type MuscleGroup =
  | 'full_body' | 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio' | 'mobility';

export type Equipment =
  | 'none' | 'bodyweight' | 'dumbbells' | 'barbell' | 'kettlebell' | 'machine' | 'bands' | 'other';

export type Level = 'beginner' | 'intermediate' | 'advanced';

export type Exercise = {
  id: number;
  name: string;
  description: string | null;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  level: Level;
  videoUrl: string | null;
  createdAt: string;
};

export type UpsertExercise = {
  name: string;
  description?: string | null;
  muscleGroup: MuscleGroup;
  equipment?: Equipment;
  level?: Level;
  videoUrl?: string | null;
};