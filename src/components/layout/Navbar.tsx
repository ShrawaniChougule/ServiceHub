import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/ui/Misc';
import { classNames } from '@/lib/utils';
import type { Notification } from '@/lib/types';
import {
  Menu, X, Bell, LayoutDashboard, User, LogOut, Wrench, ClipboardList,
  CalendarCheck, Shield, ChevronDown, Home as HomeIcon, Wallet, Star,
} from 'lucide-react';

export function Navbar() {
  const { path, navigate } = useRouter();
  const { profile, signOut, isProvider, isAdmin, isCustomer } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notes, setNotes] = useState<Notification[]>([]);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
    setBellOpen(false);
  }, [path]);

  useEffect(() => {
    if (!profile) {
      setUnread(0);
      setNotes([]);
      return;
    }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (!active) return;
      setNotes((data as Notification[]) ?? []);
      setUnread((data as Notification[])?.filter((n) => !n.is_read).length ?? 0);
    })();
    return () => {
      active = false;
    };
  }, [profile, path]);

  async function markAllRead() {
    if (!profile) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile.id).eq('is_read', false);
    setNotes((n) => n.map((x) => ({ ...x, is_read: true })));
    setUnread(0);
  }

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Services', to: '/services' },
    { label: 'How it Works', to: '/how-it-works' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const dashboardLink = isAdmin ? '/admin' : isProvider ? '/provider' : '/customer';

  const accountLinks = isProvider
    ? [
        { label: 'Dashboard', to: '/provider', icon: LayoutDashboard },
        { label: 'Bookings', to: '/provider/bookings', icon: ClipboardList },
        { label: 'Earnings', to: '/provider/earnings', icon: Wallet },
        { label: 'Reviews', to: '/provider/reviews', icon: Star },
        { label: 'Profile', to: '/provider/profile', icon: User },
      ]
    : isAdmin
      ? [
          { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
          { label: 'Customers', to: '/admin/customers', icon: User },
          { label: 'Providers', to: '/admin/providers', icon: Wrench },
          { label: 'Bookings', to: '/admin/bookings', icon: CalendarCheck },
          { label: 'Services', to: '/admin/services', icon: ClipboardList },
        ]
      : [
          { label: 'Dashboard', to: '/customer', icon: LayoutDashboard },
          { label: 'My Bookings', to: '/customer/bookings', icon: ClipboardList },
          { label: 'Profile', to: '/customer/profile', icon: User },
        ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 shadow-soft">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-brand-900">
            Service<span className="text-accent-500">Hub</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={classNames(
                'rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                path === l.to ? 'text-brand-900 bg-brand-50' : 'text-slate-600 hover:text-brand-900 hover:bg-slate-50',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {profile ? (
            <>
              {!isAdmin && (
                <Link
                  to={dashboardLink}
                  className="hidden rounded-lg px-3.5 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50 sm:block"
                >
                  Dashboard
                </Link>
              )}

              {/* Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setBellOpen((o) => !o);
                    if (!bellOpen && unread > 0) markAllRead();
                  }}
                  className="relative rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100"
                >
                  <Bell className="h-5 w-5" />
                  {unread > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
                {bellOpen && (
                  <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-glow animate-scale-in">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="font-bold text-brand-900">Notifications</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notes.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet</p>
                      ) : (
                        notes.map((n) => (
                          <div
                            key={n.id}
                            className={classNames(
                              'border-b border-slate-50 px-4 py-3 last:border-0',
                              !n.is_read && 'bg-brand-50/40',
                            )}
                          >
                            <p className="text-sm font-semibold text-brand-900">{n.title}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Account */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-slate-100"
                >
                  <Avatar name={profile.full_name || profile.email} src={profile.avatar_url || undefined} size="sm" />
                  <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-glow animate-scale-in">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-bold text-brand-900">{profile.full_name || 'User'}</p>
                      <p className="truncate text-xs text-slate-500">{profile.email}</p>
                      <span className="mt-1.5 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                        {profile.role}
                      </span>
                    </div>
                    <div className="py-1.5">
                      {accountLinks.map((a) => (
                        <Link
                          key={a.to}
                          to={a.to}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <a.icon className="h-4 w-4 text-slate-400" />
                          {a.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          signOut();
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
              <Link to="/signup" className="btn-primary text-sm">Get started</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-xl p-2.5 text-brand-900 transition-colors hover:bg-slate-100 lg:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden animate-fade-in">
          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={classNames(
                  'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold',
                  path === l.to ? 'bg-brand-50 text-brand-900' : 'text-slate-600',
                )}
              >
                <HomeIcon className="h-4 w-4 text-slate-400" />
                {l.label}
              </Link>
            ))}
            {!profile && (
              <div className="mt-2 flex flex-col gap-2">
                <Link to="/login" className="btn-outline w-full">Sign in</Link>
                <Link to="/signup" className="btn-primary w-full">Get started</Link>
              </div>
            )}
            {profile && (
              <Link to={dashboardLink} className="mt-2 btn-primary w-full">
                <Shield className="h-4 w-4" /> Go to Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
