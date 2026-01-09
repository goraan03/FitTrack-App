export interface TrainerBillingRow {
    trainerId: number;
    trainerName: string;
    trainerEmail: string;
    clientCount: number;
}

export interface IBillingRepository {
    getTrainersWithClientCount(): Promise<TrainerBillingRow[]>;
}