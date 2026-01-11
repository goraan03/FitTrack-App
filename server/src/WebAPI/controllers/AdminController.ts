import { Request, Response, Router } from 'express';
import { IAdminService } from '../../Domain/services/admin/IAdminService';
import { validateCreateTrainer, validateUpdateUser } from '../validators/admin/AdminValidators';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';

export class AdminController {
  private router: Router;
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.router = Router();
    this.adminService = adminService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/admin', authenticate, authorize('admin'));

    this.router.get('/admin/users', this.listUsers.bind(this));
    this.router.post('/admin/trainers', this.createTrainer.bind(this));
    this.router.patch('/admin/users/:id/block', this.blockToggle.bind(this));
    this.router.patch('/admin/users/:id', this.updateUser.bind(this));
    this.router.get('/admin/audit', this.getAudit.bind(this));
    this.router.get('/admin/invoices', this.listInvoices.bind(this));
    this.router.patch('/admin/invoices/:id/status', this.setInvoiceStatus.bind(this));
    this.router.get('/admin/invoices/:id/pdf', this.downloadInvoice.bind(this));
  }

  private async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const { uloga, blokiran } = req.query;
      const filters: any = {};
      if (uloga && typeof uloga === 'string') filters.uloga = uloga;
      if (typeof blokiran === 'string') filters.blokiran = blokiran === '1' || blokiran === 'true';
      const data = await this.adminService.listUsers(filters);
      res.status(200).json({ success: true, message: 'OK', data });
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  private async createTrainer(req: Request, res: Response): Promise<void> {
    try {
      const v = validateCreateTrainer(req.body);
      if (!v.ok) { res.status(400).json({ success: false, message: v.message }); return; }
      const me = req.user!;
      const result = await this.adminService.createTrainer(req.body, me.id, me.korisnickoIme);
      res.status(201).json({ success: true, message: 'Trener kreiran', data: result });
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('već postoji')) return void res.status(409).json({ success: false, message: msg });
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  private async blockToggle(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) { res.status(400).json({ success: false, message: 'Neispravan ID' }); return; }
      const { blokiran } = req.body as { blokiran: boolean };
      const me = req.user!;
      await this.adminService.setBlocked(id, !!blokiran, me.id, me.korisnickoIme);
      res.status(200).json({ success: true, message: blokiran ? 'Korisnik blokiran' : 'Korisnik odblokiran' });
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  private async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) { res.status(400).json({ success: false, message: 'Neispravan ID' }); return; }
      const v = validateUpdateUser(req.body);
      if (!v.ok) { res.status(400).json({ success: false, message: v.message }); return; }
      const me = req.user!;
      await this.adminService.updateUserBasicInfo(id, req.body, me.id, me.korisnickoIme);
      res.status(200).json({ success: true, message: 'Podaci ažurirani' });
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  private async getAudit(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, Number(req.query.page || 1));
      const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize || 20)));
      const category = (req.query.category as any) || undefined;
      const search = (req.query.search as string) || undefined;
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const data = await this.adminService.getAuditLogs({ page, pageSize, category, search, userId });
      res.status(200).json({ success: true, message: 'OK', data });
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  private async listInvoices(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.query.trainerId ? Number(req.query.trainerId) : undefined;
      const status = req.query.status as "issued" | "paid" | "overdue" | undefined;

      const data = await this.adminService.getInvoices({
        trainerId: Number.isFinite(trainerId as number) ? trainerId : undefined,
        status
      });

      res.status(200).json({ success: true, message: 'OK', data });
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  private async setInvoiceStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if(!Number.isFinite(id) || id <= 0) {
        res.status(400).json({ success: false, message: 'Neispravan ID' });;
        return;
      }

      const { status } = req.body as { status: "issued" | "paid" | "overdue" };
      if(!status || !["issued", "paid", "overdue"].includes(status)) {
        res.status(400).json({ success: false, message: 'Neispravan status' });;
        return;
      }

      await this.adminService.setInvoiceStatus(id, status);
      res.status(200).json({ success: true, message: 'Status ažuriran' });
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  private async downloadInvoice(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Neispravan ID" });
        return;
      }

      const invoice = await this.adminService.getInvoiceById(id);
      if (!invoice) {
        res.status(404).json({ success: false, message: "Račun nije pronađen" });
        return;
      }

      res.download(invoice.pdfPath, (err) => {
        if (err) {
          console.error("Download error:", err);
        }
      });
    } catch {
      res.status(500).json({ success: false, message: "Greška na serveru" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}