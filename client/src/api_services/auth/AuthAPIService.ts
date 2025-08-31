import type { AuthResponse } from "../../types/auth/AuthResponse";
import type { IAuthAPIService } from "./IAuthAPIService";
import type { LoginStep1Response } from "../../types/auth/LoginStep1Response";
import type { Resend2FAResponse } from "../../types/auth/Resend2FAResponse";
import type { BootInfoResponse } from "../../types/auth/BootInfo";
import axios, { isAxiosError } from "axios";

const API_URL: string = (import.meta.env.VITE_API_URL || "") + "auth";

export const authApi: IAuthAPIService = {
  async prijava(korisnickoIme: string, lozinka: string): Promise<LoginStep1Response> {
    try {
      const res = await axios.post<LoginStep1Response>(`${API_URL}/login`, { korisnickoIme, lozinka });
      return res.data;
    } catch (err) {
      const fallback: LoginStep1Response = { success: false, message: "Greška pri prijavi." };
      if (isAxiosError(err)) {
        return { ...fallback, message: err.response?.data?.message || err.message || fallback.message };
      }
      return fallback;
    }
  },

  async verify2fa(challengeId: string, code: string): Promise<AuthResponse> {
    try {
      const res = await axios.post<AuthResponse>(`${API_URL}/verify-2fa`, { challengeId, code });
      return res.data;
    } catch (err) {
      const fallback: AuthResponse = { success: false, message: "Greška pri verifikaciji." };
      if (isAxiosError(err)) {
        return { ...fallback, message: err.response?.data?.message || err.message || fallback.message };
      }
      return fallback;
    }
  },

  async resend2fa(challengeId: string): Promise<Resend2FAResponse> {
    try {
      const res = await axios.post<Resend2FAResponse>(`${API_URL}/resend-2fa`, { challengeId });
      return res.data;
    } catch (err) {
      const fallback: Resend2FAResponse = { success: false, message: "Greška pri slanju novog koda." };
      if (isAxiosError(err)) {
        return { ...fallback, message: err.response?.data?.message || err.message || fallback.message };
      }
      return fallback;
    }
  },

  async registracija(podaci) {
    try {
      const res = await axios.post<AuthResponse>(`${API_URL}/register`, podaci);
      return res.data;
    } catch (err) {
      const fallback: AuthResponse = { success: false, message: "Greška pri registraciji." };
      if (isAxiosError(err)) {
        return { ...fallback, message: err.response?.data?.message || err.message || fallback.message };
      }
      return fallback;
    }
  },

  async getBoot(): Promise<BootInfoResponse> {
    try {
      const res = await axios.get<BootInfoResponse>(`${API_URL}/boot`);
      return res.data;
    } catch (err) {
      const fallback: BootInfoResponse = { success: false, message: "Greška pri dohvatanju BOOT ID." };
      if (isAxiosError(err)) {
        return { ...fallback, message: err.response?.data?.message || err.message || fallback.message };
      }
      return fallback;
    }
  }
};