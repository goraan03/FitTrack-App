import { RowDataPacket } from "mysql2";
import db from "../../connection/DbConnectionPool";
import { IPlansRepository } from "../../../Domain/repositories/plans/IPlansRepository";
import { Plan } from "../../../Domain/models/Plan";

type PlanRow = RowDataPacket & {
  id: number;
  name: 'STARTER' | 'GROWTH' | 'PRO' | 'UNLIMITED';
  max_clients: number;
  price_eur: number | string;
  tier: number;
};

export class PlansRepository implements IPlansRepository {
  private mapRow(r: PlanRow): Plan {
    return new Plan(r.id, r.name, r.max_clients, Number(r.price_eur), r.tier);
  }

  async getAll(): Promise<Plan[]> {
    const [rows] = await db.execute<PlanRow[]>(
      'SELECT * FROM plans ORDER BY tier ASC'
    );
    return rows.map(r => this.mapRow(r));
  }

  async getById(id: number): Promise<Plan | null> {
    const [rows] = await db.execute<PlanRow[]>(
      'SELECT * FROM plans WHERE id = ?', [id]
    );
    return rows.length > 0 ? this.mapRow(rows[0]) : null;
  }

  async getByTier(tier: number): Promise<Plan | null> {
    const [rows] = await db.execute<PlanRow[]>(
      'SELECT * FROM plans WHERE tier = ?', [tier]
    );
    return rows.length > 0 ? this.mapRow(rows[0]) : null;
  }
}