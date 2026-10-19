import { type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from '@/lib/router';
import { Spinner } from '@/components/ui';
import { ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
  children: ReactNode;
  role?: 'customer' | 'provider' | 'admin';
}

export function ProtectedRoute({ children, role }: Props) {
  const { profile, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      navigate('/login');
      return;
    }
    if (profile.is_blocked) {
      navigate('/');
      return;
    }
    if (role && profile.role !== role) {
      navigate('/');
    }
  }, [profile, loading, role, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!profile || (role && profile.role !== role) || profile.is_blocked) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <ShieldAlert className="h-12 w-12 text-rose-400" />
        <p className="text-lg font-bold text-brand-900">Access restricted</p>
        <p className="text-sm text-slate-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
