// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/landing/LandingPage";
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

import ClientLayout from "./layouts/ClientLayout";
import ClientDashboardPage from "./pages/client/ClientDashboardPage";
import ClientSessionsPage from "./pages/client/ClientSessionsPage";
import ClientHistoryPage from "./pages/client/ClientHistoryPage";
import ClientProfilePage from "./pages/client/ClientProfilePage";
import ChooseTrainerPage from "./pages/client/ChooseTrainerPage";
import ClientProgramsPage from "./pages/client/ClientProgramsPage";

export default function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Legacy redirects (stare putanje) */}
      <Route path="/dashboard" element={<LegacyRedirect />} />
      <Route path="/coach" element={<LegacyRedirect />} />

      {/* Auth */}
      <Route path="/login" element={<PrijavaStranica authApi={authApi} />} />
      <Route path="/register" element={<RegistracijaStranica authApi={authApi} />} />

      {/* Admin */}
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

      {/* Client (klijent) */}
      <Route
        path="/app"
        element={
          <ProtectedRoute requiredRole="klijent">
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboardPage />} />
        <Route path="sessions" element={<ClientSessionsPage />} />
        <Route path="programs" element={<ClientProgramsPage />} />
        <Route path="history" element={<ClientHistoryPage />} />
        <Route path="profile" element={<ClientProfilePage />} />
        <Route path="choose-trainer" element={<ChooseTrainerPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}