export interface IEmailService {
  sendOtp(email: string, code: string): Promise<void>;
}