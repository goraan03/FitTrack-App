import axios from "axios";
import { getAuthToken } from "./getAuthToken";

const raw = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const apiBase = raw.replace(/\/+$/, "");
const baseURL = `${apiBase}/client`;

export const instance = axios.create({ baseURL });

instance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
    (config.headers as any)["X-Auth-Token"] = token;
  }
  return config;
});