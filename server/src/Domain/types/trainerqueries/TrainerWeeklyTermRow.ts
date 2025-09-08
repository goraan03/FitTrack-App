export type TrainerWeeklyTermRow = {
  termId: number;
  startAt: Date;
  dur: number;
  type: 'individual'|'group';
  title: string;
  enrolledCount: number;
  capacity: number;
};