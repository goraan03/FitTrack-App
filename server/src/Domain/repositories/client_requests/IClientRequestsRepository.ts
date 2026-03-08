import { ClientRequest } from "../../models/ClientRequest";

export interface IClientRequestsRepository {
  create(clientId: number, trainerId: number): Promise<number>;
  getById(id: number): Promise<ClientRequest | null>;
  getPendingForTrainer(trainerId: number): Promise<(ClientRequest & { clientName: string; clientEmail: string })[]>;
  getByClientAndTrainer(clientId: number, trainerId: number): Promise<ClientRequest | null>;
  approve(id: number): Promise<void>;
  reject(id: number): Promise<void>;
  getStatusForClient(clientId: number, trainerId: number): Promise<'pending' | 'approved' | 'rejected' | null>;
}