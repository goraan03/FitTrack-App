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
};