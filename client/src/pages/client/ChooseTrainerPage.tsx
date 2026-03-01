import { useEffect, useState } from "react";
import type { IClientAPIService } from "../../api_services/client/IClientAPIService";
import { useSettings } from "../../context/SettingsContext";

interface ChooseTrainerPageProps {
  clientApi: IClientAPIService;
  onTrainerChosen: () => void;
}

// Assuming User type is similar to Trainer or defined elsewhere, as per the edit's useState change
type User = { id: number; name: string; email: string };


export default function ChooseTrainerPage({ clientApi, onTrainerChosen }: ChooseTrainerPageProps) {
  const { t } = useSettings();
  const [trainers, setTrainers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await clientApi.listTrainers();
      if (resp.success && Array.isArray(resp.data)) setTrainers(resp.data);
      else setError(resp.message || t("failed_to_load_trainers"));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || t("error_loading_trainers"));
    } finally {
      setLoading(false);
    }
  };

  const choose = async (id: number) => {
    setActionLoading(id);
    try {
      const r = await clientApi.chooseTrainer(id);
      if (r.success) onTrainerChosen();
      else alert(r.message || t("failed_to_choose_trainer"));
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || t("error_choosing_trainer"));
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-yellow-500">
          {t('choose_trainer')}
        </h1>
        <p className="text-gray-400">
          {t('pick_trainer_subtitle')}
        </p>
      </header>

      {loading && (
        <div className="flex items-center justify-center p-12 text-gray-400">
          {t('loading')}...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-800 p-4 shadow">
          {error}
        </div>
      )}

      {!loading && !error && trainers.length === 0 && (
        <div className="text-center p-12 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
          {t('no_trainers_available')}
        </div>
      )}

      {!loading && !error && trainers.length > 0 && (
        <div className="grid gap-4">
          {trainers.map((tr) => (
            <div
              key={tr.id}
              className="bg-white text-black rounded-2xl border border-gray-200 shadow p-5 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-gray-900">{tr.name}</div>
                <div className="text-sm text-gray-600">{tr.email}</div>
              </div>
              <button
                onClick={() => choose(tr.id)}
                disabled={actionLoading === tr.id}
                className="inline-flex items-center rounded-xl bg-yellow-400 text-black px-4 py-2.5 font-semibold hover:bg-yellow-500 transition disabled:opacity-60 shadow"
              >
                {actionLoading === tr.id ? `${t('selecting')}...` : t('select')}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}