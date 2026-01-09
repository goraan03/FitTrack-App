import { RowDataPacket } from "mysql2";
import { IBillingRepository, TrainerBillingRow } from "../../../Domain/repositories/billing/IBillingRepository";
import db from "../../connection/DbConnectionPool";

export class BillingRepository implements IBillingRepository {
    async getTrainersWithClientCount(): Promise<TrainerBillingRow[]> {
        const [rows] = await db.execute<RowDataPacket[]>(
            `
            SELECT
                t.id AS trainerId,
                CONCAT(t.ime, ' ', t.prezime) AS trainerName,
                t.korisnickoIme AS trainerEmail,
                COUNT(c.id) AS clientCount
            FROM users t
            LEFT JOIN users c
                ON c.assigned_trener_id = t.id
                AND c.uloga = 'klijent'
            WHERE t.uloga = 'trener'
            GROUP BY t.id, t.ime, t.prezime, t.korisnickoIme
            HAVING clientCount > 0
            `
        );

        return (rows as any[]).map((r) => ({
            trainerId: Number(r.trainerId),
            trainerName: r.trainerName,
            trainerEmail: r.trainerEmail,
            clientCount: Number(r.clientCount),
        }));
    }
}