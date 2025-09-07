import { useEffect, useState } from "react";
import type { ProgramListItem } from "../../types/trainer/Program";
import type { TrainerTerm } from "../../types/trainer/Term";
import { format } from "date-fns";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";

interface TrainerTermsPageProps {
  trainerApi: ITrainerAPIService;
}

export default function TrainerTermsPage({ trainerApi }: TrainerTermsPageProps) {
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [terms, setTerms] = useState<TrainerTerm[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    programId: 0,
    type: 'individual' as 'individual'|'group',
    startDate: '',
    startTime: '',
    durationMin: 60,
    capacity: 1,
  });

  const load = async () => {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([trainerApi.listPrograms(), trainerApi.listTerms()]);
      if (p.success) setPrograms(p.data);
      if (t.success) setTerms(t.data);
    } finally { setLoading(false); }
  };

  useEffect(()=> { load(); }, []);

  useEffect(()=> {
    if (form.type === 'individual') setForm(f => ({...f, capacity: 1}));
  }, [form.type]);

  const save = async () => {
    if (!form.programId) return alert('Pick program');
    if (!form.startDate || !form.startTime) return alert('Pick date and time');
    const startAtISO = new Date(`${form.startDate}T${form.startTime}:00`).toISOString();
    const r = await trainerApi.createTerm({
      programId: Number(form.programId),
      type: form.type,
      startAtISO,
      durationMin: Number(form.durationMin || 60),
      capacity: Number(form.capacity || 1),
    });
    if (!r.success) return alert(r.message);
    await load();
    alert('Term created');
  };

  const cancel = async (id: number) => {
    if (!confirm('Cancel this term?')) return;
    const r = await trainerApi.cancelTerm(id);
    if (!r.success) return alert(r.message);
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Terms</h1>

      <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500">Program</label>
            <select value={form.programId} onChange={e=> setForm(f=> ({...f, programId: Number(e.target.value)}))}
                    className="w-full rounded-lg border px-3 py-2">
              <option value={0}>Pick a program</option>
              {programs.map(p=> <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Type</label>
            <select value={form.type} onChange={e=> setForm(f=> ({...f, type: e.target.value as any}))}
                    className="w-full rounded-lg border px-3 py-2">
              <option value="individual">individual</option>
              <option value="group">group</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Date</label>
            <input type="date" value={form.startDate} onChange={e=> setForm(f=> ({...f, startDate: e.target.value}))}
                   className="w-full rounded-lg border px-3 py-2"/>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Time</label>
            <input type="time" value={form.startTime} onChange={e=> setForm(f=> ({...f, startTime: e.target.value}))}
                   className="w-full rounded-lg border px-3 py-2"/>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Duration (min)</label>
            <input type="number" value={form.durationMin} onChange={e=> setForm(f=> ({...f, durationMin: Number(e.target.value)}))}
                   className="w-full rounded-lg border px-3 py-2"/>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Capacity</label>
            <input type="number" disabled={form.type==='individual'} value={form.capacity}
                   onChange={e=> setForm(f=> ({...f, capacity: Number(e.target.value)}))}
                   className="w-full rounded-lg border px-3 py-2"/>
            <div className="text-[11px] text-gray-500 mt-1">Individual = 1; Group up to 30</div>
          </div>
          <div className="md:col-span-3 flex items-center justify-end">
            <button onClick={save} className="px-3 py-2 rounded-xl bg-emerald-600 text-white">Create</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-sm p-4">
        <h3 className="font-semibold">Upcoming terms</h3>
        <div className="mt-3 divide-y">
          {terms.map(t => (
            <div key={t.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{t.programTitle}</div>
                <div className="text-xs text-gray-500">
                  {format(new Date(t.startAt), 'PPpp')} • {t.type} • {t.enrolledCount}/{t.capacity} {t.canceled ? '• canceled' : ''}
                </div>
              </div>
              <button onClick={()=> cancel(t.id)} disabled={t.canceled} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white disabled:opacity-40">
                Cancel
              </button>
            </div>
          ))}
          {terms.length===0 && <div className="text-sm text-gray-500">No terms.</div>}
        </div>
      </div>
    </div>
  );
}