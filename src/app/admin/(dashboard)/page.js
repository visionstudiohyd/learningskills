import Link from 'next/link';
import { AlertTriangle, ArrowRight, Clock, Mail, Phone, Plus } from 'lucide-react';
import {
  getDashboardStats, getDueFollowUps, getEnquiriesByLevel, getEnquiryStatusBreakdown,
  getEnquiryTrend, getPreferredModeSplit, getRecentActivity, getRecentEnquiries, getTopCoursesByEnquiry,
} from '@/lib/queries/analytics';
import { ENQUIRY_STATUSES } from '@/lib/queries/leads';
import { checkConnection } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { formatDate, sanitisePhone, timeAgo } from '@/lib/utils';
import StatTile from '@/components/admin/StatTile';
import EnquiryTrendChart from '@/components/admin/charts/EnquiryTrendChart';
import BarList from '@/components/admin/charts/BarList';
import StatusBadge from '@/components/admin/StatusBadge';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

const TREND_DAYS = 30;

export default async function AdminDashboard() {
  const [admin, db, stats, trend, statusRows, topCourses, byLevel, modeSplit, recent, followUps, activity] =
    await Promise.all([
      getCurrentAdmin(),
      checkConnection(),
      getDashboardStats(),
      getEnquiryTrend(TREND_DAYS),
      getEnquiryStatusBreakdown(),
      getTopCoursesByEnquiry(8),
      getEnquiriesByLevel(),
      getPreferredModeSplit(),
      getRecentEnquiries(6),
      getDueFollowUps(5),
      getRecentActivity(8),
    ]);

  const statusMap = new Map(statusRows.map((r) => [r.status, r.total]));
  const pipelineRows = ENQUIRY_STATUSES.map((s) => ({
    key: s.value,
    label: s.label,
    value: statusMap.get(s.value) || 0,
    tone: s.tone,
    href: `/admin/enquiries?status=${s.value}`,
  }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (admin?.name || '').split(' ')[0];

  return (
    <div className="space-y-6">
      {/* ------------------------------ greeting ------------------------------ */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-950 md:text-2xl">
            {greeting}
            {firstName ? `, ${firstName}` : ''}
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            {stats.enquiries_unread > 0
              ? `${stats.enquiries_unread} unread ${stats.enquiries_unread === 1 ? 'enquiry' : 'enquiries'} waiting for a response.`
              : 'Every enquiry has been read. Nice work.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/courses/new" className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" strokeWidth={2.6} />
            New course
          </Link>
          <Link href="/admin/enquiries" className="btn btn-outline btn-sm">
            Open inbox
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
          </Link>
        </div>
      </header>

      {/* connection warning — only when something is actually wrong */}
      {!db.ok && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" strokeWidth={2.2} />
          <div>
            <p className="font-display text-sm font-bold text-amber-900">Database connection problem</p>
            <p className="mt-1 text-sm text-amber-800">
              {db.code === 'ECONNREFUSED'
                ? `Nothing is listening on ${db.host}:${db.port}. Start MySQL in the XAMPP Control Panel.`
                : db.message}
            </p>
          </div>
        </div>
      )}

      {/* -------------------------------- KPIs ------------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Enquiries this month"
          value={stats.enquiries_month || 0}
          icon="Inbox"
          tone="brand"
          delta={stats.enquiry_growth}
          deltaLabel="vs previous 30 days"
          href="/admin/enquiries"
        />
        <StatTile
          label="Unread enquiries"
          value={stats.enquiries_unread || 0}
          icon="Bell"
          tone={stats.enquiries_unread > 0 ? 'accent' : 'teal'}
          hint={stats.enquiries_today ? `${stats.enquiries_today} arrived today` : 'Nothing new today'}
          href="/admin/enquiries?unread=1"
        />
        <StatTile
          label="Converted to enrolment"
          value={stats.enquiries_converted || 0}
          icon="BadgeCheck"
          tone="teal"
          hint={`${stats.conversion_rate}% of all enquiries`}
          href="/admin/enquiries?status=converted"
        />
        <StatTile
          label="Active courses"
          value={stats.courses_active || 0}
          icon="BookOpen"
          tone="ink"
          hint={`${stats.courses_total || 0} total, including unpublished`}
          href="/admin/courses"
        />
      </div>

      {/* ------------------------- trend + pipeline -------------------------- */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <EnquiryTrendChart data={trend} days={TREND_DAYS} />

        <BarList
          title="Enquiry pipeline"
          description={`How all ${stats.enquiries_total || 0} enquiries are currently classified`}
          rows={pipelineRows}
          emptyMessage="No enquiries have been received yet."
          footer={
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center gap-1.5 font-display text-xs font-semibold text-brand-600 transition-colors hover:text-brand-800"
            >
              Manage the pipeline
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            </Link>
          }
        />
      </div>

      {/* ------------------------ demand breakdowns -------------------------- */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <BarList
          title="Most enquired courses"
          description="Where demand is concentrated"
          rows={topCourses.slice(0, 8).map((c) => ({
            key: c.id,
            label: c.title,
            value: c.enquiries,
            secondary: c.views ? `${c.views} views` : null,
            href: `/admin/courses/${c.id}`,
          }))}
          emptyMessage="No course enquiries yet."
        />

        <BarList
          title="Demand by course level"
          description="Which audience is enquiring — beginners through to advanced"
          rows={byLevel.slice(0, 8).map((l) => ({ key: l.level, label: l.level, value: l.total }))}
          emptyMessage="No level data yet."
        />

        <BarList
          title="Preferred delivery format"
          description="Useful for planning the next batches"
          rows={modeSplit.map((m) => ({ key: m.mode, label: m.mode, value: m.total }))}
          emptyMessage="No format preferences recorded yet."
          footer={
            <p className="text-xs leading-relaxed text-ink-500">
              Stated at enquiry time — learners can switch format later at no cost.
            </p>
          }
        />
      </div>

      {/* --------------------- follow-ups + recent inbox --------------------- */}
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        {/* recent enquiries */}
        <section className="rounded-2xl border border-ink-200 bg-white">
          <header className="flex items-center justify-between gap-4 border-b border-ink-200 px-5 py-4">
            <div>
              <h2 className="font-display text-base font-bold text-ink-950">Latest enquiries</h2>
              <p className="mt-0.5 text-[0.8125rem] text-ink-500">Newest first</p>
            </div>
            <Link
              href="/admin/enquiries"
              className="shrink-0 font-display text-xs font-semibold text-brand-600 transition-colors hover:text-brand-800"
            >
              View all →
            </Link>
          </header>

          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-400">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-ink-200">
              {recent.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/admin/enquiries/${item.id}`}
                    className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-ink-50"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        Number(item.is_read) === 0 ? 'bg-accent-400' : 'bg-ink-200'
                      }`}
                      aria-label={Number(item.is_read) === 0 ? 'Unread' : 'Read'}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-display text-sm font-bold text-ink-950">{item.name}</p>
                        <StatusBadge status={item.status} />
                      </div>
                      {item.courses && (
                        <p className="mt-1 truncate text-[0.8125rem] text-ink-600" title={item.courses}>
                          {item.courses}
                        </p>
                      )}
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" strokeWidth={2.2} />
                          {item.email}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" strokeWidth={2.2} />
                          {timeAgo(item.created_at)}
                        </span>
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-4">
          {/* follow-ups due */}
          <section className="rounded-2xl border border-ink-200 bg-white">
            <header className="border-b border-ink-200 px-5 py-4">
              <h2 className="font-display text-base font-bold text-ink-950">Follow-ups due</h2>
              <p className="mt-0.5 text-[0.8125rem] text-ink-500">Scheduled for today or overdue</p>
            </header>

            {followUps.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-400">Nothing due. Clear desk.</p>
            ) : (
              <ul className="divide-y divide-ink-200">
                {followUps.map((item) => {
                  const overdue = new Date(item.follow_up_at) < new Date();
                  return (
                    <li key={item.id} className="px-5 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/admin/enquiries/${item.id}`}
                          className="min-w-0 flex-1 font-display text-sm font-bold text-ink-950 transition-colors hover:text-brand-700"
                        >
                          <span className="block truncate">{item.name}</span>
                        </Link>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase ${
                            overdue ? 'bg-rose-50 text-rose-700' : 'bg-accent-50 text-accent-800'
                          }`}
                        >
                          {overdue ? 'Overdue' : 'Today'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink-500">Due {formatDate(item.follow_up_at, true)}</p>
                      {item.phone && (
                        <a
                          href={`tel:${sanitisePhone(item.phone)}`}
                          className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800"
                        >
                          <Phone className="h-3 w-3" strokeWidth={2.4} />
                          {item.phone}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* activity */}
          <section className="rounded-2xl border border-ink-200 bg-white">
            <header className="border-b border-ink-200 px-5 py-4">
              <h2 className="font-display text-base font-bold text-ink-950">Recent activity</h2>
            </header>
            {activity.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-400">No activity recorded yet.</p>
            ) : (
              <ul className="divide-y divide-ink-200">
                {activity.map((item) => (
                  <li key={item.id} className="px-5 py-3">
                    <p className="text-[0.8125rem] leading-snug text-ink-800">
                      {item.description || `${item.action} ${item.entity_type || ''}`}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {item.actor_name || 'System'} · {timeAgo(item.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* --------------------------- secondary KPIs -------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Contact messages"
          value={stats.messages_total || 0}
          icon="Mail"
          tone="brand"
          hint={stats.messages_new ? `${stats.messages_new} unanswered` : 'All answered'}
          href="/admin/messages"
        />
        <StatTile
          label="Newsletter subscribers"
          value={stats.subscribers_total || 0}
          icon="Newspaper"
          tone="teal"
          href="/admin/subscribers"
        />
        <StatTile
          label="Course page views"
          value={stats.course_views || 0}
          icon="Eye"
          tone="ink"
          hint="Since launch"
        />
        <StatTile
          label="Published pages"
          value={stats.pages_active || 0}
          icon="FileText"
          tone="ink"
          hint={`${stats.testimonials_active || 0} active testimonials`}
          href="/admin/pages"
        />
      </div>
    </div>
  );
}
