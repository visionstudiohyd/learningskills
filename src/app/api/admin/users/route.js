import { handleError, invalid, ok, readJson } from '@/lib/api';
import { hashPassword, logActivity, requireAdmin } from '@/lib/auth';
import { getClientIp, toTinyInt } from '@/lib/utils';
import { adminUserSchema, safeParse } from '@/lib/validation';
import { insert, query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 *   GET  /api/admin/users   list admin accounts (never returns password hashes)
 *   POST /api/admin/users   create an account
 *
 * Restricted to the `users` capability, which only super_admin holds.
 */
export async function GET() {
  try {
    await requireAdmin('users');
    const users = await query(
      `SELECT id, name, email, phone, role, is_active, last_login_at, created_at
         FROM admin_users ORDER BY name ASC`
    );
    return ok({ items: users });
  } catch (error) {
    return handleError(error, 'users/list');
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin('users');
    const body = await readJson(request);

    const parsed = safeParse(adminUserSchema, body);
    if (!parsed.success) return invalid(parsed.errors);

    const data = parsed.data;
    if (!data.password) {
      return invalid({ password: 'Set a password for the new account (at least 8 characters).' });
    }

    const hash = await hashPassword(data.password);

    const id = await insert(
      `INSERT INTO admin_users (name, email, password_hash, role, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.name, data.email.toLowerCase(), hash, data.role, data.phone || null, toTinyInt(data.is_active)]
    );

    await logActivity({
      admin,
      action: 'create',
      entityType: 'admin_users',
      entityId: id,
      description: `Created ${data.role.replace('_', ' ')} account for ${data.name}`,
      ip: getClientIp(request.headers),
    });

    return ok({ id, message: 'Account created.' }, 201);
  } catch (error) {
    return handleError(error, 'users/create');
  }
}
