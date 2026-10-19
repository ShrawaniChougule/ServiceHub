import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { categoryIcon, categoryGradient, POPULAR_CITIES } from '@/lib/categories';
import { formatPrice } from '@/lib/utils';
import { createNotification } from '@/lib/bookings';
import { PageContainer } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner, StarRating, RatingBadge } from '@/components/ui';
import { ProviderCard } from '@/components/cards';
import type { Service, Provider, Review } from '@/lib/types';
import {
  ArrowLeft, Clock, ShieldCheck, CheckCircle2, Star, MapPin, Calendar,
} from 'lucide-react';

export function ServiceDetailPage({ id }: { id: string }) {
  const { navigate } = useRouter();
  const { profile, isCustomer } = useAuth();
  const toast = useToast();
  const [service, setService] = useState<Service | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [svcRes, provSvcRes] = await Promise.all([
        supabase.from('services').select('*').eq('id', id).maybeSingle(),
        supabase
          .from('provider_services')
          .select('provider:providers(*, profile:profiles(*)), service_id')
          .eq('service_id', id),
      ]);
      if (!active) return;
      setService(svcRes.data as Service | null);

      const provs = ((provSvcRes.data as any[]) ?? [])
        .map((row) => row.provider)
        .filter(Boolean) as Provider[];
      setProviders(provs);

      // reviews for this service (via providers)
      if (provs.length) {
        const provIds = provs.map((p) => p.id);
        const { data: revs } = await supabase
          .from('reviews')
          .select('*, customer:profiles(*)')
          .in('provider_id', provIds)
          .order('created_at', { ascending: false })
          .limit(6);
        setReviews((revs as Review[]) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-32"><Spinner className="h-8 w-8" /></div>
    );
  }

  if (!service) {
    return (
      <PageContainer className="py-32 text-center">
        <h2 className="text-2xl font-bold text-brand-900">Service not found</h2>
        <Link to="/services" className="btn-primary mt-6">Browse all services</Link>
      </PageContainer>
    );
  }

  const Icon = categoryIcon(service.category);

  function openBooking(p: Provider | null) {
    if (!profile) {
      toast('Please sign in to book a service.', 'info');
      navigate('/login');
      return;
    }
    if (!isCustomer) {
      toast('Only customers can book services.', 'info');
      return;
    }
    setSelectedProvider(p);
    setBookingOpen(true);
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-slate-100 bg-white">
        <PageContainer className="py-4">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-brand-700">Home</Link>
            <span>/</span>
            <Link to={`/services?category=${service.category}`} className="hover:text-brand-700">{service.category}</Link>
            <span>/</span>
            <span className="font-semibold text-brand-900">{service.name}</span>
          </nav>
        </PageContainer>
      </div>

      <PageContainer className="py-10">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Left */}
          <div className="lg:col-span-2">
            <div className={`relative h-56 overflow-hidden rounded-2xl bg-gradient-to-br ${categoryGradient(service.category)}`}>
              <div className="absolute inset-0 bg-grid opacity-20" />
              <Icon className="absolute bottom-6 left-6 h-20 w-20 text-white drop-shadow-lg" />
            </div>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-brand-900">{service.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-brand-100 px-3 py-1 font-semibold text-brand-700">{service.category}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Avg. 1-2 hrs</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified pros</span>
            </div>

            <p className="mt-5 text-lg leading-relaxed text-slate-600">{service.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {['Quality guaranteed', 'On-time arrival', 'Pay after service', 'Background-checked', 'Fair pricing', 'Easy rebooking'].map((f) => (
                <div key={f} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> {f}
                </div>
              ))}
            </div>

            {/* Reviews */}
            <div className="mt-10">
              <h2 className="text-xl font-bold text-brand-900">Customer reviews</h2>
              {reviews.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-400">
                  No reviews yet — be the first to book and review!
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="card p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 font-bold text-white">
                          {(r.customer?.full_name || 'U')[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-brand-900">{r.customer?.full_name || 'Anonymous'}</p>
                          <StarRating value={r.rating} readOnly size={14} />
                        </div>
                      </div>
                      {r.comment && <p className="mt-3 text-sm text-slate-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right - booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 card p-6">
              <p className="text-sm text-slate-500">Starting from</p>
              <p className="mt-1 text-3xl font-extrabold text-brand-900">{formatPrice(service.price_from)}</p>
              <p className="mt-1 text-xs text-slate-400">Final price confirmed after inspection</p>

              <Button className="mt-5 w-full" size="lg" onClick={() => openBooking(null)}>
                <Calendar className="h-5 w-5" /> Book now
              </Button>
              <Button variant="outline" className="mt-3 w-full" onClick={() => navigate('/services')}>
                <ArrowLeft className="h-4 w-4" /> Back to services
              </Button>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
                <div className="flex items-center gap-2 text-slate-600"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified professionals</div>
                <div className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Pay after service</div>
                <div className="flex items-center gap-2 text-slate-600"><Star className="h-4 w-4 text-amber-500" /> Rated by real customers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Providers offering this */}
        <div className="mt-14">
          <h2 className="text-xl font-bold text-brand-900">Available providers</h2>
          <p className="mt-1 text-sm text-slate-500">Verified professionals offering this service.</p>
          {providers.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-400">
              No providers listed yet. Book now and we'll assign a verified professional.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((p, i) => (
                <div key={p.id} className="flex flex-col gap-3">
                  <ProviderCard provider={p} index={i} />
                  <Button onClick={() => openBooking(p)} className="w-full" size="sm">Book with this pro</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>

      {bookingOpen && service && (
        <BookingModal
          service={service}
          provider={selectedProvider}
          onClose={() => setBookingOpen(false)}
          onSuccess={(bid) => {
            setBookingOpen(false);
            toast('Booking created successfully!', 'success');
            navigate('/customer/bookings');
          }}
        />
      )}
    </div>
  );
}

function BookingModal({
  service,
  provider,
  onClose,
  onSuccess,
}: {
  service: Service;
  provider: Provider | null;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}) {
  const { profile } = useAuth();
  const toast = useToast();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const minDate = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) {
      toast('Please sign in.', 'error');
      return;
    }
    if (!date || !time || !address || !city) {
      toast('Please fill all required fields.', 'error');
      return;
    }
    setLoading(true);

    // if no provider preselected, pick the first available verified one for this service
    let providerId = provider?.id;
    if (!providerId) {
      const { data: ps } = await supabase
        .from('provider_services')
        .select('provider:providers(*)')
        .eq('service_id', service.id)
        .order('created_at', { ascending: true })
        .limit(1);
      providerId = (ps as any[])?.[0]?.provider?.id;
    }
    if (!providerId) {
      // no provider yet — create a placeholder using the first provider in the system
      const { data: anyProv } = await supabase.from('providers').select('id').limit(1).maybeSingle();
      providerId = (anyProv as any)?.id;
    }
    if (!providerId) {
      toast('No providers available right now. Please try again later.', 'error');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: profile.id,
        provider_id: providerId,
        service_id: service.id,
        address,
        city,
        scheduled_date: date,
        scheduled_time: time,
        notes,
        price: service.price_from,
        status: 'pending',
      })
      .select()
      .single();

    setLoading(false);
    if (error || !data) {
      toast(error?.message ?? 'Booking failed.', 'error');
      return;
    }

    // payment record (pending)
    await supabase.from('payments').insert({
      booking_id: data.id,
      amount: service.price_from,
      method: 'cash',
      status: 'pending',
    });

    // notify provider
    await createNotification(
      providerId,
      'New booking request',
      `${profile.full_name} booked ${service.name} for ${date} at ${time}.`,
      'booking',
      data.id,
    );

    onSuccess(data.id);
  }

  return (
    <Modal open onClose={onClose} title={`Book: ${service.name}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} required />
          <Select label="Time slot" value={time} onChange={(e) => setTime(e.target.value)} required>
            <option value="">Select time</option>
            {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
        <Input label="Address" placeholder="House no, street, area" value={address} onChange={(e) => setAddress(e.target.value)} required />
        <Select label="City" value={city} onChange={(e) => setCity(e.target.value)} required>
          <option value="">Select city</option>
          {POPULAR_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Textarea label="Notes (optional)" rows={3} placeholder="Describe the issue or any details" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="rounded-xl bg-brand-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Estimated price</span>
            <span className="font-bold text-brand-900">{formatPrice(service.price_from)}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Pay after the service is completed.</p>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">Confirm booking</Button>
      </form>
    </Modal>
  );
}
