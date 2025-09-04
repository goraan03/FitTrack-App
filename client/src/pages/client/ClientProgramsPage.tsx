// client/src/pages/client/ClientProgramsPage.tsx
import { useEffect, useState } from "react";
import type { IProgramsAPIService } from "../../api_services/programs/IProgramsAPIService";
import { Search } from "lucide-react";
import type { PublicProgram } from "../../types/programs/PublicProgram";

interface ClientProgramsPageProps {
  programsApi: IProgramsAPIService;
}

export default function ClientProgramsPage({ programsApi }: ClientProgramsPageProps) {
  const [items, setItems] = useState<PublicProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<''|'beginner'|'intermediate'|'advanced'>('');

  const load = async () => {
    setLoading(true);
    const res = await programsApi.listPublic({ q: q || undefined, level: level || undefined });
    setLoading(false);
    if (res.success && res.data) setItems(res.data);
    else setItems([]);
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Workout Programs ⭐</h1>
        <p className="text-gray-600">Explore public programs designed by trainers</p>
      </header>

      <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              placeholder="Search programs..."
              value={q}
              onChange={(e)=> setQ(e.target.value)}
              onKeyDown={(e)=> e.key==='Enter' && load()}
            />
          </div>
          <select
            className="rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
            value={level}
            onChange={(e)=> setLevel(e.target.value as any)}
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button
            onClick={load}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No programs found</div>
        ) : (
          items.map((p)=>(
            <div key={p.id} className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">{p.title}</div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                  {p.level}
                </span>
              </div>
              <div className="text-sm text-gray-600">{p.description || "—"}</div>
              <div className="text-sm text-gray-500">By {p.trainerName}</div>
              <div className="pt-2">
                <a href="/app/sessions" className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-semibold hover:bg-emerald-700 transition">
                  Browse Sessions
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}