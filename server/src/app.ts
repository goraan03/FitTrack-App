import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

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
import { AuditLogRepository } from './Database/repositories/audit/AuditLogRepository';
import { ProgramsRepository } from './Database/repositories/programs/ProgramsRepository';
import { TrainingEnrollmentRepository } from './Database/repositories/training_enrollments/TrainingEnrollmentsRepository';
import { TrainingTermsService } from './Services/training_terms/TrainingTermsService';
import { TrainingTermsRepository } from './Database/repositories/training_terms/TrainingTermsRepository';

import { TrainerQueriesRepository } from './Database/repositories/trainer/TrainerQueriesRepository';
import { TrainerService } from './Services/trainer/TrainerService';
import { TrainerController } from './WebAPI/controllers/TrainerController';

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token'],
}));
app.use(cookieParser());
app.use(express.json());

// Health
app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// DI
const userRepo = new UserRepository();
const challengeRepo = new AuthChallengeRepository();
const auditLogRepo = new AuditLogRepository();
const programsRepo = new ProgramsRepository();
const trainingEnrollmentsRepo = new TrainingEnrollmentRepository();
const trainingTermsRepo = new TrainingTermsRepository();
const emailService = new EmailService();
const auditService = new AuditService(auditLogRepo);
const trainerQueriesRepo = new TrainerQueriesRepository();
const trainerService = new TrainerService(trainerQueriesRepo, trainingTermsRepo, trainingEnrollmentsRepo, auditService);
const trainerController = new TrainerController(trainerService);

const authService = new AuthService(userRepo, challengeRepo, emailService, auditService);
const adminService = new AdminService(userRepo, auditService);
const clientService = new ClientService(auditService, userRepo, trainingEnrollmentsRepo, trainingTermsRepo);
const programsService = new ProgramsService(programsRepo);
const trainingService = new TrainingTermsService(trainingTermsRepo, userRepo);

// Controllers
const authController = new AuthController(authService, auditService);
const adminController = new AdminController(adminService);
const clientController = new ClientController(clientService, trainingService);
const programsController = new ProgramsController(programsService);

// Mount (sve pod /api)
app.use('/api', authController.getRouter());     // /api/auth/*
app.use('/api', adminController.getRouter());    // /api/admin/*
app.use('/api', clientController.getRouter());   // /api/client/*
app.use('/api', programsController.getRouter()); // /api/programs/public
app.use('/api', trainerController.getRouter());   // /api/trainer/*

export default app;