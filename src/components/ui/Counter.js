'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Counts up to `value` the first time it enters the viewport.
 * Uses requestAnimationFrame with an ease-out curve so the number decelerates
 * into place instead of ticking linearly.
 */
export default function Counter({ value = 0, duration = 1800, decimals = 0, className = '' }) {
  const target = Number(value) || 0;
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(target);
      return undefined;
    }

    let frame;
    const run = () => {
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutCubic
        const eased = 1 - (1 - progress) ** 3;
        setDisplay(target * eased);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : new Intl.NumberFormat('en-US').format(Math.round(display));

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}
