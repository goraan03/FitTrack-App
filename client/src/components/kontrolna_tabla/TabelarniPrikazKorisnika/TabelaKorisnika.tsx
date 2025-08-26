import { useEffect, useState } from "react";
import type { IUsersAPIService } from "../../../api_services/users/IUsersAPIService";
import type { UserDto } from "../../../models/users/UserDto";
import { RedUTabeliKorisnika } from "./RedUTabeliKorisnika";
import { useAuth } from "../../../hooks/auth/useAuthHook";
import { ObrišiVrednostPoKljuču } from "../../../helpers/local_storage";

interface TabelaKorisnikaProps {
  usersApi: IUsersAPIService;
}

export function TabelaKorisnika({ usersApi }: TabelaKorisnikaProps) {
  const [korisnici, setKorisnici] = useState<UserDto[]>([]);
  const { token, logout } = useAuth();

   const handleLogout = () => {
    ObrišiVrednostPoKljuču("authToken");
    logout();
  };

  useEffect(() => {
    (async () => {
      const data = await usersApi.getSviKorisnici(token ?? "");
      setKorisnici(data);
    })();
  }, [token, usersApi]);

  return (
    <div className="bg-white/30 backdrop-blur-lg border border-gray-300 shadow-xl rounded-2xl p-6 w-full max-w-4xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        Списак корисника
      </h2>
      <table className="w-full table-auto border-collapse text-left">
        <thead>
          <tr className="text-gray-700 border-b border-gray-300">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Корисничко име</th>
            <th className="px-4 py-2">Улога</th>
          </tr>
        </thead>
        <tbody>
          {korisnici.length > 0 ? (
            korisnici.map((korisnik) => (
              <RedUTabeliKorisnika key={korisnik.id} korisnik={korisnik} />
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center text-gray-500 py-4">
                Нема корисника за приказ.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button
        onClick={handleLogout}
        className="mt-8 px-4 bg-red-700/60 hover:bg-red-700/70 text-white py-2 rounded-xl ransition"
      >
        Напусти контролну таблу
      </button>
    </div>
  );
}
