export interface PlanInfo {
  id: number;
  name: 'STARTER' | 'GROWTH' | 'PRO' | 'UNLIMITED';
  max_clients: number;
  price_eur: number;
  tier: number;
}

export interface BillingStatus {
  billing_status: 'trial' | 'active' | 'past_due' | 'suspended' | 'none';
  trial_ends_at: string | null;
  current_plan: PlanInfo | null;
  pending_plan: PlanInfo | null;
  client_count: number;
  billing_customer_code: number | null;
}

export interface PendingRequest {
  id: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  createdAt: string;
}