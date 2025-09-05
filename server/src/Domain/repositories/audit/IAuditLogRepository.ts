// src/Domain/repositories/audit/IAuditLogRepository.ts
import { AuditCategory, AuditLogItem } from "../../models/AuditLog";

export type AuditLogListParams = {
  page: number;
  pageSize: number;
  category?: AuditCategory;
  userId?: number;
  search?: string;
};

export interface IAuditLogRepository {
  create(entry: {
    category: AuditCategory;
    action: string;
    userId?: number | null;
    username?: string | null;
    details?: any;
  }): Promise<void>;

  list(params: AuditLogListParams): Promise<{ items: AuditLogItem[]; total: number }>;
}