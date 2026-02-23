export type WeeklyCardItem = {
  id: number;
  title: string;
  day: number;
  start: string;
  end: string;
  type: 'individual' | 'group';
  cancellable: boolean;
  programTitle?: string;
  trainerName?: string;
  programId?: number | null;
  completed?: boolean;
  enrolledClientId?: number | null;
  enrolledClientName?: string | null;
};