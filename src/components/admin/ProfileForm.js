'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, KeyRound, Loader2, Save, UserCog } from 'lucide-react';
import { cx, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

/** The signed-in admin's own details and password. Available to every role. */
export default function ProfileForm({ admin }) {
  const router = useRouter();
  const toast = useToast();

  const [details, setDetails] = useState({ name: admin.name, phone: admin.phone || '' });
  const [detailErrors, setDetailErrors] = useState({});
  const [savingDetails, setSavingDetails] = useState(false);

  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  async function saveDetails(event) {
    event.preventDefault();
    setSavingDetails(true);
    setDetailErrors({});
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) setDetailErrors(data.errors);
        else toast.error(data.error || 'Could not save your details.');
        return;
      }
      toast.success('Profile updated.');
      router.refresh();
    } catch {
      toast.error('Could not reach the server.');
    } finally {
      setSavingDetails(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordErrors({});
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'password', ...passwords }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) setPasswordErrors(data.errors);
        else toast.error(data.error || 'Could not change your password.');
        return;
      }
      toast.success('Password changed.', { title: 'Done' });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch {
      toast.error('Could not reach the server.');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="font-display text-xl font-bold text-ink-950">My profile</h2>
        <p className="mt-1 text-sm text-ink-500">Your own account details and password.</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        {/* ----------------------------- details ---------------------------- */}
        <form onSubmit={saveDetails} className="rounded-2xl border border-ink-200 bg-white p-5 md:p-6">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.1em] text-ink-400">
            <UserCog className="h-4 w-4" strokeWidth={2.2} />
            Your details
          </h3>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="profile-name" className="field-label">
                Full name
              </label>
              <input
                id="profile-name"
                type="text"
                value={details.name}
                onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
                className={cx('field', detailErrors.name && 'field-error')}
              />
              {detailErrors.name && <p className="mt-1.5 text-xs text-rose-600">{detailErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="profile-phone" className="field-label">
                Phone
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={details.phone}
                onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))}
                className="field"
              />
            </div>

            <dl className="divide-y divide-ink-200 rounded-xl bg-ink-50 px-4 text-sm">
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-ink-500">Email</dt>
                <dd className="font-medium text-ink-900">{admin.email}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-ink-500">Role</dt>
                <dd className="font-medium capitalize text-ink-900">{admin.role.replace('_', ' ')}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-ink-500">Last signed in</dt>
                <dd className="font-medium text-ink-900">
                  {admin.last_login_at ? formatDate(admin.last_login_at, true) : '—'}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-ink-500">
              Your email address and role can only be changed by a super admin.
            </p>

            <button type="submit" disabled={savingDetails} className="btn btn-primary btn-sm w-full">
              {savingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={2.3} />}
              Save details
            </button>
          </div>
        </form>

        {/* ---------------------------- password ---------------------------- */}
        <form onSubmit={changePassword} className="rounded-2xl border border-ink-200 bg-white p-5 md:p-6">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.1em] text-ink-400">
            <KeyRound className="h-4 w-4" strokeWidth={2.2} />
            Change password
          </h3>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="current-password" className="field-label">
                Current password
              </label>
              <input
                id="current-password"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="current-password"
                value={passwords.current_password}
                onChange={(e) => setPasswords((p) => ({ ...p, current_password: e.target.value }))}
                className={cx('field', passwordErrors.current_password && 'field-error')}
              />
              {passwordErrors.current_password && (
                <p className="mt-1.5 text-xs text-rose-600">{passwordErrors.current_password}</p>
              )}
            </div>

            <div>
              <label htmlFor="new-password" className="field-label">
                New password
              </label>
              <input
                id="new-password"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                value={passwords.new_password}
                onChange={(e) => setPasswords((p) => ({ ...p, new_password: e.target.value }))}
                className={cx('field', passwordErrors.new_password && 'field-error')}
              />
              {passwordErrors.new_password ? (
                <p className="mt-1.5 text-xs text-rose-600">{passwordErrors.new_password}</p>
              ) : (
                <p className="mt-1.5 text-xs text-ink-500">At least 8 characters.</p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="field-label">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                value={passwords.confirm_password}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm_password: e.target.value }))}
                className={cx('field', passwordErrors.confirm_password && 'field-error')}
              />
              {passwordErrors.confirm_password && (
                <p className="mt-1.5 text-xs text-rose-600">{passwordErrors.confirm_password}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowPasswords((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800"
            >
              {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showPasswords ? 'Hide passwords' : 'Show passwords'}
            </button>

            <button type="submit" disabled={savingPassword} className="btn btn-primary btn-sm w-full">
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" strokeWidth={2.3} />}
              Change password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
