export type TrainerTerm = {
  id: number;
  startAt: string;
  durationMin: number;
  type: 'individual'|'group';
  capacity: number;
  enrolledCount: number;
  canceled: boolean;
  programId: number | null;
  completed?: boolean;
  programTitle: string | null;
  enrolledClientId: number | null;
  enrolledClientName: string | null;
};

export type CreateTermDto = {
  programId?: number | null;
  type: 'individual'|'group';
  startAtISO: string;
  durationMin: number;
  capacity: number;
};