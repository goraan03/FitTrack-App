import { Request, Response, Router } from 'express';
import { EmailService } from '../../Services/email/EmailService';

export class PublicContactController {
  private router: Router;
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.router = Router();
    this.emailService = emailService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/public/contact', this.sendContact.bind(this));
  }

  private async sendContact(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, message } = req.body as {
        name?: string;
        email?: string;
        message?: string;
      };

      if (!name || !email || !message) {
        res.status(400).json({ success: false, message: 'Sva polja su obavezna.' });
        return;
      }

      const to = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
      if (!to) {
        res.status(500).json({ success: false, message: 'Kontakt email nije podešen na serveru.' });
        return;
      }

      const subject = '[FitTrack kontakt] Nova poruka sa sajta';
      const text =
        `Nova poruka sa kontakt forme:\n\n` +
        `Ime: ${name}\n` +
        `Email: ${email}\n\n` +
        `Poruka:\n${message}`;

      await (this.emailService as any).transporter.sendMail({
        from: (this.emailService as any).from,
        to,
        subject,
        text,
      });

      res.status(200).json({ success: true, message: 'Poruka je uspešno poslata.' });
    } catch (e) {
      console.error('[PublicContactController] Greška pri slanju poruke:', e);
      res.status(500).json({ success: false, message: 'Greška pri slanju poruke.' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}