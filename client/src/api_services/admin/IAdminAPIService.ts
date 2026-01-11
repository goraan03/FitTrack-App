import type { ApiResponse } from "../../types/common/ApiResponse";
import type { AdminUser } from "../../types/admin/AdminUser";
import type { AuditLog } from "../../types/admin/AuditLog";
import type { TrainerRegistration } from "../../types/admin/TrainerRegistration";
import type { UserUpdate } from "../../types/admin/UserUpdate";
import type { UserListFilter } from "../../types/admin/UserListFilter";
import type { GetAuditLogs } from "../../types/admin/GetAuditLogs";
import type { Invoice, InvoiceStatus } from "../../types/admin/Invoice";

export interface IAdminAPIService {
  listUsers(filters?: UserListFilter): Promise<ApiResponse<AdminUser[]>>;
  createTrainer(podaci: TrainerRegistration): Promise<ApiResponse<{ id: number }>>;
  setBlocked(id: number, blokiran: boolean): Promise<ApiResponse<null>>;
  updateUser(id: number, input: UserUpdate): Promise<ApiResponse<null>>;
  getAuditLogs(params: GetAuditLogs): Promise<ApiResponse<{ items: AuditLog[]; total: number }>>;
  getInvoices(params?: { trainerId?: number; status?: InvoiceStatus }): Promise<ApiResponse<Invoice[]>>;
  setInvoiceStatus(id: number, status: InvoiceStatus): Promise<ApiResponse<null>>;
  downloadInvoicePdf(id: number): Promise<void>;
}