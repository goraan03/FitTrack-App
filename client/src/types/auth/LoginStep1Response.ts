export type LoginStep1Response = {
  success: boolean;
  message: string;
  data?: {
    challengeId: string;
    expiresAt: string;
    maskedEmail: string;
  };
};