import cron from 'node-cron';
import db from '../../Database/connection/DbConnectionPool';
import { RowDataPacket } from 'mysql2';
import { EmailService } from '../email/EmailService';

interface TrainerTrialRow extends RowDataPacket {
  id: number;
  korisnickoIme: string;
  ime: string;
  prezime: string;
  trial_ends_at: string;
}

export class BillingJob {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  start(): void {
    // Svaki dan u 08:00
    cron.schedule('0 8 * * *', async () => {
      console.log('[BillingJob] Running trial reminders...');
      await this.runTrialReminders();
      await this.applyPendingDowngrades();
    });
    console.log('[BillingJob] Scheduled (daily 08:00)');
  }

  async runTrialReminders(): Promise<void> {
    try {
      const now = new Date();
      console.log('[BillingJob] now:', now.toISOString());

      // Treneri čiji trial ističe za 7 dana (±12h)
      const [rows7] = await db.execute<TrainerTrialRow[]>(
        `SELECT id, korisnickoIme, ime, prezime, trial_ends_at
        FROM users
        WHERE uloga = 'trener'
            AND billing_status = 'trial'
            AND trial_ends_at BETWEEN DATE_ADD(NOW(), INTERVAL 156 HOUR)
                                AND DATE_ADD(NOW(), INTERVAL 180 HOUR)`
        );
      console.log('[BillingJob] rows7:', rows7.length, rows7.map(r => r.korisnickoIme));

      for (const trainer of rows7) {
        try {
          await this.emailService.sendTrialReminder(
            trainer.korisnickoIme,
            `${trainer.ime} ${trainer.prezime}`.trim(),
            new Date(trainer.trial_ends_at),
            7
          );
          console.log(`[BillingJob] 7-day reminder sent to ${trainer.korisnickoIme}`);
        } catch (e) {
          console.error(`[BillingJob] Failed 7-day reminder for ${trainer.korisnickoIme}:`, e);
        }
      }

      // Treneri čiji trial ističe za 1 dan (±12h)
      const [rows1] = await db.execute<TrainerTrialRow[]>(
        `SELECT id, korisnickoIme, ime, prezime, trial_ends_at
        FROM users
        WHERE uloga = 'trener'
            AND billing_status = 'trial'
            AND trial_ends_at BETWEEN DATE_ADD(NOW(), INTERVAL 12 HOUR)
                                AND DATE_ADD(NOW(), INTERVAL 36 HOUR)`
      );

      for (const trainer of rows1) {
        try {
          await this.emailService.sendTrialReminder(
            trainer.korisnickoIme,
            `${trainer.ime} ${trainer.prezime}`.trim(),
            new Date(trainer.trial_ends_at),
            1
          );
          console.log(`[BillingJob] 1-day reminder sent to ${trainer.korisnickoIme}`);
        } catch (e) {
          console.error(`[BillingJob] Failed 1-day reminder for ${trainer.korisnickoIme}:`, e);
        }
      }

      // Treneri kojima je trial istekao a još uvek su u 'trial' statusu
      const [expired] = await db.execute<TrainerTrialRow[]>(
        `SELECT id, korisnickoIme, ime, prezime, trial_ends_at
         FROM users
         WHERE uloga = 'trener'
           AND billing_status = 'trial'
           AND trial_ends_at < NOW()`
      );

      for (const trainer of expired) {
        try {
          await db.execute(
            `UPDATE users SET billing_status = 'none' WHERE id = ?`,
            [trainer.id]
          );
          await this.emailService.sendTrialExpired(
            trainer.korisnickoIme,
            `${trainer.ime} ${trainer.prezime}`.trim()
          );
          console.log(`[BillingJob] Trial expired processed for ${trainer.korisnickoIme}`);
        } catch (e) {
          console.error(`[BillingJob] Failed trial expiry for ${trainer.korisnickoIme}:`, e);
        }
      }

    } catch (e) {
      console.error('[BillingJob] runTrialReminders error:', e);
    }
  }

  async applyPendingDowngrades(): Promise<void> {
    try {
      // Primijeni pending downgrade svim trenerima gdje je billing_anchor_date danas
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT id FROM users
         WHERE uloga = 'trener'
           AND pending_plan_id IS NOT NULL
           AND DAY(billing_anchor_date) = DAY(NOW())`
      );

      for (const row of rows as any[]) {
        await db.execute(
          `UPDATE users
           SET current_plan_id = pending_plan_id, pending_plan_id = NULL
           WHERE id = ?`,
          [row.id]
        );
        console.log(`[BillingJob] Applied pending downgrade for trainer ${row.id}`);
      }
    } catch (e) {
      console.error('[BillingJob] applyPendingDowngrades error:', e);
    }
  }
}