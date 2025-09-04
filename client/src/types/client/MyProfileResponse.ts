import type { ClientProfile } from "./ClientProfile";

export interface MyProfileResponse {
  success: boolean;
  message: string;
  data: ClientProfile;
}