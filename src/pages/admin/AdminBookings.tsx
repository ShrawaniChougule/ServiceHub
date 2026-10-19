import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Spinner, EmptyState } from '@/components/ui';
import { formatPrice, formatDate, classNames } from '@/lib/utils';
import { STATUS_META } from '@/lib/bookings';
import type { Booking, BookingStatus } from '@/lib/types';
import { Search, CalendarCheck } from 'lucide-react';

type Filter = 'all' | BookingStatus;

export function AdminBookings() {
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, service:services(*), customer:profiles(*), provider:providers(*, profile:profiles(*))')
      .order('created_at', { ascending: false });
    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = bookings.filter((b) => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return b.service?.name?.toLowerCase().includes(s) ||
        b.customer?.full_name?.toLowerCase().includes(s) ||
        b.provider?.profile?.full_name?.toLowerCase().includes(s) ||
        b.city?.toLowerCase().includes(s);
    }
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">All Bookings</h1>
          <p className="mt-1 text-slate-500">{bookings.length} total bookings</p>
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings..." className="input-field pl-10 py-2.5 text-sm" />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={classNames('rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
              filter === f.key ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<CalendarCheck className="h-12 w-12" />} title="No bookings found" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Provider</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => {
                  const meta = STATUS_META[b.status];
                  return (
                    <tr key={b.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-5 py-3.5 font-semibold text-brand-900">{b.service?.name}</td>
                      <td className="px-5 py-3.5 text-slate-600">{b.customer?.full_name}</td>
                      <td className="px-5 py-3.5 text-slate-600">{b.provider?.profile?.full_name}</td>
                      <td className="px-5 py-3.5 text-slate-500">{formatDate(b.scheduled_date)}</td>
                      <td className="px-5 py-3.5 font-bold text-brand-900">{formatPrice(b.price)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
