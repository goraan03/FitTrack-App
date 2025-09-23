import type { PublicProgramsResponse } from "../../types/programs/PublicProgramsResponse";
import type { ProgramDetailsResponse } from "../../types/programs/ProgramDetailsResponse";

export interface IProgramsAPIService {
  listPublic(params?: {
    q?: string;
    level?: "beginner" | "intermediate" | "advanced";
    trainerId?: number;
  }): Promise<PublicProgramsResponse>;

  listVisible(params: {
    trainerId: number;
    clientId: number;
    q?: string;
    level?: "beginner" | "intermediate" | "advanced";
  }): Promise<PublicProgramsResponse>;

  getVisibleDetails(params: {
    programId: number;
    trainerId: number;
    clientId: number;
  }): Promise<ProgramDetailsResponse>;
}