export type AuthChallenge = {
  id: number;
  userId: number;
  codeHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  attempts: number;
  createdAt: Date;
};

export interface IAuthChallengeRepository {
  create(userId: number, codeHash: string, expiresAt: Date): Promise<number>;
  getById(id: number): Promise<AuthChallenge | null>;
  markConsumed(id: number): Promise<void>;
  incrementAttempts(id: number): Promise<void>;
}