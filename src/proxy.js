import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Admin route guard (Next.js 16 `proxy` convention — formerly `middleware`).
 *
 * Runs at the edge before any admin page renders, so an unauthenticated
 * visitor is redirected at the boundary rather than after a server component
 * has already queried the database. `jose` is used instead of jsonwebtoken
 * because this runtime only provides Web Crypto.
 *
 * This is the outer gate, not the only one: every admin API route calls
 * requireAdmin() itself, because the proxy alone would leave the APIs open to
 * a direct request if the matcher were ever changed.
 */

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'cep_session';
const ISSUER = 'course-enquiry-platform';

async function isValidSession(token) {
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 24) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { issuer: ISSUER });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const authed = await isValidSession(token);

  // Already signed in and visiting the login screen → go to the dashboard.
  if (pathname === '/admin/login') {
    if (authed) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (!authed) {
    const loginUrl = new URL('/admin/login', request.url);
    // Remember where they were headed so login can send them back.
    if (pathname !== '/admin') {
      loginUrl.searchParams.set('next', `${pathname}${search}`);
    }
    const response = NextResponse.redirect(loginUrl);
    if (token) response.cookies.delete(COOKIE_NAME); // clear an expired cookie
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Admin pages only. The /api/admin/* routes enforce auth themselves so that
  // they return a 401 JSON response rather than an HTML redirect.
  matcher: ['/admin', '/admin/((?!login).*)'],
};
