import type { TrainingType } from "../client/TrainingType";

export type TrainerWeeklyEvent = {
  id: number;
  title: string;
  day: number;
  start: string;
  end: string;
  type: TrainingType;
  cancellable: boolean;
};

export type PendingTerm = {
  termId: number;
  startAt: string;
  programTitle: string;
  count: number;
};

export type TrainerDashboardData = {
  stats: {
    totalTerms: number;
    scheduledHours: number;
    avgRating: number | null;
    enrolledThisWeek: number;
  };
  events: TrainerWeeklyEvent[];
  pendingRatings: PendingTerm[];
};

export type TrainerDashboardResponse = {
  success: boolean;
  message: string;
  data: TrainerDashboardData;
};

export type UnratedParticipantsResponse = {
  success: boolean;
  message: string;
  data: {
    termId: number;
    programTitle: string;
    participants: { userId: number; userName: string }[];
  };
};

export type BasicResponse = { success: boolean; message: string };