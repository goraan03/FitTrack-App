export function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white text-black p-4 shadow">
      <div className="text-gray-600 text-sm">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      {sub ? <div className="text-xs text-gray-500 mt-1">{sub}</div> : null}
    </div>
  );
}