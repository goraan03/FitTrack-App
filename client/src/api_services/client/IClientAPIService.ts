export type WeeklyScheduleResponse = {
  success: boolean; message: string;
  data?: { events: { termId:number; title:string; day:number; start:string; end:string; type:'individual'|'group'; programTitle:string; trainerName:string; cancellable:boolean }[] };
};
export type AvailableTermsResponse = {
  success: boolean; message: string;
  data?: {
    id:number; startAt:string; durationMin:number; type:'individual'|'group';
    capacity:number; enrolledCount:number; status:'free'|'full';
    isEnrolled: boolean; // NOVO
    program:{ id:number; title:string; level:string};
    trainer:{ id:number; name:string }
  }[];
};
export type BasicResponse = { success:boolean; message:string };
export type HistoryResponse = { success:boolean; message:string; data?: { items: { id:number; date:string; programTitle:string; trainerName:string; status:string; rating:number|null; feedback:string|null }[], stats: { total:number; avgRating:number|null } } };
export type TrainersResponse = { success:boolean; message:string; data?: { id:number; name:string; email:string }[] };

export interface IClientAPIService {
  listTrainers(): Promise<TrainersResponse>;
  chooseTrainer(trainerId:number): Promise<BasicResponse>;
  getWeeklySchedule(weekStartISO: string): Promise<WeeklyScheduleResponse>;
  getAvailableTerms(params: { fromISO?: string; toISO?: string; type?: 'individual'|'group'; programId?: number; status?: 'free'|'full' }): Promise<AvailableTermsResponse>;
  book(termId:number): Promise<BasicResponse>;
  cancel(termId:number): Promise<BasicResponse>;
  getHistory(): Promise<HistoryResponse>;
}