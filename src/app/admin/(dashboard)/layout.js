import { redirect } from 'next/navigation';
import { can, getCurrentAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { queryOne } from '@/lib/db';
import { plain } from '@/lib/utils';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

/**
 * Authenticated dashboard layout.
 *
 * The middleware already rejected unauthenticated requests, but this re-checks
 * the session against the database: it is the layer that notices an account
 * that has been deactivated or deleted since its token was issued.
 */
export default async function DashboardLayout({ children }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const [settings, counts] = await Promise.all([
    getSettings(),
    queryOne(`
      SELECT
        (SELECT COUNT(*) FROM enquiries WHERE is_read = 0)          AS enquiries,
        (SELECT COUNT(*) FROM contact_messages WHERE status = 'new') AS messages
    `).catch(() => ({ enquiries: 0, messages: 0 })),
  ]);

  return (
    <AdminShell
      admin={plain(admin)}
      siteName={settings.site_name}
      counts={{ enquiries: Number(counts?.enquiries || 0), messages: Number(counts?.messages || 0) }}
      can={{
        content: can(admin.role, 'content'),
        enquiries: can(admin.role, 'enquiries'),
        settings: can(admin.role, 'settings'),
        users: can(admin.role, 'users'),
      }}
    >
      {children}
    </AdminShell>
  );
}
