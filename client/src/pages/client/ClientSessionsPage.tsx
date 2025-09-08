import axios from "axios";
import { useEffect, useMemo, useState } from "react";
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

  const load = async () => {
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
  };

  useEffect(() => { 
    load();
  }, [filters.type, filters.status]);

  const book = async (id: number) => {
    try {
      setBookingId(id);
      const r = await clientApi.book(id);
      if (r.success) await load();
      else alert(r.message);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'An error occurred';
      console.error('Book error:', err?.response?.data || err);
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
      console.error('Cancel error:', err?.response?.data || err);
      alert(msg);
    } finally {
      setBookingId(null);
    }
  };

  const isCancellable = (startAtISO: string) =>
    new Date(startAtISO).getTime() - Date.now() >= 60 * 60 * 1000;

  const visibleList = useMemo(() => {
    let items = list;
    if (filters.status === 'free') {
      items = items.filter(i => !i.isEnrolled);
    }
    return items;
  }, [list, filters.status]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Training Sessions 🏋️‍♂️</h1>
        <p className="text-gray-600">Browse and book available workout sessions</p>
      </header>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <Filter className="h-4 w-4" />
            Filter & Search
          </div>
          <div className="flex flex-1 gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Search sessions..." />
            </div>
            <select className="rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" value={filters.type} onChange={e=> setFilters(f=>({...f, type:e.target.value as any}))}>
              <option value="">All Types</option>
              <option value="individual">Individual</option>
              <option value="group">Group</option>
            </select>
            <select className="rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" value={filters.status} onChange={e=> setFilters(f=>({...f, status:e.target.value as any}))}>
              <option value="">All Sessions</option>
              <option value="free">Free</option>
              <option value="full">Full</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-4 text-gray-500 shadow-sm">
            Loading...
          </div>
        ) : visibleList.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <div className="text-6xl mb-3">📅</div>
            <div>No sessions found</div>
          </div>
        ) : (
          visibleList.map(item=>(
            <div key={item.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{item.program.title}</div>
                <div className="text-sm text-gray-600">
                  {new Date(item.startAt).toLocaleString()} • {item.type} • {item.enrolledCount}/{item.capacity}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.isEnrolled ? (
                  isCancellable(item.startAt) ? (
                    <button
                      onClick={() => cancelBooking(item.id)}
                      disabled={bookingId === item.id}
                      className="inline-flex items-center rounded-xl bg-white border border-red-300 text-red-700 px-4 py-2 font-semibold hover:bg-red-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {bookingId === item.id ? 'Canceling…' : 'Cancel'}
                    </button>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">Enrolled</span>
                  )
                ) : item.status === 'free' ? (
                  <button
                    onClick={() => book(item.id)}
                    disabled={bookingId === item.id}
                    className="inline-flex items-center rounded-xl bg-emerald-600 text-white px-4 py-2 font-semibold hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                  >
                    {bookingId === item.id ? 'Booking…' : 'Book'}
                  </button>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">Full</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}