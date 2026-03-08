export interface IEmailService {
  sendOtp(to: string, code: string): Promise<void>;
  verifyConnection(): Promise<void>;
  sendInvoiceEmail(to: string, subject: string, text: string, pdf: Buffer, filename: string): Promise<void>;
  sendPasswordResetOtp(to: string, code: string): Promise<void>;
  sendTermCanceledToClient(
    clientEmail: string,
    programTitle: string,
    startAt: Date,
    trainerName: string
  ): Promise<void>;
  sendTermBookedToTrainer(
    trainerEmail: string,
    programTitle: string,
    startAt: Date,
    clientName: string
  ): Promise<void>;
  sendTermCanceledByClient(
    trainerEmail: string,
    programTitle: string,
    startAt: Date,
    clientName: string
  ): Promise<void>;
  sendEmail(options: {
    to: string;
    subject: string;
    text: string;
    attachments?: Array<{ filename: string; content: Buffer }>;
  }): Promise<void>;

  sendTrialReminder(to: string, trainerName: string, trialEndsAt: Date, daysLeft: number): Promise<void>;
  sendTrialExpired(to: string, trainerName: string): Promise<void>;
}
