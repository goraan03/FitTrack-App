import type { TrainerDto } from "../../models/client/TrainerDto";

export interface TrainersResponse {
  success: boolean;
  message: string;
  data: TrainerDto[];
}