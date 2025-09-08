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

  const TypeBadge = ({ type }: { type: 'individual'|'group' }) => {
    const styles = type === 'group'
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
      : "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100";
    const label = type === 'group' ? 'Group' : 'Individual';
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>{label}</span>;
  };

  const CanceledBadge = () => (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-rose-50 text-rose-700 ring-1 ring-rose-100">
      Canceled
    </span>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Terms</h1>
      </div>

      {/* Form card */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Program</label>
            <select
              value={form.programId}
              onChange={e=> setForm(f=> ({...f, programId: Number(e.target.value)}))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            >
              <option value={0}>Pick a program</option>
              {programs.map(p=> <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Type</label>
            <select
              value={form.type}
              onChange={e=> setForm(f=> ({...f, type: e.target.value as any}))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            >
              <option value="individual">individual</option>
              <option value="group">group</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={e=> setForm(f=> ({...f, startDate: e.target.value}))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={e=> setForm(f=> ({...f, startTime: e.target.value}))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Duration (min)</label>
            <input
              type="number"
              value={form.durationMin}
              onChange={e=> setForm(f=> ({...f, durationMin: Number(e.target.value)}))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider">Capacity</label>
            <input
              type="number"
              disabled={form.type==='individual'}
              value={form.capacity}
              onChange={e=> setForm(f=> ({...f, capacity: Number(e.target.value)}))}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
            <div className="text-[11px] text-gray-500 mt-1">Individual = 1; Group up to 30</div>
          </div>

          <div className="md:col-span-12 flex items-center justify-end">
            <button
              onClick={save}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
            >
              Create
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming terms */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900">Upcoming terms</h3>
        <div className="mt-3 divide-y divide-gray-100">
          {loading ? (
            <div className="py-8 text-sm text-gray-500 text-center">Loading…</div>
          ) : terms.length > 0 ? (
            terms.map(t => (
              <div key={t.id} className="py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{t.programTitle}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {format(new Date(t.startAt), 'PPpp')}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <TypeBadge type={t.type as 'individual'|'group'} />
                    <span className="text-xs text-gray-600">{t.enrolledCount}/{t.capacity}</span>
                    {t.canceled && <CanceledBadge />}
                  </div>
                </div>
                <button
                  onClick={()=> cancel(t.id)}
                  disabled={t.canceled}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
                >
                  Cancel
                </button>
              </div>
            ))
          ) : (
            <div className="py-8 text-sm text-gray-500 text-center">No terms.</div>
          )}
        </div>
      </div>
    </div>
  );
}