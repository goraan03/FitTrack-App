export type BootInfoResponse = {
  success: boolean;
  message: string;
  data?: {
    bootId: string;
    startedAt: string;
  };
};