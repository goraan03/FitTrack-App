import UsersTable from "../../components/admin/UsersTable";
import { adminApi } from "../../api_services/admin/AdminAPIService";
import { Users } from "lucide-react";

interface AdminUsersPageProps { adminApi: typeof adminApi; }

export default function AdminUsersPage({ adminApi }: AdminUsersPageProps) {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <header className="relative">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Users className="h-7 w-7 text-yellow-400" />
          List of Users
        </h1>
        <p className="text-gray-400 mt-1">Overview and management of system users</p>
      </header>

      <div className="relative">
        <UsersTable adminApi={adminApi} />
      </div>
    </div>
  );
}