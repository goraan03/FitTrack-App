import CreateTrainerForm from "../../components/admin/CreateTrainerForm";
import { adminApi } from "../../api_services/admin/AdminAPIService";
import { UserPlus } from "lucide-react";

export default function AdminCreateTrainerPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <UserPlus className="h-7 w-7 text-emerald-600" />
          Kreiranje trenera
        </h1>
        <p className="text-gray-600 mt-1">Dodajte nove trenere u sistem</p>
      </header>

      <CreateTrainerForm adminApi={adminApi} />
    </div>
  );
}