'use client';

import { useEffect, useState } from 'react';
import { Check, ListChecks, Plus } from 'lucide-react';
import { cx } from '@/lib/utils';
import { useShortlist } from '@/components/shortlist/ShortlistProvider';
import { useToast } from '@/components/ui/Toast';

/**
 * Sticky mobile action bar on the course detail page.
 *
 * On a phone the enquiry form sits below a long page, so this keeps the two
 * actions that matter — shortlist and enquire — permanently in reach. Hidden on
 * desktop, where the sidebar form is always visible.
 */
export default function CourseShortlistBar({ course }) {
  const shortlist = useShortlist();
  const toast = useToast();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const added = shortlist.has(course.id);

  function onToggle() {
    const outcome = shortlist.toggle(course);
    if (outcome.reason === 'added') toast.success('Added to your enquiry shortlist.');
    else if (outcome.reason === 'removed') toast.info('Removed from your shortlist.');
    else if (outcome.reason === 'full') toast.error(`Shortlist holds up to ${shortlist.maxItems} courses.`);
  }

  return (
    <div
      className={cx(
        'fixed inset-x-0 bottom-0 z-[70] border-t border-ink-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_28px_-12px_rgb(14_18_34/0.3)] backdrop-blur-xl transition-transform duration-300 lg:hidden',
        visible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold text-ink-950">{course.title}</p>
          <p className="text-xs text-ink-500">
            {shortlist.count > 0
              ? `${shortlist.count} in your shortlist`
              : 'Free enquiry · no payment details'}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={added}
          aria-label={added ? 'Remove from shortlist' : 'Add to shortlist'}
          className={cx(
            'grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors',
            added ? 'border-transparent bg-teal-500 text-white' : 'border-ink-300 bg-white text-ink-700'
          )}
        >
          {added ? <Check className="h-5 w-5" strokeWidth={3} /> : <Plus className="h-5 w-5" strokeWidth={2.6} />}
        </button>

        {shortlist.count > 0 ? (
          <button type="button" onClick={shortlist.openDrawer} className="btn btn-primary shrink-0">
            <ListChecks className="h-4 w-4" strokeWidth={2.3} />
            Enquire ({shortlist.count})
          </button>
        ) : (
          <a href="#enquire" className="btn btn-accent shrink-0">
            Enquire now
          </a>
        )}
      </div>
    </div>
  );
}
