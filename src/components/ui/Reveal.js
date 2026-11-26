'use client';

import { useEffect, useRef, useState } from 'react';
import { cx } from '@/lib/utils';

/**
 * Reveals its children once they scroll into view.
 *
 * Uses IntersectionObserver rather than a scroll listener so it costs nothing
 * on the main thread, disconnects after firing, and respects
 * prefers-reduced-motion by rendering visible immediately.
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  direction = 'up',
  className = '',
  threshold = 0.15,
  once = true,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  const offsets = {
    up: 'translate3d(0, 2rem, 0)',
    down: 'translate3d(0, -2rem, 0)',
    left: 'translate3d(2rem, 0, 0)',
    right: 'translate3d(-2rem, 0, 0)',
    scale: 'scale(0.96)',
    none: 'none',
  };

  return (
    <Tag
      ref={ref}
      className={cx('transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]', className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : offsets[direction] || offsets.up,
        transitionDelay: `${delay}ms`,
        willChange: visible ? 'auto' : 'opacity, transform',
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
