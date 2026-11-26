'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Pencil, Plus, Shield, Trash2, UserPlus, X } from 'lucide-react';
import { cx, formatDate, timeAgo } from '@/lib/utils';
import StatusBadge from '@/components/admin/StatusBadge';
import { useToast } from '@/components/ui/Toast';

const ROLES = [
  { value: 'super_admin', label: 'Super admin', hint: 'Full access, including other accounts' },
  { value: 'admin', label: 'Admin', hint: 'Content, enquiries and settings' },
  { value: 'editor', label: 'Editor', hint: 'Content only — no settings or accounts' },
];

const BLANK = { name: '', email: '', phone: '', role: 'admin', password: '', is_active: true };

/** Admin account management, available to super admins only. */
export default function UserManager({ users = [], currentUserId }) {
  const router = useRouter();
  const toast = useToast();

  const [editing, setEditing] = useState(null); // null | 'new' | user object
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  function openNew() {
    setEditing('new');
    setForm(BLANK);
    setErrors({});
  }

  function openEdit(user) {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '',
      is_active: Number(user.is_active) === 1,
    });
    setErrors({});
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    const isNew = editing === 'new';

    try {
      const res = await fetch(isNew ? '/api/admin/users' : `/api/admin/users/${editing.id}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else toast.error(data.error || 'Could not save the account.');
        return;
      }

      toast.success(data.message || 'Saved.');
      setEditing(null);
      router.refresh();
    } catch {
      toast.error('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(user) {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete the account for ${user.name}? They will lose access immediately.`)) return;
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Could not delete the account.');
        return;
      }
      toast.success('Account deleted.');
      router.refresh();
    } catch {
      toast.error('Could not reach the server.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-950">Admin users</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Accounts that can sign in to this dashboard. Give each person their own — shared logins make the activity
            log useless.
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn btn-primary btn-sm shrink-0">
          <UserPlus className="h-4 w-4" strokeWidth={2.4} />
          New account
        </button>
      </header>

      {/* role explainer */}
      <div className="grid gap-3 sm:grid-cols-3">
        {ROLES.map((role) => (
          <div key={role.value} className="rounded-2xl border border-ink-200 bg-white p-4">
            <p className="flex items-center gap-2 font-display text-sm font-bold text-ink-950">
              <Shield className="h-4 w-4 text-brand-600" strokeWidth={2.2} />
              {role.label}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{role.hint}</p>
          </div>
        ))}
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem]">
            <caption className="sr-only">Admin accounts</caption>
            <thead className="border-b border-ink-200 bg-ink-50">
              <tr>
                {['Name', 'Role', 'Last signed in', 'Status', ''].map((label, i) => (
                  <th
                    key={label || i}
                    scope="col"
                    className="px-4 py-3 text-left font-display text-[0.6875rem] font-bold uppercase tracking-wider text-ink-500"
                  >
                    {label || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-ink-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-linear-to-br from-brand-500 to-brand-700 font-display text-xs font-bold text-white">
                        {user.name
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-bold text-ink-950">
                          {user.name}
                          {user.id === currentUserId && (
                            <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[0.625rem] font-bold uppercase text-brand-700">
                              You
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-ink-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm capitalize text-ink-700">{user.role.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.last_login_at ? (
                      <>
                        <p className="text-sm text-ink-700">{timeAgo(user.last_login_at)}</p>
                        <p className="text-xs text-ink-400">{formatDate(user.last_login_at)}</p>
                      </>
                    ) : (
                      <span className="text-sm text-ink-400">Never</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={Number(user.is_active) === 1 ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        aria-label={`Edit ${user.name}`}
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={2.1} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(user)}
                        disabled={busyId === user.id || user.id === currentUserId}
                        aria-label={`Delete ${user.name}`}
                        title={user.id === currentUserId ? 'You cannot delete your own account' : 'Delete'}
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        {busyId === user.id ? (
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
      </div>

      {/* ------------------------------ modal ------------------------------- */}
      {editing && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setEditing(null)} aria-hidden="true" />

          <form
            onSubmit={save}
            className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-lg font-bold text-ink-950">
                {editing === 'new' ? 'New admin account' : `Edit ${editing.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="user-name" className="field-label">
                  Full name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={cx('field', errors.name && 'field-error')}
                  required
                />
                {errors.name && <p className="mt-1.5 text-xs text-rose-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="user-email" className="field-label">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={cx('field', errors.email && 'field-error')}
                  required
                />
                {errors.email && <p className="mt-1.5 text-xs text-rose-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="user-phone" className="field-label">
                  Phone
                </label>
                <input
                  id="user-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="field"
                />
              </div>

              <div>
                <label htmlFor="user-role" className="field-label">
                  Role
                </label>
                <select
                  id="user-role"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="field"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} — {r.hint}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="user-password" className="field-label">
                  Password {editing === 'new' && <span className="text-rose-500">*</span>}
                </label>
                <input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  autoComplete="new-password"
                  placeholder={editing === 'new' ? 'At least 8 characters' : 'Leave blank to keep the current password'}
                  className={cx('field', errors.password && 'field-error')}
                />
                {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password}</p>}
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-ink-200 px-4 py-3">
                <span>
                  <span className="block font-display text-sm font-semibold text-ink-900">Account active</span>
                  <span className="block text-xs text-ink-500">Inactive accounts cannot sign in.</span>
                </span>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="h-5 w-5 accent-brand-600"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button type="button" onClick={() => setEditing(null)} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" strokeWidth={2.6} />}
                {editing === 'new' ? 'Create account' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
