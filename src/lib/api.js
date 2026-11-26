import { NextResponse } from 'next/server';
import { getClientIp } from './utils';
import { safeParse } from './validation';
import { rateLimit } from './rate-limit';

/** Consistent JSON envelopes so the client code only has one shape to handle. */
export function ok(data = {}, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function fail(error, status = 400, extra = {}) {
  return NextResponse.json({ success: false, error, ...extra }, { status });
}

export function invalid(errors, message = 'Please correct the highlighted fields.') {
  return NextResponse.json({ success: false, error: message, errors }, { status: 422 });
}

/**
 * Translate a thrown error into a response.
 *
 * Internal detail (SQL text, stack traces, connection strings) is logged
 * server-side but never returned — the client gets a generic message plus the
 * status we chose deliberately.
 */
export function handleError(error, context = 'request') {
  const status = error?.status || 500;

  if (status >= 500) {
    console.error(`[api:${context}]`, error);
  }

  const dbCodes = {
    ER_DUP_ENTRY: ['That record already exists.', 409],
    ER_NO_REFERENCED_ROW_2: ['A linked record no longer exists.', 409],
    ER_ROW_IS_REFERENCED_2: ['This item is still in use elsewhere and cannot be deleted.', 409],
    ECONNREFUSED: ['The database is unavailable. Please try again shortly.', 503],
    ER_BAD_DB_ERROR: ['The database is not set up. Run the setup script.', 503],
    PROTOCOL_CONNECTION_LOST: ['The database connection dropped. Please retry.', 503],
    ETIMEDOUT: ['The database did not respond in time. Please retry.', 504],
  };

  if (error?.code && dbCodes[error.code]) {
    const [message, code] = dbCodes[error.code];
    return fail(message, code);
  }

  if (status < 500) {
    return fail(error.message || 'Request failed.', status);
  }

  return fail('Something went wrong on our side. Please try again.', 500);
}

/** Parse a JSON body defensively — an empty or malformed body is a 400, not a crash. */
export async function readJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    const error = new Error('Expected a JSON request body.');
    error.status = 400;
    throw error;
  }
}

/**
 * Validate a request body against a Zod schema, with rate limiting applied
 * first so a flood of invalid submissions is cheap to reject.
 */
export async function guard(request, schema, { limit = 8, windowMs = 60_000, key = 'generic' } = {}) {
  const ip = getClientIp(request.headers) || 'unknown';
  const check = rateLimit(`${key}:${ip}`, limit, windowMs);

  if (!check.allowed) {
    return {
      error: NextResponse.json(
        { success: false, error: `Too many attempts. Please wait ${check.retryAfter} seconds and try again.` },
        { status: 429, headers: { 'Retry-After': String(check.retryAfter) } }
      ),
    };
  }

  const body = await readJson(request);
  const parsed = safeParse(schema, body);

  if (!parsed.success) {
    return { error: invalid(parsed.errors) };
  }

  return {
    data: parsed.data,
    meta: { ip, userAgent: request.headers.get('user-agent') || null },
  };
}
