import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PročitajVrednostPoKljuču } from "../../helpers/local_storage";
import { useAuth } from "../../hooks/auth/useAuthHook";
import type { IUsersAPIService } from "../../api_services/users/IUsersAPIService";
import { TabelaKorisnika } from "../../components/kontrolna_tabla/TabelarniPrikazKorisnika/TabelaKorisnika";

interface KontrolnaTablaAdminStranicaProps {
  usersApi: IUsersAPIService;
}

export default function KontrolnaTablaAdminStranica({ usersApi }: KontrolnaTablaAdminStranicaProps) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = PročitajVrednostPoKljuču("authToken");

    if (!isAuthenticated || !token) {
      logout();
      navigate("/login");
    }
  }, [isAuthenticated, logout, navigate]);

  return (
    <main className="min-h-screen bg-gradient-to-tr from-slate-600/75 to-orange-800/70 flex items-center justify-center">
      <TabelaKorisnika usersApi={usersApi} />
    </main>
  );
}
