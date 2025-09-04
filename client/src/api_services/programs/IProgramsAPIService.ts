import type { ProgramLevelList } from "../../types/programs/ProgramLevelList";
import type { PublicProgramsResponse } from "../../types/programs/PublicProgramsResponse";

export interface IProgramsAPIService {
  listPublic(params?: ProgramLevelList): Promise<PublicProgramsResponse>;
}