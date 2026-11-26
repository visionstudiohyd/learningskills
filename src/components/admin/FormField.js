'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ImagePlus, Search, Trash2, X } from 'lucide-react';
import { cx, slugify } from '@/lib/utils';
import Icon, { ICON_NAMES } from '@/components/ui/Icon';
import SmartImage from '@/components/ui/SmartImage';
import MediaPicker from './MediaPicker';
import RichTextEditor from './RichTextEditor';

/* ========================================================================== */
/*  IMAGE                                                                     */
/* ========================================================================== */
function ImageField({ id, value, onChange, folder }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      {value ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-ink-200 bg-ink-100">
            <SmartImage src={value} alt="" fill sizes="112px" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="truncate text-xs text-ink-500" title={value}>
              {value}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPickerOpen(true)} className="btn btn-outline btn-sm">
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="btn btn-sm border border-ink-200 bg-white text-rose-700 hover:border-rose-300 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          id={id}
          onClick={() => setPickerOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-ink-300 bg-ink-50 px-4 py-5 text-left transition-colors hover:border-brand-400 hover:bg-brand-50"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-sm">
            <ImagePlus className="h-5.5 w-5.5" strokeWidth={2} />
          </span>
          <span>
            <span className="block font-display text-sm font-semibold text-ink-900">Choose an image</span>
            <span className="block text-xs text-ink-500">Upload a file, pick from the library, or paste a URL</span>
          </span>
        </button>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onChange}
        folder={folder}
        currentValue={value}
      />
    </>
  );
}

/* ========================================================================== */
/*  ICON                                                                      */
/* ========================================================================== */
function IconField({ id, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_NAMES.slice(0, 120);
    return ICON_NAMES.filter((name) => name.toLowerCase().includes(q)).slice(0, 120);
  }, [query]);

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-ink-200 bg-white text-brand-600">
          <Icon name={value || 'Sparkles'} className="h-5.5 w-5.5" strokeWidth={2.1} />
        </span>
        <input
          id={id}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Sparkles"
          className="field flex-1"
        />
        <button type="button" onClick={() => setOpen((v) => !v)} className="btn btn-outline btn-sm shrink-0">
          {open ? 'Close' : 'Browse'}
        </button>
      </div>

      {open && (
        <div className="mt-2.5 overflow-hidden rounded-xl border border-ink-200 bg-white">
          <div className="flex items-center gap-2 border-b border-ink-200 px-3.5 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={2.2} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons…"
              aria-label="Search icons"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
          <div className="grid max-h-56 grid-cols-6 gap-1 overflow-y-auto p-2 sm:grid-cols-8">
            {filtered.map((name) => (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className={cx(
                  'grid aspect-square place-items-center rounded-lg transition-colors',
                  value === name ? 'bg-brand-500 text-white' : 'text-ink-600 hover:bg-ink-100'
                )}
              >
                <Icon name={name} className="h-4.5 w-4.5" strokeWidth={2.1} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================== */
/*  BOOLEAN                                                                   */
/* ========================================================================== */
function BooleanField({ id, value, onChange, label, help }) {
  const on = value === true || value === 1 || value === '1';
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-ink-200 bg-white px-4 py-3.5 transition-colors hover:border-ink-300"
    >
      <span className="min-w-0">
        <span className="block font-display text-sm font-semibold text-ink-900">{label}</span>
        {help && <span className="mt-0.5 block text-xs text-ink-500">{help}</span>}
      </span>

      <span className="relative mt-0.5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={on}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cx(
            'block h-6 w-11 rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500',
            on ? 'bg-brand-500' : 'bg-ink-300'
          )}
        />
        <span
          className={cx(
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            on && 'translate-x-5'
          )}
        />
      </span>
    </label>
  );
}

/* ========================================================================== */
/*  COLOUR                                                                    */
/* ========================================================================== */
function ColorField({ id, value, onChange }) {
  const safe = /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#23085a';
  return (
    <div className="flex items-center gap-2.5">
      <input
        type="color"
        value={safe}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Colour picker"
        className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-ink-200 bg-white p-1"
      />
      <input
        id={id}
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#23085a"
        className="field flex-1 font-mono text-sm"
      />
    </div>
  );
}

/* ========================================================================== */
/*  MAIN DISPATCHER                                                           */
/* ========================================================================== */
export default function FormField({ field, value, onChange, error, allValues = {}, options = [] }) {
  const id = `field-${field.name}`;
  const describedBy = error ? `${id}-error` : field.help ? `${id}-help` : undefined;

  /* Booleans carry their own label inside the switch row. */
  if (field.type === 'boolean') {
    return (
      <div className={field.full ? 'sm:col-span-2' : undefined}>
        <BooleanField id={id} value={value} onChange={onChange} label={field.label} help={field.help} />
        {error && (
          <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-rose-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  const control = (() => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            rows={field.rows || 4}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cx('field resize-y', error && 'field-error')}
          />
        );

      case 'richtext':
        return <RichTextEditor value={value ?? ''} onChange={onChange} placeholder={field.placeholder} />;

      case 'image':
        return <ImageField id={id} value={value ?? ''} onChange={onChange} folder={field.folder || 'general'} />;

      case 'icon':
        return <IconField id={id} value={value ?? ''} onChange={onChange} />;

      case 'color':
        return <ColorField id={id} value={value ?? ''} onChange={onChange} />;

      case 'select':
        return (
          <div className="relative">
            <select
              id={id}
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy}
              className={cx('field appearance-none pr-10', error && 'field-error')}
            >
              {!field.required && <option value="">— none —</option>}
              {(field.options || []).map((opt) => (
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
        );

      case 'relation':
        return (
          <div className="relative">
            <select
              id={id}
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
              aria-describedby={describedBy}
              className="field appearance-none pr-10"
            >
              <option value="">— none —</option>
              {options.map((opt) => (
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
        );

      case 'number':
        return (
          <input
            id={id}
            type="number"
            value={value ?? ''}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cx('field', error && 'field-error')}
          />
        );

      case 'slug':
        return (
          <div>
            <input
              id={id}
              type="text"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={(e) => onChange(slugify(e.target.value))}
              placeholder={
                field.sourceField && allValues[field.sourceField]
                  ? slugify(allValues[field.sourceField])
                  : 'auto-generated'
              }
              aria-describedby={describedBy}
              className={cx('field font-mono text-sm', error && 'field-error')}
            />
          </div>
        );

      default:
        return (
          <input
            id={id}
            type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'tel' ? 'tel' : 'text'}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cx('field', error && 'field-error')}
          />
        );
    }
  })();

  return (
    <div className={field.full || field.type === 'richtext' ? 'sm:col-span-2' : undefined}>
      <label htmlFor={id} className="field-label">
        {field.label}
        {field.required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>

      {control}

      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      ) : (
        field.help && (
          <p id={`${id}-help`} className="mt-1.5 text-xs text-ink-500">
            {field.help}
          </p>
        )
      )}
    </div>
  );
}
