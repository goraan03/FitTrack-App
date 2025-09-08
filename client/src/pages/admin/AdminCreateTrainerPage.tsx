import CreateTrainerForm from "../../components/admin/CreateTrainerForm";
import { adminApi } from "../../api_services/admin/AdminAPIService";
import { UserPlus } from "lucide-react";

interface AdminCreateTrainerPageProps {
  adminApi: typeof adminApi;
}

export default function AdminCreateTrainerPage({ adminApi }: AdminCreateTrainerPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <UserPlus className="h-7 w-7 text-emerald-600" />
          Create Trainer
        </h1>
        <p className="text-gray-600 mt-1">Add new trainers to the system</p>
      </header>

      <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-5 shadow-sm focus:outline-none">
        <CreateTrainerForm adminApi={adminApi} />
      </div>
    </div>
  );
}