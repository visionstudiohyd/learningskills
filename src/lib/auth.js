import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { query, queryOne, execute } from './db';

/**
 * Admin authentication.
 *
 * Stateless JWT held in an httpOnly, SameSite=Lax cookie:
 *   • no session table to clean up (works on serverless/Vercel),
 *   • signed with AUTH_SECRET (HS256) and verified on every admin request,
 *   • `jose` is Web Crypto based, so the same code runs in middleware.
 */

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'cep_session';
const SESSION_HOURS = Number(process.env.AUTH_SESSION_HOURS || 12);
const ISSUER = 'course-enquiry-platform';

export const ROLES = ['super_admin', 'admin', 'editor'];

/** Capabilities per role — enforced in the admin API routes. */
const ROLE_PERMISSIONS = {
  super_admin: ['content', 'enquiries', 'settings', 'users'],
  admin: ['content', 'enquiries', 'settings'],
  editor: ['content'],
};

export function can(role, permission) {
  return (ROLE_PERMISSIONS[role] || []).includes(permission);
}

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error('AUTH_SECRET is missing or too short — set a long random value in .env.local');
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(plain) {
  return bcrypt.hash(String(plain), 11);
}

export async function verifyPassword(plain, hash) {
  if (!hash) return false;
  try {
    return await bcrypt.compare(String(plain), hash);
  } catch {
    return false;
  }
}

export function getCookieName() {
  return COOKIE_NAME;
}

/** Sign a session token for a user row. */
export async function createSessionToken(user) {
  return new SignJWT({ sub: String(user.id), email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
}

/** Verify a token and return its payload, or null. */
export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER });
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_HOURS * 60 * 60,
  };
}

/** Write the session cookie (Server Action / Route Handler context). */
export async function setSessionCookie(token) {
  const store = await cookies();
  store.set({ ...sessionCookieOptions(), value: token });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set({ ...sessionCookieOptions(), value: '', maxAge: 0 });
}

/**
 * Current admin for the request, or null.
 * Re-reads the user row so a deactivated account loses access immediately
 * instead of staying valid until its token expires.
 */
export async function getCurrentAdmin() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const payload = await verifySessionToken(token);
  if (!payload?.sub) return null;

  try {
    const user = await queryOne(
      'SELECT id, name, email, role, avatar, phone, is_active, last_login_at FROM admin_users WHERE id = ? LIMIT 1',
      [Number(payload.sub)]
    );
    if (!user || !user.is_active) return null;
    return user;
  } catch {
    return null;
  }
}

/** Throws a 401-shaped error when there is no signed-in admin. */
export async function requireAdmin(permission = null) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    const error = new Error('Authentication required');
    error.status = 401;
    throw error;
  }
  if (permission && !can(admin.role, permission)) {
    const error = new Error('You do not have permission to do that');
    error.status = 403;
    throw error;
  }
  return admin;
}

/** Email + password -> user row, or null. */
export async function authenticate(email, password) {
  const user = await queryOne(
    'SELECT id, name, email, role, password_hash, is_active FROM admin_users WHERE email = ? LIMIT 1',
    [String(email).trim().toLowerCase()]
  );
  if (!user || !user.is_active) return null;
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return null;
  await execute('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [user.id]);
  delete user.password_hash;
  return user;
}

/** Append to the audit trail. Never throws — logging must not break a request. */
export async function logActivity({ admin, action, entityType = null, entityId = null, description = null, ip = null }) {
  try {
    await query(
      `INSERT INTO activity_log (admin_user_id, actor_name, action, entity_type, entity_id, description, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [admin?.id || null, admin?.name || null, action, entityType, entityId, description, ip]
    );
  } catch {
    /* audit logging is best-effort */
  }
}
