import type { AuditCategory } from "./AuditLog";

export type GetAuditLogs = {
    page?: number;
    pageSize?: number;
    category?: AuditCategory;
    search?: string;
    userId?: number;
}