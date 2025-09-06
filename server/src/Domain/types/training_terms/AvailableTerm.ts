import { TrainingType } from "../training_enrollments/TrainingType";

export interface AvailableTerm {
  id: number;
  startAt: string;
  durationMin: number;
  type: TrainingType;
  capacity: number;
  enrolledCount: number;
  status: 'free' | 'full';
  isEnrolled: boolean;
  program: {
    id: number;
    title: string;
    level: string;
  };
  trainer: {
    id: number;
    name: string;
  };
}
