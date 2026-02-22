import nodemailer, { type Transporter } from 'nodemailer';
import { IEmailService } from '../../Domain/services/email/IEmailService';

export class EmailService implements IEmailService {
  private transporter: Transporter;
  private from: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true' || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host) throw new Error('SMTP_HOST nije definisan u .env');
    if (!user) throw new Error('SMTP_USER nije definisan u .env');
    if (!pass) throw new Error('SMTP_PASS nije definisan u .env');

    this.from = process.env.EMAIL_FROM || user;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    console.log(`[EmailService] Mode: SMTP (${host}:${port}, secure=${secure})`);
  }

  async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('[EmailService] SMTP connection verified.');
    } catch (e) {
      console.error('[EmailService] SMTP verify failed:', e);
      throw e;
    }
  }

  async sendOtp(to: string, code: string): Promise<void> {
    const minutes = 5;
    const subject = 'Vaš verifikacioni kod (2FA)';
    const text = `Vaš verifikacioni kod je: ${code}. Važi ${minutes} minuta.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verifikacija prijave</h2>
        <p>Vaš verifikacioni kod je:</p>
        <p style="font-size: 22px; font-weight: bold; letter-spacing: 3px;">${code}</p>
        <p>Kod važi ${minutes} minuta.</p>
        <p>Ako niste Vi započeli prijavu, ignorišite ovu poruku.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html,
    });
  }

  async sendInvoiceEmail(to: string, subject: string, text: string, pdf: Buffer, filename: string) : Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text,
      attachments: [
        {
          filename,
          content: pdf,
          contentType: 'application/pdf'
        },
      ],
    });
  }

  async sendPasswordResetOtp(to: string, code: string): Promise<void> {
  const minutes = 5;
  const subject = 'FitTrack - Password Reset Code';
  const text = `Your password reset code is: ${code}. Valid for ${minutes} minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 30px; text-align: center;">
        <h1 style="color: #EAB308; margin: 0;">🔐 Password Reset</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5;">
        <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #666; font-size: 16px;">
          You requested a password reset for your FitTrack account.
        </p>
        
        <div style="background: #f9f9f9; border-left: 4px solid #EAB308; padding: 20px; margin: 25px 0;">
          <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;">Your verification code:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #EAB308; margin: 0;">
            ${code}
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This code is valid for <strong>${minutes} minutes</strong>.
        </p>
        
        <p style="color: #999; font-size: 13px; margin-top: 30px;">
          If you didn't request this, please ignore this email or contact support.
        </p>
      </div>
      
      <div style="background: #f5f5f5; padding: 20px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} FitTrack. All rights reserved.
        </p>
      </div>
    </div>
  `;

  await this.transporter.sendMail({
    from: this.from,
    to,
    subject,
    text,
    html,
  });
}
}