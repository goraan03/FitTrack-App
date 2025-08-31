import CreateTrainerForm from "../../components/admin/CreateTrainerForm";
import { adminApi } from "../../api_services/admin/AdminAPIService";

export default function AdminCreateTrainerPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Kreiranje trenera</h1>
        <p className="text-gray-600">
          Dodajte nove trenere u sistem.
        </p>
      </header>

      <CreateTrainerForm adminApi={adminApi} />
    </div>
  );
}