import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { clientApi } from "../../api_services/client/ClientAPIService";
import { Filter, Search } from "lucide-react";
import type { TermItem } from "../../types/client/TermItem";

interface ClientSessionsPageProps {
  clientApi: typeof clientApi;
}

export default function ClientSessionsPage({ clientApi }: ClientSessionsPageProps) {
  const [list, setList] = useState<TermItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [filters, setFilters] = useState<{ type?: 'individual'|'group'|''; status?: 'free'|'full'|'' }>({ type:'', status:'free' });
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await clientApi.getAvailableTerms({
        status: filters.status || undefined,
        type: (filters.type || undefined) as any
      });
      if (resp.success && resp.data) setList(resp.data as unknown as TermItem[]);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as any)?.message ?? err.message
        : 'Greška prilikom učitavanja termina';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.type, clientApi]);

  useEffect(() => { 
    load(); 
  }, [load]);

  const book = async (id: number) => {
    try {
      setBookingId(id);
      const r = await clientApi.book(id);
      if (r.success) await load();
      else alert(r.message);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'An error occurred';
      alert(msg);
    } finally {
      setBookingId(null);
    }
  };

  const cancelBooking = async (id: number) => {
    try {
      setBookingId(id);
      const r = await clientApi.cancel(id);
      if (r.success) await load();
      else alert(r.message);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'An error occurred';
      alert(msg);
    } finally {
      setBookingId(null);
    }
  };

  const isCancellable = (startAtISO: string) =>
    new Date(startAtISO).getTime() - Date.now() >= 60 * 60 * 1000;

  const visibleList = useMemo(() => {
    let items = list;

    if (filters.status === "free") items = items.filter(i => !i.isEnrolled);

    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(i =>
        (i.program?.title || "").toLowerCase().includes(q) ||
        String(i.type || "").toLowerCase().includes(q)
      );
    }

    if (filters.type) items = items.filter(i => i.type === filters.type);

    if (filters.status === "full") items = items.filter(i => i.status === "full");

    return items;
  }, [list, filters.status, filters.type, query]);

  return (
  <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-amber-400 selection:text-black">
    <div className="absolute top-0 left-0 w-full h-[420px] bg-gradient-to-b from-white/5 via-white/0 to-transparent pointer-events-none" />

    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10 pb-20 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 opacity-0 animate-fade-in-up">
        <div className="min-w-0">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
            Training <span className="text-amber-400">Sessions</span>
          </h1>
          <p className="text-slate-400 text-sm uppercase tracking-widest mt-2">
            Browse and book available sessions
          </p>
        </div>
      </header>

      {/* Filter card */}
      <div
        className="bg-[#111118] border border-[#27273a] rounded-2xl p-4 sm:p-5 shadow-[0_18px_55px_rgba(0,0,0,0.55)] opacity-0 animate-fade-in-up stagger-1"
        style={{ animationFillMode: "forwards" }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Filter className="h-4 w-4 text-amber-400" />
            <span className="uppercase tracking-wider text-xs">Filter & Search</span>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="
                  w-full rounded-xl border border-white/5
                  bg-black/30 text-white placeholder:text-slate-500
                  pl-11 pr-4 py-3 text-sm font-semibold
                  focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/40
                "
                placeholder="Search sessions..."
              />
            </div>

            {/* Type */}
            <select
              className="
                rounded-xl border border-white/5
                bg-black/30 text-white
                px-4 py-3 text-sm font-semibold
                focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/40
                appearance-none cursor-pointer
              "
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as any }))}
            >
              <option value="">All Types</option>
              <option value="individual">Individual</option>
              <option value="group">Group</option>
            </select>

            {/* Status */}
            <select
              className="
                rounded-xl border border-white/5
                bg-black/30 text-white
                px-4 py-3 text-sm font-semibold
                focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/40
                appearance-none cursor-pointer
              "
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as any }))}
            >
              <option value="">All Sessions</option>
              <option value="free">Free</option>
              <option value="full">Full</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4 opacity-0 animate-fade-in-up stagger-2" style={{ animationFillMode: "forwards" }}>
        {loading ? (
          <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-8 flex items-center gap-4">
            <div className="w-8 h-8 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <div className="text-slate-400 text-sm font-semibold uppercase tracking-widest">Loading…</div>
          </div>
        ) : visibleList.length === 0 ? (
          <div className="bg-[#111118] border border-[#27273a] rounded-2xl p-12 text-center">
            <div className="text-6xl mb-3">📅</div>
            <div className="text-slate-300 font-black uppercase tracking-widest text-sm">No sessions found</div>
            <div className="text-slate-500 text-sm mt-2">Try adjusting your filters</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleList.map((item, idx) => (
              <div
                key={item.id}
                className="bg-[#111118] border border-[#27273a] rounded-2xl p-5 sm:p-6 card-hover shadow-[0_18px_55px_rgba(0,0,0,0.55)]"
                style={{ animationDelay: `${0.08 * idx}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-white font-black uppercase tracking-tight truncate">
                        {item.program.title}
                      </div>

                      {/* status pill */}
                      {item.isEnrolled ? (
                        <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400/10 text-amber-400 border border-amber-400/20">
                          Enrolled
                        </span>
                      ) : item.status === "free" ? (
                        <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Free
                        </span>
                      ) : (
                        <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Full
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-slate-400">
                      {new Date(item.startAt).toLocaleString()} •{" "}
                      <span className="uppercase tracking-wider">{item.type}</span> •{" "}
                      {item.enrolledCount}/{item.capacity}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {item.isEnrolled ? (
                      isCancellable(item.startAt) ? (
                        <button
                          onClick={() => cancelBooking(item.id)}
                          disabled={bookingId === item.id}
                          className="
                            inline-flex items-center justify-center
                            rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest
                            bg-rose-500/10 text-rose-400 border border-rose-500/20
                            hover:bg-rose-500 hover:text-white transition
                            disabled:opacity-60 disabled:cursor-not-allowed
                          "
                        >
                          {bookingId === item.id ? "Canceling…" : "Cancel"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest">
                          Not cancellable
                        </span>
                      )
                    ) : item.status === "free" ? (
                      <button
                        onClick={() => book(item.id)}
                        disabled={bookingId === item.id}
                        className="
                          inline-flex items-center justify-center
                          rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest
                          bg-gradient-to-r from-amber-400 to-amber-500 text-[#0a0a0f]
                          hover:from-amber-500 hover:to-amber-600 transition
                          shadow-[0_18px_45px_rgba(251,191,36,0.12)]
                          active:scale-[0.99]
                          disabled:opacity-60 disabled:cursor-not-allowed
                        "
                      >
                        {bookingId === item.id ? "Booking…" : "Book"}
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-black uppercase tracking-widest">
                        Full
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  </div>
);
}