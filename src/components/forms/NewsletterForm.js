'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { cx } from '@/lib/utils';

/** Footer newsletter signup. Keeps its own success state so it never needs a page reload. */
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [message, setMessage] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    if (state === 'loading') return;

    setState('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setState('done');
        setEmail('');
        setMessage(data.message || 'You are on the list. Thank you.');
      } else {
        setState('error');
        setMessage(data.error || data.errors?.email || 'Something went wrong. Please try again.');
      }
    } catch {
      setState('error');
      setMessage('Could not reach the server. Please check your connection.');
    }
  }

  if (state === 'done') {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-teal-400/30 bg-teal-400/10 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" strokeWidth={2.2} />
        <div>
          <p className="font-display text-sm font-semibold text-white">Subscribed</p>
          <p className="mt-0.5 text-sm text-white/70">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === 'error') setState('idle');
          }}
          placeholder="your.name@email.com"
          aria-invalid={state === 'error'}
          aria-describedby={state === 'error' ? 'newsletter-error' : undefined}
          className={cx(
            'min-w-0 flex-1 rounded-full border bg-white/5 px-5 py-3 text-[0.9375rem] text-white placeholder:text-white/40 transition-all focus:outline-none',
            state === 'error'
              ? 'border-rose-400/60 focus:border-rose-300 focus:bg-white/10'
              : 'border-white/15 focus:border-brand-300 focus:bg-white/10'
          )}
        />
        <button type="submit" disabled={state === 'loading'} className="btn btn-accent shrink-0">
          {state === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining
            </>
          ) : (
            <>
              Subscribe
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </>
          )}
        </button>
      </div>

      {state === 'error' && message && (
        <p id="newsletter-error" role="alert" className="mt-2.5 text-sm text-rose-300">
          {message}
        </p>
      )}
      {state !== 'error' && (
        <p className="mt-2.5 text-xs text-white/45">One email a month. Unsubscribe in one click, any time.</p>
      )}
    </form>
  );
}
