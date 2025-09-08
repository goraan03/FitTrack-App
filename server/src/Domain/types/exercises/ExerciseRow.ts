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