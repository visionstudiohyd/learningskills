import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, BookOpen, Calendar, ExternalLink, GraduationCap, Globe, Mail, MapPin, MessageSquare,
  Monitor, Phone, Clock,
} from 'lucide-react';
import { getEnquiryById, markEnquiryRead } from '@/lib/queries/leads';
import { getSettings } from '@/lib/settings';
import { query } from '@/lib/db';
import { formatDate, plain, sanitisePhone, timeAgo, whatsappLink } from '@/lib/utils';
import { WhatsAppIcon } from '@/components/ui/Icon';
import StatusBadge from '@/components/admin/StatusBadge';
import EnquiryWorkspace from '@/components/admin/EnquiryWorkspace';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Enquiry' };

export default async function EnquiryDetailPage({ params }) {
  const { id } = await params;
  const enquiry = await getEnquiryById(id);
  if (!enquiry) notFound();

  // Opening an enquiry is what "read" means — clear the unread flag here so the
  // sidebar badge and the dashboard counter stay honest.
  if (Number(enquiry.is_read) === 0) {
    await markEnquiryRead(enquiry.id);
  }

  const [settings, admins] = await Promise.all([
    getSettings(),
    query('SELECT id, name FROM admin_users WHERE is_active = 1 ORDER BY name').catch(() => []),
  ]);

  const courseList = enquiry.courses.map((c) => c.course_title).join(', ');
  const waMessage = `Hello ${enquiry.name.split(' ')[0]}, thank you for your enquiry about ${
    courseList || 'our courses'
  } at ${settings.site_name}.`;
  const waLink = whatsappLink(enquiry.phone, waMessage);

  const facts = [
    { icon: MapPin, label: 'City', value: enquiry.city },
    { icon: GraduationCap, label: 'Qualification', value: enquiry.qualification },
    { icon: Monitor, label: 'Preferred format', value: enquiry.preferred_mode },
    { icon: Clock, label: 'Preferred timing', value: enquiry.preferred_time },
    { icon: Globe, label: 'Submitted from', value: enquiry.source_page },
    { icon: Calendar, label: 'Received', value: `${formatDate(enquiry.created_at, true)} (${timeAgo(enquiry.created_at)})` },
  ].filter((f) => f.value);

  return (
    <div className="space-y-5">
      {/* ------------------------------ header ------------------------------ */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            href="/admin/enquiries"
            className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-900"
            aria-label="Back to enquiries"
          >
            <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.2} />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-xl font-bold text-ink-950">{enquiry.name}</h2>
              <StatusBadge status={enquiry.status} size="md" />
              <StatusBadge status={enquiry.priority} size="md" />
            </div>
            <p className="mt-1 font-mono text-xs text-ink-500">{enquiry.reference}</p>
          </div>
        </div>

        {/* contact actions — the first thing staff reach for */}
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${sanitisePhone(enquiry.phone)}`} className="btn btn-primary btn-sm">
            <Phone className="h-3.5 w-3.5" strokeWidth={2.4} />
            Call
          </a>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm bg-[#25D366] text-white hover:brightness-95">
              <WhatsAppIcon size={15} />
              WhatsApp
            </a>
          )}
          <a
            href={`mailto:${enquiry.email}?subject=${encodeURIComponent(
              `Your enquiry about ${courseList || 'our courses'} (${enquiry.reference})`
            )}`}
            className="btn btn-outline btn-sm"
          >
            <Mail className="h-3.5 w-3.5" strokeWidth={2.4} />
            Email
          </a>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        {/* ------------------------------ left ----------------------------- */}
        <div className="space-y-5">
          {/* contact card */}
          <section className="rounded-2xl border border-ink-200 bg-white p-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink-400">Contact details</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
                  <Mail className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Email
                </dt>
                <dd className="mt-1">
                  <a href={`mailto:${enquiry.email}`} className="break-all font-display text-sm font-semibold text-brand-700 hover:underline">
                    {enquiry.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
                  <Phone className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Phone
                </dt>
                <dd className="mt-1">
                  <a href={`tel:${sanitisePhone(enquiry.phone)}`} className="font-display text-sm font-semibold text-brand-700 hover:underline">
                    {enquiry.phone}
                  </a>
                </dd>
              </div>

              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
                    <fact.icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                    {fact.label}
                  </dt>
                  <dd className="mt-1 break-words text-sm text-ink-900">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* courses enquired about */}
          <section className="rounded-2xl border border-ink-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink-400">
                Courses enquired about
              </h3>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                {enquiry.courses.length}
              </span>
            </div>

            {enquiry.courses.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-ink-300 bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
                No specific course was selected — check the message below for what they are looking for.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {enquiry.courses.map((course) => (
                  <li
                    key={`${course.course_id}-${course.course_title}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-ink-50/70 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-bold text-ink-950">{course.course_title}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {[course.duration, course.level].filter(Boolean).join(' · ') ||
                          (course.course_id ? '' : 'This course has since been removed')}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {course.course_id && (
                        <Link
                          href={`/admin/courses/${course.course_id}`}
                          aria-label={`Edit ${course.course_title}`}
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-700"
                        >
                          <BookOpen className="h-4 w-4" strokeWidth={2.1} />
                        </Link>
                      )}
                      {course.slug && (
                        <a
                          href={`/courses/${course.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${course.course_title} on the site`}
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-800"
                        >
                          <ExternalLink className="h-4 w-4" strokeWidth={2.1} />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* their message */}
          {enquiry.message && (
            <section className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.1em] text-ink-400">
                <MessageSquare className="h-4 w-4" strokeWidth={2.2} />
                What they wrote
              </h3>
              <blockquote className="mt-4 whitespace-pre-wrap rounded-xl border-l-[3px] border-brand-400 bg-brand-50/50 p-4 text-[0.9375rem] leading-relaxed text-ink-800">
                {enquiry.message}
              </blockquote>
            </section>
          )}

          {/* technical trail */}
          <section className="rounded-2xl border border-ink-200 bg-white p-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink-400">Submission trail</h3>
            <dl className="mt-4 divide-y divide-ink-200 text-sm">
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-ink-500">IP address</dt>
                <dd className="font-mono text-xs text-ink-700">{enquiry.ip_address || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt className="shrink-0 text-ink-500">Browser</dt>
                <dd className="max-w-[60%] break-words text-right text-xs text-ink-600">{enquiry.user_agent || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-ink-500">Last updated</dt>
                <dd className="text-xs text-ink-700">{formatDate(enquiry.updated_at, true)}</dd>
              </div>
            </dl>
          </section>
        </div>

        {/* ------------------------------ right ---------------------------- */}
        <div className="lg:sticky lg:top-24">
          <EnquiryWorkspace enquiry={plain(enquiry)} admins={plain(admins)} />
        </div>
      </div>
    </div>
  );
}
