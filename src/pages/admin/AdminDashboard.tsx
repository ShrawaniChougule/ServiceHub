import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Spinner } from '@/components/ui';
import { formatPrice, formatDate } from '@/lib/utils';
import { STATUS_META } from '@/lib/bookings';
import type { Booking } from '@/lib/types';
import {
  Users, Wrench, CalendarCheck, Wallet, TrendingUp, ArrowRight, Star, ShieldCheck,
} from 'lucide-react';

interface AdminStats {
  customers: number;
  providers: number;
  pendingProviders: number;
  bookings: number;
  activeBookings: number;
  revenue: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusBreakdown, setStatusBreakdown] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      const [cust, prov, pendingProv, book, recent] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('providers').select('*', { count: 'exact', head: true }),
        supabase.from('providers').select('*', { count: 'exact', head: true }).eq('is_verified', false),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase
          .from('bookings')
          .select('*, service:services(*), customer:profiles(*), provider:providers(*, profile:profiles(*))')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);
      if (!active) return;

      const recentBookings = (recent.data as Booking[]) ?? [];
      setRecentBookings(recentBookings);

      // status breakdown + revenue from ALL bookings (not just the 6 recent)
      const breakdown: Record<string, number> = {};
      let totalRevenue = 0;
      const { data: allBook } = await supabase.from('bookings').select('status, price');
      (allBook as { status: string; price: number }[] | null)?.forEach((b) => {
        breakdown[b.status] = (breakdown[b.status] ?? 0) + 1;
        if (b.status === 'completed') totalRevenue += Number(b.price);
      });
      setStatusBreakdown(breakdown);

      const activeCount = (allBook as { status: string }[] | null)?.filter((b) => ['pending', 'accepted', 'in_progress'].includes(b.status)).length ?? 0;

      setStats({
        customers: cust.count ?? 0,
        providers: prov.count ?? 0,
        pendingProviders: pendingProv.count ?? 0,
        bookings: book.count ?? 0,
        activeBookings: activeCount,
        revenue: totalRevenue,
      });
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const cards = [
    { label: 'Customers', value: stats?.customers ?? 0, icon: Users, color: 'from-brand-500 to-brand-700', to: '/admin/customers' },
    { label: 'Providers', value: stats?.providers ?? 0, icon: Wrench, color: 'from-accent-400 to-accent-600', to: '/admin/providers' },
    { label: 'Total bookings', value: stats?.bookings ?? 0, icon: CalendarCheck, color: 'from-emerald-400 to-green-600', to: '/admin/bookings' },
    { label: 'Revenue (completed)', value: formatPrice(stats?.revenue ?? 0), icon: Wallet, color: 'from-amber-400 to-orange-500', to: '/admin/bookings' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">Admin Dashboard</h1>
        <p className="mt-1 text-slate-500">Platform overview and analytics.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((c) => (
              <Link key={c.label} to={c.to} className="card group p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.color}`}>
                  <c.icon className="h-5 w-5 text-white" />
                </div>
                <p className="mt-3 text-2xl font-extrabold text-brand-900">{c.value}</p>
                <p className="flex items-center gap-1 text-sm text-slate-500">
                  {c.label}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </p>
              </Link>
            ))}
          </div>

          {/* Alerts */}
          {stats && stats.pendingProviders > 0 && (
            <Link to="/admin/providers" className="mt-6 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-5 transition-colors hover:bg-amber-100">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="font-bold text-amber-900">{stats.pendingProviders} provider{stats.pendingProviders !== 1 ? 's' : ''} awaiting verification</p>
                  <p className="text-sm text-amber-700">Review and verify them to make them visible.</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-amber-600" />
            </Link>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Booking status breakdown */}
            <div className="card p-6 lg:col-span-1">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-900"><TrendingUp className="h-5 w-5 text-brand-700" /> Bookings by status</h2>
              <div className="space-y-3">
                {Object.entries(STATUS_META).map(([key, meta]) => {
                  const count = statusBreakdown[key] ?? 0;
                  const total = Object.values(statusBreakdown).reduce((a, b) => a + b, 0) || 1;
                  const pct = (count / total) * 100;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-600">{meta.label}</span>
                        <span className="font-bold text-brand-900">{count}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${meta.dot} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent bookings */}
            <div className="card p-6 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-brand-900">Recent bookings</h2>
                <Link to="/admin/bookings" className="text-sm font-semibold text-brand-700 hover:text-brand-900">View all</Link>
              </div>
              {recentBookings.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((b) => {
                    const meta = STATUS_META[b.status];
                    return (
                      <div key={b.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                          <CalendarCheck className="h-5 w-5 text-brand-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-brand-900">{b.service?.name}</p>
                          <p className="truncate text-xs text-slate-500">{b.customer?.full_name} → {b.provider?.profile?.full_name}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                          <p className="mt-0.5 text-xs text-slate-400">{formatDate(b.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
