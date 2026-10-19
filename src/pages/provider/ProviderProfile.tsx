import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select, Badge, Spinner } from '@/components/ui';
import { CATEGORIES, POPULAR_CITIES } from '@/lib/categories';
import { classNames } from '@/lib/utils';
import type { Provider, Service } from '@/lib/types';
import {
  Upload, X, Plus, CreditCard, MapPin, Wrench, BadgeCheck, ShieldCheck, Star,
} from 'lucide-react';

export function ProviderProfile() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [providerServiceIds, setProviderServiceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [idProofUrl, setIdProofUrl] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      const [provRes, svcRes, psRes] = await Promise.all([
        supabase.from('providers').select('*').eq('id', profile.id).maybeSingle(),
        supabase.from('services').select('*').eq('is_active', true).order('category'),
        supabase.from('provider_services').select('service_id').eq('provider_id', profile.id),
      ]);
      if (!active) return;
      const p = provRes.data as Provider | null;
      setProvider(p);
      setBio(p?.bio ?? '');
      setPhotoUrl(p?.profile_photo_url ?? '');
      setIdProofUrl(p?.id_proof_url ?? '');
      setSkills(p?.skills ?? []);
      setAreas(p?.service_areas ?? []);
      setAllServices((svcRes.data as Service[]) ?? []);
      setProviderServiceIds(((psRes.data as any[]) ?? []).map((r) => r.service_id));
      setLoading(false);
    })();
    return () => { active = false; };
  }, [profile]);

  if (!profile) return null;

  async function uploadFile(bucket: string, path: string, file: File, onDone: (url: string) => void, setUploading: (b: boolean) => void) {
    if (file.size > 5 * 1024 * 1024) {
      toast('File must be under 5MB.', 'error');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fullPath = `${path}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(fullPath, file, { upsert: true });
    setUploading(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
    onDone(data.publicUrl);
    toast('Uploaded.', 'success');
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput('');
  }
  function addArea() {
    const a = areaInput.trim();
    if (a && !areas.includes(a)) setAreas([...areas, a]);
    setAreaInput('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // update profile
    const { error: pErr } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', profile!.id);
    if (pErr) { toast(pErr.message, 'error'); setSaving(false); return; }

    // update provider
    const { error: provErr } = await supabase
      .from('providers')
      .update({ bio, profile_photo_url: photoUrl, id_proof_url: idProofUrl, skills, service_areas: areas })
      .eq('id', profile!.id);
    if (provErr) { toast(provErr.message, 'error'); setSaving(false); return; }

    // sync provider_services — delete all then re-insert the current selection
    await supabase.from('provider_services').delete().eq('provider_id', profile!.id);
    if (providerServiceIds.length) {
      await supabase.from('provider_services').insert(
        providerServiceIds.map((service_id) => ({ provider_id: profile!.id, service_id })),
      );
    }

    await refreshProfile();
    setSaving(false);
    toast('Profile saved.', 'success');
  }

  function toggleService(id: string) {
    setProviderServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      </DashboardLayout>
    );
  }

  const servicesByCategory = CATEGORIES.map((c) => ({
    cat: c,
    items: allServices.filter((s) => s.category === c.name),
  })).filter((g) => g.items.length > 0);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">Provider Profile</h1>
        <p className="mt-1 text-slate-500">Set up your profile to start receiving bookings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Verification status */}
        <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {provider?.is_verified ? (
              <Badge color="green"><BadgeCheck className="h-4 w-4" /> Verified provider</Badge>
            ) : (
              <Badge color="amber"><ShieldCheck className="h-4 w-4" /> Pending verification</Badge>
            )}
            {provider && provider.rating > 0 && (
              <Badge color="amber"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {provider.rating.toFixed(1)} ({provider.rating_count})</Badge>
            )}
          </div>
          <p className="text-xs text-slate-400">Admin verifies profiles after you upload your ID proof.</p>
        </div>

        {/* Photo + basic info */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold text-brand-900">Basic information</h2>
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="h-28 w-28 rounded-2xl object-cover ring-2 ring-white shadow-soft" />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-3xl font-bold text-white">
                    {(fullName || 'P')[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <span className="btn-outline inline-flex text-sm">
                  <Upload className="h-4 w-4" /> {uploadingPhoto ? 'Uploading...' : 'Upload photo'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile('avatars', `providers/${profile.id}`, f, setPhotoUrl, setUploadingPhoto);
                }} disabled={uploadingPhoto} />
              </label>
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Email" value={profile.email} disabled />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold text-brand-900">About you</h2>
          <Textarea label="Bio" rows={4} placeholder="Tell customers about your experience and expertise..." value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        {/* Skills */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-900"><Wrench className="h-5 w-5 text-brand-700" /> Skills</h2>
          <div className="flex gap-2">
            <Input placeholder="e.g. Pipe fitting, Leak detection" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
            <Button type="button" variant="outline" onClick={addSkill}><Plus className="h-4 w-4" /> Add</Button>
          </div>
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
                  {s}
                  <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}><X className="h-3.5 w-3.5" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Service areas */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-900"><MapPin className="h-5 w-5 text-brand-700" /> Service areas</h2>
          <div className="flex gap-2">
            <Input placeholder="e.g. Andheri, Bandra" value={areaInput} onChange={(e) => setAreaInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())} />
            <Button type="button" variant="outline" onClick={addArea}><Plus className="h-4 w-4" /> Add</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {POPULAR_CITIES.map((c) => (
              <button key={c} type="button" onClick={() => !areas.includes(c) && setAreas([...areas, c])}
                className={classNames('rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                  areas.includes(c) ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
                {c}
              </button>
            ))}
          </div>
          {areas.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {areas.map((a) => (
                <span key={a} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                  <MapPin className="h-3.5 w-3.5" /> {a}
                  <button type="button" onClick={() => setAreas(areas.filter((x) => x !== a))}><X className="h-3.5 w-3.5" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ID proof */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-900"><CreditCard className="h-5 w-5 text-brand-700" /> ID Proof</h2>
          <p className="mb-3 text-sm text-slate-500">Upload a government-issued ID (Aadhaar, PAN, etc.) for verification.</p>
          <label className="cursor-pointer">
            <span className="btn-outline inline-flex">
              <Upload className="h-4 w-4" /> {uploadingId ? 'Uploading...' : 'Upload ID document'}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile('idproofs', `${profile.id}`, f, setIdProofUrl, setUploadingId);
            }} disabled={uploadingId} />
          </label>
          {idProofUrl && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
              <BadgeCheck className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">ID proof uploaded successfully</span>
              <a href={idProofUrl} target="_blank" rel="noreferrer" className="ml-auto text-sm font-semibold text-brand-700 hover:underline">View</a>
            </div>
          )}
        </div>

        {/* Services offered */}
        <div className="card p-6">
          <h2 className="mb-1 text-lg font-bold text-brand-900">Services you offer</h2>
          <p className="mb-4 text-sm text-slate-500">Select the services you can provide.</p>
          <div className="space-y-5">
            {servicesByCategory.map((g) => (
              <div key={g.cat.slug}>
                <p className="mb-2 text-sm font-bold text-brand-900">{g.cat.name}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {g.items.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleService(s.id)}
                      className={classNames(
                        'flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all',
                        providerServiceIds.includes(s.id)
                          ? 'border-brand-600 bg-brand-50'
                          : 'border-slate-200 hover:border-slate-300',
                      )}
                    >
                      <span className="text-sm font-semibold text-brand-900">{s.name}</span>
                      <span className={classNames(
                        'flex h-5 w-5 items-center justify-center rounded-md border-2',
                        providerServiceIds.includes(s.id) ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300',
                      )}>
                        {providerServiceIds.includes(s.id) && <BadgeCheck className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="sticky bottom-4 z-10">
          <div className="card flex items-center justify-between p-4 shadow-glow">
            <p className="text-sm text-slate-500">Don't forget to save your changes.</p>
            <Button type="submit" loading={saving} size="lg">Save profile</Button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
