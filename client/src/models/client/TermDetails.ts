export type TermDetails = {
  id: number;
  title: string;
  startAt: string;
  endAt: string;
  type: 'individual' | 'group';
  trainerName?: string;
  programTitle?: string;
  exercises?: string[];
  completed?: boolean;
  enrolledClientId?: number | null;
  enrolledClientName?: string | null;
  programId?: number | null;
};