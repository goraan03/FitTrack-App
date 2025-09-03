import type { ApiResponse } from "../../types/common/ApiResponse";
import type { AdminUser } from "../../types/admin/AdminUser";
import type { AuditLog, AuditCategory } from "../../types/admin/AuditLog";

export interface IAdminAPIService {
  listUsers(filters?: { uloga?: 'klijent' | 'trener' | 'admin'; blokiran?: boolean }): Promise<ApiResponse<AdminUser[]>>;
  createTrainer(podaci: {
    korisnickoIme: string;
    lozinka: string;
    ime: string;
    prezime: string;
    datumRodjenja?: string;
    pol: 'musko' | 'zensko';
  }): Promise<ApiResponse<{ id: number }>>;
  setBlocked(id: number, blokiran: boolean): Promise<ApiResponse<null>>;
  updateUser(
    id: number,
    input: { ime: string; prezime: string; datumRodjenja?: string | null; pol: 'musko' | 'zensko' }
  ): Promise<ApiResponse<null>>;

  getAuditLogs(params: {
    page?: number;
    pageSize?: number;
    category?: AuditCategory;
    search?: string;
    userId?: number;
  }): Promise<ApiResponse<{ items: AuditLog[]; total: number }>>;
}