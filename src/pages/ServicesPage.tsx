import { useEffect, useMemo, useState } from 'react';
import { useRouter, Link } from '@/lib/router';
import { useQueryParams } from '@/lib/useQueryParams';
import { CATEGORIES, POPULAR_CITIES } from '@/lib/categories';
import { supabase } from '@/lib/supabase';
import { ServiceCard } from '@/components/cards';
import { PageContainer } from '@/components/layout/Layout';
import { EmptyState, Spinner } from '@/components/ui/Misc';
import { Input, Select } from '@/components/ui/Input';
import type { Service } from '@/lib/types';
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react';

export function ServicesPage() {
  const params = useQueryParams();
  const { navigate } = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? '');
  const [city, setCity] = useState(params.get('city') ?? '');
  const [sort, setSort] = useState('popular');

  useEffect(() => {
    setQ(params.get('q') ?? '');
    setCategory(params.get('category') ?? '');
    setCity(params.get('city') ?? '');
  }, [params]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      let query = supabase.from('services').select('*').eq('is_active', true);
      if (category) query = query.eq('category', category);
      if (q) {
        const safe = q.replace(/[%_]/g, (m) => '\\' + m);
        query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%,category.ilike.%${safe}%`);
      }
      if (sort === 'price-low') query = query.order('price_from', { ascending: true });
      else if (sort === 'price-high') query = query.order('price_from', { ascending: false });
      else query = query.order('name');
      const { data } = await query;
      if (!active) return;
      setServices((data as Service[]) ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [q, category, sort]);

  function updateUrl(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    navigate(`/services?${p.toString()}`);
  }

  function clearFilters() {
    setQ('');
    setCategory('');
    setCity('');
    setSort('popular');
    navigate('/services');
  }

  const activeFilters = useMemo(() => [q, category, city].filter(Boolean).length, [q, category, city]);

  return (
    <div>
      {/* Hero strip */}
      <div className="border-b border-slate-100 bg-gradient-to-br from-brand-50 to-slate-50">
        <PageContainer className="py-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-900">Browse services</h1>
          <p className="mt-2 text-slate-500">Find trusted professionals across {CATEGORIES.length} categories.</p>

          {/* Search bar */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && updateUrl('q', q)}
                placeholder="Search services..."
                className="input-field pl-11"
              />
            </div>
            <div className="relative sm:w-56">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && updateUrl('city', city)}
                placeholder="City"
                className="input-field pl-11"
              />
            </div>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="py-10">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setCategory(''); updateUrl('category', ''); }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              !category ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => { setCategory(c.slug); updateUrl('category', c.slug); }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                category === c.slug ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <SlidersHorizontal className="h-4 w-4" />
            {loading ? 'Loading...' : `${services.length} service${services.length !== 1 ? 's' : ''} found`}
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="ml-2 inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700">
                <X className="h-3.5 w-3.5" /> Clear filters
              </button>
            )}
          </div>
          <div className="w-44">
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Sort: Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </Select>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
          ) : services.length === 0 ? (
            <EmptyState
              icon={<Search className="h-12 w-12" />}
              title="No services found"
              description="Try adjusting your search or filters."
              action={<Link to="/services" className="btn-primary">Reset</Link>}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
            </div>
          )}
        </div>

        {/* City chips */}
        <div className="mt-12 border-t border-slate-100 pt-8">
          <p className="text-sm font-bold text-brand-900">Available in these cities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {POPULAR_CITIES.map((c) => (
              <Link
                key={c}
                to={`/services?city=${c}`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
