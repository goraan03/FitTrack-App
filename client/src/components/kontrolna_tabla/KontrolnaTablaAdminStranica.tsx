import CreateTrainerForm from "../../components/admin/CreateTrainerForm";
import UsersTable from "../../components/admin/UsersTable";
import { adminApi } from "../../api_services/admin/AdminAPIService";

export default function KontrolnaTablaAdminStranica() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Admin kontrolna tabla</h1>
          <p className="text-gray-600">Kreirajte trenere, pregledajte i upravljajte korisnicima.</p>
        </header>

        <CreateTrainerForm adminApi={adminApi} />

        <UsersTable adminApi={adminApi} />
      </div>
    </main>
  );
}