'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUp, ListChecks, Phone, Plus, X } from 'lucide-react';
import { cx, sanitisePhone, whatsappLink } from '@/lib/utils';
import { WhatsAppIcon } from '@/components/ui/Icon';
import { useShortlist } from '@/components/shortlist/ShortlistProvider';

/**
 * Persistent conversion rail.
 *
 * Collapsed to a single button so it never blocks content on a phone; expands
 * to WhatsApp, call and shortlist actions. Back-to-top appears only after the
 * visitor has scrolled far enough for it to be useful.
 */
export default function FloatingActions({ whatsapp, phone, whatsappMessage, whatsappEnabled = true }) {
  const { count, openDrawer } = useShortlist();
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const waLink = whatsappEnabled && whatsapp ? whatsappLink(whatsapp, whatsappMessage) : '';
  const telLink = phone ? `tel:${sanitisePhone(phone)}` : '';
  const hasActions = Boolean(waLink || telLink);

  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-[80] flex flex-col items-end gap-3 sm:bottom-7 sm:right-6">
      {/* back to top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={cx(
          'pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-ink-200 bg-white/90 text-ink-700 shadow-[var(--shadow-card)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700',
          showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
        )}
      >
        <ArrowUp className="h-4.5 w-4.5" strokeWidth={2.3} />
      </button>

      {/* expanded actions */}
      {hasActions && (
        <div
          className={cx(
            'flex flex-col items-end gap-2.5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
          )}
        >
          {count > 0 && (
            <button
              type="button"
              onClick={() => {
                openDrawer();
                setOpen(false);
              }}
              className="group flex items-center gap-2.5 rounded-full border border-ink-200 bg-white py-2 pl-3.5 pr-2 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
            >
              <span className="font-display text-sm font-semibold text-ink-900">
                Enquire about {count}
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-white">
                <ListChecks className="h-4 w-4" strokeWidth={2.3} />
              </span>
            </button>
          )}

          {telLink && (
            <a
              href={telLink}
              className="group flex items-center gap-2.5 rounded-full border border-ink-200 bg-white py-2 pl-3.5 pr-2 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
            >
              <span className="font-display text-sm font-semibold text-ink-900">Call us</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-white">
                <Phone className="h-4 w-4" strokeWidth={2.3} />
              </span>
            </a>
          )}

          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 rounded-full border border-ink-200 bg-white py-2 pl-3.5 pr-2 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
            >
              <span className="font-display text-sm font-semibold text-ink-900">WhatsApp</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#25D366] text-white">
                <WhatsAppIcon size={17} />
              </span>
            </a>
          )}
        </div>
      )}

      {/* trigger */}
      {hasActions && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close contact options' : 'Open contact options'}
          className={cx(
            'pointer-events-auto relative grid h-14 w-14 place-items-center rounded-full text-white shadow-[0_12px_32px_-8px_rgb(14_18_34/0.45)] transition-all duration-300 hover:scale-105',
            open ? 'bg-ink-900' : 'animate-pulse-ring bg-[#25D366]'
          )}
        >
          {open ? <X className="h-6 w-6" strokeWidth={2.4} /> : <WhatsAppIcon size={26} />}
          {!open && count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-6 min-w-6 place-items-center rounded-full border-2 border-white bg-accent-400 px-1 font-display text-[0.6875rem] font-bold text-ink-950">
              {count}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
