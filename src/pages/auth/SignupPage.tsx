import { useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User, Eye, EyeOff, Wrench, Home as HomeIcon, Shield } from 'lucide-react';
import type { Role } from '@/lib/types';

export function SignupPage() {
  const { signUp } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();

  // pre-select role from query string e.g. #/signup?role=provider
  const initialRole = (() => {
    const qs = window.location.hash.split('?')[1] ?? '';
    return new URLSearchParams(qs).get('role') as Role | null;
  })();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>(initialRole === 'provider' ? 'provider' : 'customer');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (error) {
      setError(error);
      toast(error, 'error');
      return;
    }
    toast('Account created! You are signed in.', 'success');
    navigate(role === 'provider' ? '/provider' : '/customer');
  }

  const roles: { value: Role; label: string; icon: typeof HomeIcon; desc: string }[] = [
    { value: 'customer', label: 'Customer', icon: HomeIcon, desc: 'Book services' },
    { value: 'provider', label: 'Provider', icon: Wrench, desc: 'Offer services' },
  ];

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join ServiceHub in less than a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-900">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role selector */}
        <div>
          <label className="label">I want to</label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 transition-all ${
                  role === r.value
                    ? 'border-brand-600 bg-brand-50 text-brand-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <r.icon className="h-6 w-6" />
                <span className="text-sm font-bold">{r.label}</span>
                <span className="text-xs text-slate-400">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Full name"
          placeholder="John Doe"
          icon={<User className="h-4 w-4" />}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Phone (optional)"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            placeholder="At least 6 characters"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600"
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create account
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
          <Shield className="h-3.5 w-3.5" /> By signing up you agree to our Terms &amp; Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}
