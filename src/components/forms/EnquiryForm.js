'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  BadgeCheck, Check, ChevronDown, CircleDollarSign, Clock, Loader2, Plus, Search,
  Send, ShieldCheck, Sparkles, X,
} from 'lucide-react';
import { enquirySchema } from '@/lib/validation';
import { zodResolver } from '@/lib/form';
import { cx } from '@/lib/utils';
import { useShortlist } from '@/components/shortlist/ShortlistProvider';
import { useToast } from '@/components/ui/Toast';

const MODES = ['No Preference', 'Online', 'Classroom', 'Hybrid'];
const TIMES = ['Weekday evenings', 'Weekends', 'Weekday daytime', 'Self paced', 'Flexible'];

/**
 * Course enquiry form.
 *
 * Supports multiple course selection in three ways, all of which stay in sync:
 *   • courses already in the visitor's shortlist (localStorage),
 *   • a course the page itself is about (`course` prop on a detail page),
 *   • an in-form searchable picker over every active course.
 *
 * Validated client-side with the same Zod schema the API route re-validates
 * with, so a bypassed browser cannot submit anything the server would reject.
 */
export default function EnquiryForm({
  courseOptions = [],
  course = null,
  variant = 'full',
  settings = {},
  className = '',
  onSuccess,
}) {
  const pathname = usePathname();
  const toast = useToast();
  const shortlist = useShortlist();

  const [picked, setPicked] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [result, setResult] = useState(null);
  const [serverError, setServerError] = useState('');

  const compact = variant === 'compact';
  const maxCourses = Number(settings.enquiry_max_courses || 8);
  const cityRequired = settings.enquiry_require_city === '1' || settings.enquiry_require_city === true;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      city: '',
      qualification: '',
      preferred_mode: 'No Preference',
      preferred_time: '',
      message: '',
      consent: false,
      company: '',
      course_ids: [],
      source_page: pathname,
    },
  });

  // Seed the selection: the current course first, then anything shortlisted.
  useEffect(() => {
    if (!shortlist.hydrated) return;
    const seeded = [];
    if (course?.id) seeded.push({ id: Number(course.id), title: course.title, slug: course.slug });
    for (const item of shortlist.items) {
      if (!seeded.some((s) => s.id === item.id)) seeded.push(item);
    }
    setPicked(seeded.slice(0, maxCourses));
  }, [shortlist.hydrated, shortlist.items, course, maxCourses]);

  // Mirror the selection into the form value that gets submitted.
  useEffect(() => {
    setValue('course_ids', picked.map((p) => p.id), { shouldValidate: false });
  }, [picked, setValue]);

  useEffect(() => {
    setValue('source_page', pathname);
  }, [pathname, setValue]);

  const pickedIds = useMemo(() => new Set(picked.map((p) => p.id)), [picked]);

  const filteredOptions = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    const available = courseOptions.filter((opt) => !pickedIds.has(Number(opt.id)));
    if (!q) return available.slice(0, 60);
    return available
      .filter((opt) => opt.title.toLowerCase().includes(q))
      .slice(0, 60);
  }, [courseOptions, pickedIds, pickerQuery]);

  function addCourse(option) {
    if (picked.length >= maxCourses) {
      toast.info(`You can enquire about up to ${maxCourses} courses at once.`);
      return;
    }
    setPicked((prev) => [...prev, { id: Number(option.id), title: option.title, slug: option.slug }]);
    setPickerQuery('');
  }

  function removeCourse(id) {
    setPicked((prev) => prev.filter((p) => p.id !== id));
    if (shortlist.has(id)) shortlist.remove(id);
  }

  async function onSubmit(values) {
    setServerError('');
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, course_ids: picked.map((p) => p.id) }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const firstFieldError = data.errors ? Object.values(data.errors)[0] : null;
        setServerError(firstFieldError || data.error || 'We could not submit your enquiry. Please try again.');
        toast.error(firstFieldError || data.error || 'Enquiry could not be submitted.');
        return;
      }

      setResult(data);
      reset();
      setPicked([]);
      shortlist.clear();
      toast.success('Enquiry sent — we will be in touch shortly.', { title: 'Thank you' });
      onSuccess?.(data);
    } catch {
      setServerError('Could not reach the server. Please check your connection and try again.');
      toast.error('Network error — your enquiry was not sent.');
    }
  }

  /* ------------------------------ success view ----------------------------- */
  if (result) {
    return (
      <div className={cx('rounded-[var(--radius-card)] border border-teal-200 bg-teal-50/60 p-6 text-center md:p-8', className)}>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-500 text-white shadow-[0_10px_30px_-10px_rgb(15_185_168/0.6)]">
          <BadgeCheck className="h-7 w-7" strokeWidth={2.2} />
        </span>
        <h3 className="mt-5 font-display text-xl font-bold text-ink-950">
          {settings.enquiry_success_title || 'Enquiry received'}
        </h3>
        <p className="mx-auto mt-2.5 max-w-md text-[0.9375rem] leading-relaxed text-ink-600">
          {settings.enquiry_success_text ||
            'Thank you — a course advisor will contact you within 24 working hours.'}
        </p>
        {result.reference && (
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-teal-300 bg-white px-4 py-2 font-display text-sm font-semibold text-teal-800">
            Reference
            <span className="font-mono tracking-tight text-ink-950">{result.reference}</span>
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/courses" className="btn btn-outline btn-sm">
            Browse more courses
          </Link>
          <button type="button" onClick={() => setResult(null)} className="btn btn-primary btn-sm">
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------- the form ------------------------------- */
  const fieldError = (name) => errors[name]?.message;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cx(
        compact ? 'space-y-4' : 'rounded-[var(--radius-card)] border border-ink-200 bg-white p-6 shadow-[var(--shadow-card)] md:p-8',
        className
      )}
      id="enquiry-form"
    >
      {!compact && (
        <div className="mb-6">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
            No obligation
          </span>
          <h2 className="mt-2.5 font-display text-2xl font-bold text-ink-950">
            {settings.enquiry_form_title || 'Request course details'}
          </h2>
          <p className="mt-2 text-[0.9375rem] text-ink-600">
            {settings.enquiry_form_text || 'Takes under a minute. No payment details, ever.'}
          </p>
        </div>
      )}

      {/* --------------------------- course selection -------------------------- */}
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <label className="field-label mb-0">
            Courses you are interested in
            {picked.length > 0 && (
              <span className="ml-1.5 font-normal text-ink-500">
                ({picked.length}/{maxCourses})
              </span>
            )}
          </label>
          {courseOptions.length > 0 && (
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              aria-expanded={pickerOpen}
              className="font-display text-xs font-semibold text-brand-600 transition-colors hover:text-brand-800"
            >
              {pickerOpen ? 'Close list' : 'Add a course'}
            </button>
          )}
        </div>

        {picked.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {picked.map((item) => (
              <li key={item.id}>
                <span className="group inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1.5 pl-3 pr-1.5 text-[0.8125rem] font-medium text-brand-800">
                  <span className="truncate">{item.title}</span>
                  <button
                    type="button"
                    onClick={() => removeCourse(item.id)}
                    aria-label={`Remove ${item.title}`}
                    className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-brand-500 transition-colors hover:bg-brand-500 hover:text-white"
                  >
                    <X className="h-3 w-3" strokeWidth={2.6} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-ink-300 bg-ink-50 px-4 py-3 text-sm text-ink-500">
            No courses selected yet — add one below, or just tell us what you are looking for in the message.
          </p>
        )}

        {/* searchable picker */}
        {pickerOpen && courseOptions.length > 0 && (
          <div className="mt-3 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 border-b border-ink-200 px-3.5 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={2.2} />
              <input
                type="text"
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="Search courses by name or field…"
                aria-label="Search courses"
                className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
            <ul className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-3 text-sm text-ink-500">No matching courses.</li>
              ) : (
                filteredOptions.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => addCourse(option)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-brand-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink-900">{option.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-ink-500">
                          {[option.duration, option.level].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <Plus className="h-4 w-4 shrink-0 text-brand-500" strokeWidth={2.4} />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {/* ------------------------------ identity ------------------------------ */}
      <div className={cx('grid gap-4', !compact && 'sm:grid-cols-2')}>
        <div>
          <label htmlFor="eq-name" className="field-label">
            Full name <span className="text-rose-500">*</span>
          </label>
          <input
            id="eq-name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Priya Sharma"
            aria-invalid={Boolean(fieldError('name'))}
            aria-describedby={fieldError('name') ? 'eq-name-error' : undefined}
            className={cx('field', fieldError('name') && 'field-error')}
            {...register('name')}
          />
          {fieldError('name') && (
            <p id="eq-name-error" role="alert" className="mt-1.5 text-xs text-rose-600">
              {fieldError('name')}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="eq-phone" className="field-label">
            Phone <span className="text-rose-500">*</span>
          </label>
          <input
            id="eq-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            aria-invalid={Boolean(fieldError('phone'))}
            aria-describedby={fieldError('phone') ? 'eq-phone-error' : undefined}
            className={cx('field', fieldError('phone') && 'field-error')}
            {...register('phone')}
          />
          {fieldError('phone') && (
            <p id="eq-phone-error" role="alert" className="mt-1.5 text-xs text-rose-600">
              {fieldError('phone')}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="eq-email" className="field-label">
          Email <span className="text-rose-500">*</span>
        </label>
        <input
          id="eq-email"
          type="email"
          autoComplete="email"
          placeholder="your.name@email.com"
          aria-invalid={Boolean(fieldError('email'))}
          aria-describedby={fieldError('email') ? 'eq-email-error' : undefined}
          className={cx('field', fieldError('email') && 'field-error')}
          {...register('email')}
        />
        {fieldError('email') && (
          <p id="eq-email-error" role="alert" className="mt-1.5 text-xs text-rose-600">
            {fieldError('email')}
          </p>
        )}
      </div>

      {/* --------------------------- extra context ---------------------------- */}
      {!compact && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="eq-city" className="field-label">
              City {cityRequired && <span className="text-rose-500">*</span>}
            </label>
            <input
              id="eq-city"
              type="text"
              autoComplete="address-level2"
              placeholder="e.g. Pune"
              className={cx('field', fieldError('city') && 'field-error')}
              {...register('city')}
            />
          </div>
          <div>
            <label htmlFor="eq-qualification" className="field-label">
              Highest qualification
            </label>
            <input
              id="eq-qualification"
              type="text"
              placeholder="e.g. B.Com, B.Tech, MBA"
              className="field"
              {...register('qualification')}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="eq-mode" className="field-label">
            Preferred format
          </label>
          <div className="relative">
            <select id="eq-mode" className="field appearance-none pr-10" {...register('preferred_mode')}>
              {MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              strokeWidth={2.2}
            />
          </div>
        </div>
        <div>
          <label htmlFor="eq-time" className="field-label">
            Preferred timing
          </label>
          <div className="relative">
            <select id="eq-time" className="field appearance-none pr-10" {...register('preferred_time')}>
              <option value="">No preference</option>
              {TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              strokeWidth={2.2}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="eq-message" className="field-label">
          Anything you would like us to know?
        </label>
        <textarea
          id="eq-message"
          rows={compact ? 2 : 3}
          placeholder="Your background, what you want to achieve, or a question about the course…"
          className="field resize-y"
          {...register('message')}
        />
      </div>

      {/* honeypot — hidden from users, catches naive bots */}
      <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="eq-company">Company</label>
        <input id="eq-company" type="text" tabIndex={-1} autoComplete="off" {...register('company')} />
      </div>

      {/* ------------------------------- consent ------------------------------ */}
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer rounded border-ink-300 text-brand-600 accent-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500"
            aria-invalid={Boolean(fieldError('consent'))}
            {...register('consent')}
          />
          <span className="text-[0.8125rem] leading-relaxed text-ink-600">
            {settings.enquiry_consent_text ||
              'I agree to be contacted about my enquiry by phone, email or WhatsApp.'}
          </span>
        </label>
        {fieldError('consent') && (
          <p role="alert" className="mt-1.5 text-xs text-rose-600">
            {fieldError('consent')}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {serverError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg my-3 w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4.5 w-4.5" strokeWidth={2.2} />
            {picked.length > 1 ? `Enquire about ${picked.length} courses` : 'Send my enquiry'}
          </>
        )}
      </button>

      <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[0.75rem] text-ink-500">
        <li className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600" strokeWidth={2.2} />
          Your details stay private
        </li>
        <li className="flex items-center gap-1.5">
          <CircleDollarSign className="h-3.5 w-3.5 text-teal-600" strokeWidth={2.2} />
          No payment required
        </li>
        <li className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-teal-600" strokeWidth={2.2} />
          Reply within 24 working hours
        </li>
      </ul>
    </form>
  );
}
