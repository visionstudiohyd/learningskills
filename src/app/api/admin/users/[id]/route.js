import { handleError, invalid, ok, readJson } from '@/lib/api';
import { hashPassword, logActivity, requireAdmin } from '@/lib/auth';
import { getClientIp, toTinyInt } from '@/lib/utils';
import { adminUserSchema, safeParse } from '@/lib/validation';
import { execute, queryOne, queryValue } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PATCH / DELETE an admin account.
 *
 * Two safety rules are enforced here rather than in the UI, because the UI is
 * not the security boundary:
 *   • you cannot delete or deactivate your own account — that is how an
 *     organisation locks itself out of its own dashboard;
 *   • the last active super_admin cannot be removed or demoted, for the
 *     same reason.
 */
async function assertNotLastSuperAdmin(userId, { changingRole = null, deactivating = false, deleting = false } = {}) {
  const user = await queryOne('SELECT id, role, is_active FROM admin_users WHERE id = ? LIMIT 1', [Number(userId)]);
  if (!user || user.role !== 'super_admin') return;

  const losesSuperAdmin = deleting || deactivating || (changingRole && changingRole !== 'super_admin');
  if (!losesSuperAdmin) return;

  const remaining = await queryValue(
    `SELECT COUNT(*) FROM admin_users WHERE role = 'super_admin' AND is_active = 1 AND id <> ?`,
    [Number(userId)]
  );

  if (Number(remaining) === 0) {
    const error = new Error(
      'This is the last active super admin. Promote another account to super admin first, or you will lock yourself out.'
    );
    error.status = 409;
    throw error;
  }
}

export async function PATCH(request, { params }) {
  try {
    const admin = await requireAdmin('users');
    const { id } = await params;
    const targetId = Number(id);

    const existing = await queryOne('SELECT * FROM admin_users WHERE id = ? LIMIT 1', [targetId]);
    if (!existing) {
      return handleError(Object.assign(new Error('Account not found.'), { status: 404 }));
    }

    const body = await readJson(request);
    const parsed = safeParse(adminUserSchema, { ...existing, ...body, password: body.password || '' });
    if (!parsed.success) return invalid(parsed.errors);

    const data = parsed.data;

    if (targetId === admin.id && data.is_active === false) {
      return handleError(
        Object.assign(new Error('You cannot deactivate your own account.'), { status: 409 })
      );
    }

    await assertNotLastSuperAdmin(targetId, {
      changingRole: data.role,
      deactivating: data.is_active === false,
    });

    const fields = ['name = ?', 'email = ?', 'phone = ?', 'role = ?', 'is_active = ?'];
    const values = [data.name, data.email.toLowerCase(), data.phone || null, data.role, toTinyInt(data.is_active)];

    if (data.password) {
      fields.push('password_hash = ?');
      values.push(await hashPassword(data.password));
    }

    values.push(targetId);
    await execute(`UPDATE admin_users SET ${fields.join(', ')} WHERE id = ?`, values);

    await logActivity({
      admin,
      action: 'update',
      entityType: 'admin_users',
      entityId: targetId,
      description: `Updated account for ${data.name}${data.password ? ' (password changed)' : ''}`,
      ip: getClientIp(request.headers),
    });

    return ok({ message: 'Account updated.' });
  } catch (error) {
    return handleError(error, 'users/update');
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdmin('users');
    const { id } = await params;
    const targetId = Number(id);

    if (targetId === admin.id) {
      return handleError(
        Object.assign(new Error('You cannot delete the account you are signed in with.'), { status: 409 })
      );
    }

    const existing = await queryOne('SELECT id, name FROM admin_users WHERE id = ? LIMIT 1', [targetId]);
    if (!existing) {
      return handleError(Object.assign(new Error('Account not found.'), { status: 404 }));
    }

    await assertNotLastSuperAdmin(targetId, { deleting: true });
    await execute('DELETE FROM admin_users WHERE id = ?', [targetId]);

    await logActivity({
      admin,
      action: 'delete',
      entityType: 'admin_users',
      entityId: targetId,
      description: `Deleted account for ${existing.name}`,
      ip: getClientIp(request.headers),
    });

    return ok({ message: 'Account deleted.' });
  } catch (error) {
    return handleError(error, 'users/delete');
  }
}
