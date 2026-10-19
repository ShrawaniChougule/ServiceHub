import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { formatPrice, formatDate } from '@/lib/utils';
import { STATUS_META } from '@/lib/bookings';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui';
import type { Booking } from '@/lib/types';
import {
  CalendarCheck, Clock, Sparkles, TrendingUp, ArrowRight, Wallet, Star,
} from 'lucide-react';

export function CustomerDashboard() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, spent: 0 });

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, service:services(*), provider:providers(*, profile:profiles(*))')
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (!active) return;
      const all = (data as Booking[]) ?? [];
      setBookings(all);

      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', profile.id);
      const { data: allRows } = await supabase
        .from('bookings')
        .select('status, price')
        .eq('customer_id', profile.id);
      const rows = (allRows as { status: string; price: number }[]) ?? [];
      const activeCount = rows.filter((b) => ['pending', 'accepted', 'in_progress'].includes(b.status)).length;
      const completedCount = rows.filter((b) => b.status === 'completed').length;
      const spent = rows.filter((b) => b.status === 'completed').reduce((s, b) => s + Number(b.price), 0);
      setStats({ total: count ?? 0, active: activeCount, completed: completedCount, spent });
      setLoading(false);
    })();
    return () => { active = false; };
  }, [profile]);

  if (!profile) return null;

  const statCards = [
    { label: 'Total bookings', value: stats.total, icon: CalendarCheck, color: 'from-brand-500 to-brand-700' },
    { label: 'Active', value: stats.active, icon: Clock, color: 'from-amber-400 to-orange-500' },
    { label: 'Completed', value: stats.completed, icon: TrendingUp, color: 'from-emerald-400 to-green-600' },
    { label: 'Total spent', value: formatPrice(stats.spent), icon: Wallet, color: 'from-accent-400 to-accent-600' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">
          Hi, {profile.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="mt-1 text-slate-500">Here's an overview of your activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color}`}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-brand-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/services" className="card group flex items-center justify-between p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow">
          <div>
            <p className="font-bold text-brand-900">Book a service</p>
            <p className="text-sm text-slate-500">Browse 10+ categories</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-900 group-hover:text-white">
            <Sparkles className="h-5 w-5" />
          </div>
        </Link>
        <Link to="/customer/bookings" className="card group flex items-center justify-between p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow">
          <div>
            <p className="font-bold text-brand-900">View all bookings</p>
            <p className="text-sm text-slate-500">Track and manage</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-900 group-hover:text-white">
            <ArrowRight className="h-5 w-5" />
          </div>
        </Link>
      </div>

      {/* Recent bookings */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-900">Recent bookings</h2>
          <Link to="/customer/bookings" className="text-sm font-semibold text-brand-700 hover:text-brand-900">View all</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
        ) : bookings.length === 0 ? (
          <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
            <CalendarCheck className="h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-brand-900">No bookings yet</p>
            <p className="mt-1 text-sm text-slate-500">Book your first service to get started.</p>
            <Link to="/services" className="btn-primary mt-5">Browse services</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const meta = STATUS_META[b.status];
              return (
                <Link key={b.id} to="/customer/bookings" className="card flex items-center gap-4 p-4 transition-all hover:shadow-soft">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                    <CalendarCheck className="h-6 w-6 text-brand-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-brand-900">{b.service?.name}</p>
                    <p className="text-sm text-slate-500">{formatDate(b.scheduled_date)} at {b.scheduled_time}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                    </span>
                    <p className="mt-1 text-sm font-bold text-brand-900">{formatPrice(b.price)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
