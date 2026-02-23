import { AvailableTerm } from "../../types/training_terms/AvailableTerm";
import { TrainingType } from "../../types/training_enrollments/TrainingType";

export type TrainingTerm = {
  id: number;
  trainerId: number;
  programId: number | null;
  type: TrainingType;
  startAt: Date;
  durationMin: number;
  capacity: number;
  enrolledCount: number;
  canceled: boolean;
};

export type TermWithProgramAndTrainer = {
  termId: number;
  programId: number | null;
  programTitle: string | null;
  trainerId: number;
  trainerName: string;
  trainerEmail: string;
  startAt: Date;
};

export interface ITrainingTermsRepository {
  getAvailableTerms(trainerId: number, from: Date, to: Date, type?: TrainingType, programId?: number, status?: "free" | "full", userId?: number): Promise<AvailableTerm[]>;
  getById(termId: number): Promise<TrainingTerm | null>;
  getWithProgramAndTrainer(termId: number): Promise<TermWithProgramAndTrainer | null>;
  incrementEnrolledCount(termId: number): Promise<void>;
  decrementEnrolledCount(termId: number): Promise<void>;
  cancelTerm(termId: number): Promise<void>;
  create(dto: { trainerId: number; programId?: number | null; type: TrainingType; startAt: Date; durationMin: number; capacity: number }): Promise<number>;
  setProgram(termId: number, programId: number | null): Promise<void>;
  getEnrolledClientId(termId: number): Promise<number | null>;
}