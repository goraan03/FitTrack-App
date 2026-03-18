import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../../components/client/Avatar";
import EditProfileModal from "../../components/profile/EditProfileModal";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import type { TrainerProfile } from "../../types/trainer/TrainerProfile";
import type { BillingStatus, PlanInfo } from "../../types/trainer/Billing";
import { User, Mail, MapPin, Calendar, Award, Activity, TrendingUp, Clock, Edit3, CreditCard, Users as UsersIcon, Zap } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import toast from "react-hot-toast";
import { LanguageSelect } from "../../components/common/LanguageSelect";

export default function TrainerProfilePage({ trainerApi }: { trainerApi: ITrainerAPIService }) {
  const navigate = useNavigate();
  const { t, theme, setTheme, language, setLanguage } = useSettings();

  const [data, setData] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setErr] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editErr, setEditErr] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [planActionLoading, setPlanActionLoading] = useState(false);
  const [planLocked, setPlanLocked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await trainerApi.getMyProfile();
        if (r.success) setData(r.data);
        else setErr(r.message);
        await refreshBilling();
      } catch (e: any) {
        setErr(e?.message || "Error");
        setBillingLoading(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [trainerApi]);

  const refreshBilling = async () => {
    setBillingLoading(true);
    try {
      const b = await trainerApi.getBillingStatus();
      if (b.success) setBilling(b.data);
    } finally {
      setBillingLoading(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("sr-RS");
    } catch {
      return "—";
    }
  };

  const openPlans = async () => {
    setPlansOpen(true);
    if (plans.length === 0) {
      setPlansLoading(true);
      try {
        const p = await trainerApi.listPlans();
        if (p.success) setPlans(p.data);
      } finally {
        setPlansLoading(false);
      }
    }
  };

  const handlePlanAction = async (plan: PlanInfo) => {
    if (!billing || planLocked) return;
    const current = billing.current_plan;
    const action =
      !current || billing.billing_status === 'trial'
        ? 'select'
        : plan.tier > current.tier
          ? 'upgrade'
          : plan.tier < current.tier
            ? 'downgrade'
            : null;

    if (!action || (current && plan.id === current.id)) return;

    setPlanActionLoading(true);
    try {
      let res;
      if (action === 'select') res = await trainerApi.selectPlan(plan.id);
      else if (action === 'upgrade') res = await trainerApi.upgradePlan(plan.id);
      else res = await trainerApi.downgradePlan(plan.id);

      if (res.success) {
        setPlanLocked(true);
        const actionMsg = action === 'select'
          ? t('activated')
          : action === 'upgrade'
            ? t('upgrade_scheduled')
            : t('downgrade_scheduled');
        toast.success(`${plan.name} ${actionMsg}`);
        await refreshBilling();
        setPlansOpen(false);
      } else {
        toast.error(res.message || t('error'));
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || t('error');
      if (msg.startsWith("PLAN_TOO_SMALL")) toast.error(t('too_many_clients_for_plan'));
      else if (msg.startsWith("DOWNGRADE_BLOCKED")) toast.error(t('reduce_clients_before_downgrade'));
      else if (msg === "NOT_AN_UPGRADE") toast.error(t('not_an_upgrade'));
      else toast.error(msg);
    } finally {
      setPlanActionLoading(false);
    }
  };

  const fullName = useMemo(() =>
    data ? `${data.firstName || ""} ${data.lastName || ""}`.trim() || data.email : "",
    [data]
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-amber-400 selection:text-black">
      <div className="fixed top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-amber-400/5 via-amber-400/0 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 sm:pb-12">
        {/* HERO */}
        <div className="relative z-20 bg-[#111118] border border-[#27273a] rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.40)] overflow-visible opacity-0 animate-fade-in-up">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative self-center sm:self-auto">
                <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-10 rounded-full" />
                <div className="relative ring-2 ring-amber-400/25 rounded-full p-1 bg-[#0a0a0f]">
                  <Avatar name={fullName} src={data?.avatarUrl ?? null} />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white truncate">
                  {fullName}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <p className="inline-flex items-center justify-center sm:justify-start gap-2 text-amber-300 text-[11px] font-semibold uppercase tracking-widest">
                    <Award className="w-4 h-4 text-amber-400" />
                    {t('certified_trainer')}
                  </p>

                  <span className="hidden sm:block w-1 h-1 bg-slate-700 rounded-full" />

                  <p className="text-slate-400 text-sm font-medium break-all sm:break-normal">
                    {data?.email}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full sm:w-auto flex flex-col gap-3 sm:items-end">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white text-sm font-semibold transition-all"
                  >
                    {theme === 'dark' ? t('light') : t('dark')}
                  </button>
                  <LanguageSelect
                    value={language}
                    onChange={l => setLanguage(l as any)}
                    options={[
                      { value: "English", label: "English" },
                      { value: "Serbian", label: "Srpski" },
                      { value: "Russian", label: "Русский" },
                      { value: "German", label: "Deutsch" },
                      { value: "Hungarian", label: "Magyar" },
                    ]}
                    className="w-full sm:w-48"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditErr(null);
                    setEditOpen(true);
                  }}
                  className="
                  w-full sm:w-auto px-6 py-3 rounded-xl
                  bg-white/5 hover:bg-white/10 border border-white/5
                  text-white text-sm font-semibold
                  transition-all flex items-center justify-center gap-2
                "
                >
                  <Edit3 className="w-4 h-4" />
                  {t('edit')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-slate-500 uppercase tracking-wide text-sm font-semibold">{t('loading')}...</p>
          </div>
        ) : data ? (
          <div className="mt-8 sm:mt-10 space-y-8">
            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 opacity-0 animate-fade-in-up stagger-1" style={{ animationFillMode: "forwards" }}>
              {[
                { label: t('sessions').toUpperCase(), val: data.stats.sessionsCompleted, icon: Activity, iconColor: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/15" },
                { label: t('programs').toUpperCase(), val: data.stats.totalPrograms, icon: TrendingUp, iconColor: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/15" },
                { label: t('total_hours').toUpperCase(), val: data.stats.totalHours?.toFixed(1), icon: Clock, iconColor: "text-cyan-300", bg: "bg-cyan-300/10", border: "border-cyan-300/15" },
              ].map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div
                    key={idx}
                    className="
                    bg-[#111118] border border-[#27273a]
                    rounded-2xl p-6
                    shadow-[0_18px_60px_rgba(0,0,0,0.30)]
                    hover:border-white/15 transition-all
                  "
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${s.iconColor}`} />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">{s.label}</p>
                        <p className="text-4xl font-bold text-white">{s.val ?? 0}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{t('overview')}</p>
                  </div>
                );
              })}
            </div>

            {/* DETAILS */}
            <div
              className="bg-[#111118] border border-[#27273a] rounded-2xl p-6 sm:p-8 shadow-[0_18px_60px_rgba(0,0,0,0.40)]
                      opacity-0 animate-fade-in-up stagger-2"
              style={{ animationFillMode: "forwards" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full" />
                <h2 className="text-lg sm:text-xl font-bold text-white">{t('personal_info').toUpperCase()}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: User, label: t('first_name'), value: data.firstName },
                  { icon: User, label: t('last_name'), value: data.lastName },
                  { icon: Mail, label: t('email'), value: data.email, isEmail: true },
                  { icon: Activity, label: t('gender'), value: data.gender },
                  { icon: Calendar, label: t('age'), value: data.age ? `${data.age}` : null },
                  { icon: MapPin, label: t('address'), value: data.address },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="
                      flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2
                      p-4 rounded-xl bg-[#0a0a0f] border border-[#27273a]
                    "
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{item.label}</span>
                      </div>

                      <span className={`text-sm font-semibold text-white ${item.isEmail ? "break-all sm:text-right" : "sm:text-right"}`}>
                        {item.value || "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BILLING CARD */}
            <div
              className="bg-[#111118] border border-[#27273a] rounded-2xl overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.40)] opacity-0 animate-fade-in-up stagger-3"
              style={{ animationFillMode: "forwards" }}
            >
              {/* Header sa gradijent pozadinom */}
              <div className="bg-gradient-to-r from-[#1a1a25] to-[#111118] px-6 py-4 border-b border-[#27273a] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em]">
                    {t('your_plan') || 'Vaš plan'}
                  </h2>
                </div>
                <button
                  onClick={openPlans}
                  disabled={!!billing?.pending_plan || planActionLoading || planLocked}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  {t('change_plan') || 'Promeni plan'}
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {billingLoading ? (
                  <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
                    <div className="w-5 h-5 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                    <span className="text-sm font-medium">{t('loading') || 'Učitavanje podataka...'}</span>
                  </div>
                ) : billing && billing.current_plan ? (
                  <div className="flex flex-col items-center">
                    {/* Centralni Bedž za Ime Paketa */}
                    <div className="text-center mb-8">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/80 mb-2 block">
                        {t('active_plan') || 'Trenutni paket'}
                      </span>
                      <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                        {billing.current_plan.name}
                      </h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                          {billing.billing_status === 'active' ? (t('active') || 'Active') : billing.billing_status}
                        </span>
                      </div>
                    </div>

                    {/* Detalji u Gridu */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-[#0a0a0f] border border-[#27273a] rounded-2xl p-5 text-center transition-hover hover:border-white/10">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{t('capacity') || 'Capacity'}</p>
                        <div className="flex items-center justify-center gap-2">
                          <UsersIcon className="w-4 h-4 text-cyan-400" />
                          <p className="text-xl font-bold text-white">
                            {billing.current_plan.max_clients === 9999 ? (t('unlimited') || 'Unlimited') : `${billing.current_plan.max_clients} ${t('clients') || 'clients'}`}
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#0a0a0f] border border-[#27273a] rounded-2xl p-5 text-center transition-hover hover:border-white/10">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{t('price') || 'Price'}</p>
                        <p className="text-xl font-bold text-white">
                          {billing.current_plan.price_eur.toFixed(2)} <span className="text-sm text-slate-400">EUR / {t('month') || 'month'}</span>
                        </p>
                      </div>

                      <div className="bg-[#0a0a0f] border border-[#27273a] rounded-2xl p-5 text-center transition-hover hover:border-white/10">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{t('next_renewal') || 'Next renewal'}</p>
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <p className="text-xl font-bold text-white">{formatDate(billing.trial_ends_at)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Info o trenutnom broju klijenata */}
                    <div className="mt-8 w-full flex flex-col items-center">
                      <div className="w-full max-w-md bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all duration-1000"
                          style={{ width: `${Math.min((billing.client_count / (billing.current_plan.max_clients || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="mt-3 text-xs text-slate-400 font-medium">
                        {t('using_clients')
                          .replace('{current}', String(billing.client_count))
                          .replace('{max}', billing.current_plan.max_clients === 9999 ? '∞' : String(billing.current_plan.max_clients))}
                      </p>
                    </div>

                    {/* Pending Plan Warning */}
                    {billing.pending_plan && (
                      <div className="mt-6 w-full bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 flex items-center justify-center gap-3">
                        <Clock className="w-5 h-5 text-orange-400 shrink-0" />
                        <p className="text-sm text-orange-200">
                          {t('pending_msg')} <span className="font-bold text-white">{billing.pending_plan.name}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-slate-400 text-sm italic">{t('no_plan_found') || 'Trenutno nemate aktivnu pretplatu.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10 bg-[#111118] border border-[#27273a] rounded-2xl p-10 text-center">
            <p className="text-slate-400 font-semibold">{t('profile_load_failed')}</p>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {data ? (
        <EditProfileModal
          open={editOpen}
          title={t('edit_profile')}
          loading={editLoading}
          error={editErr}
          initial={{
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            gender: (data.gender as any) ?? null,
            birthDateISO: "",
          }}
          onClose={() => setEditOpen(false)}
          onChangePassword={() => {
            setEditOpen(false);
            navigate("/trainer/change-password");
          }}
          onSave={async (v) => {
            setEditErr(null);
            setEditLoading(true);
            try {
              const res = await trainerApi.updateMyProfile({
                ime: v.firstName,
                prezime: v.lastName,
                pol: v.gender as "musko" | "zensko",
                datumRodjenjaISO: v.birthDateISO?.trim() ? v.birthDateISO.trim() : null,
              });

              if (!res.success) {
                setEditErr(res.message || "Failed to save.");
                return;
              }

              const refreshed = await trainerApi.getMyProfile();
              if (refreshed.success) setData(refreshed.data);

              setEditOpen(false);
            } catch (e: any) {
              setEditErr(e?.message || "Failed to save changes.");
            } finally {
              setEditLoading(false);
            }
          }}
        />
      ) : null}

      {/* PLAN PICKER MODAL */}
      {plansOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPlansOpen(false)} />
          <div className="relative w-full max-w-3xl bg-[#0a0a0f] border border-[#27273a] rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                  {t('change_plan') || 'Promeni plan'}
                </h3>
              </div>
              <button className="text-slate-400 hover:text-white text-sm" onClick={() => setPlansOpen(false)}>
                {t('close') || 'Zatvori'}
              </button>
            </div>

            {plansLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                {plans.map(plan => {
                  const current = billing?.current_plan;
                  const isCurrent = current?.id === plan.id;
                  const action =
                    !current || billing?.billing_status === 'trial'
                      ? 'select'
                      : plan.tier > (current?.tier ?? 0)
                        ? 'upgrade'
                        : plan.tier < (current?.tier ?? 0)
                          ? 'downgrade'
                          : null;

                  const label =
                    action === 'select'
                      ? t('activate') || 'Aktiviraj'
                      : action === 'upgrade'
                        ? t('upgrade') || 'Upgrade'
                        : action === 'downgrade'
                          ? t('downgrade') || 'Downgrade'
                          : t('current') || 'Aktivan';

                  const disabled = !action || isCurrent || planActionLoading || planLocked || Boolean(billing?.pending_plan);

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-2xl p-5 border ${isCurrent ? 'border-amber-400/30 bg-amber-400/5' : 'border-[#27273a] bg-[#111118]'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                            <UsersIcon className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-lg">{plan.name}</p>
                            <p className="text-xs text-slate-500">
                              {plan.max_clients === 9999 ? '∞' : plan.max_clients} {t('clients') || 'klijenata'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">{plan.price_eur.toFixed(2)} €</p>
                          <p className="text-xs text-slate-500">/ {t('month')}</p>
                        </div>
                      </div>

                      <button
                        disabled={disabled}
                        onClick={() => handlePlanAction(plan)}
                        className={`w-full mt-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isCurrent
                            ? 'bg-white/5 text-slate-400 border border-[#27273a]'
                            : action === 'upgrade'
                              ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-[#0a0a0f] border-0 btn-glow'
                              : action === 'select'
                                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-[#0a0a0f] border-0 btn-glow'
                                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                          } disabled:opacity-50`}
                      >
                        {planActionLoading ? (t('loading') || 'Loading') : label}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
