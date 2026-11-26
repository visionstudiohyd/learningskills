'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ChevronDown, Loader2, Mail, MailOpen, Phone, Reply, Trash2,
} from 'lucide-react';
import { cx, formatDate, sanitisePhone, timeAgo } from '@/lib/utils';
import StatusBadge from '@/components/admin/StatusBadge';
import { useToast } from '@/components/ui/Toast';

const STATUSES = ['new', 'read', 'replied', 'archived', 'spam'];

/**
 * Contact messages as an expanding list rather than a table.
 *
 * A message is mostly prose, which a table column cannot show — so each row
 * opens in place to reveal the full text and its actions. Opening a new message
 * marks it read, which is the same convention as an email client.
 */
export default function MessageList({ messages = [] }) {
  const router = useRouter();
  const toast = useToast();
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function patch(id, payload) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Could not update that message.');
        return;
      }
      router.refresh();
    } catch {
      toast.error('Could not reach the server.');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(message) {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return;
    setBusyId(message.id);
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Could not delete.');
        return;
      }
      toast.success('Message deleted.');
      router.refresh();
    } catch {
      toast.error('Could not reach the server.');
    } finally {
      setBusyId(null);
    }
  }

  function toggle(message) {
    const opening = openId !== message.id;
    setOpenId(opening ? message.id : null);
    // Reading it is what "read" means.
    if (opening && message.status === 'new') patch(message.id, { status: 'read' });
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">
          <MailOpen className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <h3 className="mt-4 font-display text-base font-bold text-ink-900">No messages</h3>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          Messages sent through the Contact page arrive here.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {messages.map((message) => {
        const isOpen = openId === message.id;
        const isNew = message.status === 'new';
        const busy = busyId === message.id;

        return (
          <li
            key={message.id}
            className={cx(
              'overflow-hidden rounded-2xl border bg-white transition-all',
              isOpen ? 'border-brand-200 shadow-[var(--shadow-card)]' : 'border-ink-200',
              isNew && !isOpen && 'bg-accent-50/30'
            )}
          >
            <button
              type="button"
              onClick={() => toggle(message)}
              aria-expanded={isOpen}
              className="flex w-full items-start gap-3 p-4 text-left"
            >
              <span
                className={cx(
                  'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                  isNew ? 'bg-accent-100 text-accent-700' : 'bg-ink-100 text-ink-500'
                )}
              >
                {isNew ? <Mail className="h-4.5 w-4.5" strokeWidth={2.1} /> : <MailOpen className="h-4.5 w-4.5" strokeWidth={2.1} />}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-bold text-ink-950">{message.name}</span>
                  <StatusBadge status={message.status} />
                </span>
                <span className="mt-0.5 block truncate text-sm text-ink-700">
                  {message.subject || 'No subject'}
                </span>
                {!isOpen && (
                  <span className="mt-1 block truncate text-xs text-ink-400">{message.message}</span>
                )}
              </span>

              <span className="shrink-0 text-right">
                <span className="block text-xs text-ink-500">{timeAgo(message.created_at)}</span>
                <ChevronDown
                  className={cx('ml-auto mt-1.5 h-4 w-4 text-ink-400 transition-transform', isOpen && 'rotate-180')}
                  strokeWidth={2.4}
                />
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-ink-200 bg-ink-50/60 p-4">
                <dl className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-medium text-ink-500">Email</dt>
                    <dd className="mt-0.5">
                      <a href={`mailto:${message.email}`} className="break-all text-sm font-semibold text-brand-700 hover:underline">
                        {message.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-ink-500">Phone</dt>
                    <dd className="mt-0.5">
                      {message.phone ? (
                        <a href={`tel:${sanitisePhone(message.phone)}`} className="text-sm font-semibold text-brand-700 hover:underline">
                          {message.phone}
                        </a>
                      ) : (
                        <span className="text-sm text-ink-400">Not provided</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-ink-500">Received</dt>
                    <dd className="mt-0.5 text-sm text-ink-800">{formatDate(message.created_at, true)}</dd>
                  </div>
                </dl>

                <blockquote className="mt-4 whitespace-pre-wrap rounded-xl border-l-[3px] border-brand-400 bg-white p-4 text-[0.9375rem] leading-relaxed text-ink-800">
                  {message.message}
                </blockquote>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || 'Your message'}`)}`}
                    onClick={() => patch(message.id, { status: 'replied' })}
                    className="btn btn-primary btn-sm"
                  >
                    <Reply className="h-3.5 w-3.5" strokeWidth={2.4} />
                    Reply by email
                  </a>
                  {message.phone && (
                    <a href={`tel:${sanitisePhone(message.phone)}`} className="btn btn-outline btn-sm">
                      <Phone className="h-3.5 w-3.5" strokeWidth={2.4} />
                      Call
                    </a>
                  )}

                  <label htmlFor={`status-${message.id}`} className="sr-only">
                    Status
                  </label>
                  <select
                    id={`status-${message.id}`}
                    value={message.status}
                    onChange={(e) => patch(message.id, { status: e.target.value })}
                    disabled={busy}
                    className="field !py-1.5 w-auto text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>

                  {busy && <Loader2 className="h-4 w-4 animate-spin text-brand-500" />}

                  <button
                    type="button"
                    onClick={() => remove(message)}
                    disabled={busy}
                    className="btn btn-sm ml-auto border border-ink-200 bg-white text-rose-700 hover:border-rose-300 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
