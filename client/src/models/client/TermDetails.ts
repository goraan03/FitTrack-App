export type TermDetails = {
  id: number;
  title: string;
  startAt: string;        // ISO
  endAt: string;          // ISO
  type: 'individual' | 'group';
  trainerName?: string;
  programTitle?: string;
  exercises?: string[];
};