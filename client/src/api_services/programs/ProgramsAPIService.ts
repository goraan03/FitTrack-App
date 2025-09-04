import axios from "axios";
import type { IProgramsAPIService } from "./IProgramsAPIService";
import type { PublicProgramsResponse } from "../../types/programs/PublicProgramsResponse";
import { joinURL } from "../../helpers/programs/joinURL";

const baseURL = joinURL(import.meta.env.VITE_API_URL || '', 'programs');

export const programsApi: IProgramsAPIService = {
  async listPublic(params) {
    const res = await axios.get<PublicProgramsResponse>(`${baseURL}/public`, { params });
    return res.data;
  }
};