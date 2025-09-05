import UsersTable from "../../components/admin/UsersTable";
import { adminApi } from "../../api_services/admin/AdminAPIService";
import { Users } from "lucide-react";

interface AdminUsersPageProps {
  adminApi: typeof adminApi;
}

export default function AdminUsersPage({ adminApi }: AdminUsersPageProps) {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-emerald-600" />
            List of Users
          </h1>
          <p className="text-gray-600 mt-1">Overview and management of system users</p>
        </div>
      </header>

      <UsersTable adminApi={adminApi} />
    </div>
  );
}