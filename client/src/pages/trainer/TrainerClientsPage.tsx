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

  // Search now matches full name combos too (e.g. "Marko Nikolic")
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
    <div className="min-h-screen bg-[#0d0d0d] text-gray-100 font-sans pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-10 space-y-8">
        
        {/* HEADER SA SEARCH-OM */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#161616] p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-4">
             <Users className="w-8 h-8 text-yellow-400" />
             <h1 className="text-2xl font-black uppercase tracking-tight">Klijenti</h1>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Pretraži klijente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm focus:border-yellow-400 outline-none"
            />
          </div>
        </div>

        {/* GRID KARTICA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(c => (
            <div key={c.id} className="bg-[#161616] border border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 flex items-center justify-center">
                  <User className="text-yellow-400" />
                </div>
                <div className="text-left"> {/* SIMETRIJA: Sve levo poravnato */}
                  <h3 className="font-black uppercase text-white">{c.firstName} {c.lastName}</h3>
                  <p className="text-xs text-gray-500 truncate max-w-[180px]">{c.email}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedClient(c)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-yellow-400 hover:text-black transition-all group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Prikaži Profil</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL ZA FULL PROFILE */}
      {selectedClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedClient(null)} />
          <div className="relative bg-[#161616] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-yellow-400 flex items-center justify-center text-black font-black text-2xl">
                    {(selectedClient.firstName?.[0] ?? "").toUpperCase()}{(selectedClient.lastName?.[0] ?? "").toUpperCase()}
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-black uppercase text-white">{selectedClient.firstName} {selectedClient.lastName}</h2>
                    <p className="text-yellow-400 text-sm font-bold">{selectedClient.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* STATISTIKA / CHARTOVI (Placeholder za sada) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-gray-500 uppercase">Pol</p>
                  <p className="font-bold">{selectedClient.gender || "Nije uneto"}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-gray-500 uppercase">Godine</p>
                  <p className="font-bold">{selectedClient.age ? `${selectedClient.age} g` : "—"}</p>
                </div>
              </div>

              <div className="h-48 w-full bg-black/20 rounded-3xl border border-white/5 flex items-center justify-center italic text-gray-600">
                Ovde ćemo ubaciti Recharts (napredak težina kroz vreme)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
