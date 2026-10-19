import { useState } from 'react';
import { Link } from '@/lib/router';
import { PageContainer } from '@/components/layout/Layout';
import { SectionTitle } from '@/components/ui/Misc';
import { classNames } from '@/lib/utils';
import {
  Search, CalendarCheck, BadgeCheck, CreditCard, Star, ShieldCheck,
  Plus, Minus, ArrowRight,
} from 'lucide-react';

const faqs = [
  { q: 'How do I book a service on ServiceHub?', a: 'Browse services by category or search by keyword and city. Select a service, choose a date and time slot, enter your address, and confirm. A verified professional will be assigned to your booking.' },
  { q: 'Are the service providers verified?', a: 'Yes. Every provider undergoes ID verification and skill assessment before being listed. Look for the verified badge on provider profiles.' },
  { q: 'How is the pricing determined?', a: 'Each service shows a starting price. The final amount may vary based on the scope of work, which the professional confirms after inspection. You pay only after the service is completed.' },
  { q: 'Can I cancel or reschedule a booking?', a: 'Yes. You can cancel a pending or accepted booking from your dashboard at no charge. To reschedule, cancel and create a new booking for your preferred slot.' },
  { q: 'What payment methods are accepted?', a: 'We support cash, cards, UPI, and digital wallets. Payment is collected after the service is completed to your satisfaction.' },
  { q: 'How do I leave a review?', a: 'After a booking is marked completed, a "Rate & Review" button appears in your bookings list. Your feedback helps other customers and rewards great providers.' },
  { q: 'How do I become a service provider?', a: 'Sign up as a provider, complete your profile with skills, service areas, and an ID proof. Our admin team verifies your profile, after which you can start receiving bookings.' },
  { q: 'What if I am not satisfied with the service?', a: 'You can leave a honest review and contact our support team. We take quality seriously and will work to resolve any issues.' },
];

export function HowItWorksPage() {
  return (
    <div>
      <section className="bg-hero-radial py-16">
        <PageContainer className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">How ServiceHub works</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-200">
            From booking to completion — here's everything you need to know.
          </p>
        </PageContainer>
      </section>

      {/* Steps */}
      <section className="py-20">
        <PageContainer>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Search, title: 'Search', desc: 'Find the service you need by category, keyword, or location.' },
              { icon: CalendarCheck, title: 'Book', desc: 'Pick a date and time slot that works for you and confirm.' },
              { icon: BadgeCheck, title: 'Get service', desc: 'A verified professional arrives at your doorstep on time.' },
              { icon: CreditCard, title: 'Pay & review', desc: 'Pay after the job is done and share your experience.' },
            ].map((s, i) => (
              <div key={s.title} className="relative card p-6 text-center animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-900 px-3 py-0.5 text-xs font-bold text-white">
                  {i + 1}
                </div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 shadow-soft">
                  <s.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-4 font-bold text-brand-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Why trust */}
      <section className="bg-slate-50 py-20">
        <PageContainer>
          <SectionTitle center eyebrow="Why trust us" title="Built on safety and transparency" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Verified professionals', desc: 'Every provider is ID-checked and skill-assessed.' },
              { icon: Star, title: 'Real customer reviews', desc: 'Reviews only come from completed, verified bookings.' },
              { icon: CreditCard, title: 'Pay after service', desc: 'Your money is safe — pay only when the job is done.' },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <f.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-4 font-bold text-brand-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <PageContainer className="max-w-3xl">
          <SectionTitle center eyebrow="FAQ" title="Frequently asked questions" />
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => <FaqRow key={i} q={f.q} a={f.a} />)}
          </div>
          <div className="mt-12 text-center">
            <p className="text-slate-500">Still have questions?</p>
            <Link to="/contact" className="btn-primary mt-4">Contact us <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-bold text-brand-900">{q}</span>
        <span className={classNames('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors', open ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-500')}>
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      {open && <div className="animate-fade-in px-5 pb-5 text-sm leading-relaxed text-slate-600">{a}</div>}
    </div>
  );
}
