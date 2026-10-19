import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Avatar, Badge, Spinner, EmptyState, StarRating } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { formatDate, classNames } from '@/lib/utils';
import type { Provider, Review } from '@/lib/types';
import { Search, BadgeCheck, Ban, Eye, Wrench, ShieldCheck, Star } from 'lucide-react';

type Filter = 'all' | 'verified' | 'pending';

export function AdminProviders() {
  const toast = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<Provider | null>(null);
  const [viewReviews, setViewReviews] = useState<Review[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('providers')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false });
    setProviders((data as Provider[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleVerify(p: Provider) {
    const { error } = await supabase.from('providers').update({ is_verified: !p.is_verified }).eq('id', p.id);
    if (error) { toast(error.message, 'error'); return; }
    // notify provider
    await supabase.from('notifications').insert({
      user_id: p.id,
      title: p.is_verified ? 'Verification revoked' : 'You are verified!',
      body: p.is_verified ? 'Your verification status was revoked by admin.' : 'Congratulations! Your profile is now verified.',
      type: 'system',
    });
    toast(p.is_verified ? 'Verification revoked.' : 'Provider verified!', 'success');
    load();
  }

  async function toggleBlock(p: Provider) {
    if (!p.profile) return;
    const { error } = await supabase.from('profiles').update({ is_blocked: !p.profile.is_blocked }).eq('id', p.id);
    if (error) { toast(error.message, 'error'); return; }
    toast(p.profile.is_blocked ? 'Unblocked.' : 'Blocked.', 'success');
    load();
  }

  async function openDetail(p: Provider) {
    setView(p);
    const { data } = await supabase
      .from('reviews')
      .select('*, customer:profiles(*)')
      .eq('provider_id', p.id)
      .order('created_at', { ascending: false })
      .limit(5);
    setViewReviews((data as Review[]) ?? []);
  }

  const filtered = providers.filter((p) => {
    if (filter === 'verified' && !p.is_verified) return false;
    if (filter === 'pending' && p.is_verified) return false;
    if (search && !p.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) && !p.profile?.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'verified', label: 'Verified' },
    { key: 'pending', label: 'Pending' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">Providers</h1>
          <p className="mt-1 text-slate-500">{providers.length} service providers</p>
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search providers..." className="input-field pl-10 py-2.5 text-sm" />
        </div>
      </div>

      <div className="mb-5 flex gap-2">
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
        <EmptyState icon={<Wrench className="h-12 w-12" />} title="No providers found" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex items-start gap-3">
                <Avatar name={p.profile?.full_name || 'P'} src={p.profile_photo_url || undefined} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-brand-900">{p.profile?.full_name || 'No name'}</p>
                  <p className="truncate text-xs text-slate-500">{p.profile?.email}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {p.is_verified ? <Badge color="green"><BadgeCheck className="h-3 w-3" /> Verified</Badge> : <Badge color="amber"><ShieldCheck className="h-3 w-3" /> Pending</Badge>}
                    {p.profile?.is_blocked && <Badge color="rose">Blocked</Badge>}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                <StarRating value={p.rating} readOnly size={12} />
                {p.rating > 0 && <span>{p.rating_count} reviews</span>}
                <span>· {p.jobs_completed} jobs</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.skills.slice(0, 3).map((s) => (
                  <span key={s} className="rounded bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">{s}</span>
                ))}
              </div>
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                <Button size="sm" variant="ghost" onClick={() => openDetail(p)}><Eye className="h-4 w-4" /> View</Button>
                {!p.is_verified ? (
                  <Button size="sm" onClick={() => toggleVerify(p)}><BadgeCheck className="h-4 w-4" /> Verify</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => toggleVerify(p)}>Revoke</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => toggleBlock(p)} className={classNames(p.profile?.is_blocked && 'border-emerald-200 text-emerald-700 hover:bg-emerald-50')}>
                  {p.profile?.is_blocked ? 'Unblock' : <><Ban className="h-4 w-4" /> Block</>}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!view} onClose={() => setView(null)} title="Provider details" size="md">
        {view && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={view.profile?.full_name || 'P'} src={view.profile_photo_url || undefined} size="lg" />
              <div>
                <p className="text-lg font-bold text-brand-900">{view.profile?.full_name}</p>
                <p className="text-sm text-slate-500">{view.profile?.email}</p>
                <p className="text-sm text-slate-500">{view.profile?.phone || 'No phone'}</p>
              </div>
            </div>
            {view.bio && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{view.bio}</p>}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-amber-50 p-3"><p className="text-lg font-extrabold text-amber-700">{view.rating.toFixed(1)}</p><p className="text-xs text-amber-600">Rating</p></div>
              <div className="rounded-xl bg-emerald-50 p-3"><p className="text-lg font-extrabold text-emerald-700">{view.jobs_completed}</p><p className="text-xs text-emerald-600">Jobs</p></div>
              <div className="rounded-xl bg-brand-50 p-3"><p className="text-lg font-extrabold text-brand-700">{view.rating_count}</p><p className="text-xs text-brand-600">Reviews</p></div>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-bold text-brand-900">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {view.skills.length ? view.skills.map((s) => <Badge key={s} color="blue">{s}</Badge>) : <span className="text-sm text-slate-400">None listed</span>}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-bold text-brand-900">Service areas</p>
              <div className="flex flex-wrap gap-1.5">
                {view.service_areas.length ? view.service_areas.map((a) => <Badge key={a} color="green">{a}</Badge>) : <span className="text-sm text-slate-400">None listed</span>}
              </div>
            </div>
            {view.id_proof_url && (
              <div>
                <p className="mb-1.5 text-sm font-bold text-brand-900">ID Proof</p>
                <a href={view.id_proof_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
                  <ShieldCheck className="h-4 w-4" /> View document
                </a>
              </div>
            )}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-brand-900"><Star className="h-4 w-4 text-amber-500" /> Recent reviews</p>
              {viewReviews.length === 0 ? (
                <p className="text-sm text-slate-400">No reviews yet.</p>
              ) : (
                <div className="space-y-2">
                  {viewReviews.map((r) => (
                    <div key={r.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-brand-900">{r.customer?.full_name}</span>
                        <StarRating value={r.rating} readOnly size={12} />
                      </div>
                      {r.comment && <p className="mt-1 text-slate-600">{r.comment}</p>}
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
