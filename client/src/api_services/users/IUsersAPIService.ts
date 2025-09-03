import type { UserDto } from "../../models/users/UserDto";
export interface IUsersAPIService {
    getSviKorisnici(token: string): Promise<UserDto[]>;
}