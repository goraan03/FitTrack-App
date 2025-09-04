export type WeeklyCardItem = {
  id: number;
  title: string;
  day: number;   
  start: string;               // 'HH:mm'
  end: string;                 // 'HH:mm'
  type: 'individual' | 'group';
  cancellable: boolean;
  programTitle?: string;
  trainerName?: string;
};