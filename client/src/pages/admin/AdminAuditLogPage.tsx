import AuditLogTable from "../../components/admin/AuditLogTable";
import { adminApi } from "../../api_services/admin/AdminAPIService";
import { FileText } from "lucide-react";

interface AdminAuditLogPageProps {
  adminApi: typeof adminApi;
}

export default function AdminAuditLogPage({ adminApi }: AdminAuditLogPageProps) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <FileText className="h-7 w-7 text-emerald-600" />
          Audit Log
        </h1>
        <p className="text-gray-600 mt-1">Records of significant events in the system</p>
      </header>

      <AuditLogTable adminApi={adminApi} />
    </div>
  );
}