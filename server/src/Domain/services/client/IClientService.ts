export type TermType = 'individual' | 'group';
export type TermStatus = 'free' | 'full' | 'canceled';

export type WeeklyEvent = {
  termId: number;
  title: string;
  day: number;          // 0-6 (Sun-Sat)
  start: string;        // 'HH:mm'
  end: string;          // 'HH:mm'
  type: TermType;
  programTitle: string;
  trainerName: string;
  cancellable: boolean; // >= 60 min before
};

export type AvailableTerm = {
  id: number;
  startAt: string;      // ISO
  durationMin: number;
  type: TermType;
  capacity: number;
  enrolledCount: number;
  status: TermStatus;
  program: { id: number; title: string; level: string };
  trainer: { id: number; name: string };
};

export type HistoryItem = {
  id: number;
  date: string;         // ISO
  programTitle: string;
  trainerName: string;
  status: 'attended'|'no_show'|'canceled_by_user';
  rating: number | null;
  feedback: string | null;
};

export interface IClientService {
  chooseTrainer(userId: number, trainerId: number): Promise<void>;
  listTrainers(): Promise<{ id: number; name: string; email: string }[]>;

  getWeeklySchedule(userId: number, weekStartISO: string): Promise<{ events: WeeklyEvent[] }>;
  getAvailableTerms(userId: number, params: { fromISO?: string; toISO?: string; type?: TermType; programId?: number; status?: 'free'|'full' }): Promise<AvailableTerm[]>;
  bookTerm(userId: number, termId: number): Promise<void>;
  cancelTerm(userId: number, termId: number): Promise<void>;

  getHistory(userId: number): Promise<{ items: HistoryItem[]; stats: { total: number; avgRating: number | null } }>;
}