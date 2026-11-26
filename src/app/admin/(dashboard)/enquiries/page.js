import Link from 'next/link';
import { ChevronLeft, ChevronRight, Inbox, Mail, Phone } from 'lucide-react';
import { getEnquiries } from '@/lib/queries/leads';
import { cx, formatDate, sanitisePhone, timeAgo } from '@/lib/utils';
import EnquiryFilters from '@/components/admin/EnquiryFilters';
import StatusBadge from '@/components/admin/StatusBadge';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Course Enquiries' };

export default async function EnquiriesPage({ searchParams }) {
  const sp = (await searchParams) || {};

  const result = await getEnquiries({
    search: typeof sp.search === 'string' ? sp.search : '',
    status: typeof sp.status === 'string' ? sp.status : '',
    priority: typeof sp.priority === 'string' ? sp.priority : '',
    unreadOnly: sp.unread === '1',
    from: typeof sp.from === 'string' ? sp.from : '',
    to: typeof sp.to === 'string' ? sp.to : '',
    page: Number(sp.page) || 1,
    perPage: 20,
  });

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (key !== 'page' && typeof value === 'string' && value) query.set(key, value);
  }
  const pageHref = (page) => {
    const next = new URLSearchParams(query.toString());
    if (page > 1) next.set('page', String(page));
    const qs = next.toString();
    return qs ? `/admin/enquiries?${qs}` : '/admin/enquiries';
  };

  return (
    <div className="space-y-4">
      <header>
        <h2 className="font-display text-xl font-bold text-ink-950">Course enquiries</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Every enquiry submitted through the site. Unread ones carry an amber dot; open one to record what happened
          and set a follow-up.
        </p>
      </header>

      <EnquiryFilters total={result.total} />

      {result.items.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">
            <Inbox className="h-7 w-7" strokeWidth={1.8} />
          </span>
          <h3 className="mt-4 font-display text-base font-bold text-ink-900">No enquiries match</h3>
          <p className="mt-2 max-w-sm text-sm text-ink-500">
            Try widening the filters, or clear them to see the whole inbox.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem]">
              <caption className="sr-only">Course enquiries</caption>
              <thead className="border-b border-ink-200 bg-ink-50">
                <tr>
                  {['Enquirer', 'Courses', 'Contact', 'Received', 'Priority', 'Status'].map((label) => (
                    <th
                      key={label}
                      scope="col"
                      className="px-4 py-3 text-left font-display text-[0.6875rem] font-bold uppercase tracking-wider text-ink-500"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-ink-200">
                {result.items.map((item) => {
                  const unread = Number(item.is_read) === 0;
                  return (
                    <tr key={item.id} className={cx('transition-colors hover:bg-ink-50/70', unread && 'bg-accent-50/30')}>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', unread ? 'bg-accent-400' : 'bg-ink-200')}
                            title={unread ? 'Unread' : 'Read'}
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/enquiries/${item.id}`}
                              className="block truncate font-display text-sm font-bold text-ink-950 transition-colors hover:text-brand-700"
                            >
                              {item.name}
                            </Link>
                            <p className="mt-0.5 font-mono text-[0.6875rem] text-ink-400">{item.reference}</p>
                            {item.city && <p className="text-xs text-ink-500">{item.city}</p>}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="max-w-[18rem] truncate text-sm text-ink-700" title={item.courses || ''}>
                          {item.courses || <span className="text-ink-400">No course selected</span>}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-400">{item.preferred_mode}</p>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <a
                            href={`mailto:${item.email}`}
                            className="inline-flex max-w-[14rem] items-center gap-1.5 truncate text-xs text-ink-600 hover:text-brand-700"
                          >
                            <Mail className="h-3 w-3 shrink-0" strokeWidth={2.2} />
                            <span className="truncate">{item.email}</span>
                          </a>
                          <a
                            href={`tel:${sanitisePhone(item.phone)}`}
                            className="inline-flex items-center gap-1.5 text-xs text-ink-600 hover:text-brand-700"
                          >
                            <Phone className="h-3 w-3 shrink-0" strokeWidth={2.2} />
                            {item.phone}
                          </a>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-sm text-ink-700">{timeAgo(item.created_at)}</p>
                        <p className="text-xs text-ink-400">{formatDate(item.created_at)}</p>
                        {item.follow_up_at && (
                          <p className="mt-0.5 text-[0.6875rem] font-semibold text-accent-700">
                            Follow up {formatDate(item.follow_up_at)}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={item.priority} />
                        {item.assignee_name && (
                          <p className="mt-1 truncate text-[0.6875rem] text-ink-500">{item.assignee_name}</p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <Link href={`/admin/enquiries/${item.id}`}>
                          <StatusBadge status={item.status} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {result.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-ink-200 px-4 py-3">
              <Link
                href={pageHref(result.page - 1)}
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
                href={pageHref(result.page + 1)}
                aria-disabled={!result.hasNext}
                className={cx('btn btn-outline btn-sm', !result.hasNext && 'pointer-events-none opacity-40')}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
