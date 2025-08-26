import nodemailer, { type Transporter } from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { IEmailService } from '../../Domain/services/email/IEmailService';

export class EmailService implements IEmailService {
  private mode: 'sendgrid' | 'ethereal';
  private transporter: Transporter | null = null;
  private from: string;

  constructor() {
    const sgApiKey = process.env.SENDGRID_API_KEY;
    this.from = process.env.EMAIL_FROM || 'no-reply@example.com';

    if (sgApiKey) {
      sgMail.setApiKey(sgApiKey);
      this.mode = 'sendgrid';
      // console.log('[EmailService] Mode: SendGrid');
    } else {
      this.mode = 'ethereal';
      // console.log('[EmailService] Mode: Ethereal (dev)');
    }
  }

  private async ensureEtherealTransport() {
    if (this.transporter) return this.transporter;
    const testAcc = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAcc.user, pass: testAcc.pass }
    });
    console.log('[Ethereal] test user:', testAcc.user);
    console.log('[Ethereal] test pass:', testAcc.pass);
    return this.transporter;
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

    if (this.mode === 'sendgrid') {
      await sgMail.send({ to, from: this.from, subject, text, html });
      return;
    }

    // Ethereal (dev)
    const t = await this.ensureEtherealTransport();
    const info = await t.sendMail({ from: this.from, to, subject, text, html });
    const preview = (nodemailer as any).getTestMessageUrl?.(info);
    if (preview) console.log('[Ethereal] Preview URL:', preview);
  }
}