import { AuditCategory } from "../../models/AuditLog";

export type AuditLogEntry = {
    category: AuditCategory;
    action: string;
    userId?: number | null;
    username?: string | null;
    details?: any;
}