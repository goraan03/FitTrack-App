import { AuditCategory, AuditLogItem } from "../../models/AuditLog";
import { AuditLogEntry } from "../../types/audit_log/AuditLogEntry";
import { AuditLogListParams } from "../../types/audit_log/AuditLogListParams";

export interface IAuditLogRepository {
  create(entry: AuditLogEntry): Promise<void>;
  list(params: AuditLogListParams): Promise<{ items: AuditLogItem[]; total: number }>;
}