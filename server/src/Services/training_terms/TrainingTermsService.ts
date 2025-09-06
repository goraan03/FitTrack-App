import { ITrainingTermsRepository } from "../../Domain/repositories/training_terms/ITrainingTermsRepository";
import { ITrainingTermsService } from "../../Domain/services/training_terms/ITrainingTermsService";
import { AvailableTerm } from "../../Domain/types/training_terms/AvailableTerm";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";

function isoToDate(s?: string): Date | null {
  return s ? new Date(s) : null;
}

export class TrainingTermsService implements ITrainingTermsService {
  constructor(
    private repo: ITrainingTermsRepository, 
    private userRepo: IUserRepository
  ) {}

  async getAvailableTerms(
    userId: number,
    params: { 
      fromISO?: string; 
      toISO?: string; 
      type?: 'individual' | 'group'; 
      programId?: number; 
      status?: 'free' | 'full' 
    }
  ): Promise<AvailableTerm[]> {
    const trainerId = await this.userRepo.getAssignedTrainerId(userId);
    if (!trainerId) throw new Error('NO_TRAINER_SELECTED');

    const from = isoToDate(params.fromISO) || new Date();
    const to = isoToDate(params.toISO) || new Date(Date.now() + 30 * 24 * 3600 * 1000);

    return this.repo.getAvailableTerms(
      trainerId,
      from,
      to,
      params.type,
      params.programId,
      params.status,
      userId
    );
  }
}
