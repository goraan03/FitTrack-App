export interface IEmailService {
  sendOtp(to: string, code: string): Promise<void>;
  verifyConnection(): Promise<void>;
  sendOtp(to: string, code: string): Promise<void>;
  sendInvoiceEmail(to: string, subject: string, text: string, pdf: Buffer, filename: string): Promise<void>;
  sendPasswordResetOtp(to: string, code: string): Promise<void>;
}