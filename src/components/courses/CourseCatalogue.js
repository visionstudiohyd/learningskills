'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { cx } from '@/lib/utils';
import CourseCard from '@/components/course/CourseCard';
import Reveal from '@/components/ui/Reveal';
import CourseFilters from './CourseFilters';

/**
 * Catalogue shell: owns only the grid/list preference. Filtering, sorting and
 * paging are all URL-driven and resolved on the server, so this component never
 * holds a second copy of the course list.
 */
export default function CourseCatalogue({
  courses = [],
  pagination = {},
  levels = [],
  modes = [],
  sortOptions = [],
}) {
  const [layout, setLayout] = useState('grid');
  const params = useSearchParams();

  const pageHref = (page) => {
    const next = new URLSearchParams(params.toString());
    if (page <= 1) next.delete('page');
    else next.set('page', String(page));
    const qs = next.toString();
    return qs ? `/courses?${qs}` : '/courses';
  };

  const { page = 1, totalPages = 1, total = 0, hasPrev, hasNext } = pagination;

  // Compact page window: 1 … 4 5 6 … 20
  const pageNumbers = [];
  const windowSize = 1;
  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= windowSize) pageNumbers.push(i);
    else if (pageNumbers[pageNumbers.length - 1] !== '…') pageNumbers.push('…');
  }

  return (
    <div>
      <CourseFilters
        levels={levels}
        modes={modes}
        sortOptions={sortOptions}
        total={total}
        layout={layout}
        onLayoutChange={setLayout}
      />

      {courses.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-ink-100 text-ink-400">
            <SearchX className="h-8 w-8" strokeWidth={1.8} />
          </span>
          <h2 className="mt-5 font-display text-xl font-bold text-ink-950">No courses match that</h2>
          <p className="mt-2.5 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">
            Try removing a filter or searching for a broader term. If you cannot find what you are after, tell us what
            you are looking for — we may be running it next term.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/courses" className="btn btn-outline btn-sm">
              Clear all filters
            </Link>
            <Link href="/contact" className="btn btn-primary btn-sm">
              Ask about a course
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div
            className={cx(
              'mt-8 grid gap-5',
              layout === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
            )}
          >
            {courses.map((course, i) => (
              <Reveal key={course.id} delay={Math.min(i, 6) * 60}>
                <CourseCard course={course} layout={layout} priority={i < 3} className="h-full" />
              </Reveal>
            ))}
          </div>

          {/* ------------------------------ pagination ------------------------- */}
          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Course pagination">
              <Link
                href={pageHref(page - 1)}
                aria-disabled={!hasPrev}
                tabIndex={hasPrev ? undefined : -1}
                scroll
                className={cx(
                  'grid h-10 w-10 place-items-center rounded-full border transition-all',
                  hasPrev
                    ? 'border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:text-brand-700'
                    : 'pointer-events-none border-ink-200 bg-ink-50 text-ink-300'
                )}
              >
                <ChevronLeft className="h-4.5 w-4.5" strokeWidth={2.4} />
                <span className="sr-only">Previous page</span>
              </Link>

              {pageNumbers.map((num, i) =>
                num === '…' ? (
                  <span key={`gap-${i}`} className="px-1.5 text-ink-400" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <Link
                    key={num}
                    href={pageHref(num)}
                    aria-current={num === page ? 'page' : undefined}
                    scroll
                    className={cx(
                      'grid h-10 min-w-10 place-items-center rounded-full border px-3 font-display text-sm font-semibold transition-all',
                      num === page
                        ? 'border-transparent bg-brand-600 text-white shadow-[var(--shadow-brand)]'
                        : 'border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:text-brand-700'
                    )}
                  >
                    {num}
                  </Link>
                )
              )}

              <Link
                href={pageHref(page + 1)}
                aria-disabled={!hasNext}
                tabIndex={hasNext ? undefined : -1}
                scroll
                className={cx(
                  'grid h-10 w-10 place-items-center rounded-full border transition-all',
                  hasNext
                    ? 'border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:text-brand-700'
                    : 'pointer-events-none border-ink-200 bg-ink-50 text-ink-300'
                )}
              >
                <ChevronRight className="h-4.5 w-4.5" strokeWidth={2.4} />
                <span className="sr-only">Next page</span>
              </Link>
            </nav>
          )}

          <p className="mt-5 text-center text-xs text-ink-500">
            Page {page} of {totalPages} · {total} {total === 1 ? 'course' : 'courses'} total
          </p>
        </>
      )}
    </div>
  );
}
