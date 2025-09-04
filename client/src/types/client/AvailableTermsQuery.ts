export interface AvailableTermsQuery {
  fromISO?: string;
  toISO?: string;
  type?: 'individual' | 'group';
  programId?: number;
  status?: 'free' | 'full';
}