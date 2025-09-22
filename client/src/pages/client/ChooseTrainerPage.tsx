import { useEffect, useState } from "react";
import type { IClientAPIService } from "../../api_services/client/IClientAPIService";

interface ChooseTrainerPageProps {
  clientApi: IClientAPIService;
}

type Trainer = { id: number; name: string; email: string };

export default function ChooseTrainerPage({ clientApi }: ChooseTrainerPageProps) {
  const [list, setList] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await clientApi.listTrainers();
      if (resp.success && Array.isArray(resp.data)) setList(resp.data);
      else setError(resp.message || "Neuspelo učitavanje trenera");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Greška pri učitavanju trenera");
    } finally {
      setLoading(false);
    }
  };

  const choose = async (id: number) => {
    setActionLoading(id);
    try {
      const r = await clientApi.chooseTrainer(id);
      if (r.success) window.location.href = "/app/sessions";
      else alert(r.message || "Nije uspelo biranje trenera");
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Greška pri biranju trenera");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-yellow-500">Choose Your Trainer</h1>
        <p className="text-gray-400">Pick a trainer to unlock sessions and programs</p>
      </header>

      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white text-black p-4 shadow">
          Učitavanje...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-800 p-4 shadow">
          {error}
        </div>
      )}

      {!loading && !error && list.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white text-black p-4 shadow">
          Nema dostupnih trenera.
        </div>
      )}

      {!loading && !error && list.length > 0 && (
        <div className="grid gap-4">
          {list.map((t) => (
            <div
              key={t.id}
              className="bg-white text-black rounded-2xl border border-gray-200 shadow p-5 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-gray-900">{t.name}</div>
                <div className="text-sm text-gray-600">{t.email}</div>
              </div>
              <button
                onClick={() => choose(t.id)}
                disabled={actionLoading === t.id}
                className="inline-flex items-center rounded-xl bg-yellow-400 text-black px-4 py-2.5 font-semibold hover:bg-yellow-500 transition disabled:opacity-60 shadow"
              >
                {actionLoading === t.id ? "Biranje..." : "Select"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}