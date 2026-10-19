import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { formatPrice, formatDate } from '@/lib/utils';
import { STATUS_META } from '@/lib/bookings';
import { Spinner, Badge } from '@/components/ui';
import type { Booking, Provider } from '@/lib/types';
import {
  CalendarCheck, Wallet, Star, TrendingUp, Clock, BadgeCheck,
  ArrowRight, AlertCircle,
} from 'lucide-react';

export function ProviderDashboard() {
  const { profile } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(0);
  const [counts, setCounts] = useState({ pending: 0, active: 0, completed: 0 });

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      const [provRes, bookRes, countsRes] = await Promise.all([
        supabase.from('providers').select('*').eq('id', profile.id).maybeSingle(),
        supabase
          .from('bookings')
          .select('*, service:services(*), customer:profiles(*)')
          .eq('provider_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('bookings')
          .select('status, price')
          .eq('provider_id', profile.id),
      ]);
      if (!active) return;
      setProvider(provRes.data as Provider | null);
      const all = (bookRes.data as Booking[]) ?? [];
      setBookings(all);

      const allRows = (countsRes.data as { status: string; price: number }[]) ?? [];
      const earned = allRows.filter((b) => b.status === 'completed').reduce((s, b) => s + Number(b.price), 0);
      setEarnings(earned);
      setCounts({
        pending: allRows.filter((b) => b.status === 'pending').length,
        active: allRows.filter((b) => ['accepted', 'in_progress'].includes(b.status)).length,
        completed: allRows.filter((b) => b.status === 'completed').length,
      });
      setLoading(false);
    })();
    return () => { active = false; };
  }, [profile]);

  if (!profile) return null;

  const stats = [
    { label: 'Pending requests', value: counts.pending, icon: Clock, color: 'from-amber-400 to-orange-500' },
    { label: 'Active jobs', value: counts.active, icon: CalendarCheck, color: 'from-sky-400 to-blue-500' },
    { label: 'Completed', value: counts.completed, icon: TrendingUp, color: 'from-emerald-400 to-green-600' },
    { label: 'Total earnings', value: formatPrice(earnings), icon: Wallet, color: 'from-accent-400 to-accent-600' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">Provider Dashboard</h1>
          <p className="mt-1 text-slate-500">Manage your bookings and earnings.</p>
        </div>
        {provider && !provider.is_verified && (
          <Badge color="amber"><AlertCircle className="h-3.5 w-3.5" /> Awaiting verification</Badge>
        )}
        {provider?.is_verified && (
          <Badge color="green"><BadgeCheck className="h-3.5 w-3.5" /> Verified</Badge>
        )}
      </div>

      {/* Stat cards */}
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

      {/* Rating highlight */}
      {provider && (
        <div className="mt-6 card flex flex-col items-center justify-between gap-4 bg-gradient-to-br from-brand-900 to-brand-950 p-6 text-white sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-3xl font-extrabold">{provider.rating.toFixed(1)}</p>
              <p className="text-sm text-slate-300">{provider.rating_count} review{provider.rating_count !== 1 ? 's' : ''} · {provider.jobs_completed} jobs done</p>
            </div>
          </div>
          <Link to="/provider/reviews" className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/20">
            View reviews <ArrowRight className="ml-1 inline h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Recent bookings */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-900">Recent requests</h2>
          <Link to="/provider/bookings" className="text-sm font-semibold text-brand-700 hover:text-brand-900">View all</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
        ) : bookings.length === 0 ? (
          <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
            <CalendarCheck className="h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-brand-900">No bookings yet</p>
            <p className="mt-1 text-sm text-slate-500">Complete your profile to start receiving requests.</p>
            <Link to="/provider/profile" className="btn-primary mt-5">Set up profile</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const meta = STATUS_META[b.status];
              return (
                <div key={b.id} className="card flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                    <CalendarCheck className="h-6 w-6 text-brand-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-brand-900">{b.service?.name}</p>
                    <p className="truncate text-sm text-slate-500">{b.customer?.full_name} · {formatDate(b.scheduled_date)} at {b.scheduled_time}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                    </span>
                    <p className="mt-1 text-sm font-bold text-brand-900">{formatPrice(b.price)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
