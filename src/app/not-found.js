import Link from 'next/link';
import { ArrowLeft, Compass, Mail, Search } from 'lucide-react';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

/**
 * Root 404.
 *
 * Standalone rather than inside the (site) group so it renders even when a bad
 * URL falls outside the public route group — and offers routes onward rather
 * than being a dead end.
 */
export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink-950 px-5 py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(45rem 24rem at 50% 0%, rgb(56 36 24 / 0.45), transparent 65%), radial-gradient(35rem 18rem at 85% 100%, rgb(142 197 255 / 0.16), transparent 65%)',
        }}
        aria-hidden="true"
      />
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative w-full max-w-xl text-center">
        <p
          className="font-display text-[7rem] font-extrabold leading-none tracking-tighter text-white/10 md:text-[9rem]"
          aria-hidden="true"
        >
          404
        </p>

        <span className="mx-auto -mt-10 grid h-16 w-16 place-items-center rounded-2xl bg-brand-700 text-white shadow-[var(--shadow-brand)]">
          <Compass className="h-8 w-8" strokeWidth={1.9} />
        </span>

        <h1 className="mt-7 text-display-md text-white">This page is not here</h1>
        <p className="mx-auto mt-4 max-w-md text-[1.0625rem] leading-relaxed text-white/65">
          The link may be out of date, or the page may have been renamed. Nothing is lost — here is the way back.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-accent btn-lg">
            <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.4} />
            Back to home
          </Link>
          <Link href="/courses" className="btn btn-ghost-light btn-lg">
            <Search className="h-4.5 w-4.5" strokeWidth={2.4} />
            Browse courses
          </Link>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-sm text-white/50">
          Looking for something specific?{' '}
          <Link href="/contact" className="inline-flex items-center gap-1.5 font-semibold text-accent-300 hover:underline">
            <Mail className="h-3.5 w-3.5" strokeWidth={2.3} />
            Ask us and we will point you to it
          </Link>
        </p>
      </div>
    </div>
  );
}
