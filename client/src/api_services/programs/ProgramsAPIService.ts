// client/src/api_services/programs/ProgramsAPIService.ts
import axios from "axios";
import type { IProgramsAPIService, PublicProgramsResponse } from "./IProgramsAPIService";

const baseURL = (import.meta.env.VITE_API_URL || "") + "programs";

export const programsApi: IProgramsAPIService = {
  async listPublic(params) {
    const res = await axios.get<PublicProgramsResponse>(`${baseURL}/public`, { params });
    return res.data;
  }
};