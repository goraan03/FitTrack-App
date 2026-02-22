import { useEffect, useMemo, useState } from "react";
import type { TrainerClient } from "../../types/trainer/TrainerClient";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import type { ProgramListItem } from "../../types/trainer/Program";
import { Users, User, Search, ChevronRight, X } from "lucide-react";
import ClientStatsModal from "../../components/trainer/ClientStatsModal";
import toast from "react-hot-toast";

export default function TrainerClientsPage({ trainerApi }: { trainerApi: ITrainerAPIService }) {
  const [items, setItems] = useState<TrainerClient[]>([]);
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<TrainerClient | null>(null);
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [programSessions, setProgramSessions] = useState<Record<number, { sessionId: number; date: string }[]>>({});
  const [openPrograms, setOpenPrograms] = useState<Record<number, boolean>>({});
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await trainerApi.listMyClients();
      if (r.success) setItems(r.data);
      const p = await trainerApi.listPrograms();
      if (p.success) setPrograms(p.data || []);
    } finally { setLoading(false); }
  };

  const [statsModal, setStatsModal] = useState<{ open: boolean; clientId: number | null }>({
    open: false,
    clientId: null
  });

  // load per-client recent sessions when profile opens
  useEffect(() => {
    const fetchSessions = async () => {
      if (!selectedClient) return;
      setSessionsLoading(true);
      try {
        const res = await trainerApi.getClientStats(selectedClient.id);
        if (!res.success) {
          toast.error(res.message || "Failed to load stats");
          return;
        }
        const map: Record<number, { sessionId: number; date: string }[]> = {};
        const seen = new Set<number>();
        (res.data?.exercises || []).forEach((ex: any) => {
          (ex.sessions || []).forEach((s: any) => {
            if (!s.sessionId || seen.has(s.sessionId)) return;
            seen.add(s.sessionId);
            const pid = s.programId;
            if (!pid) return;
            map[pid] = map[pid] || [];
            map[pid].push({ sessionId: s.sessionId, date: s.date });
          });
        });
        Object.keys(map).forEach((k) => {
          const pid = Number(k);
          map[pid] = map[pid]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);
        });
        setProgramSessions(map);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Error loading stats");
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchSessions();
  }, [selectedClient, trainerApi]);

  const selectedPrograms = useMemo(() => {
    if (!selectedClient) return [];
    return programs.filter((p) => (p.assignedClientIds || []).includes(selectedClient.id));
  }, [programs, selectedClient]);

  const toggleProgram = (id: number) => setOpenPrograms((prev) => ({ ...prev, [id]: !prev[id] }));
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => { load(); }, []);

  // Lock body scroll when profile modal open (better mobile UX)
  useEffect(() => {
    if (selectedClient) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [selectedClient]);

  const filteredClients = items.filter(c => {
    const searchStr = searchTerm.trim().toLowerCase();
    if (!searchStr) return true;

    const firstName = (c.firstName || "").toLowerCase();
    const lastName = (c.lastName || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    const full = `${firstName} ${lastName} ${email}`.trim();

    return full.includes(searchStr);
  });

return (
  <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-amber-400 selection:text-black">
    <div className="fixed top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-amber-400/5 via-amber-400/0 to-transparent pointer-events-none" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 sm:pb-12">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 sm:mb-10 opacity-0 animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#111118] border border-[#27273a] flex items-center justify-center">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              CLIENT <span className="text-amber-400">LIST</span>
            </h1>
            <p className="text-slate-400 text-sm tracking-wide uppercase">
              Search and view your clients
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-[360px] opacity-0 animate-fade-in-up stagger-1" style={{ animationFillMode: "forwards" }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full bg-[#111118] border border-[#27273a] rounded-xl
              py-3 pl-11 pr-4 text-sm text-white
              focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400/40
            "
          />
        </div>
      </div>

      {/* GRID */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 opacity-0 animate-fade-in-up stagger-2"
        style={{ animationFillMode: "forwards" }}
      >
        {filteredClients.map((c) => (
          <div
            key={c.id}
            className="
              group bg-[#111118] border border-[#27273a] rounded-2xl p-6
              shadow-[0_18px_60px_rgba(0,0,0,0.35)]
              hover:border-white/15 transition-all
            "
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/15 flex items-center justify-center">
                <User className="w-5 h-5 text-amber-300" />
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold text-white truncate">
                  {c.firstName} {c.lastName}
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-[240px]">
                  {c.email}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedClient(c)}
                className="
                  flex-1 flex items-center justify-between
                  py-3 px-4 rounded-xl
                  bg-white/5 border border-white/5
                  hover:bg-amber-400 hover:text-black hover:border-amber-400/30
                  transition-all
                "
              >
                <span className="font-semibold">View Profile</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => setStatsModal({ open: true, clientId: c.id })}
                className="px-4 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm uppercase transition"
              >
                Progress
              </button>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full">
            <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-12 text-center opacity-90">
              <Users className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                No clients found
              </p>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* MODAL */}
    {selectedClient && (
      <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 pt-20 sm:pt-24 overflow-y-auto">
        <div
          className="absolute inset-0 bg-black/80"
          onClick={() => setSelectedClient(null)}
        />

        <div
          className="
            relative w-full max-w-xl sm:max-w-2xl lg:max-w-3xl
            bg-[#111118] border border-[#27273a]
            rounded-2xl overflow-hidden
            shadow-[0_30px_90px_rgba(0,0,0,0.70)]
            opacity-0 animate-fade-in-up
            max-h-[90vh] overflow-y-auto
          "
          style={{ animationFillMode: "forwards" }}
        >
          {/* Header */}
          <div className="p-6 sm:p-7 border-b border-white/5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 text-[#0a0a0f] flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0">
                {(selectedClient.firstName?.[0] ?? "").toUpperCase()}
                {(selectedClient.lastName?.[0] ?? "").toUpperCase()}
              </div>

              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {selectedClient.firstName} {selectedClient.lastName}
                </h2>
                <p className="text-amber-300 text-sm font-semibold truncate">
                  {selectedClient.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedClient(null)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition-colors flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0a0a0f] border border-[#27273a] p-4 rounded-xl space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Email</p>
                <p className="text-sm font-semibold text-white break-all">{selectedClient.email}</p>
              </div>
              <div className="bg-[#0a0a0f] border border-[#27273a] p-4 rounded-xl space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Gender</p>
                <p className="text-sm font-semibold text-white">{selectedClient.gender || "Not provided"}</p>
              </div>
              <div className="bg-[#0a0a0f] border border-[#27273a] p-4 rounded-xl space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Age</p>
                <p className="text-sm font-semibold text-white">{selectedClient.age ? `${selectedClient.age}` : "—"}</p>
              </div>
              <div className="bg-[#0a0a0f] border border-[#27273a] p-4 rounded-xl space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Assigned Programs</p>
                <p className="text-sm font-semibold text-white">
                  {selectedPrograms.length ? `${selectedPrograms.length}` : "None"}
                </p>
              </div>
            </div>

            <div className="bg-[#0a0a0f] border border-[#27273a] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Programs</p>
                {sessionsLoading && <p className="text-[11px] text-slate-500">Loading sessions…</p>}
              </div>
              {selectedPrograms.length ? (
                <div className="divide-y divide-white/5">
                  {selectedPrograms.map((p) => {
                    const sessions = programSessions[p.id] || [];
                    const open = openPrograms[p.id];
                    return (
                      <div key={p.id} className="py-3">
                        <button
                          onClick={() => toggleProgram(p.id)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <div>
                            <p className="text-white font-semibold">{p.title}</p>
                            <p className="text-[11px] uppercase text-slate-500 tracking-widest">Level: {p.level}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 uppercase tracking-widest text-slate-300">
                              {p.isPublic ? "Public" : "Private"}
                            </span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`} />
                          </div>
                        </button>

                        {open && (
                          <div className="mt-3 space-y-2">
                            {sessions.length ? (
                              sessions.map((s) => (
                                <div
                                  key={s.sessionId}
                                  className="rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm text-slate-200 flex items-center justify-between"
                                >
                                  <span>Session #{s.sessionId}</span>
                                  <span className="text-slate-400 text-xs">{formatDate(s.date)}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-slate-500 text-sm">No recent sessions.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No programs assigned.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    <ClientStatsModal
      open={statsModal.open}
      clientId={statsModal.clientId}
      onClose={() => setStatsModal({ open: false, clientId: null })}
      trainerApi={trainerApi}
    />
  </div>
);
}
