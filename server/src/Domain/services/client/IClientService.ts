export type TrainingType = 'individual' | 'group' | 'INDIVIDUAL' | 'GROUP';

/* WEEKLY SCHEDULE */
export interface WeeklyEvent {
  termId: number;
  title: string;
  day: number; // 0..6
  start: string;
  end: string;
  type: TrainingType;
  programTitle: string;
  trainerName: string;
  cancellable: boolean;
}

/* AVAILABLE TERMS */
export interface AvailableTermProgram {
  id: number;
  title: string;
  level?: string | null;
}

export interface AvailableTermTrainer {
  id: number;
  name: string;
}

export interface AvailableTerm {
  id: number;
  startAt: string; // ISO
  durationMin: number;
  type: TrainingType;
  capacity: number;
  enrolledCount: number;
  status: 'free' | 'full';
  isEnrolled: boolean;
  program: AvailableTermProgram;
  trainer: AvailableTermTrainer;
}

/* HISTORY */
export interface HistoryItem {
  id: number;
  date: string; // ISO
  programTitle: string;
  trainerName: string;
  status: string;
  rating: number | null;
  feedback: string | null;
}

export interface HistoryStats {
  total: number;
  avgRating: number | null;
}

export interface HistoryData {
  items: HistoryItem[];
  stats: HistoryStats;
}

/* MY PROFILE (agregat) */
export interface RatingsPoint {
  date: string; // ISO
  avg: number;  // 1-10
}

export interface UpcomingSession {
  id: number;
  title: string;
  programName: string;
  type: TrainingType;
  startsAt: string; // ISO
  durationMin: number;
  isFull: boolean;
  trainerName: string;
}

export interface ClientProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string | null;
  age?: number | null;      // izračunato iz datumRodjenja
  address?: string | null;  // nemamo u bazi — null
  avatarUrl?: string | null;// nemamo u bazi — null
  isBlocked: boolean;
  stats: {
    sessionsCompleted: number;
    avgRating: number | null;
    totalPrograms: number;
    totalHours: number;
  };
  upcomingSessions: UpcomingSession[];
  ratingsTrend: RatingsPoint[];
}

export interface IClientService {
  listTrainers(): Promise<{ id: number; name: string; email: string }[]>;
  chooseTrainer(userId: number, trainerId: number): Promise<void>;
  getWeeklySchedule(userId: number, weekStartISO: string): Promise<{ events: WeeklyEvent[] }>;
  getAvailableTerms(
    userId: number,
    params: { fromISO?: string; toISO?: string; type?: 'individual'|'group'; programId?: number; status?: 'free'|'full' }
  ): Promise<AvailableTerm[]>;
  bookTerm(userId: number, termId: number): Promise<void>;
  cancelTerm(userId: number, termId: number): Promise<void>;
  getHistory(userId: number): Promise<HistoryData>;

  // NOVO
  getMyProfile(userId: number): Promise<ClientProfile>;
}