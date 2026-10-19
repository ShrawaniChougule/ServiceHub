import { Link } from '@/lib/router';
import { PageContainer } from '@/components/layout/Layout';
import { SectionTitle } from '@/components/ui/Misc';
import { CATEGORIES } from '@/lib/categories';
import {
  Target, Heart, ShieldCheck, Users, TrendingUp, Globe, ArrowRight,
  Search, CalendarCheck, BadgeCheck, Wallet,
} from 'lucide-react';

export function AboutPage() {
  const values = [
    { icon: ShieldCheck, title: 'Trust & Safety', desc: 'Every professional is background-checked and skill-verified before joining.' },
    { icon: Heart, title: 'Customer First', desc: 'We obsess over making every booking effortless and every service exceptional.' },
    { icon: Wallet, title: 'Transparency', desc: 'No hidden charges. See pricing upfront and pay only after the job is done.' },
    { icon: TrendingUp, title: 'Empowerment', desc: 'We help skilled professionals grow their business with steady, fair work.' },
  ];

  return (
    <div>
      <section className="bg-hero-radial py-20">
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <PageContainer className="relative text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
            <Globe className="h-4 w-4 text-accent-300" /> Our story
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-white text-balance sm:text-5xl">
            Connecting communities with trusted local professionals
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-200">
            ServiceHub was born from a simple idea — finding a reliable plumber, electrician, or tutor
            shouldn't be a gamble. We've built the marketplace that makes quality home services accessible to everyone.
          </p>
        </PageContainer>
      </section>

      {/* Stats */}
      <section className="py-16">
        <PageContainer>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { value: '50,000+', label: 'Happy customers', icon: Users },
              { value: '2,500+', label: 'Verified professionals', icon: ShieldCheck },
              { value: '18,000+', label: 'Monthly bookings', icon: CalendarCheck },
              { value: '25+', label: 'Cities served', icon: Globe },
            ].map((s) => (
              <div key={s.label} className="card p-6 text-center">
                <s.icon className="mx-auto h-8 w-8 text-brand-700" />
                <p className="mt-3 text-3xl font-extrabold text-brand-900">{s.value}</p>
                <p className="mt-1 text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Mission */}
      <section className="bg-slate-50 py-20">
        <PageContainer>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionTitle eyebrow="Our mission" title="Quality services for every home" />
              <p className="mt-4 text-lg text-slate-600">
                We believe everyone deserves access to skilled, reliable professionals — whether it's fixing
                a leaking tap, servicing an AC, or finding the right tutor. By verifying every provider and
                making bookings transparent, we're removing the guesswork from home services.
              </p>
              <p className="mt-4 text-lg text-slate-600">
                For professionals, ServiceHub offers a platform to grow their business, reach more customers,
                and earn a fair income doing what they do best.
              </p>
              <Link to="/services" className="btn-primary mt-8">Explore services <ArrowRight className="h-5 w-5" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {values.map((v, i) => (
                <div key={v.title} className={`card p-6 animate-fade-in-up ${i % 2 === 1 ? 'mt-8' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
                    <v.icon className="h-5 w-5 text-brand-700" />
                  </div>
                  <h3 className="mt-4 font-bold text-brand-900">{v.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Categories */}
      <section className="py-20">
        <PageContainer>
          <SectionTitle center eyebrow="What we offer" title="Services across every category" />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} to={`/services?category=${c.slug}`}
                className="card flex items-center gap-2.5 px-5 py-3 transition-all hover:-translate-y-0.5 hover:shadow-glow">
                <c.icon className="h-5 w-5 text-brand-700" />
                <span className="font-semibold text-brand-900">{c.name}</span>
              </Link>
            ))}
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
