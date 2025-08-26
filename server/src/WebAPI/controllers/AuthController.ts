import { Request, Response, Router } from 'express';
import { IAuthService } from '../../Domain/services/auth/IAuthService';
import { validacijaPodatakaAuth, validateOtp, validateChallengeId } from '../validators/auth/AuthRequestValidator';
import jwt from "jsonwebtoken";

export class AuthController {
  private router: Router;
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.router = Router();
    this.authService = authService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/auth/login', this.startLogin.bind(this));
    this.router.post('/auth/verify-2fa', this.verifyTwoFactor.bind(this));
    this.router.post('/auth/resend-2fa', this.resendTwoFactor.bind(this));
    this.router.post('/auth/register', this.registracija.bind(this));
  }

  // KORAK 1: username+password -> šalje OTP na email (korisnickoIme)
  private async startLogin(req: Request, res: Response): Promise<void> {
    try {
      const { korisnickoIme, lozinka } = req.body;
      const rezultat = validacijaPodatakaAuth(korisnickoIme, lozinka);
      if (!rezultat.uspesno) {
        res.status(400).json({ success: false, message: rezultat.poruka });
        return;
      }

      try {
        const data = await this.authService.startLogin(korisnickoIme, lozinka);
        res.status(200).json({ success: true, message: '2FA kod poslat na email', data });
      } catch {
        res.status(401).json({ success: false, message: 'Neispravno korisničko ime ili lozinka' });
      }
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  // KORAK 2: unos OTP -> izdavanje tokena
  private async verifyTwoFactor(req: Request, res: Response): Promise<void> {
    try {
      const { challengeId, code } = req.body;

      const v1 = validateChallengeId(challengeId);
      if (!v1.uspesno) { res.status(400).json({ success: false, message: v1.poruka }); return; }

      const v2 = validateOtp(code);
      if (!v2.uspesno) { res.status(400).json({ success: false, message: v2.poruka }); return; }

      try {
        const { token } = await this.authService.verifyTwoFactor(challengeId, code);
        res.status(200).json({ success: true, message: 'Uspešna prijava', data: token });
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (msg === 'Expired') { res.status(400).json({ success: false, message: 'Kod je istekao. Zatražite novi.' }); return; }
        if (msg === 'Already used') { res.status(400).json({ success: false, message: 'Kod je već iskorišćen.' }); return; }
        if (msg === 'Invalid code') { res.status(401).json({ success: false, message: 'Netačan kod.' }); return; }
        if (msg === 'Too many attempts') { res.status(429).json({ success: false, message: 'Previše pokušaja. Započnite prijavu ponovo.' }); return; }
        res.status(400).json({ success: false, message: 'Verifikacija neuspešna.' }); return;
      }
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  // RESEND: dozvoljen tek posle isteka prethodnog koda
  private async resendTwoFactor(req: Request, res: Response): Promise<void> {
    try {
      const { challengeId } = req.body;
      const v1 = validateChallengeId(challengeId);
      if (!v1.uspesno) { res.status(400).json({ success: false, message: v1.poruka }); return; }

      try {
        const data = await this.authService.resendTwoFactor(challengeId);
        res.status(200).json({ success: true, message: 'Novi kod poslat', data });
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (msg === 'Not expired')  { res.status(400).json({ success: false, message: 'Kod još uvek važi. Sačekajte da istekne.' }); return; };
        if (msg === 'Already used')  res.status(400).json({ success: false, message: 'Prethodni kod je već iskorišćen.' }); return;
        res.status(400).json({ success: false, message: 'Nije moguće poslati novi kod.' }); return;
      }
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  // REGISTRACIJA – po tvom originalnom ponašanju vraća token
  private async registracija(req: Request, res: Response): Promise<void> {
    try {
      const { korisnickoIme, lozinka, ime, prezime, datumRodjenja, pol } = req.body;
      const rezultat = validacijaPodatakaAuth(korisnickoIme, lozinka);

      if (!rezultat.uspesno) {
        res.status(400).json({ success: false, message: rezultat.poruka });
        return;
      }

      const result = await this.authService.registracija(
        korisnickoIme, "klijent", lozinka, ime, prezime, datumRodjenja, pol
      );

      if (result.id !== 0) {
        const token = jwt.sign(
          { id: result.id, korisnickoIme: result.korisnickoIme, uloga: result.uloga },
          process.env.JWT_SECRET ?? "", { expiresIn: '6h' }
        );
        res.status(201).json({success: true, message: 'Uspešna registracija', data: token});
      } else {
        res.status(409).json({success: false, message: 'Korisničko ime već postoji.'});
      }
    } catch {
      res.status(500).json({success: false, message: 'Greška na serveru'});
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}