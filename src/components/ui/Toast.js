'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { cx } from '@/lib/utils';

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CheckCircle2, bar: 'bg-teal-500', iconClass: 'text-teal-600', ring: 'ring-teal-200' },
  error: { icon: TriangleAlert, bar: 'bg-rose-500', iconClass: 'text-rose-600', ring: 'ring-rose-200' },
  info: { icon: Info, bar: 'bg-brand-500', iconClass: 'text-brand-600', ring: 'ring-brand-200' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, options = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toast = {
      id,
      message,
      title: options.title || null,
      tone: TONES[options.tone] ? options.tone : 'info',
      duration: options.duration ?? 4800,
    };
    setToasts((prev) => [...prev.slice(-3), toast]);
    return id;
  }, []);

  const api = useMemo(
    () => ({
      push,
      dismiss,
      success: (message, options) => push(message, { ...options, tone: 'success' }),
      error: (message, options) => push(message, { ...options, tone: 'error', duration: options?.duration ?? 6500 }),
      info: (message, options) => push(message, { ...options, tone: 'info' }),
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex flex-col items-center gap-2.5 p-4 sm:inset-x-auto sm:right-0 sm:top-0 sm:items-end sm:p-6"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }) {
  const [leaving, setLeaving] = useState(false);
  const tone = TONES[toast.tone];
  const ToneIcon = tone.icon;

  useEffect(() => {
    if (!toast.duration) return undefined;
    const exitTimer = setTimeout(() => setLeaving(true), toast.duration);
    const removeTimer = setTimeout(() => onDismiss(toast.id), toast.duration + 280);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast, onDismiss]);

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
      className={cx(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl bg-white p-3.5 pr-2.5 shadow-[var(--shadow-lift)] ring-1 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        tone.ring,
        leaving ? 'translate-y-2 scale-[0.97] opacity-0' : 'translate-y-0 scale-100 opacity-100'
      )}
    >
      <span className={cx('absolute left-0 top-0 h-full w-1', tone.bar)} aria-hidden="true" />
      <ToneIcon className={cx('mt-px h-5 w-5 shrink-0', tone.iconClass)} strokeWidth={2.2} />
      <div className="flex-1 pt-px">
        {toast.title && <p className="font-display text-sm font-semibold text-ink-950">{toast.title}</p>}
        <p className={cx('text-sm leading-snug text-ink-700', toast.title && 'mt-0.5')}>{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Toast API. Safe to call from any client component under the provider. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // No-op fallback keeps a component usable in isolation (e.g. a test render).
    return { push: () => {}, dismiss: () => {}, success: () => {}, error: () => {}, info: () => {} };
  }
  return ctx;
}
