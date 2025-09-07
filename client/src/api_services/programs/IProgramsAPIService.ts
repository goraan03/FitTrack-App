// client/src/api_services/programs/IProgramsAPIService.ts
import type { PublicProgramsResponse } from "../../types/programs/PublicProgramsResponse";

export interface IProgramsAPIService {
  listPublic(params?: {
    q?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    trainerId?: number;
  }): Promise<PublicProgramsResponse>;

  listVisible(params: {
    trainerId: number;
    clientId: number;
    q?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<PublicProgramsResponse>;
}