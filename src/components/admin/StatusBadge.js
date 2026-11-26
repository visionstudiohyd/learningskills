import { cx } from '@/lib/utils';

/**
 * Status pill.
 *
 * Status colours are reserved for status and always ship with their label, so
 * state is never conveyed by colour alone.
 */
const ENQUIRY_TONES = {
  new: 'bg-brand-50 text-brand-700 ring-brand-200',
  contacted: 'bg-teal-50 text-teal-800 ring-teal-200',
  follow_up: 'bg-accent-50 text-accent-800 ring-accent-200',
  converted: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  closed: 'bg-ink-100 text-ink-700 ring-ink-200',
  spam: 'bg-rose-50 text-rose-700 ring-rose-200',
  read: 'bg-ink-100 text-ink-700 ring-ink-200',
  replied: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  archived: 'bg-ink-100 text-ink-600 ring-ink-200',
  active: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  inactive: 'bg-ink-100 text-ink-600 ring-ink-200',
  draft: 'bg-amber-50 text-amber-800 ring-amber-200',
  high: 'bg-rose-50 text-rose-700 ring-rose-200',
  medium: 'bg-accent-50 text-accent-800 ring-accent-200',
  low: 'bg-ink-100 text-ink-600 ring-ink-200',
};

const LABELS = {
  new: 'New',
  contacted: 'Contacted',
  follow_up: 'Follow up',
  converted: 'Converted',
  closed: 'Closed',
  spam: 'Spam',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export default function StatusBadge({ status, label, className = '', size = 'sm' }) {
  const key = String(status || '').toLowerCase();
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center rounded-full font-display font-bold ring-1',
        size === 'sm' ? 'px-2 py-0.5 text-[0.625rem] uppercase tracking-wide' : 'px-2.5 py-1 text-[0.6875rem]',
        ENQUIRY_TONES[key] || 'bg-ink-100 text-ink-700 ring-ink-200',
        className
      )}
    >
      {label || LABELS[key] || status}
    </span>
  );
}
