export type AuthChallenge = {
  id: number;
  userId: number;
  codeHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  attempts: number;
  createdAt: Date;
};