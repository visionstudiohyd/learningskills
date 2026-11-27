import { NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import { createHash, timingSafeEqual } from 'node:crypto';
import { closeSync, mkdirSync, openSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Push-triggered redeploy for the cPanel (Passenger) deployment.
 *
 * POST starts scripts/deploy.sh detached — it downloads main from GitHub,
 * installs, builds with webpack and restarts the app — and answers 202 at once.
 * GET returns the state that script writes to .deploy/status.json.
 *
 * Both require `Authorization: Bearer $DEPLOY_SECRET`. Without DEPLOY_SECRET in
 * the environment the route refuses everything, so a missing setting fails
 * closed rather than leaving an open rebuild trigger on the site.
 */
function authorised(request) {
  const secret = process.env.DEPLOY_SECRET;
  if (!secret) return false;

  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return false;

  // Hash both sides so the comparison is constant-time regardless of length.
  const given = createHash('sha256').update(token).digest();
  const expected = createHash('sha256').update(secret).digest();
  return timingSafeEqual(given, expected);
}

const notConfigured = () =>
  NextResponse.json(
    { success: false, error: 'Deployment is not configured on this server.' },
    { status: 503 }
  );

function unauthorised() {
  return NextResponse.json({ success: false, error: 'Unauthorised.' }, { status: 401 });
}

function stateDir() {
  return path.join(process.cwd(), '.deploy');
}

function readStatus() {
  try {
    return JSON.parse(readFileSync(path.join(stateDir(), 'status.json'), 'utf8'));
  } catch {
    return { state: 'idle', step: null, message: 'No deployment has run yet.', updatedAt: null };
  }
}

/** GET /api/deploy — current deployment state. */
export async function GET(request) {
  if (!process.env.DEPLOY_SECRET) return notConfigured();
  if (!authorised(request)) return unauthorised();

  return NextResponse.json(
    { success: true, ...readStatus() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

/** POST /api/deploy — start a rebuild. Body: { "commit": "<sha>" } (optional). */
export async function POST(request) {
  if (!process.env.DEPLOY_SECRET) return notConfigured();
  if (!authorised(request)) return unauthorised();

  const current = readStatus();
  if (current.state === 'running') {
    return NextResponse.json(
      { success: false, error: 'A deployment is already running.', ...current },
      { status: 409 }
    );
  }

  let commit = '';
  try {
    const body = await request.json();
    if (typeof body?.commit === 'string' && /^[0-9a-f]{7,40}$/i.test(body.commit)) {
      commit = body.commit;
    }
  } catch {
    // An empty body is fine — commit is only recorded for reporting.
  }

  const dir = stateDir();
  mkdirSync(dir, { recursive: true });

  const log = openSync(path.join(dir, 'deploy.log'), 'a');
  const child = spawn('bash', [path.join(process.cwd(), 'scripts', 'deploy.sh')], {
    cwd: process.cwd(),
    detached: true,
    stdio: ['ignore', log, log],
    env: { ...process.env, DEPLOY_COMMIT: commit },
  });
  closeSync(log);

  child.on('error', (error) => {
    console.error('[api:deploy] could not start deploy.sh', error);
  });
  child.unref();

  return NextResponse.json({ success: true, state: 'queued', commit: commit || null }, { status: 202 });
}
