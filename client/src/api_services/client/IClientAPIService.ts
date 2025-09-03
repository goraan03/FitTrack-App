// Centralno mesto za tipove i interfejse client API-ja

export type TrainingType = 'individual' | 'group' | 'INDIVIDUAL' | 'GROUP';

/* BASIC */
export interface BasicResponse {
  success: boolean;
  message: string;
}

/* TRAINERS */
export interface TrainerDto {
  id: number;
  name: string;
  email: string;
}

export interface TrainersResponse {
  success: boolean;
  message: string;
  data: TrainerDto[];
}

/* WEEKLY SCHEDULE */
export interface WeeklyEvent {
  termId: number;
  title: string;
  day: number;            // 0..6
  start: string;          // "HH:mm"
  end: string;            // "HH:mm"
  type: TrainingType;
  programTitle: string;
  trainerName: string;
  cancellable: boolean;
}

export interface WeeklyScheduleData {
  events: WeeklyEvent[];
}

export interface WeeklyScheduleResponse {
  success: boolean;
  message: string;
  data: WeeklyScheduleData;
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
  startAt: string;              // ISO
  durationMin: number;
  type: TrainingType;
  capacity: number;
  enrolledCount: number;
  status: 'free' | 'full';
  isEnrolled: boolean;
  program: AvailableTermProgram;
  trainer: AvailableTermTrainer;
}

export interface AvailableTermsResponse {
  success: boolean;
  message: string;
  data: AvailableTerm[];
}

export interface AvailableTermsQuery {
  fromISO?: string;
  toISO?: string;
  type?: 'individual' | 'group';
  programId?: number;
  status?: 'free' | 'full';
}

/* HISTORY */
export interface HistoryItem {
  id: number;
  date: string;                // ISO
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

export interface HistoryResponse {
  success: boolean;
  message: string;
  data: HistoryData;
}

/* MY PROFILE (agregat) */
export interface RatingsPoint {
  date: string;   // ISO
  avg: number;    // 1-10
}

export interface UpcomingSession {
  id: number;
  title: string;
  programName: string;
  type: TrainingType;
  startsAt: string;    // ISO
  durationMin: number;
  isFull: boolean;
  trainerName: string;
}

export interface ClientProfileStats {
  sessionsCompleted: number;
  avgRating: number | null;
  totalPrograms: number;
  totalHours: number;
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
  stats: ClientProfileStats;
  upcomingSessions: UpcomingSession[];
  ratingsTrend: RatingsPoint[];
}

export interface MyProfileResponse {
  success: boolean;
  message: string;
  data: ClientProfile;
}

export interface IClientAPIService {
  listTrainers(): Promise<TrainersResponse>;
  chooseTrainer(trainerId: number): Promise<BasicResponse>;
  getWeeklySchedule(weekStartISO: string): Promise<WeeklyScheduleResponse>;
  getAvailableTerms(params: AvailableTermsQuery): Promise<AvailableTermsResponse>;
  book(termId: number): Promise<BasicResponse>;
  cancel(termId: number): Promise<BasicResponse>;
  getHistory(): Promise<HistoryResponse>;

  getMyProfile(): Promise<MyProfileResponse>;
}