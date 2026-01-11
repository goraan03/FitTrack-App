import { ResultSetHeader, RowDataPacket } from "mysql2";
import { IInvoiceRepository, InvoiceRow } from "../../../Domain/repositories/invoice/IInvoicesRepository";
import { CreateInvoiceInput } from "../../../Domain/repositories/invoice/IInvoicesRepository";
import db from "../../connection/DbConnectionPool";


export class InvoicesRepository implements IInvoiceRepository {
    async createInvoice(input: CreateInvoiceInput): Promise<number> {
        const [res] = await db.execute<ResultSetHeader>(
        `
        INSERT INTO invoices (trainer_id, period, client_count, amount, pdf_path, invoice_number)
        VALUES (?,?,?,?,?, '')
        `,
        [
            input.trainerId,
            input.period,
            input.clientCount,
            input.amount,
            input.pdfPath,
        ]);
        const id = res.insertId;

        const invoiceNumber = `INV-${id.toString().padStart(6, "0")}`;

        await db.execute(
            `UPDATE invoices SET invoice_number=? WHERE id=?`,
            [invoiceNumber, id]
        );
        return id;
    } 

    async listInvoices(params: {
        trainerId?: number;
        periodFrom?: string;
        periodTo?: string;
        status?: "issued" | "paid" | "overdue";
    } = {}): Promise<InvoiceRow[]> {
        const where: string[] = [];
        const args: any[] = [];

        if(params.trainerId) {
            where.push("trainer_id = ?");
            args.push(params.trainerId);
        }
        if(params.status) {
            where.push("status = ?");
            args.push(params.status);
        }
        if(params.periodFrom) {
            where.push("period >= ?");
            args.push(params.periodFrom);
        }
        if(params.periodTo) {
            where.push("period <= ?");
            args.push(params.periodTo);
        }

        const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

        const [rows] = await db.execute<RowDataPacket[]>(
            `
            SELECT id, trainer_id, period, client_count, amount, status, pdf_path, created_at, paid_at
            FROM invoices
            ${whereSql}
            ORDER BY created_at DESC
            `,
            args
        );

        return (rows as any[]).map((r) => ({
            id: r.id,
            trainerId: r.trainer_id,
            period: r.period,
            clientCount: r.client_count,
            amount: Number(r.amount),
            status: r.status,
            pdfPath: r.pdf_path,
            createdAt: new Date(r.created_at),
            paidAt: r.paid_at ? new Date(r.paid_at) : null,
        }));
    }
    async setStatus(
        id: number,
        status: "issued" | "paid" | "overdue"
    ): Promise<void> {
        await db.execute<ResultSetHeader>(
            `UPDATE invoices SET status=?, paid_at = CASE WHEN ?='paid' THEN NOW() ELSE paid_at END WHERE id=?`,
            [status, status, id]
        );
    }

    async getById(id: number): Promise<InvoiceRow | null> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, trainer_id, period, client_count, amount, status, pdf_path, created_at, paid_at, invoice_number
       FROM invoices
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (!(rows as any[]).length) return null;
    const r: any = rows[0];

    return {
      id: r.id,
      trainerId: r.trainer_id,
      period: r.period,
      clientCount: r.client_count,
      amount: Number(r.amount),
      status: r.status,
      pdfPath: r.pdf_path,
      createdAt: new Date(r.created_at),
      paidAt: r.paid_at ? new Date(r.paid_at) : null,
    };
  }
}