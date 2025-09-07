import { Request, Response, Router } from "express";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { ITrainerService } from "../../Domain/services/trainer/ITrainerService";

export class TrainerController {
  private router: Router;

  constructor(private trainer: ITrainerService) {
    this.router = Router();
    this.init();
  }

  private init() {
    this.router.get("/trainer/dashboard", authenticate, authorize("trener"), this.dashboard.bind(this));
    this.router.get("/trainer/terms/:termId/unrated", authenticate, authorize("trener"), this.unrated.bind(this));
    this.router.post("/trainer/terms/:termId/rate", authenticate, authorize("trener"), this.rate.bind(this));
    this.router.get("/trainer/me/profile", authenticate, authorize("trener"), this.myProfile.bind(this));
  }

  private async dashboard(req: Request, res: Response) {
    try {
      const user = req.user!;
      const weekStart = typeof req.query.weekStart === 'string' ? req.query.weekStart : undefined;
      const data = await this.trainer.getDashboard(user.id, weekStart);
      res.json({ success: true, message: 'OK', data });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error)?.message || 'Server error' });
    }
  }

  private async unrated(req: Request, res: Response) {
    try {
      const user = req.user!;
      const termId = Number(req.params.termId);
      if (!Number.isFinite(termId)) return res.status(400).json({ success: false, message: 'Bad termId' });
      const data = await this.trainer.getUnratedParticipants(user.id, termId);
      res.json({ success: true, message: 'OK', data });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async rate(req: Request, res: Response) {
    try {
      const user = req.user!;
      const termId = Number(req.params.termId);
      const { userId, rating } = req.body || {};
      if (!Number.isFinite(termId) || !Number.isFinite(userId) || !Number.isFinite(rating)) {
        return res.status(400).json({ success: false, message: 'Bad input' });
      }
      await this.trainer.rateParticipant(user.id, Number(termId), Number(userId), Number(rating));
      res.json({ success: true, message: 'Rating saved' });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async myProfile(req: Request, res: Response) {
    try {
      const user = req.user!;
      const data = await this.trainer.getMyProfile(user.id);
      res.json({ success: true, message: 'OK', data });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error)?.message || 'Server error' });
    }
  }

  getRouter() { return this.router; }
}