import db from "../../Database/connection/DbConnectionPool";
import { IClientService, WeeklyEvent, AvailableTerm, HistoryItem } from "../../Domain/services/client/IClientService";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IAuditService } from "../../Domain/services/audit/IAuditService";

function isoToDate(s?: string) { return s ? new Date(s) : null; }
function pad2(n: number) { return String(n).padStart(2, '0'); }
function toHHMM(d: Date) { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }

export class ClientService implements IClientService {
  constructor(private audit: IAuditService) {}

  async chooseTrainer(userId: number, trainerId: number): Promise<void> {
    const [t] = await db.execute<RowDataPacket[]>("SELECT id, uloga, CONCAT(ime,' ',prezime) as name FROM users WHERE id=? LIMIT 1", [trainerId]);
    if (t.length === 0 || t[0].uloga !== 'trener') throw new Error('Trainer not found');

    const [u] = await db.execute<RowDataPacket[]>("SELECT assigned_trener_id FROM users WHERE id=? LIMIT 1", [userId]);
    if (u.length === 0) throw new Error('User not found');
    if (u[0].assigned_trener_id) throw new Error('Already assigned');

    await db.execute<ResultSetHeader>("UPDATE users SET assigned_trener_id=? WHERE id=?", [trainerId, userId]);
    await this.audit.log('Informacija', 'CLIENT_CHOOSE_TRAINER', userId, null, { trainerId });
  }

  async listTrainers(): Promise<{ id: number; name: string; email: string }[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT id, CONCAT(ime,' ',prezime) as name, korisnickoIme as email FROM users WHERE uloga='trener' ORDER BY ime, prezime"
    );
    return rows.map((r:any)=>({ id:r.id, name:r.name, email:r.email }));
  }

  async getWeeklySchedule(userId: number, weekStartISO: string): Promise<{ events: WeeklyEvent[] }> {
    const weekStart = new Date(weekStartISO);
    if (Number.isNaN(weekStart.getTime())) throw new Error('Bad date');

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT e.term_id as termId, t.start_at as startAt, t.duration_min as dur, t.type, 
              p.title as programTitle, CONCAT(u.ime,' ',u.prezime) as trainerName
       FROM training_enrollments e
       JOIN training_terms t ON t.id=e.term_id
       JOIN programs p ON p.id=t.program_id
       JOIN users u ON u.id=t.trainer_id
       WHERE e.user_id=? AND t.start_at>=? AND t.start_at<? AND e.status='enrolled' AND t.canceled=0
       ORDER BY t.start_at`,
      [userId, weekStart, weekEnd]
    );

    const events: WeeklyEvent[] = rows.map((r:any)=>{
      const s = new Date(r.startAt);
      const e = new Date(s.getTime() + r.dur*60000);
      const day = (s.getDay()+7)%7;
      const cancellable = (s.getTime() - Date.now()) >= (60*60000);
      return {
        termId: r.termId,
        title: r.programTitle,
        day,
        start: toHHMM(s),
        end: toHHMM(e),
        type: r.type,
        programTitle: r.programTitle,
        trainerName: r.trainerName,
        cancellable
      };
    });
    return { events };
  }

  async getAvailableTerms(
    userId: number,
    params: { fromISO?: string; toISO?: string; type?: 'individual'|'group'; programId?: number; status?: 'free'|'full' }
  ): Promise<AvailableTerm[]> {
    // Dozvoljeno samo za assigned trenera
    const [u] = await db.execute<RowDataPacket[]>("SELECT assigned_trener_id FROM users WHERE id=?", [userId]);
    if (!u.length || !u[0].assigned_trener_id) throw new Error('NO_TRAINER_SELECTED');
    const trainerId = u[0].assigned_trener_id;

    const from = isoToDate(params.fromISO) || new Date();
    const to = isoToDate(params.toISO) || new Date(Date.now() + 30*24*3600*1000);

    const where: string[] = ["t.trainer_id=?","t.canceled=0","t.start_at BETWEEN ? AND ?"];
    const args: any[] = [trainerId, from, to];

    if (params.type) { where.push("t.type=?"); args.push(params.type); }
    if (params.programId) { where.push("t.program_id=?"); args.push(params.programId); }
    if (params.status==='free') where.push("t.enrolled_count < t.capacity");
    if (params.status==='full') where.push("t.enrolled_count >= t.capacity");

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT t.id,
              t.start_at as startAt,
              t.duration_min as durationMin,
              t.type,
              t.capacity,
              t.enrolled_count as enrolledCount,
              p.id as programId,
              p.title as programTitle,
              p.level,
              CONCAT(u.ime,' ',u.prezime) as trainerName,
              u.id as trainerId,
              CASE WHEN e.id IS NULL THEN 0 ELSE 1 END as isEnrolled
       FROM training_terms t
       JOIN programs p ON p.id=t.program_id
       JOIN users u ON u.id=t.trainer_id
       LEFT JOIN training_enrollments e
              ON e.term_id = t.id
             AND e.user_id = ?
             AND e.status = 'enrolled'
       WHERE ${where.join(' AND ')}
       ORDER BY t.start_at ASC`,
      [userId, ...args]
    );

    const out: AvailableTerm[] = rows.map((r:any)=>({
      id: r.id,
      startAt: new Date(r.startAt).toISOString(),
      durationMin: r.durationMin,
      type: r.type,
      capacity: r.capacity,
      enrolledCount: r.enrolledCount,
      status: (r.enrolledCount >= r.capacity) ? 'full' : 'free',
      isEnrolled: !!Number(r.isEnrolled),
      program: { id: r.programId, title: r.programTitle, level: r.level },
      trainer: { id: r.trainerId, name: r.trainerName }
    }));
    return out;
  }

  async bookTerm(userId: number, termId: number): Promise<void> {
    // proveri term + korisnika (trener, vreme itd.)
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

    // proveri da li već postoji red za ovaj user/term
    const [erows] = await db.execute<RowDataPacket[]>(
      "SELECT id, status FROM training_enrollments WHERE term_id=? AND user_id=? LIMIT 1",
      [termId, userId]
    );

    if (erows.length) {
      const e:any = erows[0];
      if (e.status === 'enrolled') {
        throw new Error('ALREADY_ENROLLED');
      }
      // re-enroll sa proverenim kapacitetom
      if (t.enrolled_count >= t.capacity) {
        await this.audit.log('Upozorenje', 'BOOK_CONFLICT_FULL', userId, null, { termId });
        throw new Error('FULL');
      }
      await db.execute("UPDATE training_enrollments SET status='enrolled', rating=NULL, feedback=NULL WHERE id=?", [e.id]);
      await db.execute("UPDATE training_terms SET enrolled_count = enrolled_count + 1 WHERE id=?", [termId]);
      await this.audit.log('Informacija', 'BOOK_SUCCESS', userId, null, { termId });
      return;
    }

    // prvi upis
    if (t.enrolled_count >= t.capacity) {
      await this.audit.log('Upozorenje', 'BOOK_CONFLICT_FULL', userId, null, { termId });
      throw new Error('FULL');
    }

    await db.execute<ResultSetHeader>(
      "INSERT INTO training_enrollments (term_id, user_id) VALUES (?,?)",
      [termId, userId]
    );
    await db.execute("UPDATE training_terms SET enrolled_count = enrolled_count + 1 WHERE id=?", [termId]);
    await this.audit.log('Informacija', 'BOOK_SUCCESS', userId, null, { termId });
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
    await this.audit.log('Informacija', 'CANCEL_SUCCESS', userId, null, { termId });
  }

  async getHistory(userId: number): Promise<{ items: HistoryItem[]; stats: { total: number; avgRating: number | null } }> {
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
    const items: HistoryItem[] = rows.map((r:any)=>({
      id: r.id, date: new Date(r.startAt).toISOString(), programTitle: r.programTitle, trainerName: r.trainerName, status: r.status, rating: r.rating ?? null, feedback: r.feedback ?? null
    }));

    const [srows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total, AVG(rating) as avgRating FROM training_enrollments WHERE user_id=? AND rating IS NOT NULL`,
      [userId]
    );
    const stats = { total: Number(srows[0].total || 0), avgRating: srows[0].avgRating ? Number(srows[0].avgRating) : null };
    return { items, stats };
  }
}