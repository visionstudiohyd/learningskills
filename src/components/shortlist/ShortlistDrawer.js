'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ListChecks, Trash2, X } from 'lucide-react';
import { cx } from '@/lib/utils';
import EnquiryForm from '@/components/forms/EnquiryForm';
import { useShortlist } from './ShortlistProvider';

/**
 * Slide-over panel holding the visitor's shortlisted courses with the enquiry
 * form built in. Submitting from here is the shortest path from "interested"
 * to "lead" — no page change, no form hunting.
 */
export default function ShortlistDrawer({ courseOptions = [], settings = {} }) {
  const { items, count, drawerOpen, closeDrawer, remove, clear } = useShortlist();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeDrawer]);

  return (
    <>
      <div
        className={cx(
          'fixed inset-0 z-[90] bg-ink-950/55 backdrop-blur-sm transition-opacity duration-300',
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal={drawerOpen}
        aria-label="Enquiry shortlist"
        aria-hidden={!drawerOpen}
        className={cx(
          'fixed right-0 top-0 z-[95] flex h-dvh w-[min(30rem,92vw)] flex-col bg-ink-50 shadow-2xl transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]',
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-ink-200 bg-white px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <ListChecks className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-ink-950">Your enquiry shortlist</h2>
              <p className="mt-0.5 text-xs text-ink-500">
                {count === 0
                  ? 'Nothing added yet'
                  : `${count} ${count === 1 ? 'course' : 'courses'} — one enquiry covers them all`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
            aria-label="Close shortlist"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {count === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-ink-300 bg-white px-6 py-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">
                <ListChecks className="h-7 w-7" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-ink-900">Your shortlist is empty</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-500">
                Browse the courses and press <span className="font-medium text-ink-700">Add to enquiry</span> on any
                that interest you. Compare two or three — it is the sensible way to choose.
              </p>
              <Link href="/courses" onClick={closeDrawer} className="btn btn-primary btn-sm mt-5">
                Explore courses
              </Link>
            </div>
          ) : (
            <>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      {item.slug ? (
                        <Link
                          href={`/courses/${item.slug}`}
                          onClick={closeDrawer}
                          className="block truncate font-display text-sm font-semibold text-ink-950 transition-colors hover:text-brand-700"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <span className="block truncate font-display text-sm font-semibold text-ink-950">
                          {item.title}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.title} from shortlist`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2.1} />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs font-medium text-ink-500 underline-offset-2 transition-colors hover:text-rose-600 hover:underline"
                >
                  Clear shortlist
                </button>
                <Link
                  href="/courses"
                  onClick={closeDrawer}
                  className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-800"
                >
                  Add more courses →
                </Link>
              </div>

              <div className="mt-6 rounded-[var(--radius-card)] border border-ink-200 bg-white p-5">
                <h3 className="font-display text-base font-bold text-ink-950">
                  {settings.enquiry_form_title || 'Request course details'}
                </h3>
                <p className="mt-1 text-sm text-ink-600">
                  {settings.enquiry_form_text || 'Takes under a minute. No payment details, ever.'}
                </p>
                <EnquiryForm
                  variant="compact"
                  courseOptions={courseOptions}
                  settings={settings}
                  className="mt-5"
                  onSuccess={() => setTimeout(closeDrawer, 3500)}
                />
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
