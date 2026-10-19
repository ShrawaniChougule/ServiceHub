import { useState } from 'react';
import { Link } from '@/lib/router';
import { PageContainer } from '@/components/layout/Layout';
import { SectionTitle } from '@/components/ui/Misc';
import { classNames } from '@/lib/utils';
import { Plus, Minus, ArrowRight } from 'lucide-react';

const faqs = [
  { q: 'How do I book a service on ServiceHub?', a: 'Browse services by category or search by keyword and city. Select a service, choose a date and time slot, enter your address, and confirm. A verified professional will be assigned to your booking.' },
  { q: 'Are the service providers verified?', a: 'Yes. Every provider undergoes ID verification and skill assessment before being listed. Look for the verified badge on provider profiles.' },
  { q: 'How is the pricing determined?', a: 'Each service shows a starting price. The final amount may vary based on the scope of work, which the professional confirms after inspection. You pay only after the service is completed.' },
  { q: 'Can I cancel or reschedule a booking?', a: 'Yes. You can cancel a pending or accepted booking from your dashboard at no charge. To reschedule, cancel and create a new booking for your preferred slot.' },
  { q: 'What payment methods are accepted?', a: 'We support cash, cards, UPI, and digital wallets. Payment is collected after the service is completed to your satisfaction.' },
  { q: 'How do I leave a review?', a: 'After a booking is marked completed, a "Rate & Review" button appears in your bookings list. Your feedback helps other customers and rewards great providers.' },
  { q: 'How do I become a service provider?', a: 'Sign up as a provider, complete your profile with skills, service areas, and an ID proof. Our admin team verifies your profile, after which you can start receiving bookings.' },
  { q: 'What if I am not satisfied with the service?', a: 'You can leave an honest review and contact our support team. We take quality seriously and will work to resolve any issues promptly.' },
  { q: 'Is my personal information safe?', a: 'Yes. We use industry-standard encryption and never share your personal details with third parties without consent. See our Privacy Policy for details.' },
  { q: 'Do you charge a booking fee?', a: 'No. Browsing and booking on ServiceHub is free for customers. You only pay for the service you receive.' },
];

export function FaqPage() {
  return (
    <div>
      <section className="bg-hero-radial py-16">
        <PageContainer className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">FAQ</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-200">
            Answers to the most common questions about ServiceHub.
          </p>
        </PageContainer>
      </section>

      <PageContainer className="max-w-3xl py-16">
        <div className="space-y-3">
          {faqs.map((f, i) => <FaqRow key={i} q={f.q} a={f.a} />)}
        </div>
        <div className="mt-12 text-center">
          <p className="text-slate-500">Can't find what you're looking for?</p>
          <Link to="/contact" className="btn-primary mt-4">Contact support <ArrowRight className="h-5 w-5" /></Link>
        </div>
      </PageContainer>
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
