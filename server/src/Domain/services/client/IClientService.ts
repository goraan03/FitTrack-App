export type TrainingType = 'individual' | 'group' | 'INDIVIDUAL' | 'GROUP';

export interface WeeklyEvent {
  termId: number;
  title: string;
  day: number; 
  start: string;
  end: string;
  startAt?: string;
  durationMin?: number;
  type: TrainingType;
  programTitle: string;
  trainerName: string;
  cancellable: boolean;
   completed?: boolean;
}

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
  startAt: string; 
  durationMin: number;
  type: TrainingType;
  capacity: number;
  enrolledCount: number;
  status: 'free' | 'full';
  isEnrolled: boolean;
  program: AvailableTermProgram;
  trainer: AvailableTermTrainer;
}

export interface HistoryItem {
  id: number;
  date: string; 
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

export interface RatingsPoint {
  date: string; 
  avg: number; 
}

export interface UpcomingSession {
  id: number;
  title: string;
  programName: string;
  type: TrainingType;
  startsAt: string;
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
  age?: number | null;     
  address?: string | null;  
  avatarUrl?: string | null;
  isBlocked: boolean;
  assignedTrainerId: number | null;
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
  bookTerm(userId: number, termId: number): Promise<void>;
  cancelTerm(userId: number, termId: number): Promise<void>;
  getHistory(userId: number): Promise<HistoryData>;
  getMyProfile(userId: number): Promise<ClientProfile>;
  updateMyProfile(userId: number, dto: { ime: string; prezime: string; pol: 'musko' | 'zensko'; datumRodjenja: Date | null }): Promise<void>;
}
