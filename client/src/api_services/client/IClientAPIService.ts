import type { AvailableTermsQuery } from "../../types/client/AvailableTermsQuery";
import type { AvailableTermsResponse } from "../../types/client/AvailableTermsResponse";
import type { BasicResponse } from "../../types/client/BasicResposne";
import type { HistoryResponse } from "../../types/client/HistoryResponse";
import type { MyProfileResponse } from "../../types/client/MyProfileResponse";
import type { TrainersResponse } from "../../types/client/TrainersResponse";
import type { WeeklyScheduleResponse } from "../../types/client/WeeklyScheduleResponse";


export interface IClientAPIService {
  listTrainers(): Promise<TrainersResponse>;
  chooseTrainer(trainerId: number): Promise<BasicResponse>;
  getWeeklySchedule(weekStartISO: string): Promise<WeeklyScheduleResponse>;
  getAvailableTerms(params: AvailableTermsQuery): Promise<AvailableTermsResponse>;
  book(termId: number): Promise<BasicResponse>;
  cancel(termId: number): Promise<BasicResponse>;
  getHistory(): Promise<HistoryResponse>;

  getMyProfile(): Promise<MyProfileResponse>;
}