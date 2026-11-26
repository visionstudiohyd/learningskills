import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getContactMessages } from '@/lib/queries/leads';
import { cx, plain } from '@/lib/utils';
import MessageList from '@/components/admin/MessageList';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contact Messages' };

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
  { value: 'spam', label: 'Spam' },
];

export default async function MessagesPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const status = typeof sp.status === 'string' ? sp.status : '';
  const search = typeof sp.search === 'string' ? sp.search : '';

  const result = await getContactMessages({
    status,
    search,
    page: Number(sp.page) || 1,
    perPage: 15,
  });

  const hrefFor = (overrides) => {
    const next = new URLSearchParams();
    const merged = { status, search, page: sp.page, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value && String(value) !== '1') next.set(key, String(value));
      else if (key === 'page' && Number(value) > 1) next.set(key, String(value));
    }
    const qs = next.toString();
    return qs ? `/admin/messages?${qs}` : '/admin/messages';
  };

  return (
    <div className="space-y-4">
      <header>
        <h2 className="font-display text-xl font-bold text-ink-950">Contact messages</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          General enquiries sent through the Contact page — group training, certificates, partnerships and careers.
          Course enquiries live in their own inbox.
        </p>
      </header>

      {/* status filter row */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink-200 bg-white p-3">
        {FILTERS.map((filter) => {
          const active = status === filter.value;
          return (
            <Link
              key={filter.value || 'all'}
              href={hrefFor({ status: filter.value, page: 1 })}
              aria-current={active ? 'true' : undefined}
              className={cx(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                active
                  ? 'border-transparent bg-ink-950 text-white'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
              )}
            >
              {filter.label}
            </Link>
          );
        })}

        <p className="ml-auto pr-1 text-sm text-ink-500">
          <span className="font-display font-bold text-ink-950">{result.total}</span>{' '}
          {result.total === 1 ? 'message' : 'messages'}
        </p>
      </div>

      <MessageList messages={plain(result.items)} />

      {result.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-white px-4 py-3">
          <Link
            href={hrefFor({ page: result.page - 1 })}
            aria-disabled={!result.hasPrev}
            className={cx('btn btn-outline btn-sm', !result.hasPrev && 'pointer-events-none opacity-40')}
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
            Previous
          </Link>
          <span className="text-xs text-ink-500">
            Page {result.page} of {result.totalPages}
          </span>
          <Link
            href={hrefFor({ page: result.page + 1 })}
            aria-disabled={!result.hasNext}
            className={cx('btn btn-outline btn-sm', !result.hasNext && 'pointer-events-none opacity-40')}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
          </Link>
        </div>
      )}
    </div>
  );
}
