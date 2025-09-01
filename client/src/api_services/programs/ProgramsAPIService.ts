// client/src/api_services/programs/ProgramsAPIService.ts
import axios from "axios";
import type { IProgramsAPIService, PublicProgramsResponse } from "./IProgramsAPIService";

const joinURL = (base: string, path: string) => {
  const b = (base || '').replace(/\/+$/, '');
  const p = (path || '').replace(/^\/+/, '');
  return [b, p].filter(Boolean).join('/');
};

const baseURL = joinURL(import.meta.env.VITE_API_URL || '', 'programs');

export const programsApi: IProgramsAPIService = {
  async listPublic(params) {
    const res = await axios.get<PublicProgramsResponse>(`${baseURL}/public`, { params });
    return res.data;
  }
};