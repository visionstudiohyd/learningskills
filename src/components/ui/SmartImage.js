'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cx } from '@/lib/utils';
import Icon from './Icon';

/**
 * Image wrapper with a graceful failure mode.
 *
 * Every image on this site is admin-editable, which means a URL can be wrong,
 * removed or rate-limited at any point. Rather than showing a broken image, we
 * fall back to a branded gradient tile with an icon — the layout keeps its
 * shape and the page still looks intentional.
 */
export default function SmartImage({
  src,
  alt = '',
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  quality = 82,
  className = '',
  wrapperClassName = '',
  fallbackIcon = 'ImageIcon',
  unoptimized = false,
  objectPosition,
  ...rest
}) {
  const [failed, setFailed] = useState(false);
  const hasSrc = typeof src === 'string' && src.trim().length > 0;

  if (!hasSrc || failed) {
    return (
      <span
        className={cx(
          'flex items-center justify-center bg-linear-to-br from-brand-100 via-ink-100 to-teal-100',
          fill ? 'absolute inset-0' : 'relative',
          wrapperClassName,
          className
        )}
        style={fill ? undefined : { width: width || '100%', height: height || '100%' }}
        aria-hidden={alt ? undefined : 'true'}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
      >
        <Icon name={fallbackIcon} className="h-8 w-8 text-brand-400/70" strokeWidth={1.5} />
      </span>
    );
  }

  const common = {
    src,
    alt,
    quality,
    priority,
    unoptimized,
    onError: () => setFailed(true),
    className: cx('object-cover', className),
    style: objectPosition ? { objectPosition } : undefined,
    ...rest,
  };

  if (fill) {
    return <Image {...common} fill sizes={sizes || '100vw'} />;
  }

  return <Image {...common} width={width || 800} height={height || 600} sizes={sizes} />;
}
