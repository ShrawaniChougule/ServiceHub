import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select, Modal, Badge, Spinner, EmptyState } from '@/components/ui';
import { categoryIcon, categoryGradient, CATEGORIES } from '@/lib/categories';
import { formatPrice, classNames } from '@/lib/utils';
import type { Service } from '@/lib/types';
import { Search, Plus, Edit, Trash2, Settings, Power } from 'lucide-react';

export function AdminServices() {
  const toast = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Service | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('services').select('*').order('category, name');
    setServices((data as Service[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = services.filter((s) => {
    if (catFilter && s.category !== catFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function toggleActive(s: Service) {
    const { error } = await supabase.from('services').update({ is_active: !s.is_active }).eq('id', s.id);
    if (error) { toast(error.message, 'error'); return; }
    toast(s.is_active ? 'Service deactivated.' : 'Service activated.', 'success');
    load();
  }

  async function deleteService(s: Service) {
    const { error } = await supabase.from('services').delete().eq('id', s.id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Service deleted.', 'success');
    setConfirmDelete(null);
    load();
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">Services</h1>
          <p className="mt-1 text-slate-500">{services.length} services across {CATEGORIES.length} categories</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Add service</Button>
      </div>

      <div className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="input-field pl-10 py-2.5 text-sm" />
        </div>
        <div className="sm:w-48">
          <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Settings className="h-12 w-12" />} title="No services found" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price from</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const Icon = categoryIcon(s.category);
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${categoryGradient(s.category)}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-brand-900">{s.name}</p>
                            <p className="line-clamp-1 max-w-xs text-xs text-slate-400">{s.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><Badge color="blue">{s.category}</Badge></td>
                      <td className="px-5 py-3.5 font-bold text-brand-900">{formatPrice(s.price_from)}</td>
                      <td className="px-5 py-3.5">
                        {s.is_active ? <Badge color="green">Active</Badge> : <Badge color="slate">Inactive</Badge>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => setEditing(s)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => toggleActive(s)}><Power className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDelete(s)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(creating || editing) && (
        <ServiceFormModal
          service={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }}
        />
      )}

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete service?" size="sm">
        <p className="text-sm text-slate-600">Are you sure you want to delete <span className="font-bold text-brand-900">{confirmDelete?.name}</span>? This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="primary" className="bg-rose-600 hover:bg-rose-700" onClick={() => confirmDelete && deleteService(confirmDelete)}>Delete</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function ServiceFormModal({ service, onClose, onSaved }: { service: Service | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [name, setName] = useState(service?.name ?? '');
  const [category, setCategory] = useState(service?.category ?? CATEGORIES[0].name);
  const [description, setDescription] = useState(service?.description ?? '');
  const [priceFrom, setPriceFrom] = useState(service?.price_from ?? 299);
  const [iconName, setIconName] = useState(service?.icon_name ?? 'Wrench');
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !category || priceFrom < 0) {
      toast('Fill all required fields.', 'error');
      return;
    }
    setSaving(true);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (service) {
      const { error } = await supabase.from('services').update({ name, category, description, price_from: priceFrom, icon_name: iconName, slug }).eq('id', service.id);
      if (error) { toast(error.message, 'error'); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('services').insert({ name, category, description, price_from: priceFrom, icon_name: iconName, slug, is_active: true });
      if (error) { toast(error.message, 'error'); setSaving(false); return; }
    }
    setSaving(false);
    toast('Service saved.', 'success');
    onSaved();
  }

  return (
    <Modal open onClose={onClose} title={service ? 'Edit service' : 'Add service'} size="md">
      <form onSubmit={save} className="space-y-4">
        <Input label="Service name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pipe Leak Repair" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
          </Select>
          <Input label="Price from (₹)" type="number" min={0} value={priceFrom} onChange={(e) => setPriceFrom(Number(e.target.value))} required />
        </div>
        <Input label="Icon name (lucide-react)" value={iconName} onChange={(e) => setIconName(e.target.value)} placeholder="Wrench" />
        <Textarea label="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the service..." />
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{service ? 'Save changes' : 'Create service'}</Button>
        </div>
      </form>
    </Modal>
  );
}
