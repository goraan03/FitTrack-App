import { UserDto } from "../../DTOs/users/UserDto";

export interface IUserService {
  getSviKorisnici(): Promise<UserDto[]>;
}