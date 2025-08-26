import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { authApi } from "./api_services/auth/AuthAPIService";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";
import PrijavaStranica from "./pages/auth/PrijavaStranica";
import RegistracijaStranica from "./pages/auth/RegistracijaStranica";
import KontrolnaTablaUserStranica from "./pages/kontrolna_tabla/KontrolnaTablaUserStranica";
import KontrolnaTablaAdminStranica from "./pages/kontrolna_tabla/KontrolnaTablaAdminStranica";
import NotFoundStranica from "./pages/not_found/NotFoundPage";
import { usersApi } from "./api_services/users/UsersAPIService";
import KontrolnaTablaTrenerStranica from "./pages/kontrolna_tabla/KontrolnaTablaTrenerStranica";
import LogoutPage from "./pages/auth/LogoutPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<PrijavaStranica authApi={authApi} />} />
      <Route path="/register" element={<RegistracijaStranica authApi={authApi} />} />
      <Route path="/404" element={<NotFoundStranica />} />
      <Route path="/logout" element={<LogoutPage />} />

      {/* klijent */}
      <Route
        path="/user-dashboard"
        element={
          <ProtectedRoute requiredRole="klijent">
            <KontrolnaTablaUserStranica />
          </ProtectedRoute>
        }
      />

      {/* trener */}
      <Route
        path="/trener-dashboard"
        element={
          <ProtectedRoute requiredRole="trener">
            <KontrolnaTablaTrenerStranica />
          </ProtectedRoute>
        }
      />

      {/* admin */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <KontrolnaTablaAdminStranica usersApi={usersApi} />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch-all bez Navigate */}
      <Route path="*" element={<NotFoundStranica />} />
    </Routes>
  );
}

export default App;