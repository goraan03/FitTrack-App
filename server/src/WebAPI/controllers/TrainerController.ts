import { Request, Response, Router } from "express";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";
import { ITrainerService } from "../../Domain/services/trainer/ITrainerService";
import { IAuditService } from "../../Domain/services/audit/IAuditService";

export class TrainerController {
  private router: Router;

  constructor(private trainer: ITrainerService, private audit: IAuditService) {
    this.router = Router();
    this.init();
  }

  private init() {
    this.router.get("/trainer/dashboard", authenticate, authorize("trener"), this.dashboard.bind(this));
    this.router.get("/trainer/terms/:termId/unrated", authenticate, authorize("trener"), this.unrated.bind(this));
    this.router.post("/trainer/terms/:termId/rate", authenticate, authorize("trener"), this.rate.bind(this));
    this.router.post("/trainer/terms/:termId/cancel", authenticate, authorize("trener"), this.cancel.bind(this));
    this.router.get("/trainer/me/profile", authenticate, authorize("trener"), this.myProfile.bind(this));
    this.router.put("/trainer/me/profile", authenticate, authorize("trener"), this.updateMyProfile.bind(this));

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
    this.router.post("/trainer/clients/create", authenticate, authorize("trener"), this.createClient.bind(this));
    this.router.get("/trainer/clients/:clientId/stats", authenticate, authorize("trener"), this.getClientStats.bind(this));

    this.router.get("/trainer/terms", authenticate, authorize("trener"), this.listTerms.bind(this));
    this.router.post("/trainer/terms", authenticate, authorize("trener"), this.createTerm.bind(this));
    this.router.patch("/trainer/terms/:termId/program", authenticate, authorize("trener"), this.setTermProgram.bind(this));
    this.router.get("/trainer/terms/:termId/participants", authenticate, authorize("trener"), this.getTermParticipants.bind(this));
    this.router.get("/trainer/clients/:clientId/programs", authenticate, authorize("trener"), this.listProgramsForClient.bind(this));

    this.router.post("/trainer/workout/finish", authenticate, authorize("trener"), this.finishWorkout.bind(this));
    this.router.get("/trainer/workouts/:sessionId/pdf", authenticate, authorize("trener"), this.downloadWorkoutPdf.bind(this));

    // Plans & Billing
    this.router.get("/trainer/billing/status", authenticate, authorize("trener"), this.billingStatus.bind(this));
    this.router.get("/trainer/billing/plans", authenticate, authorize("trener"), this.listPlans.bind(this));
    this.router.post("/trainer/billing/select-plan", authenticate, authorize("trener"), this.selectPlan.bind(this));
    this.router.post("/trainer/billing/upgrade-plan", authenticate, authorize("trener"), this.upgradePlan.bind(this));
    this.router.post("/trainer/billing/downgrade-plan", authenticate, authorize("trener"), this.downgradePlan.bind(this));

    // Client Requests
    this.router.get("/trainer/requests", authenticate, authorize("trener"), this.listRequests.bind(this));
    this.router.post("/trainer/requests/:id/approve", authenticate, authorize("trener"), this.approveRequest.bind(this));
    this.router.post("/trainer/requests/:id/reject", authenticate, authorize("trener"), this.rejectRequest.bind(this));

    // Client može poslati zahtjev (uloga klijent)
    this.router.post("/client/requests", authenticate, authorize("klijent"), this.sendRequest.bind(this));
    this.router.get("/client/requests/status", authenticate, authorize("klijent"), this.requestStatus.bind(this));
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
      await this.audit.log('Informacija', 'TRAINER_RATE_CLIENT', user.id, user.korisnickoIme, {
        termId, clientId: userId, rating
      });
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
      await this.audit.log('Upozorenje', 'TRAINER_CANCEL_TERM', user.id, user.korisnickoIme, { termId });
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
      await this.audit.log('Informacija', 'TRAINER_CREATE_EXERCISE', user.id, user.korisnickoIme, {
        exerciseId: id, name: body.name, muscleGroup: body.muscleGroup
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
      await this.audit.log('Upozorenje', 'TRAINER_DELETE_EXERCISE', user.id, user.korisnickoIme, { exerciseId: id });
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
      await this.audit.log('Informacija', 'TRAINER_CREATE_PROGRAM', user.id, user.korisnickoIme, {
        programId: id, title: body.title, level: body.level
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
      await this.audit.log('Informacija', 'TRAINER_ASSIGN_PROGRAM', user.id, user.korisnickoIme, {
        programId: id, clientId
      });
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

  private async createClient(req: Request, res: Response) {
    try {
      const trainerId = req.user!.id;
      const { firstName, lastName, email, password, birthDate, gender } = req.body;

      if (!firstName || !lastName || !email || !password || !gender) {
        return res.status(400).json({ success: false, message: 'Nedostaju obavezna polja' });
      }

      await this.trainer.createClientAccount(trainerId, {
        firstName, lastName, email, password, birthDate, gender
      });

      await this.audit.log('Informacija', 'TRAINER_CREATE_CLIENT', req.user!.id, req.user!.korisnickoIme, {
        clientEmail: email, clientName: `${firstName} ${lastName}`
      });

      res.status(201).json({ success: true, message: 'Client account created successfully' });
    } catch (err: any) {
      if (err.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({ success: false, message: 'Account with this email already exists' });
      }
      res.status(500).json({ success: false, message: err.message || 'Server error' });
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
      const { programId, clientId, type, startAtISO, durationMin, capacity } = req.body || {};
      if (!['individual', 'group'].includes(type) || !startAtISO || !Number.isFinite(durationMin) || !Number.isFinite(capacity)) {
        return res.status(400).json({ success: false, message: 'Bad input' });
      }
      const id = await this.trainer.createTerm(user.id, {
        programId: programId ? Number(programId) : null,
        clientId: clientId ? Number(clientId) : null,
        type,
        startAt: new Date(startAtISO),
        durationMin: Number(durationMin),
        capacity: Number(capacity)
      });
      await this.audit.log('Informacija', 'TRAINER_CREATE_TERM', user.id, user.korisnickoIme, {
        termId: id, type, startAt: startAtISO, capacity
      });
      res.json({ success: true, message: 'Created', data: { id } });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async setTermProgram(req: Request, res: Response) {
    try {
      const user = req.user!;
      const termId = Number(req.params.termId);
      const programId = Number(req.body?.programId);
      if (!Number.isFinite(termId) || !Number.isFinite(programId)) {
        return res.status(400).json({ success: false, message: 'Bad input' });
      }
      await this.trainer.setTermProgram(user.id, termId, programId);
      res.json({ success: true, message: 'Program set' });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async listProgramsForClient(req: Request, res: Response) {
    try {
      const user = req.user!;
      const clientId = Number(req.params.clientId);
      if (!Number.isFinite(clientId)) return res.status(400).json({ success: false, message: 'Bad clientId' });
      const data = await this.trainer.listProgramsForClient(user.id, clientId);
      res.json({ success: true, message: 'OK', data });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async finishWorkout(req: Request, res: Response) {
    try {
      const trainerId = req.user!.id;
      const result = await this.trainer.finishWorkout(trainerId, req.body);
      await this.audit.log('Informacija', 'TRAINER_FINISH_WORKOUT', req.user!.id, req.user!.korisnickoIme, {
        sessionId: result, termId: req.body?.termId, clientId: req.body?.clientId
      });
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

  private async updateMyProfile(req: Request, res: Response) {
    try {
      const user = req.user!;
      const body = req.body || {};

      const ime = String(body.ime ?? body.firstName ?? '').trim();
      const prezime = String(body.prezime ?? body.lastName ?? '').trim();

      const polRaw = body.pol ?? body.gender;
      const pol = polRaw === 'musko' || polRaw === 'zensko' ? polRaw : null;

      const datumRodjenjaISO = body.datumRodjenjaISO ?? body.dateOfBirthISO ?? null;
      const datumRodjenja =
        datumRodjenjaISO && String(datumRodjenjaISO).trim()
          ? new Date(String(datumRodjenjaISO))
          : null;

      if (!ime || ime.length < 2) return res.status(400).json({ success: false, message: 'Ime je obavezno (min 2)' });
      if (!prezime || prezime.length < 2) return res.status(400).json({ success: false, message: 'Prezime je obavezno (min 2)' });
      if (!pol) return res.status(400).json({ success: false, message: 'Pol je obavezan (musko/zensko)' });

      if (datumRodjenja && Number.isNaN(datumRodjenja.getTime())) {
        return res.status(400).json({ success: false, message: 'Neispravan datum rođenja' });
      }

      await this.trainer.updateMyProfile(user.id, { ime, prezime, pol, datumRodjenja });
      await this.audit.log('Informacija', 'TRAINER_UPDATE_PROFILE', user.id, user.korisnickoIme, {
        ime, prezime, pol
      });

      res.json({ success: true, message: "Profil ažuriran" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: (err as Error)?.message || "Server error" });
    }
  }

  private async downloadWorkoutPdf(req: Request, res: Response) {
    try {
      const user = req.user!;
      const sessionId = Number(req.params.sessionId);
      if (!Number.isFinite(sessionId)) return res.status(400).json({ success: false, message: 'Bad sessionId' });

      const { pdfBuffer, filename } = await this.trainer.generateWorkoutPdf(user.id, sessionId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error)?.message || 'Server error' });
    }
  }

  private async getClientStats(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.user!.id;
      const clientId = Number(req.params.clientId);

      if (!Number.isFinite(clientId) || clientId <= 0) {
        res.status(400).json({ success: false, message: 'Invalid client ID' });
        return;
      }

      const data = await this.trainer.getClientProgressStats(trainerId, clientId);
      res.status(200).json({ success: true, data });
    } catch (e: any) {
      console.error('getClientStats error:', e);
      res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
  }

  private async billingStatus(req: Request, res: Response) {
    try {
      const data = await this.trainer.getBillingStatus(req.user!.id);
      res.json({ success: true, message: 'OK', data });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error)?.message || 'Server error' });
    }
  }

  private async listPlans(req: Request, res: Response) {
    try {
      const data = await this.trainer.listPlans();
      res.json({ success: true, message: 'OK', data });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error)?.message || 'Server error' });
    }
  }

  private async selectPlan(req: Request, res: Response) {
    try {
      const planId = Number(req.body?.planId);
      if (!Number.isFinite(planId)) return res.status(400).json({ success: false, message: 'Bad planId' });
      await this.trainer.selectPlan(req.user!.id, planId);
      await this.audit.log('Informacija', 'TRAINER_SELECT_PLAN', req.user!.id, req.user!.korisnickoIme, { planId });
      res.json({ success: true, message: 'Plan aktiviran' });
    } catch (err) {
      const msg = (err as Error)?.message || 'Bad request';
      if (msg.startsWith('PLAN_TOO_SMALL')) return res.status(400).json({ success: false, message: msg });
      if (msg === 'USE_UPGRADE_OR_DOWNGRADE') return res.status(400).json({ success: false, message: msg });
      res.status(400).json({ success: false, message: msg });
    }
  }

  private async upgradePlan(req: Request, res: Response) {
    try {
      const planId = Number(req.body?.planId);
      if (!Number.isFinite(planId)) return res.status(400).json({ success: false, message: 'Bad planId' });
      await this.trainer.upgradePlan(req.user!.id, planId);
      await this.audit.log('Informacija', 'TRAINER_UPGRADE_PLAN', req.user!.id, req.user!.korisnickoIme, { planId });
      res.json({ success: true, message: 'Plan nadograđen' });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async downgradePlan(req: Request, res: Response) {
    try {
      const planId = Number(req.body?.planId);
      if (!Number.isFinite(planId)) return res.status(400).json({ success: false, message: 'Bad planId' });
      await this.trainer.downgradePlan(req.user!.id, planId);
      await this.audit.log('Upozorenje', 'TRAINER_DOWNGRADE_PLAN', req.user!.id, req.user!.korisnickoIme, { planId });
      res.json({ success: true, message: 'Downgrade zakazan za sledeći period' });
    } catch (err) {
      const msg = (err as Error)?.message || 'Bad request';
      if (msg.startsWith('DOWNGRADE_BLOCKED')) return res.status(400).json({ success: false, message: msg });
      res.status(400).json({ success: false, message: msg });
    }
  }

  private async listRequests(req: Request, res: Response) {
    try {
      const data = await this.trainer.listPendingRequests(req.user!.id);
      res.json({ success: true, message: 'OK', data });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error)?.message || 'Server error' });
    }
  }

  private async approveRequest(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: 'Bad id' });
      await this.trainer.approveRequest(req.user!.id, id);
      await this.audit.log('Informacija', 'TRAINER_APPROVE_CLIENT_REQUEST', req.user!.id, req.user!.korisnickoIme, { requestId: id });
      res.json({ success: true, message: 'Zahtjev odobren' });
    } catch (err) {
      const msg = (err as Error)?.message || 'Bad request';
      if (msg.startsWith('PLAN_LIMIT_REACHED')) return res.status(403).json({ success: false, message: msg });
      res.status(400).json({ success: false, message: msg });
    }
  }

  private async rejectRequest(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: 'Bad id' });
      await this.trainer.rejectRequest(req.user!.id, id);
      await this.audit.log('Upozorenje', 'TRAINER_REJECT_CLIENT_REQUEST', req.user!.id, req.user!.korisnickoIme, { requestId: id });
      res.json({ success: true, message: 'Zahtjev odbijen' });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error)?.message || 'Bad request' });
    }
  }

  private async sendRequest(req: Request, res: Response) {
    try {
      const trainerId = Number(req.body?.trainerId);
      if (!Number.isFinite(trainerId)) return res.status(400).json({ success: false, message: 'Bad trainerId' });
      await this.trainer.sendClientRequest(req.user!.id, trainerId);
      await this.audit.log('Informacija', 'CLIENT_SEND_TRAINER_REQUEST', req.user!.id, req.user!.korisnickoIme, { trainerId });
      res.json({ success: true, message: 'Zahtjev poslat' });
    } catch (err) {
      const msg = (err as Error)?.message || 'Bad request';
      if (msg === 'ALREADY_ASSIGNED') return res.status(400).json({ success: false, message: 'Već ste dodijeljeni ovom treneru' });
      if (msg === 'REQUEST_ALREADY_PENDING') return res.status(400).json({ success: false, message: 'Zahtjev je već na čekanju' });
      if (msg === 'TRAINER_NOT_FOUND') return res.status(404).json({ success: false, message: 'Trener nije pronađen' });
      res.status(400).json({ success: false, message: msg });
    }
  }

  private async requestStatus(req: Request, res: Response) {
    try {
      const trainerId = Number(req.query.trainerId);
      if (!Number.isFinite(trainerId)) return res.status(400).json({ success: false, message: 'Bad trainerId' });
      const status = await this.trainer.getRequestStatus(req.user!.id, trainerId);
      res.json({ success: true, message: 'OK', data: { status } });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error)?.message || 'Server error' });
    }
  }

  getRouter() { return this.router; }
}
