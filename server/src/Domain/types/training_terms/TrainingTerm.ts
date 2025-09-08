export type TrainingTerm = {
  id: number;
  trainerId: number;
  programId: number;
  type: TrainingType;
  startAt: Date;
  durationMin: number;
  capacity: number;
  enrolledCount: number;
  canceled: boolean;
};