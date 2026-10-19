import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Spinner, EmptyState } from '@/components/ui';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Booking } from '@/lib/types';
import { Wallet, TrendingUp, Calendar, Clock } from 'lucide-react';

export function ProviderEarnings() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, service:services(*)')
        .eq('provider_id', profile.id)
        .order('created_at', { ascending: false });
      setBookings((data as Booking[]) ?? []);
      setLoading(false);
    })();
  }, [profile]);

  const completed = bookings.filter((b) => b.status === 'completed');
  const total = completed.reduce((s, b) => s + Number(b.price), 0);
  const pending = bookings.filter((b) => ['pending', 'accepted', 'in_progress'].includes(b.status));
  const pendingTotal = pending.reduce((s, b) => s + Number(b.price), 0);

  const stats = [
    { label: 'Total earnings', value: formatPrice(total), icon: Wallet, color: 'from-emerald-400 to-green-600' },
    { label: 'Pending (in-progress)', value: formatPrice(pendingTotal), icon: Clock, color: 'from-amber-400 to-orange-500' },
    { label: 'Completed jobs', value: completed.length, icon: TrendingUp, color: 'from-sky-400 to-blue-500' },
    { label: 'Avg. per job', value: formatPrice(completed.length ? total / completed.length : 0), icon: Calendar, color: 'from-accent-400 to-accent-600' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">Earnings</h1>
        <p className="mt-1 text-slate-500">Track your income from completed bookings.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color}`}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-brand-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-brand-900">Payment history</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
        ) : completed.length === 0 ? (
          <EmptyState icon={<Wallet className="h-12 w-12" />} title="No earnings yet" description="Complete bookings to start earning." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completed.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-semibold text-brand-900">{b.service?.name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(b.scheduled_date)}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-600">{formatPrice(b.price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td colSpan={2} className="px-5 py-3.5 font-bold text-brand-900">Total</td>
                  <td className="px-5 py-3.5 text-right font-extrabold text-emerald-600">{formatPrice(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
