import { useEffect, useState } from "react";
import type { TrainerClient } from "../../types/trainer/TrainerClient";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import { Users, User, Search, ChevronRight, X } from "lucide-react";

export default function TrainerClientsPage({ trainerApi }: { trainerApi: ITrainerAPIService }) {
  const [items, setItems] = useState<TrainerClient[]>([]);
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<TrainerClient | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await trainerApi.listMyClients();
      if (r.success) setItems(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

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

            <button
              onClick={() => setSelectedClient(c)}
              className="
                w-full flex items-center justify-between
                py-3 px-4 rounded-xl
                bg-white/5 border border-white/5
                hover:bg-amber-400 hover:text-black hover:border-amber-400/30
                transition-all
              "
            >
              <span className="text-[11px] font-semibold uppercase tracking-widest">
                View profile
              </span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/80"
          onClick={() => setSelectedClient(null)}
        />

        <div
          className="
            relative w-full max-w-2xl
            bg-[#111118] border border-[#27273a]
            rounded-2xl overflow-hidden
            shadow-[0_30px_90px_rgba(0,0,0,0.70)]
            opacity-0 animate-fade-in-up
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
              <div className="bg-[#0a0a0f] border border-[#27273a] p-4 rounded-xl">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Gender
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {selectedClient.gender || "Not provided"}
                </p>
              </div>

              <div className="bg-[#0a0a0f] border border-[#27273a] p-4 rounded-xl">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Age
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {selectedClient.age ? `${selectedClient.age}` : "—"}
                </p>
              </div>
            </div>

            <div className="h-48 w-full bg-[#0a0a0f] border border-[#27273a] rounded-2xl flex items-center justify-center text-slate-500 text-sm">
              Charts placeholder (Recharts)
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);}