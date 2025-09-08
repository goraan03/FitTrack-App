import { Program } from "../../models/Program";

export interface IProgramsService {
  listPublic(params: {
    q?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    trainerId?: number;
  }): Promise<Program[]>;

  listVisibleForClient(params: {
    clientId: number;
    trainerId: number;
    q?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<Program[]>;
}