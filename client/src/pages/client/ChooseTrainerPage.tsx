import { useEffect, useState } from "react";
import type { IClientAPIService } from "../../api_services/client/IClientAPIService";

interface ChooseTrainerPageProps {
  clientApi: IClientAPIService;
}

export default function ChooseTrainerPage({ clientApi }: ChooseTrainerPageProps) {
  const [list, setList] = useState<{id:number; name:string; email:string}[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const resp = await clientApi.listTrainers();
    setLoading(false);
    if (resp.success && resp.data) setList(resp.data);
  };

  const choose = async (id:number) => {
    const r = await clientApi.chooseTrainer(id);
    if (r.success) window.location.href = "/app/sessions";
    else alert(r.message);
  };

  useEffect(()=>{ load(); },[]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Choose Your Trainer</h1>
        <p className="text-gray-600">Pick a trainer to unlock sessions and programs</p>
      </header>

      <div className="grid gap-4">
        {loading ? <div>Loading...</div> :
          list.map(t=>(
            <div key={t.id} className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-gray-600">{t.email}</div>
              </div>
              <button onClick={()=>choose(t.id)} className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-semibold hover:bg-emerald-700 transition">
                Select
              </button>
            </div>
          ))
        }
      </div>
    </section>
  );
}