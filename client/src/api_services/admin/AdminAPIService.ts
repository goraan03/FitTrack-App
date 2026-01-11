import axios, { isAxiosError } from "axios";
import type { IAdminAPIService } from "./IAdminAPIService";
import type { ApiResponse } from "../../types/common/ApiResponse";
import type { AdminUser } from "../../types/admin/AdminUser";
import type { AuditLog } from "../../types/admin/AuditLog";
import { authHeader } from "../../helpers/admin/authHeader";
import type { Invoice } from "../../types/admin/Invoice";
const API_URL = (import.meta.env.VITE_API_URL || "") + "admin";

export const adminApi: IAdminAPIService = {
  async listUsers(filters) {
    try {
      const res = await axios.get<ApiResponse<AdminUser[]>>(`${API_URL}/users`, {
        headers: { ...authHeader(), "Content-Type": "application/json" },
        params: {
          uloga: filters?.uloga,
          blokiran: typeof filters?.blokiran === "boolean" ? (filters.blokiran ? "1" : "0") : undefined,
        },
      });
      return res.data;
    } catch (err) {
      const fallback: ApiResponse<AdminUser[]> = { success: false, message: "Greška pri učitavanju korisnika." };
      if (isAxiosError(err)) return { ...fallback, message: err.response?.data?.message || fallback.message };
      return fallback;
    }
  },

  async createTrainer(podaci) {
    try {
      const res = await axios.post<ApiResponse<{ id: number }>>(`${API_URL}/trainers`, podaci, {
        headers: { ...authHeader(), "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err) {
      const fallback: ApiResponse<{ id: number }> = { success: false, message: "Greška pri kreiranju trenera." };
      if (isAxiosError(err)) return { ...fallback, message: err.response?.data?.message || fallback.message };
      return fallback;
    }
  },

  async setBlocked(id, blokiran) {
    try {
      const res = await axios.patch<ApiResponse<null>>(
        `${API_URL}/users/${id}/block`,
        { blokiran },
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );
      return res.data;
    } catch (err) {
      const fallback: ApiResponse<null> = { success: false, message: "Greška pri izmeni statusa korisnika." };
      if (isAxiosError(err)) return { ...fallback, message: err.response?.data?.message || fallback.message };
      return fallback;
    }
  },

  async updateUser(id, input) {
    try {
      const res = await axios.patch<ApiResponse<null>>(
        `${API_URL}/users/${id}`,
        input,
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );
      return res.data;
    } catch (err) {
      const fallback: ApiResponse<null> = { success: false, message: "Greška pri ažuriranju korisnika." };
      if (isAxiosError(err)) return { ...fallback, message: err.response?.data?.message || fallback.message };
      return fallback;
    }
  },

  async getAuditLogs(params) {
    try {
      const res = await axios.get<ApiResponse<{ items: AuditLog[]; total: number }>>(
        `${API_URL}/audit`,
        {
          headers: { ...authHeader(), "Content-Type": "application/json" },
          params: {
            page: params.page ?? 1,
            pageSize: params.pageSize ?? 20,
            category: params.category,
            search: params.search,
            userId: params.userId
          }
        }
      );
      return res.data;
    } catch (err) {
      const fallback: ApiResponse<{ items: AuditLog[]; total: number }> = {
        success: false, message: "Greška pri učitavanju audit log-a."
      };
      if (isAxiosError(err)) return { ...fallback, message: err.response?.data?.message || fallback.message };
      return fallback;
    }
  },

  async getInvoices(params) {
    try {
      const res = await axios.get<ApiResponse<Invoice[]>>(
        `${API_URL}/invoices`,
        {
          headers: { ...authHeader(), "Content-Type": "application/json" },
          params: {
            trainerId: params?.trainerId,
            status: params?.status
          },
        }
      );
      return res.data;
    } catch (error) {
      const fallback: ApiResponse<Invoice[]> = {
        success: false,
        message: "Greška pri učitavanju faktura."
      };
      if(isAxiosError(error)) {
        return { ...fallback, message: error.response?.data?.message || fallback.message };
      }
      return fallback;
    }
  },

  async setInvoiceStatus(id, status) {
    try {
      const res = await axios.patch<ApiResponse<null>>(
        `${API_URL}/invoices/${id}/status`,
        { status },
        { headers: { ...authHeader(), "Content-Type": "application/json" } }
      );
      return res.data;
    } catch (error) {
      const fallback: ApiResponse<null> = {
        success: false,
        message: "Greška pri ažuriranju statusa fakture."
      };
      if(isAxiosError(error)) {
        return { ...fallback, message: error.response?.data?.message || fallback.message };
      }
      return fallback;
    }
  }
};