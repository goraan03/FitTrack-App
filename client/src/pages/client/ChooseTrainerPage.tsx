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
  const [actionLoading, setActionLoading] = useState<number | null>(null); // id trenera koji se bira

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await clientApi.listTrainers();
      if (resp.success && Array.isArray(resp.data)) {
        setList(resp.data);
      } else {
        setError(resp.message || "Neuspelo učitavanje trenera");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Greška pri učitavanju trenera";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const choose = async (id: number) => {
    setActionLoading(id);
    try {
      const r = await clientApi.chooseTrainer(id);
      if (r.success) {
        // nakon izbora, guard će pustiti pristup ostatku app
        window.location.href = "/app/sessions";
      } else {
        alert(r.message || "Nije uspelo biranje trenera");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Greška pri biranju trenera";
      alert(msg);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Choose Your Trainer</h1>
        <p className="text-gray-600">Pick a trainer to unlock sessions and programs</p>
      </header>

      {loading && (
        <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-4 text-gray-600 shadow-sm">
          Učitavanje...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 text-red-800 p-4 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && list.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-4 text-gray-600 shadow-sm">
          Nema dostupnih trenera.
        </div>
      )}

      {!loading && !error && list.length > 0 && (
        <div className="grid gap-4">
          {list.map((t) => (
            <div
              key={t.id}
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-gray-900">{t.name}</div>
                <div className="text-sm text-gray-600">{t.email}</div>
              </div>
              <button
                onClick={() => choose(t.id)}
                disabled={actionLoading === t.id}
                className="inline-flex items-center rounded-xl bg-emerald-600 text-white px-4 py-2.5 font-semibold hover:bg-emerald-700 transition disabled:opacity-60 shadow-sm"
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