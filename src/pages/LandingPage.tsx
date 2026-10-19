import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { CATEGORIES, POPULAR_CITIES } from '@/lib/categories';
import { ServiceCard } from '@/components/cards';
import { SectionTitle } from '@/components/ui/Misc';
import { supabase } from '@/lib/supabase';
import type { Service } from '@/lib/types';
import {
  Search, MapPin, ShieldCheck, Clock, Star, ArrowRight, Sparkles,
  CalendarCheck, BadgeCheck, Wallet, ThumbsUp, Quote,
} from 'lucide-react';

export function LandingPage() {
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('price_from', { ascending: true })
        .limit(8);
      setServices((data as Service[]) ?? []);
      setLoading(false);
    })();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (city) params.set('city', city);
    navigate(`/services?${params.toString()}`);
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-radial">
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-accent-300" />
              Trusted by 50,000+ happy customers
            </span>
            <h1 className="mt-6 animate-fade-in-up text-4xl font-extrabold leading-[1.1] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
              Home services made
              <span className="block bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
                simple &amp; reliable
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl animate-fade-in-up text-lg text-slate-200 text-balance" style={{ animationDelay: '100ms' }}>
              Book verified electricians, plumbers, cleaners, tutors and more — at your doorstep, on your schedule.
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-9 max-w-2xl animate-fade-in-up rounded-2xl bg-white p-2 shadow-glow"
              style={{ animationDelay: '200ms' }}
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What service do you need?"
                    className="w-full rounded-xl border-0 bg-transparent pl-11 pr-4 py-3.5 text-brand-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                  />
                </div>
                <div className="relative sm:w-52">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full rounded-xl border-0 bg-slate-50 pl-11 pr-4 py-3.5 text-brand-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <button type="submit" className="btn-primary whitespace-nowrap">
                  <Search className="h-5 w-5" /> Search
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <span className="text-sm text-slate-300">Popular:</span>
              {POPULAR_CITIES.slice(0, 5).map((c) => (
                <button
                  key={c}
                  onClick={() => navigate(`/services?city=${c}`)}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            {[
              { label: 'Professionals', value: '2,500+' },
              { label: 'Bookings / month', value: '18,000+' },
              { label: 'Avg. rating', value: '4.8 / 5' },
              { label: 'Cities covered', value: '25+' },
            ].map((s) => (
              <div key={s.label} className="glass-dark rounded-2xl p-4 text-center">
                <p className="text-2xl font-extrabold text-white sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-300 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            center
            eyebrow="Browse categories"
            title="Services for every need"
            subtitle="From quick fixes to deep cleans — find the right professional in seconds."
          />
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((c, i) => (
              <Link
                key={c.slug}
                to={`/services?category=${c.slug}`}
                className="card group flex flex-col items-center p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-glow animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${c.gradient} shadow-soft transition-transform group-hover:scale-110`}>
                  <c.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-brand-900">{c.name}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{c.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR SERVICES */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <SectionTitle
              eyebrow="Popular services"
              title="Most booked this week"
            />
            <Link to="/services" className="hidden items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-900 sm:flex">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card h-64 shimmer bg-slate-100" />
                ))
              : services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle center eyebrow="How it works" title="Book in 3 easy steps" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Search, title: 'Search & Compare', desc: 'Browse services by category and location. Compare verified providers and pricing.' },
              { icon: CalendarCheck, title: 'Book a slot', desc: 'Pick a date and time that works for you. Confirm your booking in seconds.' },
              { icon: BadgeCheck, title: 'Get it done', desc: 'A verified professional arrives on time. Pay after the service and leave a review.' },
            ].map((step, i) => (
              <div key={i} className="relative card p-8 text-center animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-900 px-3 py-1 text-xs font-bold text-white">
                  Step {i + 1}
                </div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 shadow-soft">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-brand-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-brand-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-300">
                Why ServiceHub
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-balance">
                Quality you can trust, transparency you deserve
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                Every professional is background-checked and skill-verified. No hidden charges, no surprises.
              </p>
              <div className="mt-8 space-y-5">
                {[
                  { icon: ShieldCheck, title: 'Verified professionals', desc: 'ID-verified and skill-tested experts only.' },
                  { icon: Wallet, title: 'Transparent pricing', desc: 'See the price upfront. Pay only after the job is done.' },
                  { icon: Clock, title: 'On-time guarantee', desc: 'Your time matters. Professionals arrive when promised.' },
                  { icon: Star, title: 'Rated by real customers', desc: 'Every review comes from a completed booking.' },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <f.icon className="h-5 w-5 text-accent-300" />
                    </div>
                    <div>
                      <h3 className="font-bold">{f.title}</h3>
                      <p className="text-sm text-slate-400">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent-500/20 to-brand-600/20 blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {[
                  { stat: '98%', label: 'On-time arrival' },
                  { stat: '4.8★', label: 'Average rating' },
                  { stat: '2,500+', label: 'Verified pros' },
                  { stat: '0', label: 'Hidden charges' },
                ].map((s) => (
                  <div key={s.label} className="glass-dark rounded-2xl p-6 text-center">
                    <p className="text-3xl font-extrabold text-white">{s.stat}</p>
                    <p className="mt-1 text-sm text-slate-300">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle center eyebrow="Testimonials" title="Loved by customers" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Priya Sharma', role: 'Bengaluru', text: 'Booked an AC service and the technician arrived within 2 hours. Professional and transparent pricing. Highly recommend!' },
              { name: 'Rahul Verma', role: 'Mumbai', text: 'The deep cleaning service was outstanding. The team was punctual and left my apartment spotless. Will use again.' },
              { name: 'Ananya Gupta', role: 'Delhi', text: 'Found an excellent math tutor for my son through ServiceHub. The booking process was effortless.' },
            ].map((t, i) => (
              <div key={i} className="card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <Quote className="h-8 w-8 text-brand-200" />
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.text}</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 font-bold text-white">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 px-6 py-14 text-center shadow-glow sm:px-12">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="relative">
            <ThumbsUp className="mx-auto h-12 w-12 text-accent-300" />
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-balance">
              Are you a skilled professional?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
              Join ServiceHub as a service provider, set your own areas, and grow your business with steady bookings.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/signup?role=provider" className="btn-accent w-full sm:w-auto">
                Become a Provider <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/services" className="btn-outline w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 sm:w-auto">
                Browse services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
