import type { TrainingType } from "../../types/users/ClientProfile";

export interface UpcomingSession {
  id: number;
  title: string;
  programName: string;
  type: TrainingType;
  startsAt: string;    // ISO
  durationMin: number;
  isFull: boolean;
  trainerName: string;
}