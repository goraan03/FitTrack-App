import type { UserDto } from "../../models/users/UserDto";

/**
 * Interfejs za korisnicki servis.
 */
export interface IUsersAPIService {
    getSviKorisnici(token: string): Promise<UserDto[]>;
}