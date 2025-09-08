import { Program } from "../../Domain/models/Program";
import { IProgramsRepository } from "../../Domain/repositories/programs/IProgramsRepository";
import { IProgramsService } from "../../Domain/services/programs/IProgramsService";

export class ProgramsService implements IProgramsService {
  constructor(private programsRepository: IProgramsRepository) {}

  async listPublic(params: {
    q?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    trainerId?: number;
  }): Promise<Program[]> {
    return await this.programsRepository.listPublic(params);
  }

  async listVisibleForClient(params: {
    clientId: number;
    trainerId: number;
    q?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<Program[]> {
    return await this.programsRepository.listVisibleForClient(params);
  }
}