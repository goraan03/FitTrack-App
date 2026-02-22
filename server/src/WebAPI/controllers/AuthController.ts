import { Request, Response, Router } from 'express';
import { IAuthService } from '../../Domain/services/auth/IAuthService';
import { validacijaPodatakaAuth, validateOtp, validateChallengeId } from '../validators/auth/AuthRequestValidator';
import jwt from "jsonwebtoken";
import { BOOT_ID, BOOT_STARTED_AT } from '../../boot/BootInfo';
import { IAuditService } from '../../Domain/services/audit/IAuditService';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';

export class AuthController {
  private router: Router;
  private authService: IAuthService;
  private audit: IAuditService;

  constructor(authService: IAuthService, audit: IAuditService) {
    this.router = Router();
    this.authService = authService;
    this.audit = audit;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/auth/boot', this.getBoot.bind(this));
    this.router.post('/auth/login', this.startLogin.bind(this));
    this.router.post('/auth/verify-2fa', this.verifyTwoFactor.bind(this));
    this.router.post('/auth/resend-2fa', this.resendTwoFactor.bind(this));
    this.router.post('/auth/register', this.registracija.bind(this));
    this.router.post('/auth/forgot-password', this.forgotPassword.bind(this));
    this.router.post('/auth/reset-password', this.resetPassword.bind(this));
    this.router.post('/auth/verify-reset-otp', this.verifyResetOtp.bind(this));
    this.router.post('/auth/change-password/start', authenticate, this.changePasswordStart.bind(this));
    this.router.post('/auth/change-password/verify', authenticate, this.changePasswordVerify.bind(this));
    this.router.post('/auth/change-password/finish', authenticate, this.changePasswordFinish.bind(this));
  }

  private async getBoot(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'OK',
      data: { bootId: BOOT_ID, startedAt: BOOT_STARTED_AT.toISOString() }
    });
  }

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
      } catch (e: any) {
        if (String(e?.message) === 'Account blocked') {
        res.status(403).json({ success: false, message: 'Vaš nalog je blokiran. Kontaktirajte administratora.' });
        return;
      }
        res.status(401).json({ success: false, message: 'Neispravno korisničko ime ili lozinka' });
      }
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

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
        res.status(500).json({ success: false, message: 'Greška na serveru' });
        return;
      }
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

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
        if (msg === 'Not expired') { res.status(400).json({ success: false, message: 'Kod još uvek važi. Sačekajte da istekne.' }); return; }
        if (msg === 'Already used') { res.status(400).json({ success: false, message: 'Prethodni kod je već iskorišćen.' }); return; }
        res.status(500).json({ success: false, message: 'Nije moguće poslati novi kod.' });
        return;
      }
    } catch {
      res.status(500).json({ success: false, message: 'Greška na serveru' });
    }
  }

  private async registracija(req: Request, res: Response): Promise<void> {
    try {
      const { korisnickoIme, lozinka, ime, prezime, datumRodjenja, pol } = req.body;
      const rezultat = validacijaPodatakaAuth(korisnickoIme, lozinka);

      if (!rezultat.uspesno) {
        await this.audit.log('Upozorenje', 'REGISTER_INVALID_INPUT', null, korisnickoIme || null);
        res.status(400).json({ success: false, message: rezultat.poruka });
        return;
      }

      const result = await this.authService.registracija(
        korisnickoIme, "klijent", lozinka, ime, prezime, datumRodjenja, pol
      );

      if (result.id !== 0) {
        await this.audit.log('Informacija', 'REGISTER_SUCCESS', result.id, korisnickoIme);
        const token = jwt.sign(
          { id: result.id, korisnickoIme: result.korisnickoIme, uloga: result.uloga },
          process.env.JWT_SECRET ?? "", { expiresIn: '6h' }
        );
        res.status(201).json({success: true, message: 'Uspešna registracija', data: token});
      } else {
        await this.audit.log('Upozorenje', 'REGISTER_CONFLICT_EXISTING_USER', null, korisnickoIme);
        res.status(409).json({success: false, message: 'Korisničko ime već postoji.'});
      }
    } catch {
      res.status(500).json({success: false, message: 'Greška na serveru'});
    }
  }

  private async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { korisnickoIme } = req.body;
      
      if (!korisnickoIme || !korisnickoIme.trim()) {
        res.status(400).json({ success: false, message: 'Email je obavezan' });
        return;
      }

      try {
        const data = await this.authService.startPasswordReset(korisnickoIme);
        res.status(200).json({ 
          success: true, 
          message: 'Verification code sent to your email', 
          data 
        });
      } catch (e: any) {
        res.status(200).json({ 
          success: true, 
          message: 'If email exists, verification code was sent' 
        });
      }
    } catch {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  private async verifyResetOtp(req: Request, res: Response): Promise<void> {
    try {
      const { challengeId, code } = req.body;

      if (!challengeId || !code) {
        res.status(400).json({ success: false, message: 'Missing fields' });
        return;
      }

      try {
        await this.authService.verifyPasswordResetOtp(challengeId, code);
        res.status(200).json({ 
          success: true, 
          message: 'Code verified',
          data: { challengeId } 
        });
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (msg === 'Expired') { 
          res.status(400).json({ success: false, message: 'Code expired' }); 
          return; 
        }
        if (msg === 'Invalid code') { 
          res.status(401).json({ success: false, message: 'Invalid code' }); 
          return; 
        }
        if (msg === 'Too many attempts') { 
          res.status(429).json({ success: false, message: 'Too many attempts' }); 
          return; 
        }
        res.status(500).json({ success: false, message: 'Verification failed' });
      }
    } catch {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  private async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { challengeId, newPassword } = req.body;

      if (!challengeId || !newPassword) {
        res.status(400).json({ success: false, message: 'Missing fields' });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        return;
      }

      try {
        await this.authService.resetPassword(challengeId, newPassword);
        res.status(200).json({ success: true, message: 'Password reset successfully' });
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (msg === 'Challenge not found') {
          res.status(404).json({ success: false, message: 'Invalid or expired reset link' });
          return;
        }
        res.status(500).json({ success: false, message: 'Reset failed' });
      }
    } catch {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  private async changePasswordStart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ success: false, message: 'Nedostaje token' }); return; }

      const data = await this.authService.startChangePassword(userId);
      res.status(200).json({ success: true, message: 'Verification code sent to your email', data });
    } catch {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  private async changePasswordVerify(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ success: false, message: 'Nedostaje token' }); return; }

      const { challengeId, code } = req.body;

      const v1 = validateChallengeId(challengeId);
      if (!v1.uspesno) { res.status(400).json({ success: false, message: v1.poruka }); return; }

      const v2 = validateOtp(code);
      if (!v2.uspesno) { res.status(400).json({ success: false, message: v2.poruka }); return; }

      try {
        await this.authService.verifyChangePasswordOtp(userId, challengeId, code);
        res.status(200).json({ success: true, message: 'Code verified', data: { challengeId } });
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (msg === 'Expired') { res.status(400).json({ success: false, message: 'Code expired' }); return; }
        if (msg === 'Already used') { res.status(400).json({ success: false, message: 'Code already used' }); return; }
        if (msg === 'Invalid code') { res.status(401).json({ success: false, message: 'Invalid code' }); return; }
        if (msg === 'Too many attempts') { res.status(429).json({ success: false, message: 'Too many attempts' }); return; }
        if (msg === 'NOT_ALLOWED') { res.status(403).json({ success: false, message: 'Not allowed' }); return; }
        res.status(500).json({ success: false, message: 'Verification failed' });
      }
    } catch {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  private async changePasswordFinish(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ success: false, message: 'Nedostaje token' }); return; }

      const { challengeId, newPassword } = req.body;

      const v1 = validateChallengeId(challengeId);
      if (!v1.uspesno) { res.status(400).json({ success: false, message: v1.poruka }); return; }

      if (!newPassword || String(newPassword).length < 8) {
        res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        return;
      }

      try {
        await this.authService.finishChangePassword(userId, challengeId, newPassword);
        res.status(200).json({ success: true, message: 'Password changed successfully' });
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (msg === 'Expired') { res.status(400).json({ success: false, message: 'Code expired' }); return; }
        if (msg === 'Already used') { res.status(400).json({ success: false, message: 'Code already used' }); return; }
        if (msg === 'NOT_ALLOWED') { res.status(403).json({ success: false, message: 'Not allowed' }); return; }
        if (msg === 'Challenge not found') { res.status(404).json({ success: false, message: 'Invalid or expired challenge' }); return; }
        res.status(500).json({ success: false, message: 'Change password failed' });
      }
    } catch {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}