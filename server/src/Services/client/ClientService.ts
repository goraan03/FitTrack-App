import {
  IClientService,
  WeeklyEvent,
  HistoryData,
  ClientProfile,
  UpcomingSession,
  RatingsPoint,
} from "../../Domain/services/client/IClientService";
import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { ITrainingEnrollmentsRepository } from "../../Domain/repositories/training_enrollments/ITrainingEnrollmentsRepository";
import { ITrainingTermsRepository } from "../../Domain/repositories/training_terms/ITrainingTermsRepository";
import { TrainingType } from "../../Domain/types/training_enrollments/TrainingType";
import { calcAge } from "../../helpers/ClientService/calcAge";
import { toHHMM } from "../../helpers/ClientService/toHHMM";
import { IEmailService } from "../../Domain/services/email/IEmailService";
import db from "../../Database/connection/DbConnectionPool";
import { RowDataPacket } from "mysql2";
import fs from 'fs';
import path from 'path';
import { htmlToPdfBuffer } from '../billing/BillingService';

export class ClientService implements IClientService {
  constructor(
    private audit: IAuditService,
    private userRepo: IUserRepository,
    private trainingEnrollmentsRepo: ITrainingEnrollmentsRepository,
    private trainingTermsRepo: ITrainingTermsRepository,
    private emailService: IEmailService,
  ) { }

  async chooseTrainer(userId: number, trainerId: number): Promise<void> {
    const trainer = await this.userRepo.getById(trainerId);
    if (!trainer || trainer.uloga !== "trener") {
      throw new Error("Trainer not found");
    }

    const user = await this.userRepo.getById(userId);
    if (!user) throw new Error("User not found");

    await this.userRepo.updateAssignedTrainer(userId, trainerId);

    try {
      await this.audit.log("Informacija", "CLIENT_CHOOSE_TRAINER", userId, null, { trainerId });
    } catch { }
  }

  async listTrainers(): Promise<{ id: number; name: string; email: string }[]> {
    return this.userRepo.listTrainers();
  }

  async getWeeklySchedule(userId: number, weekStartISO: string): Promise<{ events: WeeklyEvent[] }> {
    const weekStart = new Date(weekStartISO);
    if (Number.isNaN(weekStart.getTime())) throw new Error("Bad date");

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const rows = await this.trainingEnrollmentsRepo.getWeeklySchedule(userId, weekStart, weekEnd);

    const now = Date.now();

    const events: WeeklyEvent[] = rows
      .map(r => {
        const s = new Date(r.startAt);
        const e = new Date(s.getTime() + r.dur * 60000);
        const graceEnd = e.getTime() + 60 * 60 * 1000; // 1h posle završetka
        const day = (s.getDay() + 7) % 7;
        const cancellable = (s.getTime() - now) >= (60 * 60 * 1000);
        const completed = !!r.completed;

        return {
          termId: r.termId,
          title: r.programTitle,
          day,
          start: toHHMM(s),
          end: toHHMM(e),
          startAt: s.toISOString(),
          durationMin: r.dur,
          type: r.type as TrainingType,
          programTitle: r.programTitle,
          trainerName: r.trainerName,
          cancellable,
          completed,
          graceEnd,
        } as any;
      })
      // filtriraj: ostavi samo događaje koji su još u toku ili u grace periodu (1h posle kraja)
      .filter(ev => now <= ev.graceEnd)
      // ukloni pomoćno polje
      .map(({ graceEnd, ...rest }) => rest);

    return { events };
  }

  async bookTerm(userId: number, termId: number): Promise<void> {
    const term = await this.trainingTermsRepo.getById(termId);
    if (!term) throw new Error('TERM_NOT_FOUND');

    const client = await this.userRepo.getById(userId);
    if (!client) throw new Error('User not found');

    const assignedTrainerId = await this.userRepo.getAssignedTrainerId(userId);
    if (!assignedTrainerId) throw new Error('NO_TRAINER_SELECTED');
    if (assignedTrainerId !== term.trainerId) throw new Error('DIFFERENT_TRAINER');

    const start = new Date(term.startAt);
    if ((start.getTime() - Date.now()) < 60 * 60000) throw new Error('TOO_LATE');
    if (term.canceled) throw new Error('CANCELED');

    const existing = await this.trainingEnrollmentsRepo.findByUserAndTerm(userId, termId);
    if (existing) {
      if (existing.status === 'enrolled') throw new Error('ALREADY_ENROLLED');
      if (term.enrolledCount >= term.capacity) {
        try { await this.audit.log('Upozorenje', 'BOOK_CONFLICT_FULL', userId, null, { termId }); } catch { }
        throw new Error('FULL');
      }
      await this.trainingEnrollmentsRepo.reactivateEnrollment(existing.id);
      await this.trainingTermsRepo.incrementEnrolledCount(termId);
      try { await this.audit.log('Informacija', 'BOOK_SUCCESS', userId, null, { termId, reactivated: true }); } catch { }
    } else {
      if (term.enrolledCount >= term.capacity) {
        try { await this.audit.log('Upozorenje', 'BOOK_CONFLICT_FULL', userId, null, { termId }); } catch { }
        throw new Error('FULL');
      }

      await this.trainingEnrollmentsRepo.createEnrollment(termId, userId);
      await this.trainingTermsRepo.incrementEnrolledCount(termId);
      try { await this.audit.log('Informacija', 'BOOK_SUCCESS', userId, null, { termId, reactivated: false }); } catch { }
    }

    try {
      const meta = await this.trainingTermsRepo.getWithProgramAndTrainer(termId);
      const trainerUser = meta ? await this.userRepo.getById(meta.trainerId) : null;
      const trainerEmail = meta?.trainerEmail || trainerUser?.korisnickoIme;
      if (trainerEmail && meta) {
        const clientName = `${client.ime} ${client.prezime}`.trim() || client.korisnickoIme;
        const programTitle = meta.programTitle ?? 'Zakazani termin';
        await this.emailService.sendTermBookedToTrainer(
          trainerEmail,
          programTitle,
          meta.startAt,
          clientName
        );
      } else {
        console.warn('Booking email skipped: trainer email missing', { termId, trainerId: term.trainerId });
      }
    } catch (e) {
      console.error('Failed to send booking email:', e);
    }
  }

  async cancelTerm(userId: number, termId: number): Promise<void> {
    const enr = await this.trainingEnrollmentsRepo.getActiveEnrollmentWithTerm(userId, termId);
    if (!enr) throw new Error('NOT_ENROLLED');

    const start = new Date(enr.termStartAt);
    if ((start.getTime() - Date.now()) < 60 * 60000) throw new Error('TOO_LATE');

    await this.trainingEnrollmentsRepo.cancelEnrollment(enr.enrollmentId);
    await this.trainingTermsRepo.decrementEnrolledCount(termId);
    await this.trainingTermsRepo.setProgram(termId, null);
    try { await this.audit.log('Informacija', 'CANCEL_SUCCESS', userId, null, { termId }); } catch { }
    try {
      const [meta, client] = await Promise.all([
        this.trainingTermsRepo.getWithProgramAndTrainer(termId),
        this.userRepo.getById(userId),
      ]);
      const trainerUser = meta ? await this.userRepo.getById(meta.trainerId) : null;
      const trainerEmail = meta?.trainerEmail || trainerUser?.korisnickoIme;
      if (trainerEmail && client && meta) {
        const clientName = `${client.ime} ${client.prezime}`.trim() || client.korisnickoIme;
        const programTitle = meta.programTitle ?? 'Zakazani termin';
        await this.emailService.sendTermCanceledByClient(
          trainerEmail,
          programTitle,
          meta.startAt,
          clientName
        );
      } else {
        console.warn('Cancel email skipped: trainer email missing', { termId, trainerId: meta?.trainerId });
      }
    } catch (e) {
      console.error('Failed to send cancelation email:', e);
    }
  }

  async getHistory(userId: number): Promise<any> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT 
        ws.id as sessionId,
        ws.start_time as date,
        tt.program_id as programId,
        p.title as programTitle,
        CONCAT(u.ime, ' ', u.prezime) as trainerName,
        e.name as exerciseName,
        wel.exercise_id,
        wel.set_number,
        wel.actual_reps,
        wel.actual_weight
      FROM workout_sessions ws
      LEFT JOIN training_terms tt ON ws.term_id = tt.id
      LEFT JOIN programs p ON tt.program_id = p.id
      LEFT JOIN users u ON tt.trainer_id = u.id
      LEFT JOIN workout_exercise_logs wel ON ws.id = wel.session_id
      LEFT JOIN exercises e ON wel.exercise_id = e.id
      WHERE ws.client_id = ?
      ORDER BY ws.start_time DESC, wel.exercise_id, wel.set_number`,
      [userId]
    );

    const sessionMap = new Map<number, any>();

    for (const row of rows as any[]) {
      if (!sessionMap.has(row.sessionId)) {
        sessionMap.set(row.sessionId, {
          id: row.sessionId,
          date: row.date,
          programId: row.programId,
          programTitle: row.programTitle || 'Individual Workout',
          trainerName: row.trainerName,
          exercises: []
        });
      }

      const session = sessionMap.get(row.sessionId)!;
      if (row.exercise_id) {
        let ex = session.exercises.find((e: any) => e.exerciseId === row.exercise_id);

        if (!ex) {
          ex = {
            exerciseId: row.exercise_id,
            name: row.exerciseName,
            sets: []
          };
          session.exercises.push(ex);
        }

        if (row.set_number) {
          ex.sets.push({
            setNumber: row.set_number,
            reps: row.actual_reps,
            weight: row.actual_weight
          });
        }
      }
    }

    const items = Array.from(sessionMap.values());
    const stats = await this.trainingEnrollmentsRepo.getRatingsStats(userId);

    return { items, stats };
  }

  async getMyProfile(userId: number): Promise<ClientProfile> {
    const user = await this.userRepo.getById(userId);
    if (!user || !user.id) throw new Error('User not found');

    const sessionsCompleted = await this.trainingEnrollmentsRepo.getCompletedCount(userId);
    const ratingsStats = await this.trainingEnrollmentsRepo.getRatingsStats(userId);
    const totalPrograms = await this.trainingEnrollmentsRepo.getTotalPrograms(userId);
    const totalMinutes = await this.trainingEnrollmentsRepo.getTotalCompletedMinutes(userId);
    const upcomingRows = await this.trainingEnrollmentsRepo.listUpcomingSessions(userId, 10);
    const ratingsTrendRows = await this.trainingEnrollmentsRepo.getRatingsTrend(userId);
    const assignedTrainerId = await this.userRepo.getAssignedTrainerId(userId);

    const upcomingSessions: UpcomingSession[] = upcomingRows.map(r => ({
      id: r.id,
      title: r.title,
      programName: r.programName,
      type: r.type,
      startsAt: r.startsAt.toISOString(),
      durationMin: r.durationMin,
      isFull: r.enrolledCount >= r.capacity,
      trainerName: r.trainerName,
      trainerId: user.assigned_trener_id ?? null,
    }));

    const ratingsTrend: RatingsPoint[] = ratingsTrendRows.map(r => ({
      date: r.date.toISOString(),
      avg: r.avg,
    }));

    try { await this.audit.log('Informacija', 'CLIENT_PROFILE_VIEW', userId, null, {}); } catch { }

    return {
      id: user.id!,
      firstName: user.ime || '',
      lastName: user.prezime || '',
      email: user.korisnickoIme,
      gender: (user.pol as any) ?? null,
      age: calcAge(user.datumRodjenja),
      address: null,
      avatarUrl: null,
      isBlocked: !!user.blokiran,
      assignedTrainerId,
      stats: {
        sessionsCompleted,
        avgRating: ratingsStats.avgRating,
        totalPrograms,
        totalHours: totalMinutes / 60,
      },
      upcomingSessions,
      ratingsTrend,
    };
  }

  async updateMyProfile(userId: number, dto: { ime: string; prezime: string; pol: 'musko' | 'zensko'; datumRodjenja: Date | null }): Promise<void> {
    await this.userRepo.updateBasicInfo({
      id: userId,
      ime: dto.ime,
      prezime: dto.prezime,
      datumRodjenja: dto.datumRodjenja,
      pol: dto.pol,
    });
    try { await this.audit.log('Informacija', 'CLIENT_PROFILE_UPDATE', userId, null, {}); } catch { }
  }

  async generateWorkoutPdf(clientId: number, sessionId: number): Promise<{ pdfBuffer: Buffer, filename: string }> {
    const client = await this.userRepo.getById(clientId);
    if (!client) throw new Error('Client not found');

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT 
        ws.id as sessionId,
        ws.start_time,
        ws.end_time,
        ws.trainer_id,
        tt.program_id as programId,
        p.title as programTitle,
        e.name as exerciseName,
        wel.exercise_id,
        wel.set_number,
        wel.actual_reps,
        wel.actual_weight
      FROM workout_sessions ws
      LEFT JOIN training_terms tt ON ws.term_id = tt.id
      LEFT JOIN programs p ON tt.program_id = p.id
      LEFT JOIN workout_exercise_logs wel ON ws.id = wel.session_id
      LEFT JOIN exercises e ON wel.exercise_id = e.id
      WHERE ws.id = ? AND ws.client_id = ?
      ORDER BY wel.exercise_id, wel.set_number`,
      [sessionId, clientId]
    );

    if (!rows || rows.length === 0) throw new Error('Session not found');

    const trainerId = rows[0].trainer_id;
    const trainer = await this.userRepo.getById(trainerId);
    if (!trainer) throw new Error('Trainer not found');

    const startTime = new Date(rows[0].start_time);
    const endTime = new Date(rows[0].end_time);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    const programTitle = rows[0].programTitle || "Individual Workout";

    let totalVolume = 0;
    const exMap = new Map<number, { name: string, sets: any[] }>();

    for (const r of rows as any[]) {
      if (!r.exercise_id) continue;
      totalVolume += (Number(r.actual_reps) || 0) * (Number(r.actual_weight) || 0);

      if (!exMap.has(r.exercise_id)) {
        exMap.set(r.exercise_id, { name: r.exerciseName, sets: [] });
      }
      exMap.get(r.exercise_id)!.sets.push({
        setNumber: r.set_number,
        actualReps: r.actual_reps,
        actualWeight: r.actual_weight
      });
    }

    let exerciseLogsHtml = '';
    for (const [exId, exData] of exMap.entries()) {
      let setsRows = '';
      exData.sets.forEach((s: any) => {
        setsRows += `
          <tr>
            <td>Set ${s.setNumber}</td>
            <td>${s.actualReps}</td>
            <td>${s.actualWeight} kg</td>
          </tr>
        `;
      });

      exerciseLogsHtml += `
        <div class="exercise-item">
          <div class="exercise-header">${exData.name}</div>
          <table class="set-table">
            <thead>
              <tr>
                <th>Set</th>
                <th>Reps</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              ${setsRows}
            </tbody>
          </table>
        </div>
      `;
    }

    const templatePath = path.join(__dirname, '..', '..', 'templates', 'workout_report.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    const replacements: Record<string, string | number> = {
      '{{workoutDate}}': startTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      '{{clientName}}': `${client.ime} ${client.prezime}`,
      '{{trainerName}}': `${trainer.ime} ${trainer.prezime}`,
      '{{duration}}': duration,
      '{{totalVolume}}': totalVolume.toLocaleString(),
      '{{exerciseCount}}': exMap.size,
      '{{exerciseLogs}}': exerciseLogsHtml,
      '{{programTitle}}': programTitle,
      '{{currentYear}}': new Date().getFullYear()
    };

    for (const [key, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(key, 'g'), String(value));
    }

    const pdfBuffer = await htmlToPdfBuffer(html);
    const filename = `WorkoutReport_${startTime.toISOString().split('T')[0]}.pdf`;

    return { pdfBuffer, filename };
  }
}
