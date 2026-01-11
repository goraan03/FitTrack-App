export type InvoiceStatus = "issued" | "paid" | "overdue";

export interface Invoice {
  id: number;
  trainerId: number;
  period: string;
  clientCount: number;
  amount: number;
  status: InvoiceStatus;
  pdfPath: string;
  createdAt: string;
  paidAt: string | null;
}