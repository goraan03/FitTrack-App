import { useEffect, useState } from "react";
import { Users, Clock, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, XCircle, ChevronRight, Zap } from "lucide-react";
import toast from "react-hot-toast";
import type { ITrainerAPIService } from "../../api_services/trainer/ITrainerAPIService";
import type { BillingStatus, PlanInfo } from "../../types/trainer/Billing";
import { useSettings } from "../../context/SettingsContext";

interface Props { trainerApi: ITrainerAPIService; }

const PLAN_COLORS: Record<string, { accent: string; bg: string; border: string; icon: string }> = {
  STARTER: { accent: "text-slate-300", bg: "bg-slate-400/10", border: "border-slate-400/20", icon: "text-slate-400" },
  GROWTH: { accent: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: "text-emerald-400" },
  PRO: { accent: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: "text-amber-400" },
  UNLIMITED: { accent: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", icon: "text-violet-400" },
};

function StatusBadge({ status }: { status: BillingStatus['billing_status'] }) {
  const { t } = useSettings();
  const map = {
    trial: { label: t('trial').toUpperCase(), cls: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
    active: { label: t('active').toUpperCase(), cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
    past_due: { label: t('past_due').toUpperCase(), cls: "bg-orange-400/10 text-orange-400 border-orange-400/20" },
    suspended: { label: t('suspended').toUpperCase(), cls: "bg-red-400/10 text-red-400 border-red-400/20" },
    none: { label: t('inactive').toUpperCase(), cls: "bg-slate-400/10 text-slate-400 border-slate-400/20" },
  };
  const { label, cls } = map[status] ?? map.none;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-widest border ${cls}`}>
      {label}
    </span>
  );
}

function TrialBanner({ billing }: { billing: BillingStatus }) {
  const { t } = useSettings();
  if (billing.billing_status !== 'trial' || !billing.trial_ends_at) return null;

  const daysLeft = Math.max(0, Math.ceil(
    (new Date(billing.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));

  const urgent = daysLeft <= 3;

  return (
    <div className={`rounded-2xl p-5 border flex items-start gap-4 mb-8 ${urgent
      ? "bg-red-400/5 border-red-400/20"
      : "bg-amber-400/5 border-amber-400/20"
      }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${urgent ? "bg-red-400/10" : "bg-amber-400/10"
        }`}>
        <Clock className={`w-5 h-5 ${urgent ? "text-red-400" : "text-amber-400"}`} />
      </div>
      <div>
        <p className={`font-bold text-sm uppercase tracking-wider mb-1 ${urgent ? "text-red-400" : "text-amber-400"}`}>
          {urgent
            ? t('trial_ends_in_' + (daysLeft === 1 ? 'singular' : 'plural')).replace('{days}', String(daysLeft))
            : t('trial_period_days').replace('{days}', String(daysLeft))}
        </p>
        <p className="text-slate-400 text-sm">
          {urgent
            ? t('select_plan_to_avoid_break')
            : t('try_all_features_free')}
        </p>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  current,
  pending,
  clientCount,
  billingStatus,
  onAction,
  loading,
}: {
  plan: PlanInfo;
  current: PlanInfo | null;
  pending: PlanInfo | null;
  clientCount: number;
  billingStatus: BillingStatus['billing_status'];
  onAction: (plan: PlanInfo, action: 'select' | 'upgrade' | 'downgrade') => void;
  loading: boolean;
}) {
  const { t } = useSettings();
  const colors = PLAN_COLORS[plan.name] ?? PLAN_COLORS.STARTER;
  const isCurrent = current?.id === plan.id;
  const isPending = pending?.id === plan.id;
  const tooSmall = clientCount > plan.max_clients;
  const noCurrentPlan = !current || billingStatus === 'trial';
  const hasPending = !!pending;

  let action: 'select' | 'upgrade' | 'downgrade' | null = null;
  let actionLabel = "";
  let actionDisabled = false;

  if (isCurrent) {
    actionLabel = t('current_plan').toUpperCase();
    actionDisabled = true;
  } else if (noCurrentPlan) {
    action = 'select';
    actionLabel = tooSmall ? `${t('too_many_clients').toUpperCase()} (max ${plan.max_clients})` : t('select_plan').toUpperCase();
    actionDisabled = tooSmall;
  } else if (current && plan.tier > current.tier) {
    action = 'upgrade';
    actionLabel = hasPending && pending!.id === plan.id
      ? t('upgrade_scheduled').toUpperCase()
      : t('upgrade').toUpperCase();
    actionDisabled = hasPending && pending?.id !== plan.id; // blokira dok ima pending
  } else if (current && plan.tier < current.tier) {
    action = 'downgrade';
    actionLabel = tooSmall
      ? `${t('too_many_clients').toUpperCase()} (max ${plan.max_clients})`
      : hasPending && pending!.id === plan.id
        ? t('downgrade_scheduled').toUpperCase()
        : hasPending
          ? t('plan_already_scheduled').toUpperCase()        // blokira ostale
          : t('downgrade').toUpperCase();
    actionDisabled = tooSmall || (hasPending && pending?.id !== plan.id);
  }

  return (
    <div className={`relative bg-[#111118] border rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 ${isCurrent
      ? `${colors.border} shadow-[0_0_30px_rgba(0,0,0,0.4)]`
      : "border-[#27273a] hover:border-white/10"
      }`}>
      {isCurrent && (
        <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold tracking-widest ${colors.bg} ${colors.accent} border ${colors.border}`}>
          {t('active').toUpperCase()}
        </div>
      )}
      {isPending && !isCurrent && (
        <div className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold tracking-widest bg-orange-400/10 text-orange-400 border border-orange-400/20">
          {t('pending').toUpperCase()}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`text-xl font-black tracking-wider ${colors.accent}`}>{plan.name}</h3>
          <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">
            {t('up_to')} {plan.max_clients === 9999 ? "∞" : plan.max_clients} {t('clients')}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
          {plan.name === 'UNLIMITED' ? (
            <Zap className={`w-6 h-6 ${colors.icon}`} />
          ) : (
            <Users className={`w-6 h-6 ${colors.icon}`} />
          )}
        </div>
      </div>

      {/* Price */}
      <div>
        <span className="text-4xl font-black text-white">{plan.price_eur.toFixed(2)}</span>
        <span className="text-slate-500 text-sm ml-1">EUR / {t('month')}.</span>
      </div>

      {/* Client bar */}
      {isCurrent && (
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5 uppercase tracking-wider">
            <span>{t('clients')}</span>
            <span className={tooSmall ? "text-red-400" : colors.accent}>
              {clientCount} / {plan.max_clients === 9999 ? "∞" : plan.max_clients}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#0a0a0f] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${tooSmall ? "bg-red-400" : `bg-gradient-to-r from-amber-400 to-amber-500`}`}
              style={{ width: plan.max_clients === 9999 ? "10%" : `${Math.min(100, (clientCount / plan.max_clients) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        disabled={actionDisabled || loading || isCurrent}
        onClick={() => action && onAction(plan, action)}
        className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isCurrent
          ? `${colors.bg} ${colors.accent} border ${colors.border} cursor-default`
          : actionDisabled
            ? "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
            : action === 'upgrade'
              ? `bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0a0a0f] btn-glow`
              : action === 'select'
                ? `bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0a0a0f] btn-glow`
                : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
          }`}
      >
        {isCurrent ? (
          <><CheckCircle className="w-4 h-4" />{actionLabel}</>
        ) : action === 'upgrade' ? (
          <><TrendingUp className="w-4 h-4" />{actionLabel}</>
        ) : action === 'downgrade' ? (
          <><TrendingDown className="w-4 h-4" />{actionLabel}</>
        ) : (
          <><ChevronRight className="w-4 h-4" />{actionLabel}</>
        )}
      </button>
    </div>
  );
}

export default function TrainerBillingPage({ trainerApi }: Props) {
  const { t } = useSettings();
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.all([
        trainerApi.getBillingStatus(),
        trainerApi.listPlans(),
      ]);
      if (bRes.success) setBilling(bRes.data);
      if (pRes.success) setPlans(pRes.data);
    } catch {
      toast.error(t('error_loading_billing'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (plan: PlanInfo, action: 'select' | 'upgrade' | 'downgrade') => {
    if (action === 'upgrade' || action === 'downgrade') {
      const ok = window.confirm(
        `Prelazak na ${plan.name} (${plan.price_eur.toFixed(2)} EUR/mj.) biće primjenjen na sljedeći billing ciklus.\n\nNastaviti?`
      );
      if (!ok) return;
    }

    setActionLoading(true);
    try {
      let res;
      if (action === 'select') res = await trainerApi.selectPlan(plan.id);
      else if (action === 'upgrade') res = await trainerApi.upgradePlan(plan.id);
      else res = await trainerApi.downgradePlan(plan.id);

      if (res.success) {
        toast.success(
          action === 'select'
            ? `Paket ${plan.name} aktiviran`
            : `${plan.name} zakazan za sljedeći billing ciklus`
        );
        await load();
      } else {
        toast.error(res.message || "Greška");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Greška";
      if (msg.startsWith("PLAN_TOO_SMALL")) toast.error("Imaš previše klijenata za ovaj paket");
      else if (msg.startsWith("DOWNGRADE_BLOCKED")) toast.error("Smanji broj klijenata prije downgrade-a");
      else if (msg === "NOT_AN_UPGRADE") toast.error("Odabrani paket nije upgrade");
      else if (msg === "USE_UPGRADE_OR_DOWNGRADE") toast.error("Koristite upgrade ili downgrade opciju");
      else toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-10 h-10 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-slate-500 uppercase tracking-wide text-sm font-semibold">{t('loading')}...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed top-0 left-0 right-0 h-[420px] bg-gradient-to-b from-amber-400/5 via-amber-400/0 to-transparent pointer-events-none" />

      <div className="pb-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10 opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 uppercase">
              BILLING & <span className="text-amber-400">{t('plan') + 's'}</span>
            </h1>
            <p className="text-slate-400 text-sm tracking-wide uppercase">
              {t('manage_subscription_limits')}
            </p>
          </div>
          {billing && <StatusBadge status={billing.billing_status} />}
        </div>

        {billing && <TrialBanner billing={billing} />}

        {/* Current plan info */}
        {billing?.current_plan && (
          <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-6 mb-8 opacity-0 animate-fade-in-up stagger-1" style={{ animationFillMode: "forwards" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full" />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">{t('subscription_overview')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Paket", value: billing.current_plan.name },
                { label: "Klijenti", value: `${billing.client_count} / ${billing.current_plan.max_clients === 9999 ? "∞" : billing.current_plan.max_clients}` },
                { label: "Cijena", value: `${billing.current_plan.price_eur.toFixed(2)} EUR/mj.` },
                { label: "Status", value: billing.billing_status.toUpperCase() },
              ].map((item) => (
                <div key={item.label} className="p-4 bg-[#0a0a0f] rounded-xl border border-[#27273a]">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            {billing.pending_plan && (
              <div className="mt-4 flex items-center gap-3 p-4 bg-orange-400/5 border border-orange-400/15 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                <p className="text-sm text-orange-300">
                  {t('downgrade_scheduled_msg').replace('{plan}', billing.pending_plan.name)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Plan cards */}
        <div className="mb-4 opacity-0 animate-fade-in-up stagger-2" style={{ animationFillMode: "forwards" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-full" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">{t('available_plans')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                current={billing?.current_plan ?? null}
                pending={billing?.pending_plan ?? null}
                clientCount={billing?.client_count ?? 0}
                billingStatus={billing?.billing_status ?? 'none'}
                onAction={handleAction}
                loading={actionLoading}
              />
            ))}
          </div>
        </div>

        {/* No plan state */}
        {billing && !billing.current_plan && billing.billing_status !== 'trial' && (
          <div className="mt-8 bg-red-400/5 border border-red-400/15 rounded-2xl p-8 text-center">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-red-300 font-bold text-lg mb-2">{t('account_not_active')}</p>
            <p className="text-slate-400 text-sm">{t('select_plan_to_continue')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
