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
}