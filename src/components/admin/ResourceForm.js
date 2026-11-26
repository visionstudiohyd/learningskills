'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, Loader2, Save, Trash2, TriangleAlert } from 'lucide-react';
import { cx } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import FormField from './FormField';

/**
 * Generic create/edit form, built from a resource's field definitions.
 *
 * The server does the validating — this posts the whole record and renders
 * whatever field errors come back, so the rules can never drift from the API's.
 * Unsaved-change tracking drives both the Save button state and the leave
 * confirmation.
 */
export default function ResourceForm({
  resource,
  item = null,
  relationOptions = {},
  backHref,
  viewUrl = null,
}) {
  const router = useRouter();
  const toast = useToast();

  const isEdit = Boolean(item?.id);

  // Seed from the record, or from each field's declared default.
  const initial = useMemo(() => {
    const seed = {};
    for (const field of resource.fields) {
      if (item && field.name in item) {
        seed[field.name] = item[field.name];
      } else if (field.default !== undefined) {
        seed[field.name] = field.default;
      } else if (field.type === 'boolean') {
        seed[field.name] = false;
      } else if (field.type === 'number') {
        seed[field.name] = '';
      } else {
        seed[field.name] = '';
      }
    }
    return seed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, resource.key]);

  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState('');

  const groups = useMemo(() => {
    const map = new Map();
    for (const field of resource.fields) {
      const group = field.group || 'Details';
      if (!map.has(group)) map.set(group, []);
      map.get(group).push(field);
    }
    return [...map.entries()];
  }, [resource.fields]);

  function setValue(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function submit(event, { close = false } = {}) {
    event?.preventDefault();
    if (saving) return;

    setSaving(true);
    setErrors({});
    setFormError('');

    try {
      const url = isEdit ? `/api/admin/${resource.key}/${item.id}` : `/api/admin/${resource.key}`;
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          const count = Object.keys(data.errors).length;
          toast.error(`${count} field${count === 1 ? '' : 's'} need attention.`);
        } else {
          setFormError(data.error || 'Could not save. Please try again.');
          toast.error(data.error || 'Could not save.');
        }
        return;
      }

      setDirty(false);
      toast.success(data.message || `${resource.singular} saved.`);

      if (close || !isEdit) {
        router.push(backHref);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch {
      setFormError('Could not reach the server. Is the application still running?');
      toast.error('Network error — nothing was saved.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete this ${resource.singular.toLowerCase()}? This cannot be undone.`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/${resource.key}/${item.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || 'Could not delete.');
        setDeleting(false);
        return;
      }

      toast.success(data.message || `${resource.singular} deleted.`);
      router.push(backHref);
      router.refresh();
    } catch {
      toast.error('Could not reach the server.');
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* --------------------------- sticky header -------------------------- */}
      <div className="sticky top-16 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 bg-ink-100/95 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={backHref}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-900"
            aria-label={`Back to ${resource.label}`}
          >
            <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.2} />
          </Link>
          <div className="min-w-0">
            <h2 className="truncate font-display text-base font-bold text-ink-950">
              {isEdit ? `Edit ${resource.singular.toLowerCase()}` : `New ${resource.singular.toLowerCase()}`}
            </h2>
            {dirty && <p className="text-xs text-accent-700">Unsaved changes</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEdit && viewUrl && (
            <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.3} />
              View
            </a>
          )}
          {isEdit && (
            <button
              type="button"
              onClick={remove}
              disabled={deleting || saving}
              className="btn btn-sm border border-ink-200 bg-white text-rose-700 hover:border-rose-300 hover:bg-rose-50"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />}
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={(e) => submit(e, { close: true })}
            disabled={saving}
            className="btn btn-outline btn-sm"
          >
            Save &amp; close
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2.3} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {formError && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" strokeWidth={2.2} />
          <p className="text-sm text-rose-800">{formError}</p>
        </div>
      )}

      {/* ----------------------------- field groups ------------------------- */}
      {groups.map(([groupName, fields]) => (
        <section key={groupName} className="rounded-2xl border border-ink-200 bg-white p-5 md:p-6">
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink-400">{groupName}</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {fields.map((field) => (
              <FormField
                key={field.name}
                field={{
                  ...field,
                  sourceField: resource.slug?.field === field.name ? resource.slug.from : undefined,
                  folder: field.folder || resource.key,
                }}
                value={values[field.name]}
                allValues={values}
                options={relationOptions[field.name] || []}
                error={errors[field.name]}
                onChange={(value) => setValue(field.name, value)}
              />
            ))}
          </div>
        </section>
      ))}

      {/* bottom actions, for long forms */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 pb-4">
        <Link href={backHref} className="btn btn-outline">
          Cancel
        </Link>
        <button type="submit" disabled={saving} className={cx('btn btn-primary', saving && 'opacity-70')}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2.3} />}
          {isEdit ? 'Save changes' : `Create ${resource.singular.toLowerCase()}`}
        </button>
      </div>
    </form>
  );
}
