import Link from 'next/link';
import { ArrowLeft, GraduationCap, ShieldCheck } from 'lucide-react';
import { getSettings } from '@/lib/settings';
import { checkConnection } from '@/lib/db';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const [settings, dbStatus] = await Promise.all([getSettings(), checkConnection()]);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink-950 px-5 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(45rem 24rem at 50% -5%, rgb(7 7 88 / 0.4), transparent 65%), radial-gradient(32rem 18rem at 85% 100%, rgb(15 185 168 / 0.18), transparent 65%)',
        }}
        aria-hidden="true"
      />
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.3} />
          Back to website
        </Link>

        <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.06] p-7 backdrop-blur-xl md:p-9">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-linear-to-br from-brand-400 to-brand-600 text-white shadow-[var(--shadow-brand)]">
              <GraduationCap className="h-6 w-6" strokeWidth={2.1} />
            </span>
            <div>
              <p className="font-display text-[1.0625rem] font-extrabold leading-tight text-white">
                {settings.site_name}
              </p>
              <p className="text-xs text-white/50">Administration dashboard</p>
            </div>
          </div>

          <h1 className="mt-8 font-display text-2xl font-bold text-white">Sign in</h1>
          <p className="mt-2 text-sm text-white/60">
            Enter the credentials for your administrator account to manage the website.
          </p>

          <LoginForm nextPath={typeof sp.next === 'string' ? sp.next : '/admin'} />

          {/* Connection state — the single most common cause of a failed first
              login is MySQL not running, so say so plainly rather than letting
              the attempt fail with a generic error. */}
          <div className="mt-7 border-t border-white/10 pt-5">
            {dbStatus.ok ? (
              <p className="flex items-center gap-2 text-xs text-white/45">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-400" strokeWidth={2.3} />
                Database connected · {dbStatus.database} on {dbStatus.host}:{dbStatus.port}
              </p>
            ) : (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5">
                <p className="font-display text-xs font-bold text-amber-200">Database unreachable</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-100/80">
                  {dbStatus.code === 'ECONNREFUSED'
                    ? `Nothing is listening on ${dbStatus.host}:${dbStatus.port}. Start MySQL in the XAMPP Control Panel, then reload this page.`
                    : dbStatus.code === 'ER_BAD_DB_ERROR'
                      ? `The database "${dbStatus.database}" does not exist yet. Run: npm run db:setup`
                      : dbStatus.message}
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/35">
          Authorised access only. Sign-in attempts are rate limited and logged.
        </p>
      </div>
    </div>
  );
}
