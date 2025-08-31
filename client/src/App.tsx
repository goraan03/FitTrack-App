import { Routes, Route, Navigate } from "react-router-dom";

import PrijavaStranica from "./pages/auth/PrijavaStranica";
import RegistracijaStranica from "./pages/auth/RegistracijaStranica";
import NotFoundPage from "./pages/not_found/NotFoundPage";

import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";
import { authApi } from "./api_services/auth/AuthAPIService";

import AdminLayout from "./layouts/AdminLayout";
import AdminCreateTrainerPage from "./pages/kontrolna_tabla/AdminCreateTrainerPage";
import AdminUsersPage from "./pages/kontrolna_tabla/AdminUsersPage";
import AdminAuditLogPage from "./pages/kontrolna_tabla/AdminAuditLogPage";
import LegacyRedirect from "./routes/LegacyRedirect";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Stare/nepostojeće rute bez 404 */}
      <Route path="/dashboard" element={<LegacyRedirect />} />
      <Route path="/coach" element={<LegacyRedirect />} />

      <Route path="/login" element={<PrijavaStranica authApi={authApi} />} />
      <Route path="/register" element={<RegistracijaStranica authApi={authApi} />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="users" replace />} />
        <Route path="create-trainer" element={<AdminCreateTrainerPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="audit" element={<AdminAuditLogPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}