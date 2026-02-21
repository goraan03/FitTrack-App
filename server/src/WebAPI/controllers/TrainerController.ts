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
    this.router.post("/trainer/terms/:termId/cancel", authenticate, authorize("trener"), this.cancel.bind(this));
    this.router.get("/trainer/me/profile", authenticate, authorize("trener"), this.myProfile.bind(this));

    this.router.get("/trainer/exercises", authenticate, authorize("trener"), this.listExercises.bind(this));
    this.router.post("/trainer/exercises", authenticate, authorize("trener"), this.createExercise.bind(this));
    this.router.put("/trainer/exercises/:id", authenticate, authorize("trener"), this.updateExercise.bind(this));
    this.router.delete("/trainer/exercises/:id", authenticate, authorize("trener"), this.deleteExercise.bind(this));

    this.router.get("/trainer/programs", authenticate, authorize("trener"), this.listPrograms.bind(this));
    this.router.post("/trainer/programs", authenticate, authorize("trener"), this.createProgram.bind(this));
    this.router.put("/trainer/programs/:id", authenticate, authorize("trener"), this.updateProgram.bind(this));
    this.router.get("/trainer/programs/:id", authenticate, authorize("trener"), this.getProgramDetails.bind(this));
    this.router.post("/trainer/programs/:id/exercises", authenticate, authorize("trener"), this.setProgramExercises.bind(this));
    this.router.post("/trainer/programs/:id/assign", authenticate, authorize("trener"), this.assignProgram.bind(this));

    this.router.get("/trainer/clients", authenticate, authorize("trener"), this.listClients.bind(this));

    this.router.get("/trainer/terms", authenticate, authorize("trener"), this.listTerms.bind(this));
    this.router.post("/trainer/terms", authenticate, authorize("trener"), this.createTerm.bind(this));
    this.router.get("/trainer/terms/:termId/participants", authenticate, authorize("trener"), this.getTermParticipants.bind(this));

    this.router.post("/trainer/workout/finish", authenticate, authorize("trener"), this.finishWorkout.bind(this));
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

  private async cancel(req: Request, res: Response) {
    try {
      const user = req.user!;
      const termId = Number(req.params.termId);
      if (!Number.isFinite(termId)) return res.status(400).json({ success: false, message: 'Bad termId' });
      await this.trainer.cancelTerm(user.id, termId);
      res.json({ success: true, message: 'Canceled' });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  // ---- Exercises ----
  private async listExercises(req: Request, res: Response) {
    try {
      const user = req.user!;
      const data = await this.trainer.listExercises(user.id);
      res.json({ success: true, message: 'OK', data });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error)?.message || 'Server error' });
    }
  }

  private async createExercise(req: Request, res: Response) {
    try {
      const user = req.user!;
      const body = req.body || {};
      if (!body.name || !body.muscleGroup) return res.status(400).json({ success: false, message: 'Bad input' });
      const id = await this.trainer.createExercise(user.id, {
        name: String(body.name),
        description: body.description ?? null,
        muscleGroup: body.muscleGroup,
        equipment: body.equipment ?? 'none',
        level: body.level ?? 'beginner',
        videoUrl: body.videoUrl ?? null
      });
      res.json({ success: true, message: 'Created', data: { id } });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async updateExercise(req: Request, res: Response) {
    try {
      const user = req.user!;
      const id = Number(req.params.id);
      const body = req.body || {};
      if (!Number.isFinite(id) || !body.name || !body.muscleGroup) return res.status(400).json({ success: false, message: 'Bad input' });
      await this.trainer.updateExercise(user.id, id, {
        name: String(body.name),
        description: body.description ?? null,
        muscleGroup: body.muscleGroup,
        equipment: body.equipment ?? 'none',
        level: body.level ?? 'beginner',
        videoUrl: body.videoUrl ?? null
      });
      res.json({ success: true, message: 'Updated' });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async deleteExercise(req: Request, res: Response) {
    try {
      const user = req.user!;
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: 'Bad input' });
      await this.trainer.deleteExercise(user.id, id);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  // ---- Programs ----
  private async listPrograms(req: Request, res: Response) {
    try {
      const user = req.user!;
      const data = await this.trainer.listPrograms(user.id);
      res.json({ success: true, message: 'OK', data });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error)?.message || 'Server error' });
    }
  }

  private async createProgram(req: Request, res: Response) {
    try {
      const user = req.user!;
      const body = req.body || {};
      if (!body.title || !body.level) return res.status(400).json({ success: false, message: 'Bad input' });
      const id = await this.trainer.createProgram(user.id, {
        title: String(body.title),
        description: body.description ?? null,
        level: body.level,
        isPublic: !!body.isPublic,
      });
      res.json({ success: true, message: 'Created', data: { id } });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async updateProgram(req: Request, res: Response) {
    try {
      const user = req.user!;
      const id = Number(req.params.id);
      const body = req.body || {};
      if (!Number.isFinite(id) || !body.title || !body.level) return res.status(400).json({ success: false, message: 'Bad input' });
      await this.trainer.updateProgram(user.id, id, {
        title: String(body.title),
        description: body.description ?? null,
        level: body.level,
        isPublic: !!body.isPublic,
      });
      res.json({ success: true, message: 'Updated' });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async getProgramDetails(req: Request, res: Response) {
    try {
      const user = req.user!;
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: 'Bad program id' });
      const data = await this.trainer.getProgramDetails(user.id, id);
      res.json({ success: true, message: 'OK', data });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async setProgramExercises(req: Request, res: Response) {
    try {
      const user = req.user!;
      const id = Number(req.params.id);
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: 'Bad program id' });
      await this.trainer.setProgramExercises(user.id, id, items);
      res.json({ success: true, message: 'Saved' });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async assignProgram(req: Request, res: Response) {
    try {
      const user = req.user!;
      const id = Number(req.params.id);
      const clientId = Number(req.body?.clientId);
      if (!Number.isFinite(id) || !Number.isFinite(clientId)) return res.status(400).json({ success: false, message: 'Bad input' });
      await this.trainer.assignProgramToClient(user.id, id, clientId);
      res.json({ success: true, message: 'Assigned' });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  // ---- Clients ----
  private async listClients(req: Request, res: Response) {
    try {
      const user = req.user!;
      const data = await this.trainer.listMyClients(user.id);
      res.json({ success: true, message: 'OK', data });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error)?.message || 'Server error' });
    }
  }

  // ---- Terms ----
  private async listTerms(req: Request, res: Response) {
    try {
      const user = req.user!;
      const f = typeof req.query.from === 'string' ? new Date(req.query.from) : undefined;
      const t = typeof req.query.to === 'string' ? new Date(req.query.to) : undefined;
      const data = await this.trainer.listTerms(user.id, f, t);
      res.json({ success: true, message: 'OK', data });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error)?.message || 'Server error' });
    }
  }

  private async createTerm(req: Request, res: Response) {
    try {
      const user = req.user!;
      const { programId, type, startAtISO, durationMin, capacity } = req.body || {};
      if (!Number.isFinite(programId) || !['individual','group'].includes(type) || !startAtISO || !Number.isFinite(durationMin) || !Number.isFinite(capacity)) {
        return res.status(400).json({ success: false, message: 'Bad input' });
      }
      const id = await this.trainer.createTerm(user.id, { programId: Number(programId), type, startAt: new Date(startAtISO), durationMin: Number(durationMin), capacity: Number(capacity) });
      res.json({ success: true, message: 'Created', data: { id } });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async finishWorkout(req: Request, res: Response) {
    try {
        const trainerId = req.user!.id;
        const result = await this.trainer.finishWorkout(trainerId, req.body);
        res.json({ success: true, message: "Trening uspešno sačuvan", sessionId: result });
    } catch (err) {
        res.status(400).json({ success: false, message: (err as Error).message || 'Bad request' });
    }
  }

  private async getTermParticipants(req: Request, res: Response): Promise<void> {
    try {
      const termId = Number(req.params.termId);
      if (!Number.isFinite(termId) || termId <= 0) {
        res.status(400).json({ success: false, message: 'Neispravan ID' });
        return;
      }
      
      const data = await this.trainer.getTermParticipants(termId);
      res.status(200).json({ success: true, data });
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  getRouter() { return this.router; }
}
