import { ITrainerService, TrainerDashboard, PendingParticipant, TrainerProfile, ExerciseInput, ExerciseItem, ProgramInput, ProgramLite, ProgramDetails as ProgramDetailsType, ProgramExerciseSet, TrainerTermDetails } from "../../Domain/services/trainer/ITrainerService";
import { ITrainerQueriesRepository } from "../../Domain/repositories/trainer/ITrainerQueriesRepository";
import { ITrainingTermsRepository } from "../../Domain/repositories/training_terms/ITrainingTermsRepository";
import { ITrainingEnrollmentsRepository } from "../../Domain/repositories/training_enrollments/ITrainingEnrollmentsRepository";
import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { toHHMM } from "../../helpers/ClientService/toHHMM";
import { startOfWeek } from "date-fns";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { calcAge } from "../../helpers/ClientService/calcAge";
import { IExercisesRepository } from "../../Domain/repositories/exercises/IExercisesRepository";
import { ITrainerProgramsRepository } from "../../Domain/repositories/trainer_programs/ITrainerProgramsRepository";

function parseISO(d?: string): Date | null {
  return d ? new Date(d) : null;
}

export class TrainerService implements ITrainerService {
  constructor(
    private queries: ITrainerQueriesRepository,
    private termsRepo: ITrainingTermsRepository,
    private enrollRepo: ITrainingEnrollmentsRepository,
    private audit: IAuditService,
    private userRepo: IUserRepository,
    private exercisesRepo: IExercisesRepository,
    private programsRepo: ITrainerProgramsRepository
  ) {}

  async getDashboard(trainerId: number, weekStartISO?: string): Promise<TrainerDashboard> {
    const weekStart = parseISO(weekStartISO) || startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const now = new Date();
    const isCurrentWeek = now >= weekStart && now < weekEnd;

    const statsFrom = isCurrentWeek ? now : weekStart;

    const [weekTerms, weekStats, avgRating, pendingRows] = await Promise.all([
      this.queries.getWeeklyTerms(trainerId, weekStart, weekEnd),
      this.queries.getWeekStats(trainerId, statsFrom, weekEnd),
      this.queries.getAvgRatingAllTime(trainerId),
      this.queries.listPendingRatings(trainerId),
    ]);

    const events = weekTerms.map(t => {
      const s = new Date(t.startAt);
      const e = new Date(s.getTime() + t.dur * 60000);
      const jsDay = s.getDay();
      const day = (jsDay + 6) % 7;
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

  async cancelTerm(trainerId: number, termId: number): Promise<void> {
    const term = await this.termsRepo.getById(termId);
    if (!term || term.trainerId !== trainerId) throw new Error('NOT_ALLOWED');

    const msUntilStart = term.startAt.getTime() - Date.now();
    if (msUntilStart < 60 * 60000) {
      throw new Error('CANNOT_CANCEL_WITHIN_60_MIN');
    }

    await this.termsRepo.cancelTerm(termId);
    try { await this.audit.log('Informacija', 'TRAINER_CANCEL_TERM', trainerId, null, { termId }); } catch {}
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

  // Exercises
  async listExercises(trainerId: number): Promise<ExerciseItem[]> {
    const rows = await this.exercisesRepo.listByTrainer(trainerId);
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      muscleGroup: r.muscleGroup,
      equipment: r.equipment,
      level: r.level,
      videoUrl: r.videoUrl,
      createdAt: r.createdAt,
    }));
  }

  async createExercise(trainerId: number, input: ExerciseInput): Promise<number> {
    const id = await this.exercisesRepo.create(trainerId, {
      name: input.name,
      description: input.description ?? null,
      muscleGroup: input.muscleGroup,
      equipment: input.equipment ?? 'none',
      level: input.level ?? 'beginner',
      videoUrl: input.videoUrl ?? null
    });
    try { await this.audit.log('Informacija', 'TRAINER_CREATE_EXERCISE', trainerId, null, { id, name: input.name }); } catch {}
    return id;
  }

  async updateExercise(trainerId: number, exerciseId: number, input: ExerciseInput): Promise<void> {
    await this.exercisesRepo.update(trainerId, exerciseId, {
      name: input.name,
      description: input.description ?? null,
      muscle_group: undefined as any,
      muscleGroup: input.muscleGroup,
      equipment: input.equipment ?? 'none',
      level: input.level ?? 'beginner',
      videoUrl: input.videoUrl ?? null
    } as any);
    try { await this.audit.log('Informacija', 'TRAINER_UPDATE_EXERCISE', trainerId, null, { id: exerciseId }); } catch {}
  }

  async deleteExercise(trainerId: number, exerciseId: number): Promise<void> {
    await this.exercisesRepo.delete(trainerId, exerciseId);
    try { await this.audit.log('Upozorenje', 'TRAINER_DELETE_EXERCISE', trainerId, null, { id: exerciseId }); } catch {}
  }

  // Programs
  async listPrograms(trainerId: number): Promise<ProgramLite[]> {
    const rows = await this.programsRepo.listByTrainer(trainerId);
    return rows.map(r => ({
      id: r.id, title: r.title, level: r.level, isPublic: r.isPublic
    }));
  }

  async createProgram(trainerId: number, input: ProgramInput): Promise<number> {
    const id = await this.programsRepo.create(trainerId, {
      title: input.title,
      description: input.description ?? null,
      level: input.level,
      isPublic: !!input.isPublic
    });
    try { await this.audit.log('Informacija', 'TRAINER_CREATE_PROGRAM', trainerId, null, { id, title: input.title }); } catch {}
    return id;
  }

  async updateProgram(trainerId: number, programId: number, input: ProgramInput): Promise<void> {
    await this.programsRepo.update(trainerId, programId, {
      title: input.title,
      description: input.description ?? null,
      level: input.level,
      isPublic: !!input.isPublic
    } as any);
    try { await this.audit.log('Informacija', 'TRAINER_UPDATE_PROGRAM', trainerId, null, { id: programId }); } catch {}
  }

  async getProgramDetails(trainerId: number, programId: number): Promise<ProgramDetailsType> {
    const { program, exercises } = await this.programsRepo.getDetails(trainerId, programId);
    return {
      id: program.id,
      title: program.title,
      description: program.description,
      level: program.level,
      exercises: exercises.map(x => ({
        exerciseId: x.exerciseId, position: x.position, sets: x.sets, reps: x.reps, tempo: x.tempo, restSec: x.restSec, notes: x.notes, name: x.name || ''
      }))
    };
  }

  async setProgramExercises(trainerId: number, programId: number, items: ProgramExerciseSet[]): Promise<void> {
    const ids = Array.from(new Set(items.map(x => x.exerciseId)));
    const owned = await this.exercisesRepo.getByIds(trainerId, ids);
    if (owned.length !== ids.length) throw new Error('EXERCISE_OWNERSHIP_MISMATCH');

    await this.programsRepo.replaceProgramExercises(trainerId, programId, items as any);
    try { await this.audit.log('Informacija', 'TRAINER_SET_PROGRAM_EXERCISES', trainerId, null, { programId, count: items.length }); } catch {}
  }

  async assignProgramToClient(trainerId: number, programId: number, clientId: number): Promise<void> {
    const ok = await this.queries.isClientAssignedToTrainer(clientId, trainerId);
    if (!ok) throw new Error('CLIENT_NOT_ASSIGNED');

    const program = await this.programsRepo.getById(programId);
    if (!program || program.trainerId !== trainerId) throw new Error('NOT_ALLOWED');

    await this.programsRepo.assignToClient(programId, clientId);
    try { await this.audit.log('Informacija', 'TRAINER_ASSIGN_PROGRAM', trainerId, null, { programId, clientId }); } catch {}
  }

  // Clients
  async listMyClients(trainerId: number) {
    const rows = await this.queries.listMyClients(trainerId);
    return rows.map(r => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      gender: r.gender,
      age: r.birthDate ? calcAge(r.birthDate) : null,
    }));
  }

  // Terms
  async listTerms(trainerId: number, from?: Date, to?: Date): Promise<TrainerTermDetails[]> {
    const f = from || new Date();
    const t = to || new Date(Date.now() + 30*24*3600*1000);
    const rows = await this.queries.getTermsBetweenDetailed(trainerId, f, t);
    return rows;
  }

  async createTerm(trainerId: number, dto: { programId: number; type: 'individual'|'group'; startAt: Date; durationMin: number; capacity: number }): Promise<number> {
    if (dto.type === 'individual') dto.capacity = 1;
    if (dto.type === 'group' && (dto.capacity < 2 || dto.capacity > 30)) throw new Error('BAD_CAPACITY');

    const program = await this.programsRepo.getById(dto.programId);
    if (!program || program.trainerId !== trainerId) throw new Error('NOT_ALLOWED');

    if (dto.startAt.getTime() < Date.now()) throw new Error('PAST_NOT_ALLOWED');

    const id = await this.termsRepo.create({
      trainerId,
      programId: dto.programId,
      type: dto.type,
      startAt: dto.startAt,
      durationMin: dto.durationMin,
      capacity: dto.capacity
    });
    try { await this.audit.log('Informacija', 'TRAINER_CREATE_TERM', trainerId, null, { id }); } catch {}
    return id;
  }
}