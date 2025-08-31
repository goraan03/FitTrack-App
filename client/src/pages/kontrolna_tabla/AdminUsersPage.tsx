import UsersTable from "../../components/admin/UsersTable";
import { adminApi } from "../../api_services/admin/AdminAPIService";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Korisnici</h1>
        <p className="text-gray-600">Pregled i upravljanje korisnicima.</p>
      </header>

      <UsersTable adminApi={adminApi} />
    </div>
  );
}