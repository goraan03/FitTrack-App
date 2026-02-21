import type { TrainingType } from "../../types/users/ClientProfile";

export interface WeeklyEvent {
  termId: number;
  title: string;
  day: number;            
  start: string;          
  end: string;            
  startAt?: string;
  durationMin?: number;
  type: TrainingType;
  programTitle: string;
  trainerName: string;
  cancellable: boolean;
  completed?: boolean;
  programId: number;
}
