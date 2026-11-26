'use client';

import { ListChecks } from 'lucide-react';
import { cx } from '@/lib/utils';
import { useShortlist } from './ShortlistProvider';

/** Header entry point to the shortlist drawer, with a live item count. */
export default function ShortlistButton({ transparent = false, className = '' }) {
  const { count, openDrawer, hydrated } = useShortlist();

  return (
    <button
      type="button"
      onClick={openDrawer}
      className={cx(
        'relative grid h-10 w-10 place-items-center rounded-full transition-colors',
        transparent ? 'text-white/90 hover:bg-white/15' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-950',
        className
      )}
      aria-label={count > 0 ? `Open enquiry shortlist (${count} courses)` : 'Open enquiry shortlist'}
    >
      <ListChecks className="h-4.5 w-4.5" strokeWidth={2.2} />
      {hydrated && count > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent-400 px-1 font-display text-[0.6875rem] font-bold text-ink-950 shadow-sm"
          aria-hidden="true"
        >
          {count}
        </span>
      )}
    </button>
  );
}
