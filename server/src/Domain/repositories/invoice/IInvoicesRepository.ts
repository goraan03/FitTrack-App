export interface CreateInvoiceInput {
    trainerId: number;
    period: string;
    clientCount: number;
    amount: number;
    pdfPath: string;
}

export interface InvoiceRow {
    id: number;
    trainerId: number;
    period: string;
    clientCount: number;
    amount: number;
    status: "issued" | "paid" | "overdue";
    pdfPath: string;
    createdAt: Date;
    paidAt: Date | null;
}

export interface IInvoiceRepository {
    createInvoice(input: CreateInvoiceInput): Promise<number>;
    listInvoices(params?: {
        trainerId?: number;
        periodFrom?: string;
        periodTo?: string;
        status?: "issued" | "paid" | "overdue";
    }) : Promise<InvoiceRow[]>;
    setStatus(id: number, status: "issued" | "paid" | "overdue"): Promise<void>;
    getById(id: number): Promise<InvoiceRow | null>;
}