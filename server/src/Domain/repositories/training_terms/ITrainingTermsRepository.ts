import { AvailableTerm } from "../../types/training_terms/AvailableTerm";
import { TrainingType } from "../../types/training_enrollments/TrainingType";

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

export interface ITrainingTermsRepository {
  getAvailableTerms(
    trainerId: number,
    from: Date,
    to: Date,
    type?: TrainingType,
    programId?: number,
    status?: "free" | "full",
    userId?: number
  ): Promise<AvailableTerm[]>;

  getById(termId: number): Promise<TrainingTerm | null>;
  incrementEnrolledCount(termId: number): Promise<void>;
  decrementEnrolledCount(termId: number): Promise<void>;
  cancelTerm(termId: number): Promise<void>;

  // NEW
  create(dto: { trainerId: number; programId: number; type: TrainingType; startAt: Date; durationMin: number; capacity: number }): Promise<number>;
}