// src/Database/repositories/audit/AuditLogRepository.ts
import { RowDataPacket } from "mysql2";
import db from "../../connection/DbConnectionPool";
import {
  IAuditLogRepository,
  AuditLogListParams,
} from "../../../Domain/repositories/audit/IAuditLogRepository";
import { AuditCategory, AuditLogItem } from "../../../Domain/models/AuditLog";

function decodeDetails(raw: any): any {
  if (raw === null || raw === undefined) return null;
  try {
    if (typeof raw === "string") {
      const s = raw.trim();
      if (s === "" || s.toLowerCase() === "null") return null;
      return JSON.parse(s);
    }
    if (Buffer.isBuffer(raw)) {
      const s = raw.toString("utf8").trim();
      if (s === "" || s.toLowerCase() === "null") return null;
      return JSON.parse(s);
    }
    return raw;
  } catch {
    try {
      return String(raw);
    } catch {
      return null;
    }
  }
}

export class AuditLogRepository implements IAuditLogRepository {
  async create(entry: {
    category: AuditCategory;
    action: string;
    userId?: number | null;
    username?: string | null;
    details?: any;
  }): Promise<void> {
    const json = entry.details === undefined ? null : JSON.stringify(entry.details);
    await db.execute(
      "INSERT INTO `audit_log` (`category`, `action`, `user_id`, `username`, `details`) VALUES (?, ?, ?, ?, ?)",
      [entry.category, entry.action, entry.userId ?? null, entry.username ?? null, json]
    );
  }

  async list(params: AuditLogListParams): Promise<{ items: AuditLogItem[]; total: number }> {
    const page = Math.max(1, Number(params.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize || 20)));
    const offset = (page - 1) * pageSize;

    const where: string[] = [];
    const args: any[] = [];

    if (params.category) {
      where.push("`category` = ?");
      args.push(params.category);
    }
    if (typeof params.userId === "number") {
      where.push("`user_id` = ?");
      args.push(params.userId);
    }
    if (params.search) {
      where.push("(`action` LIKE ? OR `username` LIKE ?)");
      args.push(`%${params.search}%`, `%${params.search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const query = `
      SELECT 
        \`id\`,
        \`category\`,
        \`action\`,
        \`user_id\`  AS userId,
        \`username\`,
        \`details\`,
        \`created_at\` AS createdAt
      FROM \`audit_log\`
      ${whereSql}
      ORDER BY \`created_at\` DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM \`audit_log\`
      ${whereSql}
    `;

    const [rows] = await db.execute<RowDataPacket[]>(query, args);
    const [cnt] = await db.execute<RowDataPacket[]>(countQuery, args);

    const items: AuditLogItem[] = rows.map((r: any) => ({
      id: r.id,
      category: r.category,
      action: r.action,
      userId: r.userId ?? null,
      username: r.username ?? null,
      details: decodeDetails(r.details),
      createdAt: new Date(r.createdAt),
    }));

    const total = Number((cnt[0] as any).total || 0);
    return { items, total };
  }
}