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
import { PublicContactController } from './WebAPI/controllers/PublicContactController';

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
import { ExercisesRepository } from './Database/repositories/exercises/ExercisesRepository';
import { TrainerProgramsRepository } from './Database/repositories/trainer_programs/TrainerProgramsRepository';
import { InvoicesRepository } from './Database/repositories/invoice/InvoicesRepository';
import { WorkoutRepository } from './Database/repositories/workout/WorkoutRepository';
import { BackofficeController } from './WebAPI/controllers/BackofficeController'
import { ClientRequestsRepository } from './Database/repositories/client_requests/ClientRequestsRepository';
import { PlansRepository } from './Database/repositories/plans/PlansRepository';
import { BillingJob } from './Services/billing_job/BillingJob';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token'],
}));

app.use(cookieParser());
app.use(express.json());

// Health
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'fittrack-api'
  });
});

// DI
const exercisesRepo = new ExercisesRepository();
const trainerProgramsRepo = new TrainerProgramsRepository();
const userRepo = new UserRepository();
const challengeRepo = new AuthChallengeRepository();
const auditLogRepo = new AuditLogRepository();
const programsRepo = new ProgramsRepository();
const trainingEnrollmentsRepo = new TrainingEnrollmentRepository();
const trainingTermsRepo = new TrainingTermsRepository();
const invoicesRepo = new InvoicesRepository();
const emailService = new EmailService();
const auditService = new AuditService(auditLogRepo);
const trainerQueriesRepo = new TrainerQueriesRepository();
const workoutRepo = new WorkoutRepository();
const clientRequestsRepo = new ClientRequestsRepository();
const plansRepo = new PlansRepository();
const trainerService = new TrainerService(
  trainerQueriesRepo,
  trainingTermsRepo,
  trainingEnrollmentsRepo,
  auditService,
  userRepo,
  exercisesRepo,
  trainerProgramsRepo,
  workoutRepo,
  emailService,
  plansRepo,
  clientRequestsRepo
);
const trainerController = new TrainerController(trainerService, auditService);
const publicContactController = new PublicContactController(emailService);


const authService = new AuthService(userRepo, challengeRepo, emailService, auditService);
const adminService = new AdminService(userRepo, auditService, invoicesRepo);
const clientService = new ClientService(auditService, userRepo, trainingEnrollmentsRepo, trainingTermsRepo, emailService);
const programsService = new ProgramsService(programsRepo);
const trainingService = new TrainingTermsService(trainingTermsRepo, userRepo);

// Controllers
const authController = new AuthController(authService, auditService);
const adminController = new AdminController(adminService, auditService);
const clientController = new ClientController(clientService, trainingService, auditService);
const programsController = new ProgramsController(programsService);
const backofficeCtrl = new BackofficeController()

// Mount
app.use('/api', authController.getRouter());     // /api/auth/*
app.use('/api', adminController.getRouter());    // /api/admin/*
app.use('/api', clientController.getRouter());   // /api/client/*
app.use('/api', programsController.getRouter()); // /api/programs/public
app.use('/api', trainerController.getRouter());   // /api/trainer/*
app.use('/api', publicContactController.getRouter()); // /api/public/contact
// Backoffice integration routes (secured by API key, ne JWT)
app.get('/api/backoffice/trainers', (req, res) => backofficeCtrl.getTrainers(req, res))
app.post('/api/backoffice/block', (req, res) => backofficeCtrl.setBlock(req, res))
app.get('/api/backoffice/trainer/:id/status', (req, res) => backofficeCtrl.getTrainerStatus(req, res))
app.get('/api/backoffice/metrics', (req, res) => backofficeCtrl.getMetrics(req, res))

// ── Billing Cron ─────────────────────────────────────────────────────────────
const billingJob = new BillingJob(emailService);
billingJob.start();

app.get('/api/dev/billing-job', async (req, res) => {
  await billingJob.runTrialReminders();
  res.json({ ok: true });
});

export default app;
