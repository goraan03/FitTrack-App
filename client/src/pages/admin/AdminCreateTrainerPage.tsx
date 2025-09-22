import CreateTrainerForm from "../../components/admin/CreateTrainerForm";
import { adminApi } from "../../api_services/admin/AdminAPIService";
import { UserPlus } from "lucide-react";

interface AdminCreateTrainerPageProps { adminApi: typeof adminApi; }

export default function AdminCreateTrainerPage({ adminApi }: AdminCreateTrainerPageProps) {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <header className="relative">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <UserPlus className="h-7 w-7 text-yellow-400" />
          Create Trainer
        </h1>
        <p className="text-gray-400 mt-1">Add new trainers to the system</p>
      </header>

      <div className="relative">
        <CreateTrainerForm adminApi={adminApi} />
      </div>
    </div>
  );
}