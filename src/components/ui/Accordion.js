'use client';

import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '@/lib/utils';

/**
 * Accessible accordion used for FAQs and the course syllabus.
 * Buttons carry aria-expanded / aria-controls, panels animate on grid-rows so
 * the height transition works without measuring in JavaScript.
 *
 * Each item may supply its panel content three ways, checked in this order:
 *   item.body     — any ReactNode, for rich panels (e.g. a syllabus module)
 *   item.answer   — plain text, used by the FAQ lists
 *   item.description
 *
 * Deliberately a data prop rather than a render callback: this is a Client
 * Component, and a function prop cannot cross the server/client boundary — but
 * pre-rendered JSX can, so Server Components can still build rich panels.
 */
export default function Accordion({
  items = [],
  allowMultiple = false,
  defaultOpen = [],
  variant = 'card',
  className = '',
}) {
  const baseId = useId();
  const [open, setOpen] = useState(() => new Set(defaultOpen));

  const toggle = (index) => {
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (!items.length) return null;

  const isNumbered = variant === 'numbered';

  return (
    <div className={cx('flex flex-col gap-3', className)}>
      {items.map((item, index) => {
        const isOpen = open.has(index);
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div
            key={item.id ?? index}
            className={cx(
              'overflow-hidden rounded-2xl border bg-white transition-all duration-300',
              isOpen ? 'border-brand-200 shadow-[var(--shadow-card)]' : 'border-ink-200 hover:border-ink-300'
            )}
          >
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left md:px-6 md:py-5"
              >
                {isNumbered && (
                  <span
                    className={cx(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold transition-colors',
                      isOpen ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-600'
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                )}

                <span className="flex-1">
                  <span
                    className={cx(
                      'block font-display text-base font-semibold transition-colors md:text-[1.0625rem]',
                      isOpen ? 'text-brand-700' : 'text-ink-950'
                    )}
                  >
                    {item.question || item.title}
                  </span>
                  {item.meta && <span className="mt-1 block text-xs text-ink-500">{item.meta}</span>}
                </span>

                <span
                  className={cx(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                    isOpen ? 'rotate-180 bg-brand-500 text-white' : 'bg-ink-100 text-ink-600'
                  )}
                >
                  <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div
                  className={cx(
                    'px-5 pb-5 text-[0.9375rem] leading-relaxed text-ink-600 md:px-6 md:pb-6',
                    isNumbered && 'md:pl-[4.5rem]'
                  )}
                >
                  {item.body ?? item.answer ?? item.description}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
