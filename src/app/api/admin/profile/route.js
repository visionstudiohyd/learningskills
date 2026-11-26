import { handleError, invalid, ok, readJson } from '@/lib/api';
import {
  getCurrentAdmin, hashPassword, logActivity, requireAdmin, verifyPassword,
} from '@/lib/auth';
import { getClientIp } from '@/lib/utils';
import { passwordChangeSchema, safeParse } from '@/lib/validation';
import { execute, queryOne } from '@/lib/db';
import { nameSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/profile — the signed-in admin editing their own account.
 *
 * Available to every role, unlike /api/admin/users. Changing a password
 * requires the current one, so a left-open session cannot be used to lock the
 * real owner out of their account.
 */
export async function PATCH(request) {
  try {
    const admin = await requireAdmin();
    const body = await readJson(request);

    /* ----------------------------- password ------------------------------ */
    if (body._action === 'password') {
      const parsed = safeParse(passwordChangeSchema, body);
      if (!parsed.success) return invalid(parsed.errors);

      const row = await queryOne('SELECT password_hash FROM admin_users WHERE id = ? LIMIT 1', [admin.id]);
      const valid = await verifyPassword(parsed.data.current_password, row?.password_hash);
      if (!valid) {
        return invalid({ current_password: 'That is not your current password.' });
      }

      const hash = await hashPassword(parsed.data.new_password);
      await execute('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hash, admin.id]);

      await logActivity({
        admin,
        action: 'update',
        entityType: 'admin_users',
        entityId: admin.id,
        description: `${admin.name} changed their own password`,
        ip: getClientIp(request.headers),
      });

      return ok({ message: 'Password changed.' });
    }

    /* ------------------------------ details ------------------------------ */
    const nameResult = nameSchema.safeParse(body.name);
    if (!nameResult.success) {
      return invalid({ name: nameResult.error.issues[0]?.message || 'Enter a valid name.' });
    }

    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 40) || null : null;
    const avatar = typeof body.avatar === 'string' ? body.avatar.trim().slice(0, 500) || null : null;

    await execute('UPDATE admin_users SET name = ?, phone = ?, avatar = ? WHERE id = ?', [
      nameResult.data,
      phone,
      avatar,
      admin.id,
    ]);

    return ok({ message: 'Profile updated.' });
  } catch (error) {
    return handleError(error, 'profile');
  }
}

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return handleError(Object.assign(new Error('Authentication required'), { status: 401 }));
    }
    return ok({ admin });
  } catch (error) {
    return handleError(error, 'profile/get');
  }
}
