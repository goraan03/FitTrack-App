// server/src/app.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { UserRepository } from './Database/repositories/users/UserRepository';
import { AuthChallengeRepository } from './Database/repositories/auth/AuthChallengeRepository';
import { EmailService } from './Services/email/EmailService';

import { AuditService } from './Services/audit/AuditService';
import { AuthService } from './Services/auth/AuthService';
import { AdminService } from './Services/admin/AdminService';
import { ClientService } from './Services/client/ClientService';

import { AuthController } from './WebAPI/controllers/AuthController';
import { AdminController } from './WebAPI/controllers/AdminController';
import { ClientController } from './WebAPI/controllers/ClientController';

import { ProgramsService } from './Services/programs/ProgramsService';
import { ProgramsController } from './WebAPI/controllers/ProgramsController';

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
const clientService = new ClientService(auditService);
const programsService = new ProgramsService();

// Controllers
const authController = new AuthController(authService, auditService);
const adminController = new AdminController(adminService);
const clientController = new ClientController(clientService);
const programsController = new ProgramsController(programsService);

// Mount
// /api/auth/* (public)
app.use('/api', authController.getRouter());
// /api/admin/* (zaštita se primenjuje unutar AdminController-a)
app.use('/api', adminController.getRouter());
// /api/client/* (zaštita se primenjuje unutar ClientController-a)
app.use('/api', clientController.getRouter());
app.use('/api', programsController.getRouter());

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API sluša na portu ${port}`));

export default app;