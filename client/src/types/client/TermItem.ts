export type TermItem = {
  id: number;
  startAt: string;
  durationMin: number;
  type: 'individual' | 'group';
  capacity: number;
  enrolledCount: number;
  status: 'free' | 'full';
  isEnrolled: boolean;
  program: { id:number; title:string; level:string };
  trainer: { id:number; name:string };
};