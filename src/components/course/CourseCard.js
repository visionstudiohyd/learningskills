'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Check, Clock, Monitor, Plus, Signal, Star, Users } from 'lucide-react';
import { compactNumber, cx } from '@/lib/utils';
import SmartImage from '@/components/ui/SmartImage';
import { useShortlist } from '@/components/shortlist/ShortlistProvider';
import { useToast } from '@/components/ui/Toast';

const LEVEL_TONES = {
  Beginner: 'bg-teal-50 text-teal-800 border-teal-200',
  Intermediate: 'bg-brand-50 text-brand-800 border-brand-200',
  Advanced: 'bg-accent-50 text-accent-800 border-accent-200',
  'All Levels': 'bg-ink-100 text-ink-700 border-ink-200',
};

/**
 * Course card used on the homepage, the listing grid and related-course rails.
 * The "Add to enquiry" control is the primary conversion affordance — it is a
 * button, not a link, so the visitor never loses their place while shortlisting.
 */
export default function CourseCard({ course, layout = 'grid', priority = false, className = '' }) {
  const shortlist = useShortlist();
  const toast = useToast();

  const added = shortlist.has(course.id);
  const isList = layout === 'list';

  function onToggle() {
    const outcome = shortlist.toggle({ id: course.id, title: course.title, slug: course.slug });
    if (outcome.reason === 'added') {
      toast.success(`"${course.title}" added to your enquiry shortlist.`, { title: 'Shortlisted' });
    } else if (outcome.reason === 'removed') {
      toast.info(`"${course.title}" removed from your shortlist.`);
    } else if (outcome.reason === 'full') {
      toast.error(`Your shortlist holds up to ${shortlist.maxItems} courses. Remove one to add another.`);
    }
  }

  return (
    <article
      className={cx(
        'card card-hover group relative flex overflow-hidden',
        isList ? 'flex-col sm:flex-row' : 'flex-col',
        className
      )}
    >
      {/* ------------------------------- media -------------------------------- */}
      <div
        className={cx(
          'relative shrink-0 overflow-hidden bg-ink-100',
          isList ? 'aspect-16/10 sm:aspect-4/3 sm:w-64 lg:w-72' : 'aspect-16/10'
        )}
      >
        <Link href={`/courses/${course.slug}`} tabIndex={-1} aria-hidden="true">
          <SmartImage
            src={course.thumbnail}
            alt=""
            fill
            priority={priority}
            sizes={isList ? '(max-width: 640px) 100vw, 18rem' : '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25rem'}
            className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
        </Link>

        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink-950/55 via-ink-950/5 to-transparent"
          aria-hidden="true"
        />

        {/* badges */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {Number(course.is_featured) === 1 && (
            <span className="rounded-full bg-accent-400 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-ink-950 shadow-sm">
              Featured
            </span>
          )}
          {Number(course.is_popular) === 1 && (
            <span className="rounded-full bg-ink-950/85 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-white backdrop-blur">
              Popular
            </span>
          )}
        </div>

        {/* rating */}
        {Number(course.rating) > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 shadow-sm backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" strokeWidth={0} />
            <span className="font-display text-xs font-bold text-ink-950">{Number(course.rating).toFixed(1)}</span>
            {Number(course.reviews_count) > 0 && (
              <span className="text-[0.6875rem] text-ink-500">({compactNumber(course.reviews_count)})</span>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------- content ------------------------------ */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cx('chip border', LEVEL_TONES[course.level] || LEVEL_TONES['All Levels'])}>
            <Signal className="h-3 w-3" strokeWidth={2.6} />
            {course.level}
          </span>
          <span className="chip border border-ink-200 bg-white text-ink-600">
            <Monitor className="h-3 w-3" strokeWidth={2.4} />
            {course.delivery_mode}
          </span>
        </div>

        <h3 className={cx('mt-3 font-display font-bold leading-snug text-ink-950', isList ? 'text-xl' : 'text-[1.0625rem]')}>
          <Link
            href={`/courses/${course.slug}`}
            className="transition-colors hover:text-brand-700 focus-visible:text-brand-700"
          >
            {course.title}
          </Link>
        </h3>

        {course.short_description && (
          <p className={cx('mt-2 text-sm leading-relaxed text-ink-600', isList ? 'clamp-3' : 'clamp-2')}>
            {course.short_description}
          </p>
        )}

        {/* meta row */}
        <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-600">
          {course.duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-brand-500" strokeWidth={2.2} />
              <dt className="sr-only">Duration</dt>
              <dd>{course.duration}</dd>
            </div>
          )}
          {Number(course.lessons_count) > 0 && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-brand-500" strokeWidth={2.2} />
              <dt className="sr-only">Sessions</dt>
              <dd>{course.lessons_count} sessions</dd>
            </div>
          )}
          {Number(course.students_enrolled) > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-brand-500" strokeWidth={2.2} />
              <dt className="sr-only">Learners trained</dt>
              <dd>{compactNumber(course.students_enrolled)} trained</dd>
            </div>
          )}
        </dl>

        {/* actions */}
        <div className="mt-5 flex items-center gap-2 border-t border-ink-200 pt-4">
          <Link href={`/courses/${course.slug}`} className="btn btn-outline btn-sm flex-1">
            View details
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
          </Link>

          <button
            type="button"
            onClick={onToggle}
            aria-pressed={added}
            className={cx(
              'btn btn-sm shrink-0 transition-all',
              added
                ? 'bg-teal-500 text-white shadow-[0_8px_20px_-8px_rgb(15_185_168/0.6)] hover:bg-teal-600'
                : 'btn-accent'
            )}
            title={added ? 'Remove from enquiry shortlist' : 'Add to enquiry shortlist'}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                Added
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                Enquire
              </>
            )}
          </button>
        </div>

        {course.fee_text && (
          <p className="mt-3 text-[0.75rem] text-ink-500">{course.fee_text}</p>
        )}
      </div>
    </article>
  );
}
