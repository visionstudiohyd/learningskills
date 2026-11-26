'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Loader2, Save } from 'lucide-react';
import { cx } from '@/lib/utils';
import Icon from '@/components/ui/Icon';
import FormField from './FormField';
import { useToast } from '@/components/ui/Toast';

/**
 * Settings screen.
 *
 * Groups appear as a sidebar of tabs rather than one enormous scroll, and only
 * the changed keys of the active group are sent on save — so two people editing
 * different groups cannot overwrite each other's work.
 */
export default function SettingsManager({ groups = [] }) {
  const toast = useToast();

  const [activeGroup, setActiveGroup] = useState(groups[0]?.key || 'brand');
  const [values, setValues] = useState(() => {
    const seed = {};
    for (const group of groups) {
      for (const field of group.fields) seed[field.key] = field.value;
    }
    return seed;
  });
  const [dirtyKeys, setDirtyKeys] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const current = useMemo(() => groups.find((g) => g.key === activeGroup) || groups[0], [groups, activeGroup]);

  function setValue(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirtyKeys((prev) => new Set(prev).add(key));
  }

  const dirtyInGroup = current ? current.fields.filter((f) => dirtyKeys.has(f.key)).length : 0;

  async function save() {
    if (!current) return;

    // Send only this group's changes — never the whole settings table.
    const patch = {};
    for (const field of current.fields) {
      if (dirtyKeys.has(field.key)) patch[field.key] = values[field.key];
    }

    if (Object.keys(patch).length === 0) {
      toast.info('Nothing has changed in this section.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: patch, group: current.label }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || 'Could not save the settings.');
        return;
      }

      toast.success(data.message || 'Settings saved.');
      setDirtyKeys((prev) => {
        const next = new Set(prev);
        Object.keys(patch).forEach((key) => next.delete(key));
        return next;
      });
    } catch {
      toast.error('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  if (!groups.length) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
        <h2 className="font-display text-base font-bold text-amber-900">No settings available</h2>
        <p className="mt-2 text-sm text-amber-800">
          The settings table looks empty. Run <code className="font-mono text-xs">npm run db:seed</code> to populate it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-950">Settings</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Everything here is live on the public site. Changes take effect within 30 seconds, or immediately on a hard
            refresh.
          </p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm shrink-0">
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.3} />
          View site
        </a>
      </header>

      <div className="grid gap-5 lg:grid-cols-[15rem_1fr] lg:items-start">
        {/* group tabs */}
        <nav className="lg:sticky lg:top-24" aria-label="Settings sections">
          <ul className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {groups.map((group) => {
              const active = group.key === activeGroup;
              const groupDirty = group.fields.some((f) => dirtyKeys.has(f.key));
              return (
                <li key={group.key} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setActiveGroup(group.key)}
                    aria-current={active ? 'true' : undefined}
                    className={cx(
                      'flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left font-display text-[0.8125rem] font-semibold transition-all',
                      active
                        ? 'border-transparent bg-ink-950 text-white'
                        : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
                    )}
                  >
                    <Icon name={group.icon} className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                    <span className="flex-1 whitespace-nowrap lg:whitespace-normal">{group.label}</span>
                    {groupDirty && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" title="Unsaved changes" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* active group */}
        {current && (
          <section className="rounded-2xl border border-ink-200 bg-white">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 px-5 py-4">
              <div>
                <h3 className="font-display text-base font-bold text-ink-950">{current.label}</h3>
                {current.description && <p className="mt-0.5 text-sm text-ink-500">{current.description}</p>}
              </div>
              <button type="button" onClick={save} disabled={saving} className="btn btn-primary btn-sm shrink-0">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2.3} />}
                {saving ? 'Saving…' : dirtyInGroup > 0 ? `Save ${dirtyInGroup} change${dirtyInGroup === 1 ? '' : 's'}` : 'Save'}
              </button>
            </header>

            <div className="grid gap-5 p-5 sm:grid-cols-2 md:p-6">
              {current.fields.map((field) => (
                <FormField
                  key={field.key}
                  field={{
                    name: field.key,
                    label: field.label,
                    type: field.type,
                    help: field.description,
                    rows: field.type === 'textarea' ? 3 : undefined,
                    folder: 'branding',
                    full: field.type === 'richtext' || field.type === 'textarea',
                    options: field.options
                      ? String(field.options)
                          .split(',')
                          .map((o) => ({ value: o.trim(), label: o.trim() }))
                      : undefined,
                  }}
                  value={values[field.key]}
                  onChange={(value) => setValue(field.key, value)}
                />
              ))}
            </div>

            <footer className="flex items-center justify-end gap-3 border-t border-ink-200 bg-ink-50 px-5 py-3.5">
              {dirtyInGroup > 0 && (
                <p className="mr-auto text-xs font-medium text-accent-700">
                  {dirtyInGroup} unsaved change{dirtyInGroup === 1 ? '' : 's'} in this section
                </p>
              )}
              <button type="button" onClick={save} disabled={saving} className="btn btn-primary btn-sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2.3} />}
                Save {current.label.toLowerCase()}
              </button>
            </footer>
          </section>
        )}
      </div>
    </div>
  );
}
