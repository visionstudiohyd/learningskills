import { ToastProvider } from '@/components/ui/Toast';

export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Admin root. Intentionally minimal — the authenticated shell (sidebar, topbar,
 * auth guard) lives in the (dashboard) route group so the login screen can sit
 * outside it and render full-bleed.
 */
export default function AdminRootLayout({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}
