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

// Repozitorijumi i servisi
const userRepo = new UserRepository();
const challengeRepo = new AuthChallengeRepository();
const emailService = new EmailService();
const authService = new AuthService(userRepo, challengeRepo, emailService);

// Kontroler
const authController = new AuthController(authService);
app.use('/api', authController.getRouter());

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`API sluša na portu ${port}`);
});