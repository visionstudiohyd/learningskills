import { getClientIp } from '@/lib/utils';
import { fail, handleError, invalid, ok, readJson } from '@/lib/api';
import { rateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validation';
import { safeParse } from '@/lib/validation';
import { authenticate, createSessionToken, logActivity, setSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/login
 *
 * Rate limited harder than the public forms (5 attempts/minute/IP) to make
 * password guessing impractical, and the failure message is deliberately
 * identical for "no such user" and "wrong password" so it cannot be used to
 * discover which email addresses have accounts.
 */
export async function POST(request) {
  try {
    const ip = getClientIp(request.headers) || 'unknown';
    const limit = rateLimit(`login:${ip}`, 5, 60_000);
    if (!limit.allowed) {
      return fail(`Too many sign-in attempts. Please wait ${limit.retryAfter} seconds.`, 429);
    }

    const body = await readJson(request);
    const parsed = safeParse(loginSchema, body);
    if (!parsed.success) return invalid(parsed.errors);

    const user = await authenticate(parsed.data.email, parsed.data.password);
    if (!user) {
      return fail('Those credentials are not valid.', 401);
    }

    const token = await createSessionToken(user);
    await setSessionCookie(token);

    await logActivity({
      admin: user,
      action: 'login',
      entityType: 'admin_users',
      entityId: user.id,
      description: `${user.name} signed in`,
      ip,
    });

    return ok({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return handleError(error, 'auth/login');
  }
}
