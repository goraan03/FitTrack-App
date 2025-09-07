export type TrainerWeeklyTermRow = {
  termId: number;
  startAt: Date;
  dur: number;
  type: 'individual' | 'group';
  title: string;
  enrolledCount: number;
  capacity: number;
};

export type PendingParticipant = { userId: number; userName: string };

export type TrainerDashboard = {
  stats: {
    totalTerms: number;
    scheduledHours: number;
    avgRating: number | null;
    enrolledThisWeek: number;
  };
  events: {
    id: number;
    title: string;
    day: number;     // 0=Mon .. 6=Sun
    start: string;   // HH:mm
    end: string;     // HH:mm
    type: 'individual'|'group';
    cancellable: boolean;
  }[];
  pendingRatings: {
    termId: number;
    startAt: string;
    programTitle: string;
    count: number;
  }[];
};

export type TrainerProfile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string | null;
  age: number | null;
  address: string | null;
  avatarUrl: string | null;
  isBlocked: boolean;
  stats: {
    sessionsCompleted: number;
    avgRating: number | null;
    totalPrograms: number;
    totalHours: number;
  };
  ratingsTrend: { date: string; avg: number | null }[];
};

export type ExerciseInput = {
  name: string;
  description?: string | null;
  muscleGroup: 'full_body'|'chest'|'back'|'legs'|'shoulders'|'arms'|'core'|'cardio'|'mobility';
  equipment?: 'none'|'bodyweight'|'dumbbells'|'barbell'|'kettlebell'|'machine'|'bands'|'other';
  level?: 'beginner'|'intermediate'|'advanced';
  videoUrl?: string | null;
};

export type ExerciseItem = ExerciseInput & {
  id: number;
  createdAt: Date;
};

export type ProgramInput = {
  title: string;
  description?: string | null;
  level: 'beginner'|'intermediate'|'advanced';
  isPublic?: boolean;
};

export type ProgramLite = {
  id: number;
  title: string;
  level: 'beginner'|'intermediate'|'advanced';
  isPublic: boolean;
};

export type ProgramExerciseSet = {
  exerciseId: number;
  position: number;
  sets: number | null;
  reps: string | null;
  tempo: string | null;
  restSec: number | null;
  notes: string | null;
};

export type ProgramDetails = {
  id: number;
  title: string;
  description: string | null;
  level: 'beginner'|'intermediate'|'advanced';
  exercises: (ProgramExerciseSet & { name: string })[];
};

export type TrainerTermDetails = {
  id: number;
  startAt: Date;
  durationMin: number;
  type: 'individual'|'group';
  capacity: number;
  enrolledCount: number;
  canceled: boolean;
  programTitle: string;
};

export interface ITrainerService {
  getDashboard(trainerId: number, weekStartISO?: string): Promise<TrainerDashboard>;
  getUnratedParticipants(trainerId: number, termId: number): Promise<{ termId: number; programTitle: string; participants: PendingParticipant[] }>;
  rateParticipant(trainerId: number, termId: number, userId: number, rating: number): Promise<void>;
  cancelTerm(trainerId: number, termId: number): Promise<void>;
  getMyProfile(trainerId: number): Promise<TrainerProfile>;

  // Exercises
  listExercises(trainerId: number): Promise<ExerciseItem[]>;
  createExercise(trainerId: number, input: ExerciseInput): Promise<number>;
  updateExercise(trainerId: number, exerciseId: number, input: ExerciseInput): Promise<void>;
  deleteExercise(trainerId: number, exerciseId: number): Promise<void>;

  // Programs
  listPrograms(trainerId: number): Promise<ProgramLite[]>;
  createProgram(trainerId: number, input: ProgramInput): Promise<number>;
  updateProgram(trainerId: number, programId: number, input: ProgramInput): Promise<void>;
  getProgramDetails(trainerId: number, programId: number): Promise<ProgramDetails>;
  setProgramExercises(trainerId: number, programId: number, items: ProgramExerciseSet[]): Promise<void>;
  assignProgramToClient(trainerId: number, programId: number, clientId: number): Promise<void>;

  // Clients
  listMyClients(trainerId: number): Promise<{ id: number; firstName: string | null; lastName: string | null; email: string; gender: string | null; age: number | null }[]>;

  // Terms
  listTerms(trainerId: number, from?: Date, to?: Date): Promise<TrainerTermDetails[]>;
  createTerm(trainerId: number, dto: { programId: number; type: 'individual'|'group'; startAt: Date; durationMin: number; capacity: number }): Promise<number>;
}