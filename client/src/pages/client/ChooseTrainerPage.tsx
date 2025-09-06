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
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Choose Your Trainer</h1>
        <p className="text-gray-600">Pick a trainer to unlock sessions and programs</p>
      </header>

      {loading && <div className="text-gray-600">Učitavanje...</div>}

      {error && !loading && (
        <div className="rounded-lg bg-red-50 text-red-700 p-3 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {!loading && !error && list.length === 0 && (
        <div className="text-gray-600">Nema dostupnih trenera.</div>
      )}

      {!loading && !error && list.length > 0 && (
        <div className="grid gap-4">
          {list.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-gray-600">{t.email}</div>
              </div>
              <button
                onClick={() => choose(t.id)}
                disabled={actionLoading === t.id}
                className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
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