import { User } from "../../models/User";

export interface IUserRepository {
  create(user: User): Promise<User>;
  getById(id: number): Promise<User>;
  getByUsername(korisnickoIme: string): Promise<User>;
  getAll(): Promise<User[]>;
  update(user: User): Promise<User>;
  delete(id: number): Promise<boolean>;
  exists(id: number): Promise<boolean>;
  updateBasicInfo(input: {
    id: number;
    ime: string;
    prezime: string;
    datumRodjenja: Date | null;
    pol: 'musko' | 'zensko';
  }): Promise<boolean>;
  setBlocked(id: number, blokiran: boolean): Promise<boolean>;
  updateAssignedTrainer(userId: number, trainerId: number): Promise<void>;
  listTrainers(): Promise<{ id: number; name: string; email: string }[]>;
  getAssignedTrainerId(userId: number): Promise<number | null>;
  updatePassword(userId: number, hashedPassword: string): Promise<void>;
  // Billing
  startTrial(userId: number, trialStartedAt: Date, trialEndsAt: Date): Promise<void>;
  setBillingStatus(userId: number, status: User['billing_status']): Promise<void>;
  setCurrentPlan(userId: number, planId: number, anchorDate: Date): Promise<void>;
  setPendingPlan(userId: number, planId: number | null): Promise<void>;
  applyPendingPlan(userId: number): Promise<void>;
  getClientCountForTrainer(trainerId: number): Promise<number>;
  getBillingInfo(userId: number): Promise<{
    billing_status: User['billing_status'];
    trial_ends_at: Date | null;
    current_plan_id: number | null;
    pending_plan_id: number | null;
    billing_customer_code: number | null;
    billing_anchor_date: Date | null;
  } | null>;
}