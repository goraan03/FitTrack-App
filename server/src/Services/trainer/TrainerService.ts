import { ITrainerService, TrainerDashboard, PendingParticipant, TrainerProfile } from "../../Domain/services/trainer/ITrainerService";
import { ITrainerQueriesRepository } from "../../Domain/repositories/trainer/ITrainerQueriesRepository";
import { ITrainingTermsRepository } from "../../Domain/repositories/training_terms/ITrainingTermsRepository";
import { ITrainingEnrollmentsRepository } from "../../Domain/repositories/training_enrollments/ITrainingEnrollmentsRepository";
import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { toHHMM } from "../../helpers/ClientService/toHHMM";
import { startOfWeek } from "date-fns";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { calcAge } from "../../helpers/ClientService/calcAge";

function parseISO(d?: string): Date | null {
  return d ? new Date(d) : null;
}

export class TrainerService implements ITrainerService {
  constructor(
    private queries: ITrainerQueriesRepository,
    private termsRepo: ITrainingTermsRepository,
    private enrollRepo: ITrainingEnrollmentsRepository,
    private audit: IAuditService,
    private userRepo: IUserRepository
  ) {}

  async getDashboard(trainerId: number, weekStartISO?: string): Promise<TrainerDashboard> {
    const weekStart = parseISO(weekStartISO) || startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const [weekTerms, weekStats, avgRating, pendingRows] = await Promise.all([
      this.queries.getWeeklyTerms(trainerId, weekStart, weekEnd),
      this.queries.getWeekStats(trainerId, weekStart, weekEnd),
      this.queries.getAvgRatingAllTime(trainerId),
      this.queries.listPendingRatings(trainerId),
    ]);

    const events = weekTerms.map(t => {
      const s = new Date(t.startAt);
      const e = new Date(s.getTime() + t.dur * 60000);
      const day = (s.getDay() + 7) % 7;
      const cancellable = (s.getTime() - Date.now()) >= (60 * 60000);
      return {
        id: t.termId,
        title: t.title,
        day,
        start: toHHMM(s),
        end: toHHMM(e),
        type: t.type,
        cancellable,
      };
    });

    const pendingMap = new Map<number, { termId: number; startAt: string; programTitle: string; count: number }>();
    for (const r of pendingRows) {
      const key = r.termId;
      const item = pendingMap.get(key) || { termId: r.termId, startAt: r.startAt.toISOString(), programTitle: r.title, count: 0 };
      item.count += 1;
      pendingMap.set(key, item);
    }

    try { await this.audit.log('Informacija', 'TRAINER_DASHBOARD_VIEW', trainerId, null, { weekStart: weekStart.toISOString() }); } catch {}

    return {
      stats: {
        totalTerms: weekStats.totalTerms,
        scheduledHours: weekStats.totalMinutes / 60,
        avgRating: avgRating,
        enrolledThisWeek: weekStats.enrolledSum,
      },
      events,
      pendingRatings: Array.from(pendingMap.values()),
    };
  }

  async getUnratedParticipants(trainerId: number, termId: number): Promise<{ termId: number; programTitle: string; participants: PendingParticipant[] }> {
    const term = await this.termsRepo.getById(termId);
    if (!term || term.trainerId !== trainerId) throw new Error('NOT_ALLOWED');

    const rows = await this.queries.listUnratedParticipantsForTerm(trainerId, termId);
    const participants = rows.map(r => ({ userId: r.userId, userName: r.userName }));
    const programTitle = rows[0]?.title || '';
    return { termId, programTitle, participants };
  }

  async rateParticipant(trainerId: number, termId: number, userId: number, rating: number): Promise<void> {
    if (rating < 1 || rating > 10) throw new Error('BAD_RATING');

    const term = await this.termsRepo.getById(termId);
    if (!term || term.trainerId !== trainerId) throw new Error('NOT_ALLOWED');

    const end = new Date(term.startAt.getTime() + term.durationMin * 60000);
    if (end.getTime() > Date.now()) throw new Error('TERM_NOT_FINISHED');

    await this.enrollRepo.setRating(termId, userId, rating);
    try { await this.audit.log('Informacija', 'TRAINER_RATE_PARTICIPANT', trainerId, null, { termId, userId, rating }); } catch {}
  }

  // ---- NOVO ----
  async getMyProfile(trainerId: number): Promise<TrainerProfile> {
    const user = await this.userRepo.getById(trainerId);
    if (!user || !user.id) throw new Error('User not found');

    const [sessionsCompleted, avgRating, totalPrograms, totalMinutes, trendRows] = await Promise.all([
      this.queries.getCompletedTermsCount(trainerId),
      this.queries.getAvgRatingAllTime(trainerId),
      this.queries.getProgramsCount(trainerId),
      this.queries.getTotalCompletedMinutes(trainerId),
      this.queries.getRatingsTrend(trainerId),
    ]);

    try { await this.audit.log('Informacija', 'TRAINER_PROFILE_VIEW', trainerId, null, {}); } catch {}

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
      stats: {
        sessionsCompleted,
        avgRating,
        totalPrograms,
        totalHours: totalMinutes / 60,
      },
      ratingsTrend: trendRows.map(r => ({
        date: r.date.toISOString(),
        avg: r.avg != null ? Number(r.avg) : null,
      })),
    };
  }
}