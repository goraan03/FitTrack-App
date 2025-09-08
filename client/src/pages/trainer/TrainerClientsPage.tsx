import { useEffect, useState } from "react";
import type { TrainerClient } from "../../types/trainer/TrainerClient";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";

interface TrainerClientsPageProps {
  trainerApi: ITrainerAPIService;
}

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Clients</h1>
      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(c => (
            <div key={c.id} className="bg-white rounded-2xl ring-1 ring-gray-200 p-4">
              <div className="font-semibold">{c.firstName || ''} {c.lastName || ''}</div>
              <div className="text-sm text-gray-600">{c.email}</div>
              <div className="text-xs text-gray-500">{c.gender || ''} {c.age ? `• ${c.age}y` : ''}</div>
              {/* Link ka javnom profilu klijenta – ovde stavite vašu postojeću rutu javnog profila */}
              {/* Primer: <Link to={`/public/clients/${c.id}`} ...>View profile</Link> */}
            </div>
          ))}
          {items.length===0 && <div className="col-span-full text-sm text-gray-500">No clients yet.</div>}
        </div>
      )}
    </div>
  );
}