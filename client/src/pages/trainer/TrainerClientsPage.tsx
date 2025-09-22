import { useEffect, useState } from "react";
import type { TrainerClient } from "../../types/trainer/TrainerClient";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";

interface TrainerClientsPageProps { trainerApi: ITrainerAPIService; }

export default function TrainerClientsPage({ trainerApi }: TrainerClientsPageProps) {
  const [items, setItems] = useState<TrainerClient[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await trainerApi.listMyClients();
      if (r.success) setItems(r.data);
    } finally { setLoading(false); }
  };

  useEffect(()=> { load(); }, []);

  return (
    <div className="relative space-y-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(600px_200px_at_10%_0%,rgba(253,224,71,0.06),transparent),radial-gradient(500px_200px_at_90%_10%,rgba(253,224,71,0.04),transparent)]" />
      <h1 className="relative text-3xl font-bold text-white">Your Clients</h1>
      {loading ? <div className="relative text-gray-400">Loading...</div> : (
        <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(c => (
            <div key={c.id} className="bg-white/90 backdrop-blur-sm text-black rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="font-semibold">{c.firstName || ''} {c.lastName || ''}</div>
              <div className="text-sm text-gray-600">{c.email}</div>
              <div className="text-xs text-gray-500">{c.gender || ''} {c.age ? `• ${c.age}y` : ''}</div>
            </div>
          ))}
          {items.length===0 && <div className="col-span-full text-sm text-gray-400">No clients yet.</div>}
        </div>
      )}
    </div>
  );
}