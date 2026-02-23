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

export class ClientService implements IClientService {
  constructor(
    private audit: IAuditService,
    private userRepo: IUserRepository,
    private trainingEnrollmentsRepo: ITrainingEnrollmentsRepository,
    private trainingTermsRepo: ITrainingTermsRepository,
    private emailService: IEmailService,
  ) {}

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
    } catch {}
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
        try { await this.audit.log('Upozorenje', 'BOOK_CONFLICT_FULL', userId, null, { termId }); } catch {}
        throw new Error('FULL');
      }
      await this.trainingEnrollmentsRepo.reactivateEnrollment(existing.id);
      await this.trainingTermsRepo.incrementEnrolledCount(termId);
      try { await this.audit.log('Informacija', 'BOOK_SUCCESS', userId, null, { termId, reactivated: true }); } catch {}
    } else {
      if (term.enrolledCount >= term.capacity) {
        try { await this.audit.log('Upozorenje', 'BOOK_CONFLICT_FULL', userId, null, { termId }); } catch {}
        throw new Error('FULL');
      }

      await this.trainingEnrollmentsRepo.createEnrollment(termId, userId);
      await this.trainingTermsRepo.incrementEnrolledCount(termId);
      try { await this.audit.log('Informacija', 'BOOK_SUCCESS', userId, null, { termId, reactivated: false }); } catch {}
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
    try { await this.audit.log('Informacija', 'CANCEL_SUCCESS', userId, null, { termId }); } catch {}
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

  async getHistory(userId: number): Promise<HistoryData> {
    const rows = await this.trainingEnrollmentsRepo.listHistory(userId);
    const items = rows.map(r => ({
      id: r.id,
      date: r.startAt.toISOString(),
      programTitle: r.programTitle,
      trainerName: r.trainerName,
      status: r.status,
      rating: r.rating,
      feedback: r.feedback
    }));

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

    try { await this.audit.log('Informacija', 'CLIENT_PROFILE_VIEW', userId, null, {}); } catch {}

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
    try { await this.audit.log('Informacija', 'CLIENT_PROFILE_UPDATE', userId, null, {}); } catch {}
  }
}
