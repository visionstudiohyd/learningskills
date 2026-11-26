'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Clock, Menu, Phone, Search, Signal, X } from 'lucide-react';
import { cx, sanitisePhone } from '@/lib/utils';
import SmartImage from '@/components/ui/SmartImage';
import ShortlistButton from '@/components/shortlist/ShortlistButton';

/**
 * Site header.
 *
 * The flat primary navy sits behind the bar on every page and the
 * Courses item opens a panel listing the leading programmes on desktop
 * (hover + keyboard) and an inline expander on mobile.
 */
export default function HeaderClient({ settings, menu = [], menuCourses = [] }) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const closeTimer = useRef(null);
  const [hideHeader, setHideHeader] = useState(false);
  const lastScrollY = useRef(0);

  // Only keep the bar pinned while the visitor is at the top or scrolling up;
  // it slides away as soon as they scroll down.
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      if (y <= 80) setHideHeader(false);
      else if (delta > 6) setHideHeader(true);
      else if (delta < -6) setHideHeader(false);
      lastScrollY.current = y;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close everything on navigation.
  useEffect(() => {
    setMobileOpen(false);
    setCoursesOpen(false);
    setMobileCoursesOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setMobileOpen(false);
      setCoursesOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const siteName = settings.site_name || 'Learning Skills';
  const logo = settings.site_logo_light || settings.site_logo;
  const phone = settings.contact_phone;

  const openCourses = () => {
    clearTimeout(closeTimer.current);
    setCoursesOpen(true);
  };
  const scheduleCloseCourses = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setCoursesOpen(false), 160);
  };

  const isActive = (url) => {
    if (!url || url === '#') return false;
    if (url === '/') return pathname === '/';
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  return (
    <>
      {/* ------------------------------- header ------------------------------ */}
      <header
        className={cx(
          'sticky top-0 z-50 border-b border-white/10 bg-brand-700 shadow-[0_1px_24px_-10px_rgb(2_6_23/0.65)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
          hideHeader && !mobileOpen && '-translate-y-full'
        )}
      >
        <div className="shell flex h-[var(--header-height)] items-center justify-between gap-4">
          {/* brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${siteName} — home`}>
            {logo ? (
              <span className="relative block h-10 w-auto min-w-[8rem]">
                <SmartImage src={logo} alt={siteName} fill className="object-contain object-left" sizes="200px" />
              </span>
            ) : (
              <>
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 font-display text-lg font-extrabold text-white shadow-[var(--shadow-brand)] transition-all"
                  aria-hidden="true"
                >
                  {siteName.charAt(0).toUpperCase()}
                </span>
                <span className="flex flex-col leading-none">
                  <span className="font-display text-[1.0625rem] font-extrabold tracking-tight text-white transition-colors">
                    {siteName}
                  </span>
                  {settings.site_tagline && (
                    <span className="mt-1 hidden text-[0.6875rem] font-medium tracking-wide text-brand-200/80 transition-colors sm:block">
                      {settings.site_tagline}
                    </span>
                  )}
                </span>
              </>
            )}
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {menu.map((item) => {
              const isCourses = item.url === '/courses' && menuCourses.length > 0;

              if (isCourses) {
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={openCourses}
                    onMouseLeave={scheduleCloseCourses}
                  >
                    <Link
                      href={item.url}
                      aria-expanded={coursesOpen}
                      onFocus={openCourses}
                      className={cx(
                        'flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.9375rem] font-medium transition-colors',
                        isActive(item.url)
                          ? 'bg-white/15 text-white'
                          : 'text-brand-100/85 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        className={cx('h-3.5 w-3.5 transition-transform duration-200', coursesOpen && 'rotate-180')}
                        strokeWidth={2.4}
                      />
                    </Link>

                    {/* course panel */}
                    <div
                      className={cx(
                        'absolute left-1/2 top-full w-[min(44rem,calc(100vw-4rem))] -translate-x-1/2 pt-3 transition-all duration-200',
                        coursesOpen
                          ? 'pointer-events-auto translate-y-0 opacity-100'
                          : 'pointer-events-none -translate-y-1 opacity-0'
                      )}
                    >
                      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-lift)]">
                        <div className="grid gap-1 p-3 sm:grid-cols-2">
                          {menuCourses.map((course) => (
                            <Link
                              key={course.id}
                              href={`/courses/${course.slug}`}
                              className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-ink-50"
                            >
                              <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                                <SmartImage src={course.thumbnail} alt="" fill sizes="64px" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-display text-sm font-semibold text-ink-950 transition-colors group-hover:text-brand-700">
                                  {course.title}
                                </span>
                                <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-ink-500">
                                  {course.duration && (
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="h-3 w-3" strokeWidth={2.3} />
                                      {course.duration}
                                    </span>
                                  )}
                                  {course.level && (
                                    <span className="inline-flex items-center gap-1">
                                      <Signal className="h-3 w-3" strokeWidth={2.3} />
                                      {course.level}
                                    </span>
                                  )}
                                </span>
                              </span>
                            </Link>
                          ))}
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-ink-200 bg-ink-50 px-5 py-3.5">
                          <p className="text-xs text-ink-600">
                            Shortlist as many courses as you like — one enquiry covers them all.
                          </p>
                          <Link
                            href="/courses"
                            className="inline-flex shrink-0 items-center gap-1.5 font-display text-sm font-semibold text-brand-600 transition-colors hover:text-brand-800"
                          >
                            View all courses
                            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.url}
                  target={item.open_new_tab ? '_blank' : undefined}
                  rel={item.open_new_tab ? 'noopener noreferrer' : undefined}
                  className={cx(
                    'rounded-full px-3.5 py-2 text-[0.9375rem] font-medium transition-colors',
                    isActive(item.url)
                      ? 'bg-white/15 text-white'
                      : 'text-brand-100/85 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/courses"
              aria-label="Search courses"
              className="hidden h-10 w-10 place-items-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white sm:grid"
            >
              <Search className="h-4.5 w-4.5" strokeWidth={2.2} />
            </Link>

            <ShortlistButton transparent />

            <Link href="/contact" className="btn btn-accent hidden sm:inline-flex">
              Enquire Now
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="grid h-10 w-10 place-items-center rounded-xl text-white transition-colors hover:bg-white/15 lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* --------------------------- mobile drawer -------------------------- */}
      <div
        className={cx(
          'fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <div
        id="mobile-navigation"
        className={cx(
          'fixed right-0 top-0 z-45 flex h-dvh w-[min(22rem,88vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
          <span className="font-display font-bold text-ink-950">Menu</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-600 transition-colors hover:bg-ink-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile navigation">
          {menu.map((item) => {
            const isCourses = item.url === '/courses' && menuCourses.length > 0;
            return (
              <div key={item.id}>
                <div className="flex items-center">
                  <Link
                    href={item.url}
                    className={cx(
                      'flex-1 rounded-xl px-3 py-3 font-display text-[0.9375rem] font-semibold transition-colors',
                      isActive(item.url) ? 'bg-brand-50 text-brand-700' : 'text-ink-800 hover:bg-ink-100'
                    )}
                  >
                    {item.label}
                  </Link>
                  {isCourses && (
                    <button
                      type="button"
                      onClick={() => setMobileCoursesOpen((v) => !v)}
                      aria-expanded={mobileCoursesOpen}
                      aria-label="Toggle course list"
                      className="mr-1 grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100"
                    >
                      <ChevronDown
                        className={cx('h-4 w-4 transition-transform', mobileCoursesOpen && 'rotate-180')}
                        strokeWidth={2.4}
                      />
                    </button>
                  )}
                </div>

                {isCourses && (
                  <div
                    className="grid transition-[grid-template-rows] duration-300"
                    style={{ gridTemplateRows: mobileCoursesOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-ink-200 pl-3">
                        {menuCourses.map((course) => (
                          <Link
                            key={course.id}
                            href={`/courses/${course.slug}`}
                            className="rounded-lg px-2.5 py-2 text-sm text-ink-600 transition-colors hover:bg-ink-50 hover:text-brand-700"
                          >
                            <span className="block truncate">{course.title}</span>
                            {course.duration && (
                              <span className="mt-0.5 block text-xs text-ink-400">{course.duration}</span>
                            )}
                          </Link>
                        ))}
                        <Link
                          href="/courses"
                          className="rounded-lg px-2.5 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
                        >
                          View all courses →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-ink-200 p-5">
          <Link href="/contact" className="btn btn-accent w-full">
            Enquire Now
          </Link>
          {phone && (
            <a href={`tel:${sanitisePhone(phone)}`} className="btn btn-outline w-full">
              <Phone className="h-4 w-4" strokeWidth={2.2} />
              {phone}
            </a>
          )}
        </div>
      </div>
    </>
  );
}
