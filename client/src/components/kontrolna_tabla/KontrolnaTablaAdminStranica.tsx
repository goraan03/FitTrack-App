import CreateTrainerForm from "../../components/admin/CreateTrainerForm";
import UsersTable from "../../components/admin/UsersTable";
import { adminApi } from "../../api_services/admin/AdminAPIService";

export default function KontrolnaTablaAdminStranica() {
  return (
    <main className="relative min-h-screen px-4 py-10 text-white bg-black">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(700px_250px_at_10%_0%,rgba(253,224,71,0.07),transparent),radial-gradient(600px_250px_at_90%_10%,rgba(253,224,71,0.05),transparent)]" />
      <div className="relative max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Admin Control Panel</h1>
          <p className="text-gray-400">Create trainers, view and manage users.</p>
        </header>

        <CreateTrainerForm adminApi={adminApi} />
        <UsersTable adminApi={adminApi} />
      </div>
    </main>
  );
}