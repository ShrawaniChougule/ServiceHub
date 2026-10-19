import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal, Textarea, StarRating, Spinner, EmptyState } from '@/components/ui';
import { formatPrice, formatDate, classNames } from '@/lib/utils';
import { STATUS_META, canTransition, createNotification } from '@/lib/bookings';
import type { Booking } from '@/lib/types';
import {
  CalendarCheck, MapPin, Clock, X, Star, Search, ChevronRight,
} from 'lucide-react';

type Filter = 'all' | 'active' | 'completed' | 'cancelled';

export function CustomerBookings() {
  const { profile } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('bookings')
      .select('*, service:services(*), provider:providers(*, profile:profiles(*)), review:reviews(*)')
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false });
    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  async function cancelBooking(b: Booking) {
    if (!canTransition(b.status, 'cancelled')) {
      toast('This booking cannot be cancelled.', 'error');
      return;
    }
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    await createNotification(b.provider_id, 'Booking cancelled', `A booking for ${b.service?.name} was cancelled by the customer.`, 'booking', b.id);
    toast('Booking cancelled.', 'success');
    load();
  }

  const filtered = bookings.filter((b) => {
    if (filter === 'active' && !['pending', 'accepted', 'in_progress'].includes(b.status)) return false;
    if (filter === 'completed' && b.status !== 'completed') return false;
    if (filter === 'cancelled' && !['cancelled', 'rejected'].includes(b.status)) return false;
    if (search && !b.service?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">My Bookings</h1>
        <p className="mt-1 text-slate-500">Track, cancel, and review your bookings.</p>
      </div>

      {/* Controls */}
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
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="h-12 w-12" />}
          title="No bookings found"
          description="Book a service to see it here."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const meta = STATUS_META[b.status];
            const canCancel = canTransition(b.status, 'cancelled');
            const canReview = b.status === 'completed' && !b.review;
            return (
              <div key={b.id} className="card overflow-hidden">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900">
                      <CalendarCheck className="h-7 w-7 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-brand-900">{b.service?.name}</p>
                      <p className="truncate text-sm text-slate-500">{b.provider?.profile?.full_name}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><CalendarCheck className="h-3.5 w-3.5" /> {formatDate(b.scheduled_date)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {b.scheduled_time}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {b.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                    </span>
                    <span className="font-bold text-brand-900">{formatPrice(b.price)}</span>
                  </div>
                </div>

                {(canCancel || canReview || b.review) && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                    {canCancel && (
                      <Button size="sm" variant="outline" onClick={() => cancelBooking(b)}>
                        <X className="h-4 w-4" /> Cancel booking
                      </Button>
                    )}
                    {canReview && (
                      <Button size="sm" onClick={() => setReviewBooking(b)}>
                        <Star className="h-4 w-4" /> Rate & review
                      </Button>
                    )}
                    {b.review && (
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                        <StarRating value={b.review.rating} readOnly size={14} /> Reviewed
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {reviewBooking && (
        <ReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)} onDone={() => { setReviewBooking(null); load(); }} />
      )}
    </DashboardLayout>
  );
}

function ReviewModal({ booking, onClose, onDone }: { booking: Booking; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('reviews').insert({
      booking_id: booking.id,
      customer_id: booking.customer_id,
      provider_id: booking.provider_id,
      rating,
      comment,
    });
    setLoading(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    await createNotification(booking.provider_id, 'New review received', `You received a ${rating}-star review.`, 'review', booking.id);
    toast('Review submitted. Thank you!', 'success');
    onDone();
  }

  return (
    <Modal open onClose={onClose} title="Rate your experience" size="sm">
      <form onSubmit={submit} className="space-y-5">
        <div className="rounded-xl bg-brand-50 p-4">
          <p className="font-bold text-brand-900">{booking.service?.name}</p>
          <p className="text-sm text-slate-500">{booking.provider?.profile?.full_name}</p>
        </div>
        <div className="text-center">
          <label className="label text-center">Your rating</label>
          <div className="mt-2 flex justify-center"><StarRating value={rating} onChange={setRating} size={36} /></div>
        </div>
        <Textarea label="Your review" rows={4} placeholder="Tell others about your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
        <Button type="submit" loading={loading} className="w-full" size="lg">Submit review</Button>
      </form>
    </Modal>
  );
}
