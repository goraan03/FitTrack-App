import axios from "axios";
import type { IProgramsAPIService } from "./IProgramsAPIService";
import type { PublicProgramsResponse } from "../../types/programs/PublicProgramsResponse";
import type { ProgramDetailsResponse } from "../../types/programs/ProgramDetailsResponse";
import { joinURL } from "../../helpers/programs/joinURL";

const baseURL = joinURL(import.meta.env.VITE_API_URL || "", "programs");

export const programsApi: IProgramsAPIService = {
  async listPublic(params) {
    const res = await axios.get<PublicProgramsResponse>(`${baseURL}/public`, { params });
    return res.data;
  },
  async listVisible(params) {
    const res = await axios.get<PublicProgramsResponse>(`${baseURL}/visible`, { params });
    return res.data;
  },
  async getVisibleDetails({ programId, trainerId, clientId }) {
    const res = await axios.get<ProgramDetailsResponse>(`${baseURL}/${programId}/details`, {
      params: { trainerId, clientId },
    });
    return res.data;
  },
};