import { type ReactNode } from 'react';
import { Link } from '@/lib/router';
import { Wrench, ShieldCheck, BadgeCheck, Clock } from 'lucide-react';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden bg-hero-radial lg:flex lg:flex-col lg:justify-between p-12">
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-700">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Service<span className="text-accent-400">Hub</span>
            </span>
          </Link>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight text-white text-balance">
            The marketplace trusted by thousands of households.
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Book verified professionals, track every booking, and pay with confidence.
          </p>
          <div className="mt-10 space-y-5">
            {[
              { icon: ShieldCheck, text: 'Every provider is ID-verified & skill-checked' },
              { icon: BadgeCheck, text: 'Transparent upfront pricing — no surprises' },
              { icon: Clock, text: 'On-time arrival, every single time' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <f.icon className="h-5 w-5 text-accent-300" />
                </div>
                <p className="text-sm text-slate-200">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex gap-8 text-white">
          <div><p className="text-2xl font-extrabold">2,500+</p><p className="text-xs text-slate-400">Professionals</p></div>
          <div><p className="text-2xl font-extrabold">18k+</p><p className="text-xs text-slate-400">Monthly bookings</p></div>
          <div><p className="text-2xl font-extrabold">4.8★</p><p className="text-xs text-slate-400">Avg. rating</p></div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-900">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-brand-900">
                Service<span className="text-accent-500">Hub</span>
              </span>
            </Link>
          </div>
          <div className="card p-8 animate-scale-in">
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">{title}</h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
