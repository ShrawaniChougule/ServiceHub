import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState } from '@/components/ui';
import { formatPrice, formatDate, classNames } from '@/lib/utils';
import { STATUS_META, canTransition, createNotification } from '@/lib/bookings';
import type { Booking, BookingStatus } from '@/lib/types';
import {
  CalendarCheck, MapPin, Clock, Check, X, Play, CheckCircle2, Search,
} from 'lucide-react';

type Filter = 'pending' | 'active' | 'completed' | 'all';

export function ProviderBookings() {
  const { profile } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('bookings')
      .select('*, service:services(*), customer:profiles(*)')
      .eq('provider_id', profile.id)
      .order('created_at', { ascending: false });
    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(b: Booking, status: BookingStatus) {
    if (!canTransition(b.status, status)) {
      toast('Cannot change to this status.', 'error');
      return;
    }
    const { error } = await supabase.from('bookings').update({ status }).eq('id', b.id);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    const labels: Record<BookingStatus, string> = {
      accepted: 'accepted', rejected: 'rejected', in_progress: 'started', completed: 'completed', cancelled: 'cancelled', pending: 'pending',
    };
    await createNotification(b.customer_id, `Booking ${labels[status]}`, `Your booking for ${b.service?.name} has been ${labels[status]} by the provider.`, 'booking', b.id);
    toast(`Booking ${labels[status]}.`, 'success');
    load();
  }

  const filtered = bookings.filter((b) => {
    if (filter === 'pending' && b.status !== 'pending') return false;
    if (filter === 'active' && !['accepted', 'in_progress'].includes(b.status)) return false;
    if (filter === 'completed' && b.status !== 'completed') return false;
    if (search && !b.service?.name?.toLowerCase().includes(search.toLowerCase()) && !b.customer?.full_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'all', label: 'All' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">Bookings</h1>
        <p className="mt-1 text-slate-500">Accept, reject, and update booking status.</p>
      </div>

      <div className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={classNames(
                'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                filter === f.key ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input-field pl-10 py-2.5 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<CalendarCheck className="h-12 w-12" />} title="No bookings here" description="New requests will appear in this list." />
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const meta = STATUS_META[b.status];
            return (
              <div key={b.id} className="card overflow-hidden">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900">
                      <CalendarCheck className="h-7 w-7 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-brand-900">{b.service?.name}</p>
                      <p className="truncate text-sm text-slate-500">{b.customer?.full_name} · {b.customer?.phone || 'No phone'}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><CalendarCheck className="h-3.5 w-3.5" /> {formatDate(b.scheduled_date)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {b.scheduled_time}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {b.address}, {b.city}</span>
                      </div>
                      {b.notes && <p className="mt-1.5 text-xs italic text-slate-500">"{b.notes}"</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                    </span>
                    <span className="font-bold text-brand-900">{formatPrice(b.price)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                  {b.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(b, 'accepted')}><Check className="h-4 w-4" /> Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(b, 'rejected')}><X className="h-4 w-4" /> Reject</Button>
                    </>
                  )}
                  {b.status === 'accepted' && (
                    <Button size="sm" onClick={() => updateStatus(b, 'in_progress')}><Play className="h-4 w-4" /> Start job</Button>
                  )}
                  {b.status === 'in_progress' && (
                    <Button size="sm" onClick={() => updateStatus(b, 'completed')}><CheckCircle2 className="h-4 w-4" /> Mark completed</Button>
                  )}
                  {b.status === 'accepted' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(b, 'cancelled')}><X className="h-4 w-4" /> Cancel</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
