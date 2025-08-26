export type LoginStep1Response = {
  success: boolean;
  message: string;
  data?: {
    challengeId: string;
    expiresAt: string; // ISO
    maskedEmail: string;
  };
};