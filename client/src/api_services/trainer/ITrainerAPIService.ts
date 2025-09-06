import type { TrainerDashboardResponse, UnratedParticipantsResponse, BasicResponse } from "../../types/trainer/TrainerDashboard";

export interface ITrainerAPIService {
  getDashboard(weekStartISO: string): Promise<TrainerDashboardResponse>;
  getUnrated(termId: number): Promise<UnratedParticipantsResponse>;
  rateParticipant(termId: number, userId: number, rating: number): Promise<BasicResponse>;
}