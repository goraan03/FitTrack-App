import { useEffect, useState } from "react";
import type { ProgramListItem } from "../../types/trainer/Program";
import type { TrainerTerm } from "../../types/trainer/Term";
import { format } from "date-fns";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";

export default function TrainerTermsPage({ trainerApi }: { trainerApi: ITrainerAPIService }) {
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [terms, setTerms] = useState<TrainerTerm[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ programId: 0, type: 'individual' as 'individual'|'group', startDate: '', startTime: '', durationMin: 60, capacity: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([trainerApi.listPrograms(), trainerApi.listTerms()]);
      if (p.success) setPrograms(p.data);
      if (t.success) setTerms(t.data);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);
  useEffect(()=>{ if(form.type==='individual') setForm(f=>({...f,capacity:1})); },[form.type]);

  const save = async () => {
    if (!form.programId) return alert('Pick program');
    if (!form.startDate || !form.startTime) return alert('Pick date and time');
    const startAtISO = new Date(`${form.startDate}T${form.startTime}:00`).toISOString();
    const r=await trainerApi.createTerm({programId:Number(form.programId), type:form.type, startAtISO, durationMin:form.durationMin, capacity:form.capacity});
    if (!r.success) return alert(r.message);
    await load(); alert('Term created');
  };
  const cancel = async (id: number) => {
    if(!confirm('Cancel?'))return;
    const r=await trainerApi.cancelTerm(id);
    if(!r.success)return alert(r.message);
    await load();
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 space-y-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(600px_200px_at_10%_0%,rgba(253,224,71,0.06),transparent),radial-gradient(500px_200px_at_90%_10%,rgba(253,224,71,0.04),transparent)]" />
      <h1 className="relative text-3xl font-bold text-white">Terms</h1>

      <div className="relative bg-white/90 text-black rounded-2xl border p-5 shadow-sm backdrop-blur-sm">
        <div className="grid gap-4 md:grid-cols-12">
          <select value={form.programId} onChange={e=>setForm(f=>({...f,programId:Number(e.target.value)}))}
            className="md:col-span-5 border rounded px-3 py-2 bg-white text-black focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
            <option value={0}>Pick program</option>
            {programs.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value as any}))}
            className="md:col-span-3 border rounded px-3 py-2 bg-white text-black focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
            <option value="individual">Individual</option><option value="group">Group</option>
          </select>
          <input type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))}
            className="md:col-span-2 border rounded px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"/>
          <input type="time" value={form.startTime} onChange={e=>setForm(f=>({...f,startTime:e.target.value}))}
            className="md:col-span-2 border rounded px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"/>
          <input type="number" value={form.durationMin} onChange={e=>setForm(f=>({...f,durationMin:Number(e.target.value)}))}
            className="md:col-span-2 border rounded px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"/>
          <input type="number" disabled={form.type==='individual'} value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:Number(e.target.value)}))}
            className="md:col-span-2 border rounded px-3 py-2 bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"/>
          <button onClick={save} className="md:col-span-2 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-400/90 text-black">Create</button>
        </div>
      </div>

      <div className="relative bg-white/90 text-black rounded-2xl border p-5 shadow-sm backdrop-blur-sm">
        <h3 className="font-semibold text-black">Upcoming terms</h3>
        <div className="mt-3 divide-y">
          {loading? <div className="text-center text-gray-500">Loading…</div> : terms.map(t=>(
            <div key={t.id} className="py-3 flex justify-between">
              <div>
                <div className="font-medium text-black">{t.programTitle}</div>
                <div className="text-xs text-gray-600">{format(new Date(t.startAt),'PPpp')}</div>
              </div>
              <button onClick={()=>cancel(t.id)} disabled={t.canceled}
                className="px-3 py-1.5 rounded border border-yellow-400 text-yellow-700 hover:bg-yellow-400/10 disabled:opacity-40">
                Cancel
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}