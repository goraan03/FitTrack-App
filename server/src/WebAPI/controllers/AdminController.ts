import { Request, Response, Router } from 'express';
import { IAdminService } from '../../Domain/services/admin/IAdminService';
import { validateCreateTrainer, validateUpdateUser } from '../validators/admin/AdminValidators';

export class AdminController {
  private router: Router;
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.router = Router();
    this.adminService = adminService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/admin/users', this.listUsers.bind(this));
    this.router.post('/admin/trainers', this.createTrainer.bind(this));
    this.router.patch('/admin/users/:id/block', this.blockToggle.bind(this));
    this.router.patch('/admin/users/:id', this.updateUser.bind(this));
    this.router.get('/admin/audit', this.getAudit.bind(this));
  }

  private async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const { uloga, blokiran } = req.query;
      const filters: any = {};
      if (uloga && typeof uloga === 'string') filters.uloga = uloga;
      if (typeof blokiran === 'string') filters.blokiran = blokiran === '1' || blokiran === 'true';
      const data = await this.adminService.listUsers(filters);
      res.status(200).json({ success: true, message: 'OK', data });
    } catch (e) {
      console.error('[AdminController.listUsers] error:', e);
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
      console.error('[AdminController.createTrainer] error:', e);
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
    } catch (e) {
      console.error('[AdminController.blockToggle] error:', e);
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
    } catch (e) {
      console.error('[AdminController.updateUser] error:', e);
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
    } catch (e) {
      console.error('[AdminController.getAudit] error:', e);
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}