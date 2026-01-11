import { IAdminService, CreateTrainerDto, UpdateUserDto } from "../../Domain/services/admin/IAdminService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { IAuditService } from "../../Domain/services/audit/IAuditService";
import { User } from "../../Domain/models/User";
import bcrypt from "bcryptjs";
import { parseOptionalDate } from "../../utils/date/DateUtils";
import { InvoicesRepository } from "../../Database/repositories/invoice/InvoicesRepository";
import { InvoiceRow } from "../../Domain/repositories/invoice/IInvoicesRepository";

export class AdminService implements IAdminService {
  constructor(
    private users: IUserRepository,
    private audit: IAuditService,
    private invoiceRepo: InvoicesRepository
  ) {}

  async createTrainer(input: CreateTrainerDto, byId: number, byUsername: string): Promise<{ id: number }> {
    const exists = await this.users.getByUsername(input.korisnickoIme);
    if (exists.id !== 0) throw new Error('Korisnik sa tim email-om već postoji');

    const hash = await bcrypt.hash(input.lozinka, 10);
    const u = new User(0, input.korisnickoIme, hash, 'trener', input.ime, input.prezime, parseOptionalDate(input.datumRodjenja || undefined), input.pol);
    const created = await this.users.create(u);
    if (created.id === 0) throw new Error('Kreiranje trenera nije uspelo');

    await this.audit.log('Informacija', 'ADMIN_CREATE_TRAINER', byId, byUsername, { createdTrainerId: created.id, email: input.korisnickoIme });
    return { id: created.id };
  }

  async listUsers(filters?: { uloga?: 'klijent'|'trener'|'admin'; blokiran?: boolean }): Promise<any[]> {
    const all = await this.users.getAll();
    let list = all;
    if (filters?.uloga) list = list.filter(u => u.uloga === filters.uloga);
    if (typeof filters?.blokiran === 'boolean') list = list.filter(u => u.blokiran === filters.blokiran);

    return list.map(u => ({
      id: u.id,
      korisnickoIme: u.korisnickoIme,
      uloga: u.uloga,
      ime: u.ime,
      prezime: u.prezime,
      datumRodjenja: u.datumRodjenja ? u.datumRodjenja.toISOString().slice(0,10) : null,
      pol: u.pol,
      blokiran: u.blokiran
    }));
  }

  async setBlocked(userId: number, blokiran: boolean, byId: number, byUsername: string): Promise<void> {
    const ok = await this.users.setBlocked(userId, blokiran);
    if (!ok) throw new Error('Promena statusa nije uspela');
    await this.audit.log('Upozorenje', blokiran ? 'ADMIN_BLOCK_USER' : 'ADMIN_UNBLOCK_USER', byId, byUsername, { userId, blokiran });
  }

  async updateUserBasicInfo(userId: number, input: UpdateUserDto, byId: number, byUsername: string): Promise<void> {
    const ok = await this.users.updateBasicInfo({
      id: userId,
      ime: input.ime,
      prezime: input.prezime,
      datumRodjenja: input.datumRodjenja ? parseOptionalDate(input.datumRodjenja) : null,
      pol: input.pol
    });
    if (!ok) throw new Error('Ažuriranje nije uspelo');
    await this.audit.log('Informacija', 'ADMIN_UPDATE_USER', byId, byUsername, { userId });
  }

  async getAuditLogs(params: { page: number; pageSize: number; category?: 'Informacija'|'Upozorenje'|'Greška'; userId?: number; search?: string }) {
    const { items, total } = await this.audit.list(params);
    return {
      items: items.map(i => ({
        id: i.id,
        category: i.category,
        action: i.action,
        userId: i.userId,
        username: i.username,
        details: i.details,
        createdAt: i.createdAt.toISOString()
      })),
      total
    };
  }

  async getInvoices(params: { trainerId?: number; status?: "issued" | "paid" | "overdue" }): Promise<InvoiceRow[]> {
    return this.invoiceRepo.listInvoices(params);
  }

  async setInvoiceStatus(id: number, status: "issued" | "paid" | "overdue"): Promise<void> {
    return this.invoiceRepo.setStatus(id, status);
  }
}