import type { HistoryData } from "../../models/client/HistoryData";

export interface HistoryResponse {
  success: boolean;
  message: string;
  data: HistoryData;
}