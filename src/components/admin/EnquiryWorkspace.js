'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { cx } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

const STATUSES = [
  { value: 'new', label: 'New', hint: 'Not yet contacted' },
  { value: 'contacted', label: 'Contacted', hint: 'Spoken to or emailed' },
  { value: 'follow_up', label: 'Follow up', hint: 'Waiting on them' },
  { value: 'converted', label: 'Converted', hint: 'Enrolled' },
  { value: 'closed', label: 'Closed', hint: 'Not proceeding' },
  { value: 'spam', label: 'Spam', hint: 'Not a genuine enquiry' },
];

const PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

/**
 * The working panel on an enquiry.
 *
 * Status is saved immediately on click — that is the action staff take dozens
 * of times a day and it should not need a second press. Notes and the
 * follow-up date are saved explicitly, because losing half-typed notes to an
 * autosave race would be worse than pressing a button.
 */
export default function EnquiryWorkspace({ enquiry, admins = [] }) {
  const router = useRouter();
  const toast = useToast();

  const [status, setStatus] = useState(enquiry.status);
  const [priority, setPriority] = useState(enquiry.priority);
  const [notes, setNotes] = useState(enquiry.admin_notes || '');
  const [assignedTo, setAssignedTo] = useState(enquiry.assigned_to || '');
  const [followUp, setFollowUp] = useState(
    enquiry.follow_up_at ? new Date(enquiry.follow_up_at).toISOString().slice(0, 16) : ''
  );

  const [savingField, setSavingField] = useState(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function patch(payload, { field = null, silent = false } = {}) {
    if (field) setSavingField(field);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || 'Could not save that change.');
        return false;
      }

      if (!silent) toast.success('Saved.');
      router.refresh();
      return true;
    } catch {
      toast.error('Could not reach the server.');
      return false;
    } finally {
      setSavingField(null);
    }
  }

  async function saveNotes() {
    setSavingNotes(true);
    await patch({ admin_notes: notes, follow_up_at: followUp || null, assigned_to: assignedTo || null });
    setSavingNotes(false);
  }

  async function remove() {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete enquiry ${enquiry.reference} from ${enquiry.name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Could not delete.');
        setDeleting(false);
        return;
      }
      toast.success('Enquiry deleted.');
      router.push('/admin/enquiries');
      router.refresh();
    } catch {
      toast.error('Could not reach the server.');
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* ------------------------------ status ------------------------------ */}
      <section className="rounded-2xl border border-ink-200 bg-white p-5">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink-400">Status</h3>
        <div className="mt-4 grid gap-2">
          {STATUSES.map((option) => {
            const active = status === option.value;
            const busy = savingField === `status-${option.value}`;
            return (
              <button
                key={option.value}
                type="button"
                onClick={async () => {
                  setStatus(option.value);
                  const ok = await patch({ status: option.value, is_read: true }, { field: `status-${option.value}` });
                  if (!ok) setStatus(enquiry.status);
                }}
                aria-pressed={active}
                className={cx(
                  'flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left transition-all',
                  active
                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-200'
                    : 'border-ink-200 bg-white hover:border-ink-300'
                )}
              >
                <span>
                  <span className={cx('block font-display text-sm font-bold', active ? 'text-brand-800' : 'text-ink-900')}>
                    {option.label}
                  </span>
                  <span className="block text-xs text-ink-500">{option.hint}</span>
                </span>
                {busy ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-500" />
                ) : (
                  <span
                    className={cx(
                      'h-4 w-4 shrink-0 rounded-full border-2 transition-colors',
                      active ? 'border-brand-500 bg-brand-500' : 'border-ink-300'
                    )}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ----------------------------- priority ---------------------------- */}
      <section className="rounded-2xl border border-ink-200 bg-white p-5">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink-400">Priority</h3>
        <div className="mt-4 flex gap-2">
          {PRIORITIES.map((option) => {
            const active = priority === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={async () => {
                  setPriority(option.value);
                  const ok = await patch({ priority: option.value }, { field: `priority-${option.value}` });
                  if (!ok) setPriority(enquiry.priority);
                }}
                aria-pressed={active}
                className={cx(
                  'flex-1 rounded-xl border px-3 py-2 font-display text-sm font-semibold transition-all',
                  active ? 'border-transparent bg-ink-950 text-white' : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
                )}
              >
                {savingField === `priority-${option.value}` ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  option.label
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* --------------------- owner, follow-up, notes --------------------- */}
      <section className="rounded-2xl border border-ink-200 bg-white p-5">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink-400">Working notes</h3>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="eq-assignee" className="field-label">
              Assigned to
            </label>
            <select
              id="eq-assignee"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="field"
            >
              <option value="">Unassigned</option>
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="eq-followup" className="field-label">
              Follow up on
            </label>
            <input
              id="eq-followup"
              type="datetime-local"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              className="field"
            />
            <p className="mt-1.5 text-xs text-ink-500">
              Appears in the dashboard&apos;s follow-up list on the day, and flags as overdue after it.
            </p>
          </div>

          <div>
            <label htmlFor="eq-notes" className="field-label">
              Internal notes
            </label>
            <textarea
              id="eq-notes"
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was discussed, what was sent, what happens next…"
              className="field resize-y"
            />
            <p className="mt-1.5 text-xs text-ink-500">Visible to staff only — never shown to the enquirer.</p>
          </div>

          <button type="button" onClick={saveNotes} disabled={savingNotes} className="btn btn-primary btn-sm w-full">
            {savingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2.3} />}
            {savingNotes ? 'Saving…' : 'Save notes, owner & follow-up'}
          </button>
        </div>
      </section>

      {/* ------------------------------ danger ----------------------------- */}
      <section className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
        <h3 className="font-display text-sm font-bold text-rose-900">Delete this enquiry</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-rose-800">
          Removes the record and its course selections permanently. Consider marking it as spam or closed instead —
          that keeps the history for your reporting.
        </p>
        <button
          type="button"
          onClick={remove}
          disabled={deleting}
          className="btn btn-sm mt-4 border border-rose-300 bg-white text-rose-700 hover:bg-rose-100"
        >
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />}
          Delete permanently
        </button>
      </section>
    </div>
  );
}
