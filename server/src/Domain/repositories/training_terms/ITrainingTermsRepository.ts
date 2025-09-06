import { TrainingType } from "../../types/training_enrollments/TrainingType";
import { AvailableTerm } from "../../types/training_terms/AvailableTerm";

export interface ITrainingTermsRepository {
  getAvailableTerms(
    trainerId: number,
    from: Date,
    to: Date,
    type?: TrainingType,
    programId?: number,
    status?: 'free'|'full',
    userId?: number
  ): Promise<AvailableTerm[]>;
}