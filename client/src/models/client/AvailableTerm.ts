import type { AvailableTermProgram } from "../../types/client/AvailableTermProgram";
import type { AvailableTermTrainer } from "../../types/client/AvailableTermTrainer";
import type { TrainingType } from "../../types/users/ClientProfile";

export interface AvailableTerm {
  id: number;
  startAt: string;              // ISO
  durationMin: number;
  type: TrainingType;
  capacity: number;
  enrolledCount: number;
  status: 'free' | 'full';
  isEnrolled: boolean;
  program: AvailableTermProgram;
  trainer: AvailableTermTrainer;
}