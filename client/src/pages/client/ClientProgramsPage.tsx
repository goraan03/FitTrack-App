import { useEffect, useState } from "react";
import type { IProgramsAPIService } from "../../api_services/programs/IProgramsAPIService";
import { Search } from "lucide-react";
import type { PublicProgram } from "../../types/programs/PublicProgram";
import { clientApi } from "../../api_services/client/ClientAPIService";

interface ClientProgramsPageProps {
  programsApi: IProgramsAPIService;
}

export default function ClientProgramsPage({ programsApi }: ClientProgramsPageProps) {
  const [items, setItems] = useState<PublicProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<'' | 'beginner' | 'intermediate' | 'advanced'>('');
  const [trainerId, setTrainerId] = useState<number | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setProfileLoading(true);
        const profileRes = await clientApi.getMyProfile();
        if (!alive) return;

        const tIdRaw = (profileRes as any)?.data?.assignedTrainerId ?? null;
        const tId = typeof tIdRaw === 'string' ? Number(tIdRaw) : tIdRaw;

        setTrainerId(typeof tId === 'number' && !Number.isNaN(tId) ? tId : null);
      } catch {
        if (!alive) return;
        setTrainerId(null);
      } finally {
        if (alive) setProfileLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const load = async () => {
    if (trainerId == null) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await programsApi.listPublic({
        q: q || undefined,
        level: level || undefined,
        trainerId,
      });
      if (res.success && res.data) setItems(res.data);
      else setItems([]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (trainerId != null) void load(); }, [trainerId]);

  const header = (
    <header>
      <h1 className="text-3xl font-extrabold tracking-tight">Programs</h1>
      <p className="text-gray-600">Programs of your trainer</p>
    </header>
  );

  const isFiltered = Boolean(q || level);

  if (profileLoading) {
    return (
      <section className="space-y-6">
        {header}
        <div className="text-gray-500">Loading profile…</div>
      </section>
    );
  }

  if (!trainerId) {
    return (
      <section className="space-y-6">
        {header}
        <div className="bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200 rounded-2xl p-4">
          Select a trainer to see their programs.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {header}

      <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
              placeholder="Pretraži programe..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>
          <select
            className="rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500"
            value={level}
            onChange={(e) => setLevel(e.target.value as any)}
          >
            <option value="">All levels</option>
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
          <div className="text-gray-500">Loading programs…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">
            {isFiltered ? 'No programs found for the given filters.' : 'The trainer currently has no published programs.'}
          </div>
        ) : (
          items.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">{p.title}</div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                  {p.level}
                </span>
              </div>
              <div className="text-sm text-gray-600">{p.description || "—"}</div>
              <div className="text-sm text-gray-500">Autor: {p.trainerName}</div>
              <div className="pt-2">
                <a href="/app/sessions" className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-semibold hover:bg-emerald-700 transition">
                  View Sessions
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}