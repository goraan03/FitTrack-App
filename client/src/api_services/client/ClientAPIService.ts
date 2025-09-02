import axios from "axios";
import { PročitajVrednostPoKljuču } from "../../helpers/local_storage";
import type {
  IClientAPIService,
  WeeklyScheduleResponse,
  AvailableTermsResponse,
  BasicResponse,
  HistoryResponse,
  TrainersResponse,
  MyProfileResponse,
  AvailableTermsQuery,
} from "./IClientAPIService";

const baseURL = (import.meta.env.VITE_API_URL || "") + "client";

// Fallback čitanje tokena
function getAuthToken(): string | null {
  try {
    return (
      PročitajVrednostPoKljuču("authToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      sessionStorage.getItem("authToken") ||
      null
    );
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}`, "X-Auth-Token": token } : {};
}

// Axios instance
const instance = axios.create({ baseURL });

instance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
    (config.headers as any)["X-Auth-Token"] = token;
  }
  return config;
});

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

  // NOVO – agregat profila
  async getMyProfile() {
    const res = await instance.get<MyProfileResponse>("/me/profile", { headers: authHeaders() });
    return res.data;
  },
};