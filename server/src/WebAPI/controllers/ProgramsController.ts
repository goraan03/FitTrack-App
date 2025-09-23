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
    this.router.get('/programs/visible', this.listVisibleForClient.bind(this));
    this.router.get('/programs/:id/details', this.getDetailsVisibleForClient.bind(this)); // NEW
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

  private async listVisibleForClient(req: Request, res: Response) {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const level = (req.query.level as any) || undefined;

      const trainerIdRaw = req.query.trainerId;
      const clientIdRaw = req.query.clientId;

      const trainerId =
        typeof trainerIdRaw === 'string' && /^\d+$/.test(trainerIdRaw)
          ? Number(trainerIdRaw)
          : undefined;

      const clientId =
        typeof clientIdRaw === 'string' && /^\d+$/.test(clientIdRaw)
          ? Number(clientIdRaw)
          : undefined;

      if (!trainerId || !clientId) {
        return res.status(400).json({ success: false, message: 'trainerId i clientId su obavezni' });
      }

      const data = await this.programs.listVisibleForClient({ clientId, trainerId, q, level });
      res.json({ success: true, message: 'OK', data });
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  private async getDetailsVisibleForClient(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const trainerId =
        typeof req.query.trainerId === "string" && /^\d+$/.test(req.query.trainerId as string)
          ? Number(req.query.trainerId)
          : undefined;
      const clientId =
        typeof req.query.clientId === "string" && /^\d+$/.test(req.query.clientId as string)
          ? Number(req.query.clientId)
          : undefined;

      if (!Number.isFinite(id) || !trainerId || !clientId) {
        return res.status(400).json({ success: false, message: "Bad input" });
      }

      const data = await this.programs.getVisibleDetails({ programId: id, trainerId, clientId });
      if (!data) return res.status(404).json({ success: false, message: "Program nije vidljiv ili ne postoji" });

      res.json({ success: true, message: "OK", data });
    } catch {
      res.status(500).json({ success: false, message: "Greška na serveru" });
    }
  }

  public getRouter(): Router { return this.router; }
}