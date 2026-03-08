import { Plan } from "../../models/Plan";

export interface IPlansRepository {
  getAll(): Promise<Plan[]>;
  getById(id: number): Promise<Plan | null>;
  getByTier(tier: number): Promise<Plan | null>;
}