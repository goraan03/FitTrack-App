import UsersTable from "../../components/admin/UsersTable";
import { adminApi } from "../../api_services/admin/AdminAPIService";
import { Users } from "lucide-react";

interface AdminUsersPageProps {
  adminApi: typeof adminApi;
}

export default function AdminUsersPage({ adminApi }: AdminUsersPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Users className="h-7 w-7 text-emerald-600" />
          List of Users
        </h1>
        <p className="text-gray-600 mt-1">Overview and management of system users</p>
      </header>

      <div className="rounded-2xl border border-gray-100 bg-white/70 p-5 shadow-sm">
        <UsersTable adminApi={adminApi} />
      </div>
    </div>
  );
}