import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Spinner, EmptyState, StarRating, Avatar } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Review } from '@/lib/types';
import { Star, Quote } from 'lucide-react';

export function ProviderReviews() {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*, customer:profiles(*)')
        .eq('provider_id', profile.id)
        .order('created_at', { ascending: false });
      setReviews((data as Review[]) ?? []);
      setLoading(false);
    })();
  }, [profile]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">Reviews</h1>
        <p className="mt-1 text-slate-500">See what customers say about your work.</p>
      </div>

      {/* Summary */}
      <div className="card mb-6 grid gap-6 p-6 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center border-b border-slate-100 pb-6 sm:border-b-0 sm:border-r sm:pb-0">
          <p className="text-5xl font-extrabold text-brand-900">{avg.toFixed(1)}</p>
          <StarRating value={avg} readOnly size={24} />
          <p className="mt-2 text-sm text-slate-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="space-y-2">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-3 text-sm">
              <span className="flex w-12 items-center gap-1 font-semibold text-slate-600">
                {d.star} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="w-8 text-right text-slate-400">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
      ) : reviews.length === 0 ? (
        <EmptyState icon={<Star className="h-12 w-12" />} title="No reviews yet" description="Complete jobs and get rated by customers." />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start gap-4">
                <Avatar name={r.customer?.full_name || 'User'} src={r.customer?.avatar_url || undefined} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-brand-900">{r.customer?.full_name || 'Anonymous'}</p>
                    <span className="text-xs text-slate-400">{formatDate(r.created_at)}</span>
                  </div>
                  <StarRating value={r.rating} readOnly size={16} />
                  {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
