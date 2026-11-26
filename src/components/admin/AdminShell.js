'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown, ExternalLink, GraduationCap, LogOut, Menu, Search, UserCog, X,
} from 'lucide-react';
import { cx } from '@/lib/utils';
import { ADMIN_NAV } from '@/lib/admin/nav';
import Icon from '@/components/ui/Icon';
import { useToast } from '@/components/ui/Toast';

/**
 * Authenticated dashboard chrome.
 *
 * Dark sidebar against a light workspace — the contrast makes the navigation
 * recede and the data read first, and keeps the dashboard visually distinct
 * from the public site so there is never a doubt which one you are editing.
 */
export default function AdminShell({ admin, siteName, counts = {}, can = {}, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Signed out.');
      router.replace('/admin/login');
      router.refresh();
    } catch {
      toast.error('Could not sign out. Please try again.');
      setSigningOut(false);
    }
  }

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const visibleGroups = ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => can[item.permission]),
  })).filter((group) => group.items.length > 0);

  const currentLabel =
    visibleGroups.flatMap((g) => g.items).find((item) => isActive(item))?.label || 'Dashboard';

  const sidebar = (
    <div className="flex h-full flex-col bg-ink-950">
      {/* brand */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/10 px-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-linear-to-br from-brand-400 to-brand-600 text-white">
          <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-sm font-extrabold leading-tight text-white">
            {siteName}
          </span>
          <span className="block text-[0.6875rem] text-white/45">Dashboard</span>
        </span>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="grid h-8 w-8 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard navigation">
        {visibleGroups.map((group) => (
          <div key={group.group} className="mb-5">
            <p className="px-3 pb-2 font-display text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/30">
              {group.group}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item);
                const badgeCount = item.badge ? counts[item.badge] || 0 : 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cx(
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] font-medium transition-all duration-200',
                        active
                          ? 'bg-brand-500/90 text-white shadow-[0_6px_18px_-8px_rgb(79_91_213/0.9)]'
                          : 'text-white/60 hover:bg-white/[0.07] hover:text-white'
                      )}
                    >
                      <Icon
                        name={item.icon}
                        className={cx('h-4.5 w-4.5 shrink-0 transition-transform', !active && 'group-hover:scale-110')}
                        strokeWidth={2.1}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badgeCount > 0 && (
                        <span
                          className={cx(
                            'grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1.5 font-display text-[0.6875rem] font-bold',
                            active ? 'bg-white/25 text-white' : 'bg-accent-400 text-ink-950'
                          )}
                        >
                          {badgeCount > 99 ? '99+' : badgeCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* view site */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] font-medium text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white"
        >
          <ExternalLink className="h-4.5 w-4.5 shrink-0" strokeWidth={2.1} />
          View live site
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-ink-100">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

      {/* mobile drawer */}
      <div
        className={cx(
          'fixed inset-0 z-50 bg-ink-950/60 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-55 w-64 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!mobileOpen}
      >
        {sidebar}
      </aside>

      {/* main column */}
      <div className="lg:pl-64">
        {/* topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur-xl md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-700 transition-colors hover:bg-ink-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="min-w-0 flex-1 truncate font-display text-base font-bold text-ink-950 md:text-lg">
            {currentLabel}
          </h1>

          <Link
            href="/admin/courses"
            className="hidden h-10 w-10 place-items-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 sm:grid"
            aria-label="Find a course"
          >
            <Search className="h-4.5 w-4.5" strokeWidth={2.2} />
          </Link>

          {/* user menu */}
          <div className="relative shrink-0" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2.5 rounded-xl p-1.5 pr-2.5 transition-colors hover:bg-ink-100"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-linear-to-br from-brand-500 to-brand-700 font-display text-xs font-bold text-white">
                {admin.name
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[10rem] truncate font-display text-[0.8125rem] font-bold leading-tight text-ink-950">
                  {admin.name}
                </span>
                <span className="block text-[0.6875rem] capitalize text-ink-500">
                  {admin.role.replace('_', ' ')}
                </span>
              </span>
              <ChevronDown
                className={cx('h-4 w-4 shrink-0 text-ink-400 transition-transform', userMenuOpen && 'rotate-180')}
                strokeWidth={2.4}
              />
            </button>

            {userMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-[var(--shadow-lift)]"
              >
                <div className="border-b border-ink-200 bg-ink-50 px-4 py-3">
                  <p className="truncate font-display text-sm font-bold text-ink-950">{admin.name}</p>
                  <p className="truncate text-xs text-ink-500">{admin.email}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/admin/profile"
                    role="menuitem"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-ink-100"
                  >
                    <UserCog className="h-4 w-4" strokeWidth={2.1} />
                    My profile &amp; password
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={signOut}
                    disabled={signingOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={2.1} />
                    {signingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
