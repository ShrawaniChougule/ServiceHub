import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui';
import { Avatar } from '@/components/ui/Misc';
import { Upload, User, Mail, Phone, ShieldCheck } from 'lucide-react';

export function CustomerProfile() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 2 * 1024 * 1024) {
      toast('Image must be under 2MB.', 'error');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `avatars/${profile.id}.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) {
      toast(upErr.message, 'error');
      setUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(pub.publicUrl);
    setUploading(false);
    toast('Photo uploaded.', 'success');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, avatar_url: avatarUrl })
      .eq('id', profile.id);
    setSaving(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    await refreshProfile();
    toast('Profile updated.', 'success');
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-900">My Profile</h1>
        <p className="mt-1 text-slate-500">Manage your personal information.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar card */}
        <div className="card flex flex-col items-center p-6 text-center">
          <Avatar name={profile.full_name || profile.email} src={avatarUrl || undefined} size="xl" />
          <p className="mt-4 font-bold text-brand-900">{profile.full_name || 'User'}</p>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase text-brand-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Customer
          </span>
          <label className="mt-5 cursor-pointer">
            <span className="btn-outline inline-flex">
              <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Change photo'}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="card space-y-5 p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Full name" icon={<User className="h-4 w-4" />} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input label="Phone" icon={<Phone className="h-4 w-4" />} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Input label="Email" icon={<Mail className="h-4 w-4" />} value={profile.email} disabled />
            <div className="flex justify-end border-t border-slate-100 pt-5">
              <Button type="submit" loading={saving}>Save changes</Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
