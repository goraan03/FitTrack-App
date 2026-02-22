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
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-amber-400 selection:text-black">
      <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-white/5 via-white/0 to-transparent pointer-events-none" />

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10 pb-20 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 opacity-0 animate-fade-in-up">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
              My <span className="text-amber-400">Programs</span>
            </h1>
            <p className="text-slate-400 text-sm uppercase tracking-widest mt-2">
              Programs of your trainer
            </p>
          </div>
        </div>

        {profileLoading ? (
          <div
            className="bg-[#111118] border border-[#27273a] rounded-2xl p-6 shadow-[0_18px_55px_rgba(0,0,0,0.55)] opacity-0 animate-fade-in-up stagger-1"
            style={{ animationFillMode: "forwards" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
              <div className="text-slate-400 text-sm font-semibold uppercase tracking-widest">
                Loading profile…
              </div>
            </div>
          </div>
        ) : !trainerId ? (
          <div
            className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-6 shadow-[0_18px_55px_rgba(0,0,0,0.55)] opacity-0 animate-fade-in-up stagger-1"
            style={{ animationFillMode: "forwards" }}
          >
            <div className="text-amber-300 font-black uppercase tracking-widest text-xs">
              No trainer assigned
            </div>
            <div className="text-slate-300 mt-2">
              Select a trainer to see their programs.
            </div>
          </div>
        ) : (
          <>
            {/* FILTERS */}
            <div
              className="bg-[#111118] border border-[#27273a] rounded-2xl p-4 sm:p-5 shadow-[0_18px_55px_rgba(0,0,0,0.55)] opacity-0 animate-fade-in-up stagger-1"
              style={{ animationFillMode: "forwards" }}
            >
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    className="
                      w-full rounded-xl border border-white/5
                      pl-11 pr-4 py-3 bg-black/30 text-white
                      placeholder:text-slate-500 text-sm font-semibold
                      focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/40
                    "
                    placeholder="Search programs..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && load()}
                  />
                </div>

                <select
                  className="
                    rounded-xl border border-white/5
                    px-4 py-3 bg-black/30 text-white
                    text-sm font-semibold
                    focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/40
                    appearance-none cursor-pointer
                  "
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
                  className="
                    px-5 py-3 rounded-xl
                    bg-gradient-to-r from-amber-400 to-amber-500
                    text-[#0a0a0f] font-black text-xs uppercase tracking-widest
                    hover:from-amber-500 hover:to-amber-600 transition
                    shadow-[0_18px_45px_rgba(251,191,36,0.12)]
                    active:scale-[0.99]
                  "
                >
                  Apply
                </button>
              </div>
            </div>

            {/* LIST */}
            <div
              className="opacity-0 animate-fade-in-up stagger-2"
              style={{ animationFillMode: "forwards" }}
            >
              {loading ? (
                <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-8 shadow-[0_18px_55px_rgba(0,0,0,0.55)]">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                    <div className="text-slate-400 text-sm font-semibold uppercase tracking-widest">
                      Loading programs…
                    </div>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-12 text-center shadow-[0_18px_55px_rgba(0,0,0,0.55)]">
                  <div className="text-6xl mb-3">📦</div>
                  <div className="text-slate-300 font-black uppercase tracking-widest text-sm">
                    {Boolean(q || level)
                      ? "No programs found for the given filters."
                      : "The trainer currently has no programs for you."}
                  </div>
                  <div className="text-slate-500 text-sm mt-2">
                    Try adjusting search or level.
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p, idx) => (
                    <div
                      key={p.id}
                      className="
                        bg-[#111118] border border-[#27273a]
                        rounded-2xl p-6 shadow-[0_18px_55px_rgba(0,0,0,0.55)]
                        card-hover overflow-hidden
                      "
                      style={{ animationDelay: `${0.07 * idx}s` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-black uppercase tracking-tight text-white truncate">
                            {p.title}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">
                            Author: <span className="text-slate-300">{p.trainerName}</span>
                          </div>
                        </div>

                        <span
                          className="
                            shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                            bg-white/5 text-slate-200 border border-white/10
                          "
                        >
                          {p.level}
                        </span>
                      </div>

                      <div className="mt-3 text-sm text-slate-400 line-clamp-3 min-h-[60px]">
                        {p.description || "—"}
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={() => openProgramDetails(p.id)}
                          disabled={detailsLoading}
                          className="
                            w-full inline-flex items-center justify-center
                            rounded-xl px-5 py-3
                            bg-gradient-to-r from-amber-400 to-amber-500
                            text-[#0a0a0f] font-black text-xs uppercase tracking-widest
                            hover:from-amber-500 hover:to-amber-600 transition
                            shadow-[0_18px_45px_rgba(251,191,36,0.12)]
                            disabled:opacity-60 disabled:cursor-not-allowed
                          "
                        >
                          {detailsLoading ? "Loading…" : "View Details"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ProgramDetailsModal
              open={detailsOpen}
              onClose={() => setDetailsOpen(false)}
              data={detailsData || undefined}
            />
          </>
        )}
      </section>
    </div>
  );
}