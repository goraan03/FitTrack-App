import type { ProgramDetails } from "./ProgramDetails";

export type ProgramDetailsResponse = {
  success: boolean;
  message: string;
  data?: ProgramDetails;
};