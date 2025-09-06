import { Program } from "../../models/Program";

export interface IProgramsService {
  listPublic(params: {
    q?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    trainerId?: number;
  }): Promise<Program[]>;
}