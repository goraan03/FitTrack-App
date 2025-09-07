import type { TrainerProfile } from "./TrainerProfile";

export interface MyProfileResponse {
  success: boolean;
  message: string;
  data: TrainerProfile;
}