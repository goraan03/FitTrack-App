import { TrainingType } from "./TrainingType";

export interface WeeklyEvent {
  termId: number;
  title: string;
  day: number;
  start: string;
  end: string;
  type: TrainingType;
  programTitle: string;
  trainerName: string;
  cancellable: boolean;
}