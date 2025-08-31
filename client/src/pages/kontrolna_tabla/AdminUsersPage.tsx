import UsersTable from "../../components/admin/UsersTable";
import { adminApi } from "../../api_services/admin/AdminAPIService";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-emerald-600" />
            Lista korisnika
          </h1>
          <p className="text-gray-600 mt-1">Pregled i upravljanje korisnicima sistema</p>
        </div>
      </header>

      <UsersTable adminApi={adminApi} />
    </div>
  );
}