import { useState } from 'react';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast('Please enter your email.', 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/login`,
    });
    setLoading(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    setSent(true);
    toast('Reset link sent to your email.', 'success');
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-900">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-brand-900">Check your inbox</h3>
          <p className="mt-1.5 text-sm text-slate-500">
            We've sent a password reset link to <span className="font-semibold text-brand-900">{email}</span>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
