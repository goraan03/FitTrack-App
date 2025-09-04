import type { TrainingType } from "../../types/users/ClientProfile";

export interface WeeklyEvent {
  termId: number;
  title: string;
  day: number;            // 0..6
  start: string;          // "HH:mm"
  end: string;            // "HH:mm"
  type: TrainingType;
  programTitle: string;
  trainerName: string;
  cancellable: boolean;
}