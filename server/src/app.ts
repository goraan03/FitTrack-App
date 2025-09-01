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

app.use(cors({
  origin: true, // reflektuj origin u dev-u
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token'],
}));
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

// Mount (sve pod /api)
app.use('/api', authController.getRouter());     // /api/auth/*
app.use('/api', adminController.getRouter());    // /api/admin/*
app.use('/api', clientController.getRouter());   // /api/client/*
app.use('/api', programsController.getRouter()); // /api/programs/public

export default app;