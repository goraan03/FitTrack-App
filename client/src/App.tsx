import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/landing/LandingPage";
import PrijavaStranica from "./pages/auth/PrijavaStranica";
import RegistracijaStranica from "./pages/auth/RegistracijaStranica";
import NotFoundPage from "./pages/not_found/NotFoundPage";

import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";

import { authApi } from "./api_services/auth/AuthAPIService";
import { adminApi } from "./api_services/admin/AdminAPIService";
import { clientApi } from "./api_services/client/ClientAPIService";
import { programsApi } from "./api_services/programs/ProgramsAPIService";
import { trainerApi } from "./api_services/trainer/TrainerAPIService";

import AdminLayout from "./layouts/AdminLayout";
import AdminCreateTrainerPage from "./pages/admin/AdminCreateTrainerPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminAuditLogPage from "./pages/admin/AdminAuditLogPage";

import ClientLayout from "./layouts/ClientLayout";
import ClientDashboardPage from "./pages/client/ClientDashboardPage";
import ClientSessionsPage from "./pages/client/ClientSessionsPage";
import ClientHistoryPage from "./pages/client/ClientHistoryPage";
import ClientProfilePage from "./pages/client/ClientProfilePage";
import ChooseTrainerPage from "./pages/client/ChooseTrainerPage";
import ClientProgramsPage from "./pages/client/ClientProgramsPage";

import TrainerProfilePage from "./pages/trainer/TrainerProfilePage";

import LegacyRedirect from "./routes/LegacyRedirect";
import RequireTrainer from "./components/protected_route/equireTrainer";
import TrainerDashboardPage from "./pages/trainer/TrainerDashboardPage";
import TrainerLayout from "./layouts/TrainerLayout";
import LogoutPage from "./pages/auth/LogoutPage";
import TrainerExercisesPage from "./pages/trainer/TrainerExercisesPage";
import TrainerProgramsPage from "./pages/trainer/TrainerProgramsPage";
import TrainerTermsPage from "./pages/trainer/TrainerTermsPage";
import TrainerClientsPage from "./pages/trainer/TrainerClientsPage";

export default function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Legacy redirects */}
      <Route path="/dashboard" element={<LegacyRedirect />} />
      <Route path="/coach" element={<LegacyRedirect />} />

      {/* Auth */}
      <Route path="/login" element={<PrijavaStranica authApi={authApi} />} />
      <Route path="/register" element={<RegistracijaStranica authApi={authApi} />} />
      <Route path="/logout" element={<LogoutPage />} />

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
        <Route path="create-trainer" element={<AdminCreateTrainerPage adminApi={adminApi} />} />
        <Route path="users" element={<AdminUsersPage adminApi={adminApi} />} />
        <Route path="audit" element={<AdminAuditLogPage adminApi={adminApi} />} />
      </Route>

      {/* Client */}
      <Route
        path="/app"
        element={
          <ProtectedRoute requiredRole="klijent">
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="choose-trainer" element={<ChooseTrainerPage clientApi={clientApi} />} />
        <Route element={<RequireTrainer />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboardPage clientApi={clientApi} />} />
          <Route path="sessions" element={<ClientSessionsPage clientApi={clientApi} />} />
          <Route path="programs" element={<ClientProgramsPage programsApi={programsApi} />} />
          <Route path="history" element={<ClientHistoryPage clientApi={clientApi} />} />
          <Route path="profile" element={<ClientProfilePage clientApi={clientApi} />} />
        </Route>
      </Route>

      {/* Trainer */}
      <Route
        path="/trainer"
        element={
          <ProtectedRoute requiredRole="trener">
            <TrainerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<TrainerDashboardPage trainerApi={trainerApi}/>} />
        <Route path="profile" element={<TrainerProfilePage trainerApi={trainerApi} />} />
        <Route path="exercises" element={<TrainerExercisesPage trainerApi={trainerApi} />} />
        <Route path="programs" element={<TrainerProgramsPage trainerApi={trainerApi} />} />
        <Route path="terms" element={<TrainerTermsPage trainerApi={trainerApi} />} />
        <Route path="clients" element={<TrainerClientsPage trainerApi={trainerApi} />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}