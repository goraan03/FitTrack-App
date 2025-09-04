import type { PublicProgram } from "./PublicProgram";

export type PublicProgramsResponse = {
  success: boolean;
  message: string;
  data?: PublicProgram[];
};