import axios from "axios";
import type { ITrainerAPIService } from "./ITrainerAPIService";
import type { TrainerDashboardResponse, UnratedParticipantsResponse, BasicResponse } from "../../types/trainer/TrainerDashboard";
import { authHeaders } from "../../helpers/client/authHeaders";
import { joinURL } from "../../helpers/programs/joinURL";
import type { MyProfileResponse } from "../../types/trainer/MyProfileResponse";

const baseURL = joinURL(import.meta.env.VITE_API_URL || '', 'trainer');

export const trainerApi: ITrainerAPIService = {
  async getDashboard(weekStartISO) {
    const res = await axios.get<TrainerDashboardResponse>(`${baseURL}/dashboard`, {
      params: { weekStart: weekStartISO },
      headers: authHeaders(),
    });
    return res.data;
  },

  async getUnrated(termId: number) {
    const res = await axios.get<UnratedParticipantsResponse>(`${baseURL}/terms/${termId}/unrated`, { headers: authHeaders() });
    return res.data;
  },

  async rateParticipant(termId: number, userId: number, rating: number) {
    const res = await axios.post<BasicResponse>(`${baseURL}/terms/${termId}/rate`, { userId, rating }, { headers: authHeaders() });
    return res.data;
  },

  async getMyProfile() {
    const res = await axios.get<MyProfileResponse>(`${baseURL}/me/profile`, { headers: authHeaders() });
    return res.data;
  }
};