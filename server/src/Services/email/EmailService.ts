import nodemailer, { type Transporter } from 'nodemailer';
import { IEmailService } from '../../Domain/services/email/IEmailService';

// Helper to format session datetime in local tz (Europe/Belgrade)
const formatSessionDate = (d: Date) =>
  d.toLocaleString('en-GB', {
    timeZone: 'Europe/Belgrade',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

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
    const subject = 'Your verification code (2FA)';
    const text = `Your verification code is: ${code}. Valid for ${minutes} minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verification Code</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 22px; font-weight: bold; letter-spacing: 3px;">${code}</p>
        <p>Code is valid for ${minutes} minutes.</p>
        <p>If you didn't request this, please ignore this message.</p>
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

  async sendInvoiceEmail(to: string, subject: string, text: string, pdf: Buffer, filename: string): Promise<void> {
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
    const subject = 'TrainMeter - Password Reset Code';
    const text = `Your password reset code is: ${code}. Valid for ${minutes} minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 30px; text-align: center;">
          <h1 style="color: #EAB308; margin: 0;">🔐 Password Reset</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #666; font-size: 16px;">
            You requested a password reset for your TrainMeter account.
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
            © ${new Date().getFullYear()} TrainMeter. All rights reserved.
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

  // Termin otkazan (trener → klijent)
  async sendTermCanceledToClient(
    clientEmail: string,
    programTitle: string,
    startAt: Date,
    trainerName: string
  ): Promise<void> {
    const subject = 'TrainMeter - Session Canceled';
    const dateStr = formatSessionDate(startAt);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ef4444; margin: 0;">🚫 Session Canceled</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5;">
          <p style="color: #333; font-size: 16px;">Hi,</p>
          <p style="color: #666;">
            Your trainer <strong>${trainerName}</strong> has canceled the following session:
          </p>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0;">
            <p style="color: #333; margin: 0 0 10px 0;"><strong>${programTitle}</strong></p>
            <p style="color: #666; margin: 0;">📅 ${dateStr}</p>
          </div>
          
          <p style="color: #666;">
            Please check your dashboard for alternative sessions or contact your trainer.
          </p>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} TrainMeter</p>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.from,
      to: clientEmail,
      subject,
      html,
    });
  }

  // Termin zauzet (klijent → trener)
  async sendTermBookedToTrainer(
    trainerEmail: string,
    programTitle: string,
    startAt: Date,
    clientName: string
  ): Promise<void> {
    const subject = 'TrainMeter - New Session Booking';
    const dateStr = formatSessionDate(startAt);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 30px; text-align: center;">
          <h1 style="color: #10b981; margin: 0;">✅ New Booking</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5;">
          <p style="color: #333; font-size: 16px;">Hi,</p>
          <p style="color: #666;">
            <strong>${clientName}</strong> has booked a session with you:
          </p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0;">
            <p style="color: #333; margin: 0 0 10px 0;"><strong>${programTitle}</strong></p>
            <p style="color: #666; margin: 0;">📅 ${dateStr}</p>
            <p style="color: #666; margin: 10px 0 0 0;">👤 Client: ${clientName}</p>
          </div>
          
          <p style="color: #666;">
            Check your dashboard to prepare for the session.
          </p>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} TrainMeter</p>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.from,
      to: trainerEmail,
      subject,
      html,
    });
  }

  // Klijent otkazao termin (klijent → trener)
  async sendTermCanceledByClient(
    trainerEmail: string,
    programTitle: string,
    startAt: Date,
    clientName: string
  ): Promise<void> {
    const subject = 'TrainMeter - Session Canceled by Client';
    const dateStr = formatSessionDate(startAt);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 30px; text-align: center;">
          <h1 style="color: #f59e0b; margin: 0;">⚠️ Client Canceled</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5;">
          <p style="color: #333; font-size: 16px;">Hi,</p>
          <p style="color: #666;">
            <strong>${clientName}</strong> has canceled their session:
          </p>
          
          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0;">
            <p style="color: #333; margin: 0 0 10px 0;"><strong>${programTitle}</strong></p>
            <p style="color: #666; margin: 0;">📅 ${dateStr}</p>
            <p style="color: #666; margin: 10px 0 0 0;">👤 Client: ${clientName}</p>
          </div>
          
          <p style="color: #666;">
            This slot is now available for other clients.
          </p>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} TrainMeter</p>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.from,
      to: trainerEmail,
      subject,
      html,
    });
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    text: string;
    attachments?: Array<{ filename: string; content: Buffer }>;
  }): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      attachments: options.attachments,
    });
  }

  async sendTrialReminder(
    to: string, trainerName: string, trialEndsAt: Date, daysLeft: number
  ): Promise<void> {
    const subject = daysLeft === 1
      ? 'TrainMeter — Trial ends tomorrow'
      : `TrainMeter — Trial ends in ${daysLeft} days`;

    const endDateStr = trialEndsAt.toLocaleDateString('en-US');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#0a0a0a,#1a1a1a);padding:30px;text-align:center;">
          <h1 style="color:#EAB308;margin:0;">⏳ Trial Period</h1>
        </div>
        <div style="background:#fff;padding:30px;border:1px solid #e5e5e5;">
          <p style="color:#333;font-size:16px;">Hi <strong>${trainerName}</strong>,</p>
          <p style="color:#666;">
            Your free trial for <strong>TrainMeter</strong> expires
            ${daysLeft === 1 ? '<strong>tomorrow</strong>' : `in <strong>${daysLeft} days</strong>`}
            — <strong>${endDateStr}</strong>.
          </p>
          <div style="background:#fefce8;border-left:4px solid #EAB308;padding:20px;margin:25px 0;">
            <p style="color:#333;margin:0;">
              To keep using TrainMeter without interruption, choose a plan in the app.
            </p>
          </div>
          <p style="color:#666;font-size:14px;">
            After the trial ends you will need an active plan to continue.
          </p>
        </div>
        <div style="background:#f5f5f5;padding:20px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">© ${new Date().getFullYear()} TrainMeter</p>
        </div>
      </div>
    `;

    await this.transporter.sendMail({ from: this.from, to, subject, html });
  }

  async sendTermAssignedToClient(
    clientEmail: string,
    trainerName: string,
    startAt: Date,
    programTitle?: string | null
  ): Promise<void> {
    const dateStr = formatSessionDate(startAt);
    const subject = 'TrainMeter — Session Scheduled';
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#0a0a0f;color:#f8fafc;">
        <h2 style="color:#eab308;margin:0 0 8px 0;">Session is scheduled</h2>
        <p style="margin:0 0 12px 0;">Trainer <strong>${trainerName}</strong> has assigned you a new session.</p>
        <div style="background:#111118;border:1px solid #27273a;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 6px 0;">📅 <strong>${dateStr}</strong></p>
          ${programTitle ? `<p style=\"margin:0;color:#cbd5e1;\">Program: <strong>${programTitle}</strong></p>` : ''}
        </div>
        <p style="margin:0;color:#94a3b8;">See you at the workout!</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.from,
      to: clientEmail,
      subject,
      html,
    });
  }

  async sendTrialExpired(to: string, trainerName: string): Promise<void> {
    const subject = 'TrainMeter — Your trial has expired';

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#0a0a0a,#1a1a1a);padding:30px;text-align:center;">
          <h1 style="color:#ef4444;margin:0;">🔒 Trial Expired</h1>
        </div>
        <div style="background:#fff;padding:30px;border:1px solid #e5e5e5;">
          <p style="color:#333;font-size:16px;">Hi <strong>${trainerName}</strong>,</p>
          <p style="color:#666;">
            Your free trial for <strong>TrainMeter</strong> has expired.
          </p>
          <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:20px;margin:25px 0;">
            <p style="color:#333;margin:0;">
              To keep using the platform, log in and select a subscription plan.
            </p>
          </div>
          <p style="color:#666;font-size:14px;">Your data and clients are safe and waiting.</p>
        </div>
        <div style="background:#f5f5f5;padding:20px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">© ${new Date().getFullYear()} TrainMeter</p>
        </div>
      </div>
    `;

    await this.transporter.sendMail({ from: this.from, to, subject, html });
  }
}
