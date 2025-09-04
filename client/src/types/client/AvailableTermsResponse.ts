import type { AvailableTerm } from "../../models/client/AvailableTerm";

export interface AvailableTermsResponse {
  success: boolean;
  message: string;
  data: AvailableTerm[];
}