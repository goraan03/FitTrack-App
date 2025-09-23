export type ProgramExerciseDetails = {
  exerciseId: number;
  position: number;
  name: string;
  description: string | null;
  videoUrl: string | null;
};

export type ProgramDetails = {
  id: number;
  title: string;
  description: string | null;
  level: "beginner" | "intermediate" | "advanced";
  trainerId: number;
  trainerName: string;
  exercises: ProgramExerciseDetails[];
};