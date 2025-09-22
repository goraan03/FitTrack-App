import { useEffect, useState } from "react";
import type { IClientAPIService } from "../../api_services/client/IClientAPIService";

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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-yellow-500">My Progress 📈</h1>
        <p className="text-gray-400">Your completed sessions and ratings</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white text-black rounded-2xl border border-gray-200 shadow p-5">
          <div className="text-sm text-gray-600">Sessions Attended</div>
          <div className="text-3xl font-bold mt-2 text-yellow-500">{stats.total}</div>
        </div>
        <div className="bg-white text-black rounded-2xl border border-gray-200 shadow p-5">
          <div className="text-sm text-gray-600">Average Rating</div>
          <div className="text-3xl font-bold mt-2 text-yellow-500">{stats.avgRating ?? 'N/A'}</div>
        </div>
        <div className="bg-white text-black rounded-2xl border border-gray-200 shadow p-5">
          <div className="text-sm text-gray-600">Streak</div>
          <div className="text-3xl font-bold mt-2 text-yellow-500">—</div>
        </div>
      </div>

      <div className="bg-white text-black rounded-2xl border border-gray-200 shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">History</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {items.length===0 ? (
            <div className="p-6 text-gray-500">No data available yet</div>
          ) : items.map((it)=>(
            <div key={it.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{it.programTitle}</div>
                <div className="text-sm text-gray-600">{new Date(it.date).toLocaleString()} • {it.trainerName}</div>
              </div>
              <div className="text-sm text-gray-700">{it.rating ? `Rating: ${it.rating}` : it.status}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}