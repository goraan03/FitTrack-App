import { IAuditService } from "../../Domain/services/audit/IAuditService";
import {
  IAuditLogRepository,
} from "../../Domain/repositories/audit/IAuditLogRepository";
import { AuditCategory, AuditLogItem } from "../../Domain/models/AuditLog";

export class AuditService implements IAuditService {
  constructor(private readonly auditRepo: IAuditLogRepository) {}

  async log(
    category: AuditCategory,
    action: string,
    userId?: number | null,
    username?: string | null,
    details?: any
  ): Promise<void> {
    await this.auditRepo.create({ category, action, userId, username, details });
  }

  async list(params: {
    page: number;
    pageSize: number;
    category?: AuditCategory;
    userId?: number;
    search?: string;
  }): Promise<{ items: AuditLogItem[]; total: number }> {
    const page = Math.max(1, Number(params.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize || 20)));

    return this.auditRepo.list({
      page,
      pageSize,
      category: params.category,
      userId: params.userId,
      search: params.search,
    });
  }
}