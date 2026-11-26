'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { cx } from '@/lib/utils';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import SmartImage from '@/components/ui/SmartImage';

/**
 * Testimonial rail.
 *
 * A native scroll-snap track rather than a JS carousel: swipe works natively on
 * touch, the arrows just call scrollBy, and every card stays in the DOM and
 * reachable by keyboard and screen readers.
 */
export default function TestimonialsSection({ settings = {}, testimonials = [] }) {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  if (!testimonials.length) return null;

  function scrollByCard(direction) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('[data-card]');
    const amount = card ? card.offsetWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: 'smooth' });
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 8);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 8);
  }

  return (
    <section className="section overflow-hidden bg-ink-50">
      <div className="shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={settings.home_testimonials_eyebrow}
            title={settings.home_testimonials_title}
            highlight="changed"
            text={settings.home_testimonials_text}
            align="left"
            className="lg:max-w-2xl"
          />

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={atStart}
              aria-label="Previous testimonials"
              className="grid h-11 w-11 place-items-center rounded-full border border-ink-300 bg-white text-ink-700 transition-all hover:border-brand-400 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={atEnd}
              aria-label="Next testimonials"
              className="grid h-11 w-11 place-items-center rounded-full border border-ink-300 bg-white text-ink-700 transition-all hover:border-brand-400 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>

      {/* rail inside the page container so cards stay aligned with the rest of the section */}
      <Reveal delay={120}>
        <div className="shell">
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
            tabIndex={0}
            role="region"
            aria-label="Learner testimonials"
          >
            {testimonials.map((item) => (
              <figure
                key={item.id}
                data-card
                className="flex w-[clamp(18rem,80vw,24rem)] shrink-0 snap-start flex-col rounded-[var(--radius-card)] border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-0.5" aria-label={`${item.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cx(
                          'h-4 w-4',
                          i < item.rating ? 'fill-accent-400 text-accent-400' : 'fill-ink-200 text-ink-200'
                        )}
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <Quote className="h-7 w-7 shrink-0 text-brand-200" strokeWidth={1.8} aria-hidden="true" />
                </div>

                <blockquote className="mt-4 flex-1">
                  <p className="text-[0.9375rem] leading-relaxed text-ink-700">“{item.message}”</p>
                </blockquote>

                <figcaption className="mt-6 flex items-center gap-3 border-t border-ink-200 pt-5">
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-ink-100 ring-2 ring-white">
                    <SmartImage src={item.avatar} alt="" fill sizes="44px" fallbackIcon="Users" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-sm font-bold text-ink-950">{item.name}</span>
                    <span className="block truncate text-xs text-ink-500">
                      {[item.designation, item.organisation].filter(Boolean).join(' · ')}
                    </span>
                    {item.course_label && (
                      <span className="mt-1.5 inline-block max-w-full truncate rounded-full bg-brand-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-brand-700">
                        {item.course_label}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Reveal>

      {/* mobile controls */}
      <div className="shell mt-6 flex items-center justify-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          disabled={atStart}
          aria-label="Previous testimonials"
          className="grid h-11 w-11 place-items-center rounded-full border border-ink-300 bg-white text-ink-700 transition-all disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          disabled={atEnd}
          aria-label="Next testimonials"
          className="grid h-11 w-11 place-items-center rounded-full border border-ink-300 bg-white text-ink-700 transition-all disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
        </button>
      </div>
    </section>
  );
}
