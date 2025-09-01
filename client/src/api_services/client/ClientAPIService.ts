// client/src/api_services/client/ClientAPIService.ts
import axios from "axios";
import { PročitajVrednostPoKljuču } from "../../helpers/local_storage";
import type {
  IClientAPIService,
  WeeklyScheduleResponse,
  AvailableTermsResponse,
  BasicResponse,
  HistoryResponse,
  TrainersResponse,
} from "./IClientAPIService";

const baseURL = (import.meta.env.VITE_API_URL || "") + "client";

// Axios instance sa interceptorom za Authorization header
const instance = axios.create({ baseURL });

instance.interceptors.request.use((config) => {
  const token = PročitajVrednostPoKljuču("authToken");
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export const clientApi: IClientAPIService = {
  async listTrainers() {
    const res = await instance.get<TrainersResponse>("/trainers");
    return res.data;
  },
  async chooseTrainer(trainerId: number) {
    const res = await instance.post<BasicResponse>("/choose-trainer", { trainerId });
    return res.data;
  },
  async getWeeklySchedule(weekStartISO: string) {
    const res = await instance.get<WeeklyScheduleResponse>("/schedule", { params: { weekStart: weekStartISO } });
    return res.data;
  },
  async getAvailableTerms(params) {
    const res = await instance.get<AvailableTermsResponse>("/available-terms", { params });
    return res.data;
  },
  async book(termId: number) {
    const res = await instance.post<BasicResponse>("/book", { termId });
    return res.data;
  },
  async cancel(termId: number) {
    const res = await instance.post<BasicResponse>("/cancel", { termId });
    return res.data;
  },
  async getHistory() {
    const res = await instance.get<HistoryResponse>("/history");
    return res.data;
  },
};