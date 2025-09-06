import { Request, Response, Router } from "express";
import { IProgramsService } from "../../Domain/services/programs/IProgramsService";

export class ProgramsController {
  private router: Router;
  constructor(private programs: IProgramsService) {
    this.router = Router();
    this.init();
  }

  private init() {
    this.router.get('/programs/public', this.listPublic.bind(this));
  }

  private async listPublic(req: Request, res: Response) {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const level = (req.query.level as any) || undefined;

      const trainerIdRaw = req.query.trainerId;
      const trainerId =
        typeof trainerIdRaw === 'string' && /^\d+$/.test(trainerIdRaw)
          ? Number(trainerIdRaw)
          : undefined;

      const data = await this.programs.listPublic({ q, level, trainerId });
      res.json({ success: true, message: 'OK', data });
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  public getRouter(): Router { return this.router; }
}