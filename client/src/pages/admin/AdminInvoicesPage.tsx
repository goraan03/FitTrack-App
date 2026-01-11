import { adminApi } from "../../api_services/admin/AdminAPIService";
import InvoicesTable from "../../components/admin/InvoicesTable";
import { FileText } from "lucide-react";

interface Props { adminApi: typeof adminApi; }

export default function AdminInvoicesPage({ adminApi }: Props) {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <header className="relative">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <FileText className="h-7 w-7 text-yellow-400" />
          Invoices
        </h1>
        <p className="text-gray-400 mt-1">
          Overview of monthly invoices for trainers
        </p>
      </header>

      <div className="relative">
        <InvoicesTable adminApi={adminApi} />
      </div>
    </div>
  );
}