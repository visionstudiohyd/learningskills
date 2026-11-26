'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { BadgeCheck, Loader2, Send } from 'lucide-react';
import { contactSchema } from '@/lib/validation';
import { zodResolver } from '@/lib/form';
import { cx } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

const SUBJECTS = [
  'Course information',
  'Fees and instalments',
  'Batch dates and scheduling',
  'Corporate / group training',
  'Scholarships',
  'Certificate or transcript',
  'Careers at Pathwise',
  'Something else',
];

/** General-purpose contact form — for questions that are not course enquiries. */
export default function ContactForm({ className = '' }) {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '', company: '' },
  });

  async function onSubmit(values) {
    setServerError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const first = data.errors ? Object.values(data.errors)[0] : null;
        setServerError(first || data.error || 'Your message could not be sent. Please try again.');
        toast.error(first || data.error || 'Message not sent.');
        return;
      }

      reset();
      setDone(true);
      toast.success('Message sent — we will reply shortly.', { title: 'Thank you' });
    } catch {
      setServerError('Could not reach the server. Please check your connection and try again.');
      toast.error('Network error — message not sent.');
    }
  }

  if (done) {
    return (
      <div className={cx('rounded-[var(--radius-card)] border border-teal-200 bg-teal-50/60 p-8 text-center', className)}>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-500 text-white">
          <BadgeCheck className="h-7 w-7" strokeWidth={2.2} />
        </span>
        <h3 className="mt-5 font-display text-xl font-bold text-ink-950">Message sent</h3>
        <p className="mx-auto mt-2.5 max-w-sm text-[0.9375rem] leading-relaxed text-ink-600">
          Thank you for writing to us. A member of the team will reply to your email within one working day.
        </p>
        <button type="button" onClick={() => setDone(false)} className="btn btn-outline btn-sm mt-6">
          Send another message
        </button>
      </div>
    );
  }

  const fieldError = (name) => errors[name]?.message;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cx('rounded-[var(--radius-card)] border border-ink-200 bg-white p-6 md:p-8', className)}
    >
      <h2 className="font-display text-xl font-bold text-ink-950">Send us a message</h2>
      <p className="mt-2 text-[0.9375rem] text-ink-600">
        For anything that is not a course enquiry — group training, certificates, partnerships or careers.
      </p>

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ct-name" className="field-label">
              Full name <span className="text-rose-500">*</span>
            </label>
            <input
              id="ct-name"
              type="text"
              autoComplete="name"
              className={cx('field', fieldError('name') && 'field-error')}
              aria-invalid={Boolean(fieldError('name'))}
              {...register('name')}
            />
            {fieldError('name') && (
              <p role="alert" className="mt-1.5 text-xs text-rose-600">
                {fieldError('name')}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="ct-phone" className="field-label">
              Phone
            </label>
            <input id="ct-phone" type="tel" autoComplete="tel" className="field" {...register('phone')} />
          </div>
        </div>

        <div>
          <label htmlFor="ct-email" className="field-label">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            id="ct-email"
            type="email"
            autoComplete="email"
            className={cx('field', fieldError('email') && 'field-error')}
            aria-invalid={Boolean(fieldError('email'))}
            {...register('email')}
          />
          {fieldError('email') && (
            <p role="alert" className="mt-1.5 text-xs text-rose-600">
              {fieldError('email')}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="ct-subject" className="field-label">
            What is it about?
          </label>
          <select id="ct-subject" className="field" {...register('subject')}>
            <option value="">Select a topic</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ct-message" className="field-label">
            Message <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="ct-message"
            rows={5}
            placeholder="Tell us how we can help…"
            className={cx('field resize-y', fieldError('message') && 'field-error')}
            aria-invalid={Boolean(fieldError('message'))}
            {...register('message')}
          />
          {fieldError('message') && (
            <p role="alert" className="mt-1.5 text-xs text-rose-600">
              {fieldError('message')}
            </p>
          )}
        </div>

        {/* honeypot */}
        <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="ct-company">Company</label>
          <input id="ct-company" type="text" tabIndex={-1} autoComplete="off" {...register('company')} />
        </div>

        {serverError && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {serverError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4.5 w-4.5" strokeWidth={2.2} />
              Send message
            </>
          )}
        </button>
      </div>
    </form>
  );
}
