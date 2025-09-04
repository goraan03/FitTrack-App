import type { WeeklyScheduleData } from "./WeeklyScheduleData";

export interface WeeklyScheduleResponse {
  success: boolean;
  message: string;
  data: WeeklyScheduleData;
}