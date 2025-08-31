import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { UserRepository } from './Database/repositories/users/UserRepository';
import { AuthChallengeRepository } from './Database/repositories/auth/AuthChallengeRepository';
import { EmailService } from './Services/email/EmailService';
import { AuthService } from './Services/auth/AuthService';
import { AuthController } from './WebAPI/controllers/AuthController';

import { AuditService } from './Services/audit/AuditService';
import { AdminService } from './Services/admin/AdminService';
import { AdminController } from './WebAPI/controllers/AdminController';

import { authenticate } from './Middlewares/authentification/AuthMiddleware';
import { authorize } from './Middlewares/authorization/AuthorizeMiddleware';

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// DI
const userRepo = new UserRepository();
const challengeRepo = new AuthChallengeRepository();
const emailService = new EmailService();
const auditService = new AuditService();

const authService = new AuthService(userRepo, challengeRepo, emailService, auditService);
const adminService = new AdminService(userRepo, auditService);

// Controllers
const authController = new AuthController(authService);
const adminController = new AdminController(adminService);

// Routes
app.use('/api', authController.getRouter());
app.use('/api', authenticate, authorize('admin'), adminController.getRouter());

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API sluša na portu ${port}`);
});