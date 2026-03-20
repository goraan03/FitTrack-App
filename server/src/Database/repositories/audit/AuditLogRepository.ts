import { RowDataPacket } from "mysql2";
import db from "../../connection/DbConnectionPool";
import { IAuditLogRepository } from "../../../Domain/repositories/audit/IAuditLogRepository";
import { AuditCategory, AuditLogItem } from "../../../Domain/models/AuditLog";
import { decodeDetails } from "../../../helpers/repositories/decodeDetails";
import { AuditLogListParams } from "../../../Domain/types/audit_log/AuditLogListParams";
import { AuditLogEntry } from "../../../Domain/types/audit_log/AuditLogEntry";

export class AuditLogRepository implements IAuditLogRepository {
  async create(entry: AuditLogEntry): Promise<void> {
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
      where.push("al.`category` = ?");
      args.push(params.category);
    }
    if (typeof params.userId === "number") {
      where.push("al.`user_id` = ?");
      args.push(params.userId);
    }
    if (params.search) {
      where.push("(al.`action` LIKE ? OR al.`username` LIKE ? OR u.`korisnickoIme` LIKE ?)");
      args.push(`%${params.search}%`, `%${params.search}%`, `%${params.search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const query = `
      SELECT
        al.\`id\`,
        al.\`category\`,
        al.\`action\`,
        al.\`user_id\`  AS userId,
        COALESCE(al.\`username\`, u.\`korisnickoIme\`) AS username,
        al.\`details\`,
        al.\`created_at\` AS createdAt
      FROM \`audit_log\` al
      LEFT JOIN \`users\` u ON u.id = al.\`user_id\`
      ${whereSql}
      ORDER BY al.\`created_at\` DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM \`audit_log\` al
      LEFT JOIN \`users\` u ON u.id = al.\`user_id\`
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