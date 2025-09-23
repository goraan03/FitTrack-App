import { useEffect, useState } from "react";
import type { IProgramsAPIService } from "../../api_services/programs/IProgramsAPIService";
import { Search } from "lucide-react";
import type { PublicProgram } from "../../types/programs/PublicProgram";
import { clientApi } from "../../api_services/client/ClientAPIService";
import ProgramDetailsModal from "../../components/client/ProgramDetailsModal";
import type { ProgramDetails } from "../../types/programs/ProgramDetails";

interface ClientProgramsPageProps {
  programsApi: IProgramsAPIService;
}

export default function ClientProgramsPage({ programsApi }: ClientProgramsPageProps) {
  const [items, setItems] = useState<PublicProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<"" | "beginner" | "intermediate" | "advanced">("");
  const [trainerId, setTrainerId] = useState<number | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // details modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<ProgramDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setProfileLoading(true);
        const profileRes = await clientApi.getMyProfile();
        if (!alive) return;

        const data = (profileRes as any)?.data ?? {};
        const tIdRaw = data?.assignedTrainerId ?? null;
        const cIdRaw = data?.id ?? data?.userId ?? data?.user?.id ?? null;

        const tId = typeof tIdRaw === "string" ? Number(tIdRaw) : tIdRaw;
        const cId = typeof cIdRaw === "string" ? Number(cIdRaw) : cIdRaw;

        setTrainerId(typeof tId === "number" && !Number.isNaN(tId) ? tId : null);
        setClientId(typeof cId === "number" && !Number.isNaN(cId) ? cId : null);
      } catch {
        if (!alive) return;
        setTrainerId(null);
        setClientId(null);
      } finally {
        if (alive) setProfileLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const load = async () => {
    if (trainerId == null || clientId == null) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await programsApi.listVisible({
        q: q || undefined,
        level: level || undefined,
        trainerId,
        clientId,
      });
      if (res.success && res.data) setItems(res.data);
      else setItems([]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trainerId != null && clientId != null) void load();
  }, [trainerId, clientId]);

  const openProgramDetails = async (programId: number) => {
    if (trainerId == null || clientId == null) return;
    setDetailsLoading(true);
    try {
      const res = await programsApi.getVisibleDetails({ programId, trainerId, clientId });
      if (res.success && res.data) {
        setDetailsData(res.data);
        setDetailsOpen(true);
      } else {
        alert(res.message || "Details not available");
      }
    } catch (e: any) {
      alert(e?.message || "Failed to load details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const header = (
    <header>
      <h1 className="text-3xl font-bold tracking-tight text-yellow-500">Programs</h1>
      <p className="text-gray-400">Programs of your trainer</p>
    </header>
  );
  const isFiltered = Boolean(q || level);

  if (profileLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {header}
        <div className="rounded-2xl border border-gray-200 bg-white text-black p-4 shadow">
          Loading profile…
        </div>
      </section>
    );
  }
  if (!trainerId) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {header}
        <div className="rounded-2xl border border-yellow-300 bg-yellow-50 text-yellow-900 p-4 shadow">
          Select a trainer to see their programs.
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {header}

      <div className="bg-white text-black rounded-2xl border border-gray-200 shadow p-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              placeholder="Search programs..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>
          <select
            className="rounded-xl border border-gray-200 px-3 py-2.5 bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
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
            className="px-4 py-2.5 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-500 shadow"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white text-black p-4 shadow">
            Loading programs…
          </div>
        ) : items.length === 0 ? (
          <div className="text-gray-400">
            {isFiltered
              ? "No programs found for the given filters."
              : "The trainer currently has no programs for you."}
          </div>
        ) : (
          items.map((p) => (
            <div
              key={p.id}
              className="bg-white text-black rounded-2xl border border-gray-200 shadow p-5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">{p.title}</div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                  {p.level}
                </span>
              </div>
              <div className="text-sm text-gray-600">{p.description || "—"}</div>
              <div className="text-sm text-gray-500">Author: {p.trainerName}</div>
              <div className="pt-2">
                <button
                  onClick={() => openProgramDetails(p.id)}
                  className="inline-flex items-center rounded-xl bg-yellow-400 text-black px-4 py-2 font-semibold hover:bg-yellow-500 transition shadow disabled:opacity-60"
                  disabled={detailsLoading}
                >
                  {detailsLoading ? "Loading…" : "View Details"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ProgramDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        data={detailsData || undefined}
      />
    </section>
  );
}