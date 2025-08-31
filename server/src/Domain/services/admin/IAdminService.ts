export interface CreateTrainerDto {
  korisnickoIme: string;
  lozinka: string;
  ime: string;
  prezime: string;
  datumRodjenja?: string;
  pol: 'musko' | 'zensko';
}

export interface UpdateUserDto {
  ime: string;
  prezime: string;
  datumRodjenja?: string | null;
  pol: 'musko' | 'zensko';
}

export interface IAdminService {
  createTrainer(input: CreateTrainerDto, performedByUserId: number, performedByUsername: string): Promise<{ id: number }>;
  listUsers(filters?: { uloga?: 'klijent' | 'trener' | 'admin'; blokiran?: boolean }): Promise<any[]>;
  setBlocked(userId: number, blokiran: boolean, performedByUserId: number, performedByUsername: string): Promise<void>;
  updateUserBasicInfo(userId: number, input: UpdateUserDto, performedByUserId: number, performedByUsername: string): Promise<void>;

  getAuditLogs(params: {
    page: number; pageSize: number; category?: 'Informacija'|'Upozorenje'|'Greška'; userId?: number; search?: string;
  }): Promise<{ items: any[]; total: number }>;
}