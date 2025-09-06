import db from "../../Database/connection/DbConnectionPool";
import {
  IClientService,
  WeeklyEvent,
  AvailableTerm,
  HistoryData,
  ClientProfile,
  UpcomingSession,
  RatingsPoint,
} from "../../Domain/services/client/IClientService";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { ITrainingEnrollmentsRepository } from "../../Domain/repositories/training_enrollments/ITrainingEnrollmentsRepository";
import { TrainingType } from "../../Domain/types/training_enrollments/TrainingType";

function isoToDate(s?: string) { return s ? new Date(s) : null; }
function pad2(n: number) { return String(n).padStart(2, '0'); }
function toHHMM(d: Date) { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }

export class ClientService implements IClientService {
  constructor(
    private audit: IAuditService, 
    private userRepo: IUserRepository,
    private trainingEnrollmentsRepo: ITrainingEnrollmentsRepository) {}

  async chooseTrainer(userId: number, trainerId: number): Promise<void> {
  const trainer = await this.userRepo.getById(trainerId);
  if (!trainer || trainer.uloga !== "trener") {
    throw new Error("Trainer not found");
  }

  const user = await this.userRepo.getById(userId);
  if (!user) throw new Error("User not found");
  //if (user.assigned_trener_id) throw new Error("Already assigned");

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

    const events: WeeklyEvent[] = rows.map(r => {
      const s = new Date(r.startAt);
      const e = new Date(s.getTime() + r.dur * 60000);
      const day = (s.getDay() + 7) % 7;
      const cancellable = (s.getTime() - Date.now()) >= (60 * 60000);

      return {
        termId: r.termId,
        title: r.programTitle,
        day,
        start: toHHMM(s),
        end: toHHMM(e),
        type: r.type as TrainingType,
        programTitle: r.programTitle,
        trainerName: r.trainerName,
        cancellable
      };
    });

    return { events };
  }

  async bookTerm(userId: number, termId: number): Promise<void> {
    const [trows] = await db.execute<RowDataPacket[]>(
      `SELECT t.*, u.assigned_trener_id 
       FROM training_terms t
       JOIN users u ON u.id=? 
       WHERE t.id=? LIMIT 1`,
       [userId, termId]
    );
    if (!trows.length) throw new Error('TERM_NOT_FOUND');

    const t:any = trows[0];
    if (!t.assigned_trener_id) throw new Error('NO_TRAINER_SELECTED');
    if (t.assigned_trener_id !== t.trainer_id) throw new Error('DIFFERENT_TRAINER');

    const start = new Date(t.start_at);
    if ((start.getTime() - Date.now()) < 60*60000) throw new Error('TOO_LATE');
    if (t.canceled) throw new Error('CANCELED');

    const [erows] = await db.execute<RowDataPacket[]>(
      "SELECT id, status FROM training_enrollments WHERE term_id=? AND user_id=? LIMIT 1",
      [termId, userId]
    );

    if (erows.length) {
      const e:any = erows[0];
      if (e.status === 'enrolled') {
        throw new Error('ALREADY_ENROLLED');
      }
      if (t.enrolled_count >= t.capacity) {
        try { await this.audit.log('Upozorenje', 'BOOK_CONFLICT_FULL', userId, null, { termId }); } catch {}
        throw new Error('FULL');
      }
      await db.execute("UPDATE training_enrollments SET status='enrolled', rating=NULL, feedback=NULL WHERE id=?", [e.id]);
      await db.execute("UPDATE training_terms SET enrolled_count = enrolled_count + 1 WHERE id=?", [termId]);
      try { await this.audit.log('Informacija', 'BOOK_SUCCESS', userId, null, { termId }); } catch {}
      return;
    }

    if (t.enrolled_count >= t.capacity) {
      try { await this.audit.log('Upozorenje', 'BOOK_CONFLICT_FULL', userId, null, { termId }); } catch {}
      throw new Error('FULL');
    }

    await db.execute<ResultSetHeader>(
      "INSERT INTO training_enrollments (term_id, user_id) VALUES (?,?)",
      [termId, userId]
    );
    await db.execute("UPDATE training_terms SET enrolled_count = enrolled_count + 1 WHERE id=?", [termId]);
    try { await this.audit.log('Informacija', 'BOOK_SUCCESS', userId, null, { termId }); } catch {}
  }

  async cancelTerm(userId: number, termId: number): Promise<void> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT t.*, e.id as enrId
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       WHERE e.user_id=? AND e.term_id=? AND e.status='enrolled' LIMIT 1`, [userId, termId]
    );
    if (!rows.length) throw new Error('NOT_ENROLLED');

    const r:any = rows[0];
    const start = new Date(r.start_at);
    if ((start.getTime() - Date.now()) < 60*60000) throw new Error('TOO_LATE');

    await db.execute("UPDATE training_enrollments SET status='canceled_by_user' WHERE id=?", [r.enrId]);
    await db.execute("UPDATE training_terms SET enrolled_count = GREATEST(enrolled_count-1,0) WHERE id=?", [termId]);
    try { await this.audit.log('Informacija', 'CANCEL_SUCCESS', userId, null, { termId }); } catch {}
  }

  async getHistory(userId: number): Promise<HistoryData> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT e.id, e.status, e.rating, e.feedback, t.start_at as startAt, p.title as programTitle, CONCAT(u.ime,' ',u.prezime) as trainerName
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       JOIN programs p ON p.id=t.program_id
       JOIN users u ON u.id=t.trainer_id
       WHERE e.user_id=? AND t.start_at < NOW()
       ORDER BY t.start_at DESC
       LIMIT 100`, [userId]
    );
    const items = (rows as any[]).map(r => ({
      id: r.id, date: new Date(r.startAt).toISOString(), programTitle: r.programTitle, trainerName: r.trainerName,
      status: r.status, rating: r.rating ?? null, feedback: r.feedback ?? null
    }));

    const [srows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total, AVG(rating) as avgRating FROM training_enrollments WHERE user_id=? AND rating IS NOT NULL`,
      [userId]
    );
    const stats = { total: Number((srows as any[])[0]?.total || 0), avgRating: (srows as any[])[0]?.avgRating != null ? Number((srows as any[])[0].avgRating) : null };
    return { items, stats };
  }

  // NOVO: agregacija profila (usklađena sa tvojom users tabelom)
  async getMyProfile(userId: number): Promise<ClientProfile> {
    const [urows] = await db.execute<RowDataPacket[]>(
      `SELECT id,
              ime AS firstName,
              prezime AS lastName,
              korisnickoIme AS email,
              pol AS gender,
              TIMESTAMPDIFF(YEAR, datumRodjenja, CURDATE()) AS age, -- može biti NULL ako nema datuma
              NULL AS address,
              blokiran AS isBlocked,
              NULL AS avatarUrl
       FROM users
       WHERE id=? LIMIT 1`,
      [userId]
    );
    if (!(urows as any[]).length) throw new Error('User not found');
    const u: any = (urows as any[])[0];

    const [scRows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       WHERE e.user_id=? AND e.status='enrolled' AND t.start_at < NOW()`,
      [userId]
    );
    const sessionsCompleted = Number((scRows as any[])[0]?.cnt || 0);

    const [arRows] = await db.execute<RowDataPacket[]>(
      `SELECT AVG(rating) AS avgRating
       FROM training_enrollments
       WHERE user_id=? AND rating IS NOT NULL`,
      [userId]
    );
    const avgRating = (arRows as any[])[0]?.avgRating != null ? Number((arRows as any[])[0].avgRating) : null;

    const [tpRows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT p.id) AS totalPrograms
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       JOIN programs p ON p.id=t.program_id
       WHERE e.user_id=? AND e.status='enrolled'`,
      [userId]
    );
    const totalPrograms = Number((tpRows as any[])[0]?.totalPrograms || 0);

    const [thRows] = await db.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(t.duration_min),0) AS totalMin
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       WHERE e.user_id=? AND e.status='enrolled' AND t.start_at < NOW()`,
      [userId]
    );
    const totalHours = Number((thRows as any[])[0]?.totalMin || 0) / 60;

    const [upRows] = await db.execute<RowDataPacket[]>(
      `SELECT t.id,
              p.title AS programName,
              p.title AS title,
              t.type,
              t.start_at AS startsAt,
              t.duration_min AS durationMin,
              t.enrolled_count,
              t.capacity,
              CONCAT(tr.ime,' ',tr.prezime) AS trainerName
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       JOIN programs p ON p.id=t.program_id
       JOIN users tr ON tr.id=t.trainer_id
       WHERE e.user_id=? AND e.status='enrolled' AND t.canceled=0 AND t.start_at >= NOW()
       ORDER BY t.start_at ASC
       LIMIT 10`,
      [userId]
    );
    const upcomingSessions: UpcomingSession[] = (upRows as any[]).map(r => ({
      id: r.id,
      title: r.title,
      programName: r.programName,
      type: r.type,
      startsAt: new Date(r.startsAt).toISOString(),
      durationMin: Number(r.durationMin || 0),
      isFull: Number(r.enrolled_count || 0) >= Number(r.capacity || 0),
      trainerName: r.trainerName,
    }));

    const [rtRows] = await db.execute<RowDataPacket[]>(
      `SELECT DATE_FORMAT(t.start_at, '%Y-%m-01') AS d, AVG(e.rating) AS avg
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       WHERE e.user_id=? AND e.rating IS NOT NULL
       GROUP BY d
       ORDER BY d ASC`,
      [userId]
    );
    const ratingsTrend: RatingsPoint[] = (rtRows as any[]).map(r => ({
      date: new Date(r.d).toISOString(),
      avg: Number(r.avg),
    }));

    try { await this.audit.log('Informacija', 'CLIENT_PROFILE_VIEW', userId, null, {}); } catch {}

    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      gender: u.gender ?? null,
      age: u.age != null ? Number(u.age) : null,
      address: null,
      avatarUrl: null,
      isBlocked: !!u.isBlocked,
      stats: { sessionsCompleted, avgRating, totalPrograms, totalHours },
      upcomingSessions,
      ratingsTrend,
    };
  }
}