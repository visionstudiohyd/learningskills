'use client';

import { ShortlistProvider } from '@/components/shortlist/ShortlistProvider';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * Client-side context for the public site.
 *
 * Kept as a thin wrapper so the pages it contains can stay Server Components —
 * only the providers themselves ship to the browser, not the page content.
 */
export default function SiteProviders({ children, maxShortlist = 8 }) {
  return (
    <ToastProvider>
      <ShortlistProvider maxItems={maxShortlist}>{children}</ShortlistProvider>
    </ToastProvider>
  );
}
