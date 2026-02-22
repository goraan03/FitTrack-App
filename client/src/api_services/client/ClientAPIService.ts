import type { IClientAPIService } from "./IClientAPIService";
import type { BasicResponse } from "../../types/client/BasicResposne";
import type { TrainersResponse } from "../../types/client/TrainersResponse";
import type { WeeklyScheduleResponse } from "../../types/client/WeeklyScheduleResponse";
import type { AvailableTermsResponse } from "../../types/client/AvailableTermsResponse";
import type { AvailableTermsQuery } from "../../types/client/AvailableTermsQuery";
import type { HistoryResponse } from "../../types/client/HistoryResponse";
import type { MyProfileResponse } from "../../types/client/MyProfileResponse";
import { authHeaders } from "../../helpers/client/authHeaders";
import { instance } from "../../helpers/client/instanceClient";

export const clientApi: IClientAPIService = {
  async listTrainers() {
    const res = await instance.get<TrainersResponse>("/trainers", { headers: authHeaders() });
    return res.data;
  },

  async chooseTrainer(trainerId: number) {
    const res = await instance.post<BasicResponse>("/choose-trainer", { trainerId }, { headers: authHeaders() });
    return res.data;
  },

  async getWeeklySchedule(weekStartISO: string) {
    const res = await instance.get<WeeklyScheduleResponse>("/schedule", {
      params: { weekStart: weekStartISO },
      headers: authHeaders(),
    });
    return res.data;
  },

  async getAvailableTerms(params: AvailableTermsQuery) {
    const res = await instance.get<AvailableTermsResponse>("/available-terms", {
      params,
      headers: authHeaders(),
    });
    return res.data;
  },

  async book(termId: number) {
    const res = await instance.post<BasicResponse>("/book", { termId }, { headers: authHeaders() });
    return res.data;
  },

  async cancel(termId: number) {
    const res = await instance.post<BasicResponse>("/cancel", { termId }, { headers: authHeaders() });
    return res.data;
  },

  async getHistory() {
    const res = await instance.get<HistoryResponse>("/history", { headers: authHeaders() });
    return res.data;
  },

  async getMyProfile() {
    const res = await instance.get<MyProfileResponse>("/me/profile", { headers: authHeaders() });
    return res.data;
  },

async updateMyProfile(payload) {
  const res = await instance.put<MyProfileResponse>("/me/profile", payload, { headers: authHeaders() });
  return res.data;
}
};