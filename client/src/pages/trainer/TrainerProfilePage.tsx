import { useEffect, useState, useMemo } from "react";
import { Avatar } from "../../components/client/Avatar";
import { StatCard } from "../../components/client/StatCard";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import type { TrainerProfile } from "../../types/trainer/TrainerProfile";

export default function TrainerProfilePage({ trainerApi }: { trainerApi: ITrainerAPIService }) {
  const [data, setData] = useState<TrainerProfile|null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);

  useEffect(()=>{(async()=>{try{const r=await trainerApi.getMyProfile(); if(r.success) setData(r.data); else setErr(r.message);}catch(e:any){setErr(e?.message||"Error");}finally{setLoading(false);}})();},[trainerApi]);

  const fullName=useMemo(()=> data?`${data.firstName||""} ${data.lastName||""}`.trim()||data.email:"", [data]);

  return(
    <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(600px_200px_at_10%_0%,rgba(253,224,71,0.06),transparent),radial-gradient(500px_200px_at_90%_10%,rgba(253,224,71,0.04),transparent)]" />

      <div className="relative rounded-2xl bg-gradient-to-r from-black to-yellow-500/40 p-6 shadow">
        <div className="flex items-center gap-4">
          <Avatar name={fullName} src={data?.avatarUrl??null}/>
          <div className="text-white">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-yellow-200">Public information</p>
            {data?.isBlocked && <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-red-600 text-white text-sm">Account is blocked</span>}
          </div>
          <div className="ml-auto text-right text-white">
            <div className="font-semibold">{fullName}</div>
            <div className="text-yellow-200 text-sm">{data?.email}</div>
          </div>
        </div>
      </div>

      {loading? <div className="relative text-gray-400">Loading…</div>: err?<div className="relative bg-red-50 text-red-600 p-3 rounded">{err}</div>: data&&(
        <>
          <div className="relative grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Completed Sessions" value={data.stats.sessionsCompleted??0}/>
            <StatCard label="Programs" value={data.stats.totalPrograms??0}/>
            <StatCard label="Total Hours" value={(data.stats.totalHours??0).toFixed(1)}/>
          </div>
          <div className="relative bg-white/90 text-black rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-black">Profile</h3>
            <div className="mt-4 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="text-gray-900">{data.firstName||"—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Surname</span><span className="text-gray-900">{data.lastName||"—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-900">{data.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Gender</span><span className="text-gray-900">{data.gender??"—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Age</span><span className="text-gray-900">{data.age??"—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="text-gray-900">{data.address??"—"}</span></div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}