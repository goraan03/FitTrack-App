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
import { parseISO } from "../../helpers/TrainerService/parseISO";
import { WorkoutRepository } from "../../Database/repositories/workout/WorkoutRepository";
import { IEmailService } from "../../Domain/services/email/IEmailService";
import { RowDataPacket } from "mysql2/typings/mysql/lib/protocol/packets/RowDataPacket";
import db from "../../Database/connection/DbConnectionPool";

export class TrainerService implements ITrainerService {
  constructor(
    private queries: ITrainerQueriesRepository,
    private termsRepo: ITrainingTermsRepository,
    private enrollRepo: ITrainingEnrollmentsRepository,
    private audit: IAuditService,
    private userRepo: IUserRepository,
    private exercisesRepo: IExercisesRepository,
    private programsRepo: ITrainerProgramsRepository,
    private workoutRepo: WorkoutRepository,
    private emailService: IEmailService
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

    const filteredTerms = weekTerms.filter(t => t.enrolledCount > 0);

    const events = filteredTerms
      .map(t => {
        const s = new Date(t.startAt);
        const e = new Date(s.getTime() + t.dur * 60000);
        const nowMs = now.getTime();

        // Remove completed terms immediately
        if (t.completed) return null;

        const graceEnd = new Date(e.getTime() + 60 * 60 * 1000);
        if (nowMs > graceEnd.getTime()) return null;

        const jsDay = s.getDay();
        const day = (jsDay + 6) % 7;
        const startMs = s.getTime();
        const endMs = e.getTime();

        const cancellable = (startMs - nowMs) >= (60 * 60000);
        const startable = !t.completed && nowMs >= (startMs - 15 * 60 * 1000) && nowMs < endMs;

        return {
          id: t.termId,
          title: t.title || 'Unassigned slot',
          day,
          start: toHHMM(s),
          end: toHHMM(e),
          type: t.type,
          cancellable,
          programId: t.programId,
          completed: !!t.completed,
          startable,
          enrolledClientId: t.enrolledClientId,
          enrolledClientName: t.enrolledClientName,
        };
      })
      .filter((e): e is Exclude<typeof e, null> => e !== null);

    const totalTerms = filteredTerms.length;
    const totalMinutes = filteredTerms.reduce((sum, t) => sum + t.dur, 0);
    const enrolledSum = filteredTerms.reduce((sum, t) => sum + t.enrolledCount, 0);

    const pendingMap = new Map<number, { termId: number; startAt: string; programTitle: string; count: number }>();
    for (const r of pendingRows) {
      const key = r.termId;
      const item = pendingMap.get(key) || { termId: r.termId, startAt: r.startAt.toISOString(), programTitle: r.title, count: 0 };
      item.count += 1;
      pendingMap.set(key, item);
    }

    try { 
      await this.audit.log('Informacija', 'TRAINER_DASHBOARD_VIEW', trainerId, null, { weekStart: weekStart.toISOString() }); 
    } catch {}

    return {
      stats: {
        totalTerms,
        scheduledHours: totalMinutes / 60,
        avgRating,
        enrolledThisWeek: enrolledSum,
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

    const enrolledUsers = await this.enrollRepo.getEnrolledUsers(termId);

    const msUntilStart = term.startAt.getTime() - Date.now();
    if (msUntilStart < 60 * 60000) {
      throw new Error('CANNOT_CANCEL_WITHIN_60_MIN');
    }
    
    await this.termsRepo.cancelTerm(termId);
    try { await this.audit.log('Informacija', 'TRAINER_CANCEL_TERM', trainerId, null, { termId }); } catch {}

    if (enrolledUsers.length > 0) {
      const programId = term.programId;
      let programTitle = 'Zakazani termin';

      if (programId) {
        const program = await this.programsRepo.getById(programId);
        if (!program) throw new Error('PROGRAM_NOT_FOUND');
        programTitle = program.title;
      }

      const trainer = await this.userRepo.getById(trainerId);
      const trainerName = trainer ? `${trainer.ime} ${trainer.prezime}`.trim() : 'Your trainer';

      for (const user of enrolledUsers) {
        try {
          const client = await this.userRepo.getById(user.user_id);
          const email = client?.korisnickoIme;
          if (!email) continue;

          await this.emailService.sendTermCanceledToClient(
            email,
            programTitle,
            term.startAt,
            trainerName
          );
        } catch (e) {
          console.error('Failed to send email to client for term cancellation', user.user_id, e);
        }
      }
    }
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
      id: r.id,
      title: r.title,
      level: r.level,
      isPublic: r.isPublic,
      assignedClientIds: r.assignedClientIds
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
  const [{ program, exercises }, assigned] = await Promise.all([
    this.programsRepo.getDetails(trainerId, programId),
    this.programsRepo.listAssignedClients(trainerId, programId),
  ]);

  return {
    id: program.id,
    title: program.title,
    description: program.description,
    level: program.level,
    exercises: exercises.map(x => ({
      exerciseId: x.exerciseId,
      position: x.position,
      sets: x.sets,
      reps: x.reps,
      tempo: x.tempo,
      restSec: x.restSec,
      notes: x.notes,
      name: x.name || ''
    })),
    assignedClients: assigned.map(c => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      status: c.status,
      assignedAt: c.assignedAt.toISOString(),
    })),
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

  async createTerm(trainerId: number, dto: { programId?: number | null; type: 'individual'|'group'; startAt: Date; durationMin: number; capacity: number }): Promise<number> {
    if (dto.type === 'individual') dto.capacity = 1;
    if (dto.type === 'group' && (dto.capacity < 2 || dto.capacity > 30)) throw new Error('BAD_CAPACITY');

    if (dto.programId) {
      const program = await this.programsRepo.getById(dto.programId);
      if (!program || program.trainerId !== trainerId) throw new Error('NOT_ALLOWED');
    }

    if (dto.startAt.getTime() < Date.now()) throw new Error('PAST_NOT_ALLOWED');

    const id = await this.termsRepo.create({
      trainerId,
      programId: dto.programId ?? null,
      type: dto.type,
      startAt: dto.startAt,
      durationMin: dto.durationMin,
      capacity: dto.capacity
    });
    try { await this.audit.log('Informacija', 'TRAINER_CREATE_TERM', trainerId, null, { id }); } catch {}
    return id;
  }

  async setTermProgram(trainerId: number, termId: number, programId: number): Promise<void> {
    const term = await this.termsRepo.getById(termId);
    if (!term || term.trainerId !== trainerId) throw new Error('NOT_ALLOWED');

    const program = await this.programsRepo.getById(programId);
    if (!program || program.trainerId !== trainerId) throw new Error('NOT_ALLOWED');

    const clientId = await this.termsRepo.getEnrolledClientId(termId);
    if (!clientId) throw new Error('NO_CLIENT_ENROLLED');

    const assignedPrograms = await this.programsRepo.listAssignedToClient(trainerId, clientId);
    const isAssigned = assignedPrograms.some(p => p.id === programId);
    if (!isAssigned) throw new Error('PROGRAM_NOT_ASSIGNED_TO_CLIENT');

    await this.termsRepo.setProgram(termId, programId);
    try { await this.audit.log('Informacija', 'TRAINER_SET_TERM_PROGRAM', trainerId, null, { termId, programId }); } catch {}
  }

  async listProgramsForClient(trainerId: number, clientId: number): Promise<ProgramLite[]> {
    const programs = await this.programsRepo.listAssignedToClient(trainerId, clientId);
    return programs.map(p => ({
      id: p.id,
      title: p.title,
      level: p.level,
      isPublic: p.isPublic,
    }));
  }

  async getTermParticipants(termId: number): Promise<Array<{userId: number; userName: string}>> {
    const rows = await this.enrollRepo.getEnrolledUsers(termId);
    return rows.map(r => ({
      userId: r.user_id,
      userName: `${r.ime} ${r.prezime}`
    }));
  }

  // Live workout session
  async finishWorkout(trainerId: number, payload: any) {
    const termId = Number(payload.termId);
    const clientId = Number(payload.clientId);
    if (!Number.isFinite(termId) || !Number.isFinite(clientId)) {
      throw new Error('BAD_IDS');
    }

    // Prevent double completion
    const already = await this.workoutRepo.hasSessionForTerm(termId);
    if (already) throw new Error('SESSION_ALREADY_COMPLETED');

    // Normalize & validate dates to avoid MySQL invalid datetime (ISO with T/Z)
    const start = new Date(payload.startTime);
    const end = new Date(payload.endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('BAD_TIME_RANGE');
    }

    // 1. Sačuvaj sesiju
    const sessionId = await this.workoutRepo.saveSession({
      ...payload,
      trainerId,
      termId,
      clientId,
      startTime: start,
      endTime: end,
    });
    
    // 2. Označi enrollment kao completed
    await this.enrollRepo.markSessionCompleted(termId, clientId);
    
    // 3. Audit log
    await this.audit.log('Informacija', 'WORKOUT_COMPLETED', trainerId, null, {
      termId: payload.termId,
      clientId: payload.clientId,
      sessionId
    });
    
    return sessionId;
  }

  async updateMyProfile(trainerId: number, dto: { ime: string; prezime: string; pol: 'musko' | 'zensko'; datumRodjenja: Date | null }): Promise<void> {
  await this.userRepo.updateBasicInfo({
    id: trainerId,
    ime: dto.ime,
    prezime: dto.prezime,
    datumRodjenja: dto.datumRodjenja,
    pol: dto.pol,
  });
    try { await this.audit.log('Informacija', 'TRAINER_PROFILE_UPDATE', trainerId, null, {}); } catch {}
  }

  async getClientProgressStats(trainerId: number, clientId: number): Promise<any> {
    // Verify client belongs to trainer
    const client = await this.userRepo.getById(clientId);
    if (client.id === 0) throw new Error('Client not found');
    
    // Get workout history
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT 
        ws.id as sessionId,
        ws.start_time,
        ws.end_time,
        tt.program_id as programId,
        p.title as programTitle,
        e.name as exerciseName,
        wel.exercise_id,
        wel.set_number,
        wel.actual_reps,
        wel.actual_weight
      FROM workout_sessions ws
      INNER JOIN training_terms tt ON ws.term_id = tt.id
      INNER JOIN programs p ON tt.program_id = p.id
      INNER JOIN workout_exercise_logs wel ON ws.id = wel.session_id
      INNER JOIN exercises e ON wel.exercise_id = e.id
      WHERE ws.trainer_id = ? AND ws.client_id = ?
      ORDER BY ws.start_time DESC, wel.exercise_id, wel.set_number`,
      [trainerId, clientId]
    );

    // Group by exercise
    const exerciseMap = new Map<number, any>();
    
    for (const row of rows as any[]) {
      if (!exerciseMap.has(row.exercise_id)) {
        exerciseMap.set(row.exercise_id, {
          exerciseId: row.exercise_id,
          exerciseName: row.exerciseName,
          sessions: []
        });
      }
      
      const exData = exerciseMap.get(row.exercise_id)!;
      let session = exData.sessions.find((s: any) => s.sessionId === row.sessionId);
      
      if (!session) {
        session = {
          sessionId: row.sessionId,
          date: new Date(row.start_time).toISOString(),
          programId: row.programId,
          programTitle: row.programTitle,
          sets: []
        };
        exData.sessions.push(session);
      }
      
      session.sets.push({
        setNumber: row.set_number,
        reps: row.actual_reps,
        weight: row.actual_weight
      });
    }

    // Calculate stats per exercise
    const exercises = Array.from(exerciseMap.values()).map(ex => {
      const allWeights = ex.sessions.flatMap((s: any) => s.sets.map((set: any) => set.weight));
      const maxWeight = allWeights.length > 0 ? Math.max(...allWeights) : 0;
      
      const totalVolume = ex.sessions.reduce((sum: number, s: any) => {
        return sum + s.sets.reduce((ssum: number, set: any) => ssum + (set.reps * set.weight), 0);
      }, 0);

      // Progress over time (last 10 sessions)
      const recentSessions = ex.sessions.slice(0, 10).reverse();
      const progressData = recentSessions.map((s: any) => ({
        date: new Date(s.date).toLocaleDateString(),
        maxWeight: Math.max(...s.sets.map((set: any) => set.weight)),
        totalVolume: s.sets.reduce((sum: number, set: any) => sum + (set.reps * set.weight), 0),
        avgReps: s.sets.reduce((sum: number, set: any) => sum + set.reps, 0) / s.sets.length
      }));

      return {
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        totalSessions: ex.sessions.length,
        maxWeight,
        totalVolume,
        progressData
      };
    });

    // Overall stats
    const totalWorkouts = new Set(rows.map((r: any) => r.sessionId)).size;
    const totalVolume = exercises.reduce((sum, e) => sum + e.totalVolume, 0);

    return {
      client: {
        id: client.id,
        firstName: client.ime,
        lastName: client.prezime,
        email: client.korisnickoIme
      },
      summary: {
        totalWorkouts,
        totalVolume,
        exercisesTracked: exercises.length
      },
      exercises
    };
  }
}
