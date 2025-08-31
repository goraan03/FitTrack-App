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
}