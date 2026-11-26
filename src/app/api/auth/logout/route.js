import { handleError, ok } from '@/lib/api';
import { clearSessionCookie, getCurrentAdmin, logActivity } from '@/lib/auth';
import { getClientIp } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/auth/logout — clears the session cookie. */
export async function POST(request) {
  try {
    const admin = await getCurrentAdmin();
    if (admin) {
      await logActivity({
        admin,
        action: 'logout',
        entityType: 'admin_users',
        entityId: admin.id,
        description: `${admin.name} signed out`,
        ip: getClientIp(request.headers),
      });
    }
    await clearSessionCookie();
    return ok({ message: 'Signed out.' });
  } catch (error) {
    return handleError(error, 'auth/logout');
  }
}
