import { type ReactNode } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { classNames } from '@/lib/utils';
import {
  LayoutDashboard, ClipboardList, User, Star, Wallet, Wrench,
  Users, CalendarCheck, Settings, ShieldCheck,
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
}

const navByRole: Record<string, NavItem[]> = {
  customer: [
    { label: 'Dashboard', to: '/customer', icon: LayoutDashboard },
    { label: 'My Bookings', to: '/customer/bookings', icon: ClipboardList },
    { label: 'Profile', to: '/customer/profile', icon: User },
  ],
  provider: [
    { label: 'Dashboard', to: '/provider', icon: LayoutDashboard },
    { label: 'Bookings', to: '/provider/bookings', icon: ClipboardList },
    { label: 'Earnings', to: '/provider/earnings', icon: Wallet },
    { label: 'Reviews', to: '/provider/reviews', icon: Star },
    { label: 'Profile', to: '/provider/profile', icon: User },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
    { label: 'Customers', to: '/admin/customers', icon: Users },
    { label: 'Providers', to: '/admin/providers', icon: Wrench },
    { label: 'Bookings', to: '/admin/bookings', icon: CalendarCheck },
    { label: 'Services', to: '/admin/services', icon: Settings },
  ],
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const { path } = useRouter();
  if (!profile) return null;
  const items = navByRole[profile.role] ?? [];

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-br from-brand-800 to-brand-950 p-5 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-300">
                  <ShieldCheck className="h-4 w-4" /> {profile.role} panel
                </div>
                <p className="mt-2 truncate font-bold">{profile.full_name || 'User'}</p>
                <p className="truncate text-xs text-slate-300">{profile.email}</p>
              </div>
              <nav className="p-2">
                {items.map((item) => {
                  const active = path === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={classNames(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                        active ? 'bg-brand-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-brand-900',
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
