export type TrainerTerm = {
  id: number;
  startAt: string;       
  durationMin: number;
  type: 'individual'|'group';
  capacity: number;
  enrolledCount: number;
  canceled: boolean;
  programId: number;
  completed?: boolean;
  programTitle: string;
};

export type CreateTermDto = {
  programId: number;
  type: 'individual'|'group';
  startAtISO: string;    
  durationMin: number;   
  capacity: number;      
};
