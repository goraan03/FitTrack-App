import { Request, Response, Router } from "express";
import { IClientService } from "../../Domain/services/client/IClientService";
import { authenticate } from "../../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Middlewares/authorization/AuthorizeMiddleware";

export class ClientController {
  private router: Router;
  constructor(private client: IClientService) {
    this.router = Router();
    this.init();
  }

  private init() {
    this.router.use('/client', authenticate, authorize('klijent'));

    this.router.get('/client/trainers', this.listTrainers.bind(this));
    this.router.post('/client/choose-trainer', this.chooseTrainer.bind(this));

    this.router.get('/client/schedule', this.weeklySchedule.bind(this));
    this.router.get('/client/available-terms', this.availableTerms.bind(this));
    this.router.post('/client/book', this.book.bind(this));
    this.router.post('/client/cancel', this.cancel.bind(this));

    this.router.get('/client/history', this.history.bind(this));

    this.router.get('/client/me/profile', this.myProfile.bind(this));
  }

  private getUserId(req: Request) { return (req as any).user?.id; }

  private async listTrainers(_req: Request, res: Response) {
    try { const data = await this.client.listTrainers(); res.json({ success:true, message:'OK', data }); }
    catch (e:any) { console.error(e); res.status(500).json({ success:false, message:'Greška na serveru' }); }
  }

  private async chooseTrainer(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const { trainerId } = req.body;
      await this.client.chooseTrainer(userId, Number(trainerId));
      res.json({ success:true, message:'Trener izabran' });
    } catch (e:any) {
      const msg = String(e?.message || '');
      if (msg==='Trainer not found') return res.status(404).json({ success:false, message:'Trener nije pronađen' });
      if (msg==='Already assigned') return res.status(400).json({ success:false, message:'Trener je već izabran' });
      console.error(e);
      res.status(500).json({ success:false, message:'Greška na serveru' });
    }
  }

  private async weeklySchedule(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const weekStart = String(req.query.weekStart || '');
      const data = await this.client.getWeeklySchedule(userId, weekStart);
      res.json({ success:true, message:'OK', data });
    } catch (e:any) {
      console.error(e);
      res.status(400).json({ success:false, message: e?.message || 'Bad request' });
    }
  }

  private async availableTerms(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const data = await this.client.getAvailableTerms(userId, {
        fromISO: req.query.from as any,
        toISO: req.query.to as any,
        type: req.query.type as any,
        programId: req.query.programId ? Number(req.query.programId) : undefined,
        status: req.query.status as any
      });
      res.json({ success:true, message:'OK', data });
    } catch (e:any) {
      const msg = String(e?.message||'');
      if (msg==='NO_TRAINER_SELECTED') return res.status(400).json({ success:false, message:'Izaberite trenera pre pretrage termina.' });
      console.error(e);
      res.status(500).json({ success:false, message:'Greška na serveru' });
    }
  }

  private async book(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const { termId } = req.body;
      await this.client.bookTerm(userId, Number(termId));
      res.json({ success:true, message:'Prijava uspešna' });
    } catch (e:any) {
      const msg = String(e?.message||'');
      if (['TERM_NOT_FOUND','CANCELED'].includes(msg)) return res.status(404).json({ success:false, message:'Termin nije dostupan' });
      if (['FULL','TOO_LATE','ALREADY_ENROLLED','NO_TRAINER_SELECTED','DIFFERENT_TRAINER'].includes(msg))
        return res.status(400).json({ success:false, message: msg==='FULL'?'Termin je popunjen': msg==='TOO_LATE'?'Rok za prijavu je istekao': msg==='ALREADY_ENROLLED'?'Već ste prijavljeni na ovaj termin': msg==='NO_TRAINER_SELECTED'?'Izaberite trenera pre prijave': 'Termin pripada drugom treneru' });
      console.error(e);
      res.status(500).json({ success:false, message:'Greška na serveru' });
    }
  }

  private async cancel(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const { termId } = req.body;
      await this.client.cancelTerm(userId, Number(termId));
      res.json({ success:true, message:'Prijava otkazana' });
    } catch (e:any) {
      const msg = String(e?.message||'');
      if (msg==='NOT_ENROLLED') return res.status(400).json({ success:false, message:'Niste prijavljeni na ovaj termin' });
      if (msg==='TOO_LATE') return res.status(400).json({ success:false, message:'Rok za otkazivanje je istekao' });
      console.error(e);
      res.status(500).json({ success:false, message:'Greška na serveru' });
    }
  }

  private async history(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const data = await this.client.getHistory(userId);
      res.json({ success:true, message:'OK', data });
    } catch (e:any) {
      console.error(e);
      res.status(500).json({ success:false, message:'Greška na serveru' });
    }
  }

  private async myProfile(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const data = await this.client.getMyProfile(userId);
      res.json({ success: true, message: 'OK', data });
    } catch (e:any) {
      console.error(e);
      res.status(500).json({ success: false, message: e?.message || 'Greška na serveru' });
    }
  }

  public getRouter(): Router { return this.router; }
}