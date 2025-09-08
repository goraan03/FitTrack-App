import { AuditCategory } from "../../models/AuditLog";

export type AuditLogListParams = {
  page: number;
  pageSize: number;
  category?: AuditCategory;
  userId?: number;
  search?: string;
};