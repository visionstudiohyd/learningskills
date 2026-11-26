'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';
import { cx } from '@/lib/utils';
import SmartImage from '@/components/ui/SmartImage';

const INTERVAL = 7000;

/**
 * Full-screen homepage hero.
 *
 * Crossfades between admin-managed slides with a slow ken-burns zoom on the
 * active image. Autoplay pauses on hover, on focus within, when the tab is
 * hidden, and entirely under prefers-reduced-motion. Keyboard arrows and touch
 * swipe both work, and the slide region is announced as a labelled carousel.
 */
export default function HeroSlider({ slides = [] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchStart = useRef(null);
  const total = slides.length;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const goTo = useCallback((next) => {
    if (total === 0) return;
    setIndex(((next % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay
  useEffect(() => {
    if (total <= 1 || paused || reduced) return undefined;
    const timer = setTimeout(next, INTERVAL);
    return () => clearTimeout(timer);
  }, [index, paused, reduced, total, next]);

  // Pause when the tab is in the background — avoids burning cycles unseen.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  if (total === 0) {
    return (
      <section
        className="relative flex h-screen items-center justify-center bg-ink-950 text-white"
        style={{ marginTop: 'calc(var(--header-height) * -1)', paddingTop: 'var(--header-height)' }}
      >
        <div className="shell py-24 text-center">
          <h1 className="text-display-lg">Welcome</h1>
          <p className="mt-4 text-white/70">
            Add your first homepage slide from the admin dashboard to replace this placeholder.
          </p>
          <Link href="/courses" className="btn btn-accent btn-lg mt-8">
            Explore Courses
          </Link>
        </div>
      </section>
    );
  }

  const active = slides[index];

  return (
    <section
      className="relative isolate flex h-screen flex-col justify-center overflow-hidden bg-ink-950"
      style={{ marginTop: 'calc(var(--header-height) * -1)', paddingTop: 'var(--header-height)' }}
      aria-roledescription="carousel"
      aria-label="Featured programmes"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          next();
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prev();
        }
      }}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(delta) > 60) {
          if (delta < 0) next();
          else prev();
        }
        touchStart.current = null;
      }}
    >
      {/* ------------------------------- images ------------------------------- */}
      {slides.map((slide, i) => {
        const isActive = i === index;
        return (
          <div
            key={slide.id}
            className={cx(
              'absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]',
              isActive ? 'opacity-100' : 'opacity-0'
            )}
            aria-hidden={!isActive}
          >
            <div className={cx('absolute inset-0', isActive && !reduced && 'animate-zoom-slow')}>
              <SmartImage
                src={slide.image}
                alt=""
                fill
                priority={i === 0}
                quality={86}
                sizes="100vw"
                className="object-cover"
              />
            </div>
            {/* Readability scrim: stronger on the text side, lighter on the image side. */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(100deg, rgb(14 18 34 / ${(slide.overlay_opacity ?? 65) / 100}) 0%, rgb(14 18 34 / ${
                  ((slide.overlay_opacity ?? 65) / 100) * 0.82
                }) 45%, rgb(20 22 58 / 0.35) 100%)`,
              }}
              aria-hidden="true"
            />
          </div>
        );
      })}


      {/* ------------------------------ content ------------------------------- */}
      <div className="shell relative z-10 py-12 md:py-16">
        <div
          className={cx(
            'max-w-3xl',
            active.text_align === 'center' && 'mx-auto text-center',
            active.text_align === 'right' && 'ml-auto text-right'
          )}
        >
          {slides.map((slide, i) => {
            if (i !== index) return null;
            return (
              <div key={slide.id} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${total}`}>
                {slide.eyebrow && (
                  <p
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-display text-[0.75rem] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm"
                    style={{ animation: 'fade-up 0.7s var(--ease-out-soft) both' }}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-accent-400" strokeWidth={2.6} />
                    {slide.eyebrow}
                  </p>
                )}

                <h1
                  className="mt-4 text-display-xl text-white md:text-display-2xl"
                  style={{ animation: 'fade-up 0.8s var(--ease-out-soft) 0.1s both' }}
                >
                  {slide.highlight && slide.title.includes(slide.highlight) ? (
                    <>
                      {slide.title.slice(0, slide.title.indexOf(slide.highlight))}
                      <span className="relative whitespace-nowrap text-accent-300">
                        {slide.highlight}
                        <svg
                          className="absolute -bottom-1 left-0 h-[0.4em] w-full text-accent-400/70"
                          viewBox="0 0 100 10"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                        >
                          <path d="M0,8 Q25,2 50,5 T100,4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </span>
                      {slide.title.slice(slide.title.indexOf(slide.highlight) + slide.highlight.length)}
                    </>
                  ) : (
                    slide.title
                  )}
                </h1>

                {slide.description && (
                  <p
                    className={cx(
                      'mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg',
                      active.text_align === 'center' && 'mx-auto',
                      active.text_align === 'right' && 'ml-auto'
                    )}
                    style={{ animation: 'fade-up 0.8s var(--ease-out-soft) 0.2s both' }}
                  >
                    {slide.description}
                  </p>
                )}

                <div
                  className={cx(
                    'mt-7 flex flex-wrap items-center gap-3',
                    active.text_align === 'center' && 'justify-center',
                    active.text_align === 'right' && 'justify-end'
                  )}
                  style={{ animation: 'fade-up 0.8s var(--ease-out-soft) 0.3s both' }}
                >
                  {slide.primary_btn_text && (
                    <Link href={slide.primary_btn_link || '/courses'} className="btn btn-accent btn-lg">
                      {slide.primary_btn_text}
                      <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.4} />
                    </Link>
                  )}
                  {slide.secondary_btn_text && (
                    <Link href={slide.secondary_btn_link || '/contact'} className="btn btn-ghost-light btn-lg">
                      {slide.secondary_btn_text}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ------------------------------ controls ------------------------------ */}
      {total > 1 && (
        <div className="shell relative z-10 flex items-center justify-between gap-4 pb-6 md:pb-8">
          {/* dots / progress */}
          <div className="flex items-center gap-2.5" role="tablist" aria-label="Choose slide">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}: ${slide.title}`}
                onClick={() => goTo(i)}
                className="group relative h-1.5 overflow-hidden rounded-full bg-white/25 transition-all duration-300"
                style={{ width: i === index ? '3rem' : '1.25rem' }}
              >
                {i === index && (
                  <span
                    key={`${index}-${paused}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-accent-400"
                    style={{
                      animation: paused || reduced ? 'none' : `hero-progress ${INTERVAL}ms linear forwards`,
                      width: paused || reduced ? '100%' : undefined,
                    }}
                  />
                )}
                <span className="absolute inset-0 rounded-full transition-colors group-hover:bg-white/40" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white hover:text-ink-950"
            >
              {paused ? <Play className="h-4 w-4" strokeWidth={2.4} /> : <Pause className="h-4 w-4" strokeWidth={2.4} />}
            </button>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white hover:text-ink-950"
            >
              <ChevronLeft className="h-4.5 w-4.5" strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white hover:text-ink-950"
            >
              <ChevronRight className="h-4.5 w-4.5" strokeWidth={2.4} />
            </button>
          </div>
        </div>
      )}

      {/* live region so screen readers hear slide changes without a visual jump */}
      <p className="sr-only" aria-live="polite">
        Slide {index + 1} of {total}: {active.title}
      </p>
    </section>
  );
}
