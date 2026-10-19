import { Link } from '@/lib/router';
import { categoryIcon, categoryGradient } from '@/lib/categories';
import { formatPrice } from '@/lib/utils';
import { StarRating } from '@/components/ui/StarRating';
import type { Service, Provider } from '@/lib/types';
import { ArrowRight, MapPin } from 'lucide-react';

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const Icon = categoryIcon(service.category);
  return (
    <Link
      to={`/services/${service.id}`}
      className="card group block overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-glow animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${categoryGradient(service.category)}`}>
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <Icon className="absolute bottom-4 left-5 h-12 w-12 text-white drop-shadow-lg" />
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-900">
          from {formatPrice(service.price_from)}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-accent-600">{service.category}</p>
        <h3 className="mt-1 font-bold text-brand-900 group-hover:text-brand-700">{service.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{service.description}</p>
        <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-700">
          Book now
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export function ProviderCard({ provider, index = 0 }: { provider: Provider; index?: number }) {
  const name = provider.profile?.full_name || 'Provider';
  return (
    <div
      className="card group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          {provider.profile_photo_url ? (
            <img
              src={provider.profile_photo_url}
              alt={name}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white shadow-soft"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-lg font-bold text-white shadow-soft">
              {name[0]?.toUpperCase()}
            </div>
          )}
          {provider.is_verified && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white">
              ✓
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-brand-900">{name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <StarRating value={provider.rating} readOnly size={16} />
            {provider.rating > 0 && <span className="text-xs text-slate-400">{provider.rating_count} reviews</span>}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {provider.skills.slice(0, 3).map((s) => (
              <span key={s} className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {provider.service_areas.slice(0, 2).join(', ') || 'Flexible'}
        </span>
        <span className="text-xs font-semibold text-slate-500">{provider.jobs_completed} jobs</span>
      </div>
    </div>
  );
}
