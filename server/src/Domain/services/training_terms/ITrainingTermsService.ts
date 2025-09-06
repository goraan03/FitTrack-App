import { TrainingType } from "../../types/training_enrollments/TrainingType";
import { AvailableTerm } from "../../types/training_terms/AvailableTerm";

export interface ITrainingTermsService {
  getAvailableTerms(
    userId: number,
    params: {
      fromISO?: string;
      toISO?: string;
      type?: TrainingType;
      programId?: number;
      status?: 'free' | 'full';
    }
  ): Promise<AvailableTerm[]>;
}
