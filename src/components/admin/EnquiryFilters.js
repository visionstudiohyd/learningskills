'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Download, Loader2, Search, X } from 'lucide-react';
import { cx } from '@/lib/utils';

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'follow_up', label: 'Follow up' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
  { value: 'spam', label: 'Spam' },
];

const PRIORITIES = [
  { value: '', label: 'Any priority' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

/** URL-driven filter bar for the enquiry inbox, plus the CSV export link. */
export default function EnquiryFilters({ total = 0 }) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = params.get('search') || '';
  const [searchValue, setSearchValue] = useState(currentSearch);
  const debounceRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => setSearchValue(currentSearch), [currentSearch]);

  const push = (mutate) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete('page');
    const qs = next.toString();
    startTransition(() => router.push(qs ? `/admin/enquiries?${qs}` : '/admin/enquiries'));
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    if (searchValue === currentSearch) return undefined;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      push((next) => {
        if (searchValue.trim()) next.set('search', searchValue.trim());
        else next.delete('search');
      });
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const unreadOnly = params.get('unread') === '1';
  const hasFilters = Boolean(
    currentSearch || params.get('status') || params.get('priority') || unreadOnly || params.get('from') || params.get('to')
  );

  const exportHref = `/api/admin/enquiries/export?${params.toString()}`;

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* search */}
        <div className="relative min-w-[14rem] flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            strokeWidth={2.2}
          />
          <label htmlFor="enquiry-search" className="sr-only">
            Search enquiries
          </label>
          <input
            id="enquiry-search"
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Name, email, phone or reference…"
            className="field !py-2 pl-10 text-sm"
          />
          {isPending && (
            <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-500" />
          )}
        </div>

        <select
          value={params.get('status') || ''}
          onChange={(e) => push((next) => (e.target.value ? next.set('status', e.target.value) : next.delete('status')))}
          aria-label="Filter by status"
          className="field !py-2 w-auto text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={params.get('priority') || ''}
          onChange={(e) =>
            push((next) => (e.target.value ? next.set('priority', e.target.value) : next.delete('priority')))
          }
          aria-label="Filter by priority"
          className="field !py-2 w-auto text-sm"
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => push((next) => (unreadOnly ? next.delete('unread') : next.set('unread', '1')))}
          aria-pressed={unreadOnly}
          className={cx(
            'btn btn-sm shrink-0',
            unreadOnly ? 'btn-primary' : 'btn-outline'
          )}
        >
          Unread only
        </button>

        <a href={exportHref} className="btn btn-outline btn-sm shrink-0" download>
          <Download className="h-3.5 w-3.5" strokeWidth={2.3} />
          Export CSV
        </a>
      </div>

      {/* date range + active filter summary */}
      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-ink-200 pt-3">
        <div className="flex items-center gap-2">
          <label htmlFor="enquiry-from" className="text-xs font-medium text-ink-500">
            From
          </label>
          <input
            id="enquiry-from"
            type="date"
            value={params.get('from') || ''}
            onChange={(e) => push((next) => (e.target.value ? next.set('from', e.target.value) : next.delete('from')))}
            className="field !py-1.5 w-auto text-sm"
          />
          <label htmlFor="enquiry-to" className="text-xs font-medium text-ink-500">
            to
          </label>
          <input
            id="enquiry-to"
            type="date"
            value={params.get('to') || ''}
            onChange={(e) => push((next) => (e.target.value ? next.set('to', e.target.value) : next.delete('to')))}
            className="field !py-1.5 w-auto text-sm"
          />
        </div>

        <p className="ml-auto text-sm text-ink-500" aria-live="polite">
          <span className="font-display font-bold text-ink-950">{total}</span>{' '}
          {total === 1 ? 'enquiry' : 'enquiries'}
          {hasFilters ? ' match' : ' in total'}
        </p>

        {hasFilters && (
          <button
            type="button"
            onClick={() => startTransition(() => router.push('/admin/enquiries'))}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-800"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.6} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
