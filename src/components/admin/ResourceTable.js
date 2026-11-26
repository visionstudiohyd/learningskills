'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import {
  ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ExternalLink, Inbox, Loader2,
  Pencil, Plus, Search, Star, Trash2, X,
} from 'lucide-react';
import { cx, formatDate, formatNumber } from '@/lib/utils';
import Icon from '@/components/ui/Icon';
import SmartImage from '@/components/ui/SmartImage';
import StatusBadge from '@/components/admin/StatusBadge';
import { useToast } from '@/components/ui/Toast';

/**
 * Generic list view for a registered resource.
 *
 * Search and paging live in the URL so a filtered list can be shared and
 * survives the back button; row actions (toggle a switch, nudge the display
 * order, delete) call the API and then router.refresh(), which re-runs the
 * server component rather than keeping a second copy of the rows in state.
 */
export default function ResourceTable({
  resource,
  rows = [],
  pagination = {},
  basePath,
  search = '',
  canCreate = true,
}) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(search);
  const [busyId, setBusyId] = useState(null);
  const debounceRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => setSearchValue(search), [search]);

  // Debounced search → URL
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    if (searchValue === search) return undefined;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchValue.trim()) params.set('search', searchValue.trim());
      startTransition(() => router.push(params.toString() ? `${basePath}?${params}` : basePath));
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  async function toggle(row, column) {
    setBusyId(`${row.id}-${column}`);
    try {
      const res = await fetch(`/api/admin/${resource.key}/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'toggle', column }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Could not update that.');
        return;
      }
      router.refresh();
    } catch {
      toast.error('Could not reach the server.');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(row) {
    const name = row.title || row.name || row.label || row.question || `#${row.id}`;
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setBusyId(`${row.id}-delete`);
    try {
      const res = await fetch(`/api/admin/${resource.key}/${row.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Could not delete that.');
        return;
      }
      toast.success(data.message || 'Deleted.');
      router.refresh();
    } catch {
      toast.error('Could not reach the server.');
    } finally {
      setBusyId(null);
    }
  }

  /** Swap display_order with the neighbouring row — keyboard-accessible reordering. */
  async function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    const ids = rows.map((r) => r.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];

    setBusyId(`${rows[index].id}-move`);
    try {
      const res = await fetch(`/api/admin/${resource.key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'reorder', ids }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Could not reorder.');
        return;
      }
      router.refresh();
    } catch {
      toast.error('Could not reach the server.');
    } finally {
      setBusyId(null);
    }
  }

  const pageHref = (page) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (page > 1) params.set('page', String(page));
    return params.toString() ? `${basePath}?${params}` : basePath;
  };

  function renderCell(column, row, index) {
    const value = row[column.key];

    switch (column.type) {
      case 'title':
        return (
          <div className="flex min-w-0 items-center gap-3">
            {column.thumb && (
              <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                <SmartImage src={row[column.thumb]} alt="" fill sizes="56px" />
              </span>
            )}
            {column.iconColumn && (
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                style={{
                  backgroundColor: column.accent && row[column.accent] ? `${row[column.accent]}1a` : '#eef0f7',
                  color: column.accent && row[column.accent] ? row[column.accent] : '#616a8a',
                }}
              >
                <Icon name={row[column.iconColumn]} className="h-4.5 w-4.5" strokeWidth={2.1} />
              </span>
            )}
            <div className="min-w-0">
              <Link
                href={`${resource.customEditor || basePath}/${row.id}`}
                className="block truncate font-display text-sm font-bold text-ink-950 transition-colors hover:text-brand-700"
                title={value}
              >
                {value || `#${row.id}`}
              </Link>
              {column.secondary && row[column.secondary] && (
                <p className="mt-0.5 truncate text-xs text-ink-500" title={row[column.secondary]}>
                  {row[column.secondary]}
                </p>
              )}
            </div>
          </div>
        );

      case 'boolean': {
        const on = Number(value) === 1;
        const busy = busyId === `${row.id}-${column.key}`;
        return (
          <button
            type="button"
            onClick={() => toggle(row, column.key)}
            disabled={busy}
            aria-pressed={on}
            aria-label={`${column.label}: ${on ? 'on' : 'off'} — click to change`}
            className="relative inline-flex items-center"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin text-ink-400" />
            ) : (
              <>
                <span className={cx('block h-5 w-9 rounded-full transition-colors', on ? 'bg-brand-500' : 'bg-ink-300')} />
                <span
                  className={cx(
                    'absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                    on && 'translate-x-4'
                  )}
                />
              </>
            )}
          </button>
        );
      }

      case 'status': {
        const active = Number(value) === 1;
        const busy = busyId === `${row.id}-${column.key}`;
        return (
          <button type="button" onClick={() => toggle(row, column.key)} disabled={busy} className="inline-flex">
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
            ) : (
              <StatusBadge status={active ? 'active' : 'inactive'} />
            )}
          </button>
        );
      }

      case 'rating':
        return (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-800">
            <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" strokeWidth={0} />
            {value ?? '—'}
          </span>
        );

      case 'number':
        return (
          <span className="text-sm font-medium tabular-nums text-ink-800">
            {value === null || value === undefined || value === '' ? '—' : formatNumber(value)}
            {column.suffix && value ? column.suffix : ''}
          </span>
        );

      case 'date':
        return <span className="text-sm text-ink-600">{formatDate(value)}</span>;

      default:
        return (
          <span className="block max-w-[14rem] truncate text-sm text-ink-700" title={value || ''}>
            {value === null || value === undefined || value === '' ? '—' : String(value).replace(/_/g, ' ')}
          </span>
        );
    }
  }

  const { page = 1, totalPages = 1, total = 0, hasPrev, hasNext } = pagination;
  const editBase = resource.customEditor || basePath;

  return (
    <div className="space-y-4">
      {/* ------------------------------- header ----------------------------- */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-950">{resource.label}</h2>
          {resource.description && <p className="mt-1 max-w-2xl text-sm text-ink-500">{resource.description}</p>}
        </div>
        {canCreate && (
          <Link href={`${editBase}/new`} className="btn btn-primary btn-sm shrink-0">
            <Plus className="h-4 w-4" strokeWidth={2.6} />
            New {resource.singular.toLowerCase()}
          </Link>
        )}
      </header>

      {/* ------------------------------- toolbar ---------------------------- */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink-200 bg-white p-3">
        <div className="relative min-w-[13rem] flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            strokeWidth={2.2}
          />
          <label htmlFor="resource-search" className="sr-only">
            Search {resource.label}
          </label>
          <input
            id="resource-search"
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={`Search ${resource.label.toLowerCase()}…`}
            className="field !py-2 pl-10 text-sm"
          />
          {isPending && (
            <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-500" />
          )}
          {!isPending && searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-400 hover:bg-ink-100"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.6} />
            </button>
          )}
        </div>

        <p className="shrink-0 text-sm text-ink-500" aria-live="polite">
          <span className="font-display font-bold text-ink-950">{total}</span>{' '}
          {total === 1 ? resource.singular.toLowerCase() : resource.label.toLowerCase()}
        </p>
      </div>

      {/* -------------------------------- table ----------------------------- */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">
            <Inbox className="h-7 w-7" strokeWidth={1.8} />
          </span>
          <h3 className="mt-4 font-display text-base font-bold text-ink-900">
            {search ? 'Nothing matches that search' : `No ${resource.label.toLowerCase()} yet`}
          </h3>
          <p className="mt-2 max-w-sm text-sm text-ink-500">
            {search
              ? 'Try a different term, or clear the search to see everything.'
              : `Create your first ${resource.singular.toLowerCase()} to see it here and on the site.`}
          </p>
          {!search && canCreate && (
            <Link href={`${editBase}/new`} className="btn btn-primary btn-sm mt-5">
              <Plus className="h-4 w-4" strokeWidth={2.6} />
              New {resource.singular.toLowerCase()}
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem]">
              <caption className="sr-only">{resource.label}</caption>
              <thead className="border-b border-ink-200 bg-ink-50">
                <tr>
                  {resource.reorderable && (
                    <th scope="col" className="w-16 px-4 py-3 text-left">
                      <span className="sr-only">Reorder</span>
                    </th>
                  )}
                  {resource.listColumns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={cx(
                        'px-4 py-3 font-display text-[0.6875rem] font-bold uppercase tracking-wider text-ink-500',
                        column.align === 'center' ? 'text-center' : 'text-left'
                      )}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th scope="col" className="w-28 px-4 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ink-200">
                {rows.map((row, index) => (
                  <tr key={row.id} className="transition-colors hover:bg-ink-50/70">
                    {resource.reorderable && (
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => move(index, -1)}
                            disabled={index === 0 || busyId === `${row.id}-move`}
                            aria-label="Move up"
                            className="grid h-5 w-6 place-items-center rounded text-ink-400 transition-colors hover:bg-ink-200 hover:text-ink-800 disabled:opacity-25"
                          >
                            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.6} />
                          </button>
                          <button
                            type="button"
                            onClick={() => move(index, 1)}
                            disabled={index === rows.length - 1 || busyId === `${row.id}-move`}
                            aria-label="Move down"
                            className="grid h-5 w-6 place-items-center rounded text-ink-400 transition-colors hover:bg-ink-200 hover:text-ink-800 disabled:opacity-25"
                          >
                            <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.6} />
                          </button>
                        </div>
                      </td>
                    )}

                    {resource.listColumns.map((column) => (
                      <td
                        key={column.key}
                        className={cx('px-4 py-3', column.align === 'center' ? 'text-center' : 'text-left')}
                      >
                        {renderCell(column, row, index)}
                      </td>
                    ))}

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* The public URL is resolved server-side and attached
                            to the row, since the registry's viewUrl is a
                            function and cannot cross the client boundary. */}
                        {row.__viewUrl && (
                          <a
                            href={row.__viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="View on the site"
                            title="View on the site"
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-800"
                          >
                            <ExternalLink className="h-4 w-4" strokeWidth={2.1} />
                          </a>
                        )}
                        <Link
                          href={`${editBase}/${row.id}`}
                          aria-label="Edit"
                          title="Edit"
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-700"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={2.1} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(row)}
                          disabled={busyId === `${row.id}-delete`}
                          aria-label="Delete"
                          title="Delete"
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-700"
                        >
                          {busyId === `${row.id}-delete` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" strokeWidth={2.1} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-ink-200 px-4 py-3">
              <Link
                href={pageHref(page - 1)}
                aria-disabled={!hasPrev}
                className={cx('btn btn-outline btn-sm', !hasPrev && 'pointer-events-none opacity-40')}
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
                Previous
              </Link>
              <span className="text-xs text-ink-500">
                Page {page} of {totalPages}
              </span>
              <Link
                href={pageHref(page + 1)}
                aria-disabled={!hasNext}
                className={cx('btn btn-outline btn-sm', !hasNext && 'pointer-events-none opacity-40')}
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
