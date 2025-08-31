import AuditLogTable from "../../components/admin/AuditLogTable";
import { adminApi } from "../../api_services/admin/AdminAPIService";

export default function AdminAuditLogPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Audit log</h1>
        <p className="text-gray-600">Zapisi bitnih događaja u sistemu.</p>
      </header>

      <AuditLogTable adminApi={adminApi} />
    </div>
  );
}