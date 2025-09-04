import { useEffect, useState } from "react";
import type { IClientAPIService } from "../../api_services/client/IClientAPIService";
//DI!!!
//npm run build PROVERA GRESAKA

interface ClientHistoryPageProps {
  clientApi: IClientAPIService;
}

export default function ClientHistoryPage({ clientApi }: ClientHistoryPageProps) {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total:number; avgRating:number|null }>({ total:0, avgRating:null });

  const load = async () => {
    const resp = await clientApi.getHistory();
    if (resp.success && resp.data) {
      setItems(resp.data.items);
      setStats(resp.data.stats);
    }
  };

  useEffect(()=>{ load(); },[]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">My Progress 📈</h1>
        <p className="text-gray-600">Your completed sessions and ratings</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-2xl p-5">
          <div className="text-sm text-gray-600">Sessions Attended</div>
          <div className="text-3xl font-bold mt-2">{stats.total}</div>
        </div>
        <div className="bg-indigo-50 ring-1 ring-indigo-200 rounded-2xl p-5">
          <div className="text-sm text-gray-600">Average Rating</div>
          <div className="text-3xl font-bold mt-2">{stats.avgRating ?? 'N/A'}</div>
        </div>
        <div className="bg-orange-50 ring-1 ring-orange-200 rounded-2xl p-5">
          <div className="text-sm text-gray-600">Streak</div>
          <div className="text-3xl font-bold mt-2">—</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">History</h3>
        </div>
        <div className="divide-y">
          {items.length===0 ? (
            <div className="p-6 text-gray-500">No data available yet</div>
          ) : items.map((it)=>(
            <div key={it.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{it.programTitle}</div>
                <div className="text-sm text-gray-600">{new Date(it.date).toLocaleString()} • {it.trainerName}</div>
              </div>
              <div className="text-sm">{it.rating ? `Rating: ${it.rating}` : it.status}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}