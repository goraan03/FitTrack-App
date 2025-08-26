export type Resend2FAResponse = {
  success: boolean;
  message: string;
  data?: {
    challengeId: string;
    expiresAt: string;
  };
};