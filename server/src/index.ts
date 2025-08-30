import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { UserRepository } from './Database/repositories/users/UserRepository';
import { AuthChallengeRepository } from './Database/repositories/auth/AuthChallengeRepository';
import { EmailService } from './Services/email/EmailService';
import { AuthService } from './Services/auth/AuthService';
import { AuthController } from './WebAPI/controllers/AuthController';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// DI
const userRepo = new UserRepository();
const challengeRepo = new AuthChallengeRepository();
const emailService = new EmailService();
emailService.verifyConnection().catch(() => {
  console.error('SMTP konekcija nije verifikovana. Proveri .env podešavanja.');
});
const authService = new AuthService(userRepo, challengeRepo, emailService);

// Kontroler
const authController = new AuthController(authService);

// Mount
app.use('/api', authController.getRouter());

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API sluša na portu ${port}`);
});