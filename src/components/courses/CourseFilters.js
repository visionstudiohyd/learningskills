'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { ChevronDown, LayoutGrid, Loader2, Rows3, Search, Signal, SlidersHorizontal, X } from 'lucide-react';
import { cx } from '@/lib/utils';

/**
 * Filter and search controls for the course catalogue.
 *
 * All state lives in the URL, which means a filtered view is shareable,
 * bookmarkable and survives the back button — and the heavy lifting stays in
 * the server component that reads those params. Search is debounced so typing
 * does not fire a request per keystroke.
 */
export default function CourseFilters({
  levels = [],
  modes = [],
  sortOptions = [],
  total = 0,
  layout = 'grid',
  onLayoutChange,
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = params.get('search') || '';
  const currentLevels = params.getAll('level');
  const currentModes = params.getAll('mode');
  const currentSort = params.get('sort') || 'featured';

  const [searchValue, setSearchValue] = useState(currentSearch);
  const [panelOpen, setPanelOpen] = useState(false);
  const debounceRef = useRef(null);
  const isFirstRender = useRef(true);

  // Keep the input in step when the URL changes from elsewhere (the back
  // button, or the "clear all" button).
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const push = (mutate) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete('page'); // any filter change returns to page 1
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `/courses?${qs}` : '/courses', { scroll: false });
    });
  };

  // Debounced search
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return undefined;
    }
    if (searchValue === currentSearch) return undefined;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      push((next) => {
        if (searchValue.trim()) next.set('search', searchValue.trim());
        else next.delete('search');
      });
    }, 420);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const toggleMulti = (key, value) => {
    push((next) => {
      const existing = next.getAll(key);
      next.delete(key);
      const updated = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value];
      updated.forEach((v) => next.append(key, v));
    });
  };

  const clearAll = () => {
    setSearchValue('');
    startTransition(() => router.push('/courses', { scroll: false }));
  };

  const activeChips = useMemo(() => {
    const chips = [];
    if (currentSearch) chips.push({ key: 'search', label: `“${currentSearch}”`, clear: (n) => n.delete('search') });
    currentLevels.forEach((level) =>
      chips.push({
        key: `level-${level}`,
        label: level,
        clear: (n) => {
          const rest = n.getAll('level').filter((v) => v !== level);
          n.delete('level');
          rest.forEach((v) => n.append('level', v));
        },
      })
    );
    currentModes.forEach((mode) =>
      chips.push({
        key: `mode-${mode}`,
        label: mode,
        clear: (n) => {
          const rest = n.getAll('mode').filter((v) => v !== mode);
          n.delete('mode');
          rest.forEach((v) => n.append('mode', v));
        },
      })
    );
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSearch, currentLevels.join(), currentModes.join()]);

  const hasFilters = activeChips.length > 0;

  return (
    <div className="space-y-4">
      {/* -------------------------- primary control bar ------------------------ */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* search */}
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-400"
            strokeWidth={2.2}
          />
          <label htmlFor="course-search" className="sr-only">
            Search courses
          </label>
          <input
            id="course-search"
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by course, skill or field…"
            className="field !rounded-full pl-11.5 pr-11"
          />
          {isPending ? (
            <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-500" />
          ) : (
            searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              >
                <X className="h-4 w-4" strokeWidth={2.4} />
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* filters toggle */}
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            aria-expanded={panelOpen}
            aria-controls="filter-panel"
            className={cx(
              'btn shrink-0',
              hasFilters || panelOpen ? 'btn-primary' : 'btn-outline'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={2.3} />
            Filters
            {hasFilters && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white/25 px-1 text-[0.6875rem] font-bold">
                {activeChips.length}
              </span>
            )}
          </button>

          {/* sort */}
          <div className="relative flex-1 lg:flex-none">
            <label htmlFor="course-sort" className="sr-only">
              Sort courses
            </label>
            <select
              id="course-sort"
              value={currentSort}
              onChange={(e) => push((next) => next.set('sort', e.target.value))}
              className="field !rounded-full appearance-none pr-10 lg:w-48"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              strokeWidth={2.2}
            />
          </div>

          {/* layout switch */}
          <div className="hidden items-center rounded-full border border-ink-200 bg-white p-1 sm:flex">
            <button
              type="button"
              onClick={() => onLayoutChange?.('grid')}
              aria-label="Grid view"
              aria-pressed={layout === 'grid'}
              className={cx(
                'grid h-8 w-8 place-items-center rounded-full transition-colors',
                layout === 'grid' ? 'bg-brand-500 text-white' : 'text-ink-500 hover:bg-ink-100'
              )}
            >
              <LayoutGrid className="h-4 w-4" strokeWidth={2.3} />
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange?.('list')}
              aria-label="List view"
              aria-pressed={layout === 'list'}
              className={cx(
                'grid h-8 w-8 place-items-center rounded-full transition-colors',
                layout === 'list' ? 'bg-brand-500 text-white' : 'text-ink-500 hover:bg-ink-100'
              )}
            >
              <Rows3 className="h-4 w-4" strokeWidth={2.3} />
            </button>
          </div>
        </div>
      </div>

      {/* --------------------------- level quick row -------------------------- */}
      <div className="no-scrollbar -mx-[var(--page-gutter)] flex gap-2 overflow-x-auto px-[var(--page-gutter)] pb-1">
        <button
          type="button"
          onClick={() => push((next) => next.delete('level'))}
          aria-pressed={currentLevels.length === 0}
          className={cx(
            'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all',
            currentLevels.length === 0
              ? 'border-transparent bg-ink-950 text-white'
              : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
          )}
        >
          All levels
        </button>
        {levels.map((level) => {
          const selected = currentLevels.includes(level);
          return (
            <button
              key={level}
              type="button"
              onClick={() => toggleMulti('level', level)}
              aria-pressed={selected}
              className={cx(
                'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                selected
                  ? 'border-transparent bg-brand-500 text-white'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
              )}
            >
              <Signal className="h-4 w-4" strokeWidth={2.3} />
              {level}
            </button>
          );
        })}
      </div>

      {/* ---------------------------- filter panel ---------------------------- */}
      <div
        id="filter-panel"
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: panelOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="rounded-[var(--radius-card)] border border-ink-200 bg-white p-5">
            <div className="grid gap-6 sm:grid-cols-2">
              <fieldset>
                <legend className="font-display text-sm font-bold text-ink-950">Course level</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {levels.map((level) => {
                    const checked = currentLevels.includes(level);
                    return (
                      <label
                        key={level}
                        className={cx(
                          'cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
                          checked
                            ? 'border-brand-500 bg-brand-500 text-white'
                            : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => toggleMulti('level', level)}
                        />
                        {level}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="font-display text-sm font-bold text-ink-950">Delivery format</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {modes.map((mode) => {
                    const checked = currentModes.includes(mode);
                    return (
                      <label
                        key={mode}
                        className={cx(
                          'cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
                          checked
                            ? 'border-teal-500 bg-teal-500 text-white'
                            : 'border-ink-200 bg-white text-ink-700 hover:border-teal-300'
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => toggleMulti('mode', mode)}
                        />
                        {mode}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------- result summary row ------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-4">
        <p className="text-sm text-ink-600" aria-live="polite">
          <span className="font-display font-bold text-ink-950">{total}</span>{' '}
          {total === 1 ? 'course' : 'courses'}
          {hasFilters ? ' match your filters' : ' available'}
        </p>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => push(chip.clear)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white py-1 pl-3 pr-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-rose-300 hover:text-rose-700"
              >
                {chip.label}
                <span className="grid h-4.5 w-4.5 place-items-center rounded-full bg-ink-100 text-ink-500 transition-colors group-hover:bg-rose-100 group-hover:text-rose-600">
                  <X className="h-3 w-3" strokeWidth={3} />
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-brand-600 underline-offset-2 transition-colors hover:text-brand-800 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
