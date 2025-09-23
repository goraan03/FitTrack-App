import { Program } from "../../models/Program";
import { ProgramDetailsForClient } from "../../repositories/programs/IProgramsRepository";

export interface IProgramsService {
  listPublic(params: { q?: string; level?: 'beginner' | 'intermediate' | 'advanced'; trainerId?: number; }): Promise<Program[]>;
  listVisibleForClient(params: { clientId: number; trainerId: number; q?: string; level?: 'beginner' | 'intermediate' | 'advanced'; }): Promise<Program[]>;
  getVisibleDetails(params: { programId: number; trainerId: number; clientId: number; }): Promise<ProgramDetailsForClient | null>;
}