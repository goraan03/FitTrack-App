import { AuditCategory, AuditLogItem } from "../../models/AuditLog";

export interface IAuditService {
  log(
    category: AuditCategory,
    action: string,
    userId?: number | null,
    username?: string | null,
    details?: any
  ): Promise<void>;

  list(params: {
    page: number;
    pageSize: number;
    category?: AuditCategory;
    userId?: number;
    search?: string;
  }): Promise<{ items: AuditLogItem[]; total: number }>;
}