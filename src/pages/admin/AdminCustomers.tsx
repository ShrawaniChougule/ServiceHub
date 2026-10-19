import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Avatar, Badge, Spinner, EmptyState } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { formatDate, classNames } from '@/lib/utils';
import type { Profile, Booking } from '@/lib/types';
import { Search, Ban, CheckCircle2, Eye, CalendarCheck, Users } from 'lucide-react';

export function AdminCustomers() {
  const toast = useToast();
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<Profile | null>(null);
  const [viewBookings, setViewBookings] = useState<Booking[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });
    setCustomers((data as Profile[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleBlock(c: Profile) {
    const { error } = await supabase.from('profiles').update({ is_blocked: !c.is_blocked }).eq('id', c.id);
    if (error) { toast(error.message, 'error'); return; }
    toast(c.is_blocked ? 'User unblocked.' : 'User blocked.', 'success');
    load();
    if (view?.id === c.id) setView({ ...c, is_blocked: !c.is_blocked });
  }

  async function openDetail(c: Profile) {
    setView(c);
    const { data } = await supabase
      .from('bookings')
      .select('*, service:services(*)')
      .eq('customer_id', c.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setViewBookings((data as Booking[]) ?? []);
  }

  const filtered = customers.filter((c) =>
    !search || c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">Customers</h1>
          <p className="mt-1 text-slate-500">{customers.length} registered customers</p>
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..." className="input-field pl-10 py-2.5 text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users className="h-12 w-12" />} title="No customers found" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.full_name || c.email} src={c.avatar_url || undefined} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-brand-900">{c.full_name || 'No name'}</p>
                          <p className="truncate text-xs text-slate-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{c.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-3.5">
                      {c.is_blocked ? <Badge color="rose">Blocked</Badge> : <Badge color="green">Active</Badge>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openDetail(c)}><Eye className="h-4 w-4" /></Button>
                        <Button size="sm" variant="outline" onClick={() => toggleBlock(c)} className={classNames(c.is_blocked && 'border-emerald-200 text-emerald-700 hover:bg-emerald-50')}>
                          {c.is_blocked ? <><CheckCircle2 className="h-4 w-4" /> Unblock</> : <><Ban className="h-4 w-4" /> Block</>}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!view} onClose={() => setView(null)} title="Customer details" size="md">
        {view && (
          <div>
            <div className="flex items-center gap-4">
              <Avatar name={view.full_name || view.email} src={view.avatar_url || undefined} size="lg" />
              <div>
                <p className="text-lg font-bold text-brand-900">{view.full_name || 'No name'}</p>
                <p className="text-sm text-slate-500">{view.email}</p>
                <p className="text-sm text-slate-500">{view.phone || 'No phone'}</p>
                {view.is_blocked ? <Badge color="rose">Blocked</Badge> : <Badge color="green">Active</Badge>}
              </div>
            </div>
            <div className="mt-6">
              <p className="mb-3 flex items-center gap-2 font-bold text-brand-900"><CalendarCheck className="h-4 w-4" /> Booking history ({viewBookings.length})</p>
              {viewBookings.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">No bookings yet.</p>
              ) : (
                <div className="space-y-2">
                  {viewBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm">
                      <span className="font-semibold text-brand-900">{b.service?.name}</span>
                      <span className="capitalize text-slate-500">{b.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
