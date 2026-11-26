'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { cx } from '@/lib/utils';
import FormField from './FormField';

/**
 * Ordered list of sub-records — learning outcomes, syllabus modules, highlights
 * and course FAQs.
 *
 * Order is the array order, and the server stores it as display_order, so
 * moving a row is just a swap. Reordering is done with buttons rather than drag
 * and drop so it works from the keyboard and on touch without a gesture layer.
 */
export default function Repeater({
  label,
  description,
  items = [],
  fields = [],
  onChange,
  addLabel = 'Add item',
  emptyHint,
  titleKey,
  max = 60,
}) {
  function update(index, name, value) {
    const next = items.map((item, i) => (i === index ? { ...item, [name]: value } : item));
    onChange(next);
  }

  function add() {
    if (items.length >= max) return;
    const blank = {};
    for (const field of fields) blank[field.name] = '';
    onChange([...items, blank]);
  }

  function remove(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink-400">{label}</h3>
          {description && <p className="mt-1.5 max-w-xl text-sm text-ink-500">{description}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </header>

      {items.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-ink-300 bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
          {emptyHint || 'Nothing added yet.'}
        </p>
      ) : (
        <ol className="mt-5 space-y-3">
          {items.map((item, index) => (
            <li key={index} className="rounded-xl border border-ink-200 bg-ink-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 font-display text-sm font-bold text-ink-800">
                  <span className="text-ink-400">{String(index + 1).padStart(2, '0')}</span>
                  {titleKey && item[titleKey] ? (
                    <span className="ml-2 truncate font-normal text-ink-600">{item[titleKey]}</span>
                  ) : null}
                </p>

                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move item ${index + 1} up`}
                    className="grid h-7 w-7 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-white hover:text-ink-800 disabled:opacity-25"
                  >
                    <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.6} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    aria-label={`Move item ${index + 1} down`}
                    className="grid h-7 w-7 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-white hover:text-ink-800 disabled:opacity-25"
                  >
                    <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.6} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Remove item ${index + 1}`}
                    className="grid h-7 w-7 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-rose-100 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              <div className={cx('mt-3.5 grid gap-4', fields.length > 1 && 'sm:grid-cols-2')}>
                {fields.map((field) => (
                  <FormField
                    key={field.name}
                    field={field}
                    value={item[field.name]}
                    onChange={(value) => update(index, field.name, value)}
                  />
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}

      <button
        type="button"
        onClick={add}
        disabled={items.length >= max}
        className="btn btn-outline btn-sm mt-4"
      >
        <Plus className="h-4 w-4" strokeWidth={2.6} />
        {addLabel}
      </button>
    </section>
  );
}
