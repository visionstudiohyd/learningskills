/**
 * Connection and health check.
 *
 *   npm run db:check
 *
 * Useful both locally ("is XAMPP running?") and when pointing the app at a
 * cPanel database for the first time ("is remote MySQL actually reachable from
 * here, with these credentials?"). Reports what it can and exits non-zero on
 * failure so it can be used in a deploy script.
 */
import process from 'node:process';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });

const c = { reset: '\x1b[0m', dim: '\x1b[2m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', bold: '\x1b[1m' };
const log = (m) => console.log(m);

const EXPECTED_TABLES = [
  'admin_users', 'media', 'courses', 'course_outcomes', 'course_syllabus',
  'course_highlights', 'course_faqs', 'hero_slides', 'testimonials', 'pages', 'settings',
  'enquiries', 'enquiry_courses', 'contact_messages', 'faqs', 'site_features', 'site_stats',
  'learning_steps', 'trainers', 'menu_items', 'newsletter_subscribers', 'activity_log', 'page_views',
];

function resolveConfig() {
  const url = (process.env.DATABASE_URL || '').trim();
  if (url) {
    const p = new URL(url);
    const ssl = p.searchParams.get('ssl') || p.searchParams.get('sslmode');
    return {
      source: 'DATABASE_URL',
      host: p.hostname,
      port: Number(p.port || 3306),
      user: decodeURIComponent(p.username || 'root'),
      password: decodeURIComponent(p.password || ''),
      database: decodeURIComponent((p.pathname || '').replace(/^\//, '')) || 'course_enquiry_db',
      ssl: ['1', 'true', 'yes', 'require', 'required'].includes(String(ssl).toLowerCase())
        ? { rejectUnauthorized: false }
        : undefined,
    };
  }
  return {
    source: 'DB_* variables',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME || 'course_enquiry_db',
    ssl: ['1', 'true', 'yes'].includes(String(process.env.DB_SSL).toLowerCase())
      ? { rejectUnauthorized: false }
      : undefined,
  };
}

async function main() {
  const cfg = resolveConfig();

  log('');
  log(`${c.bold}${c.cyan}  Database health check${c.reset}`);
  log(`${c.dim}  ------------------------------------------${c.reset}`);
  log(`  config from   ${cfg.source}`);
  log(`  server        ${cfg.host}:${cfg.port}`);
  log(`  user          ${cfg.user}`);
  log(`  database      ${cfg.database}`);
  log(`  ssl           ${cfg.ssl ? 'enabled' : 'disabled'}`);
  log(`  media driver  ${process.env.MEDIA_DRIVER || 'local'}`);
  log('');

  const started = Date.now();
  let db;

  // `source` is ours, for the report above — mysql2 rejects unknown options.
  const { source, ...connectionConfig } = cfg;

  try {
    db = await mysql.createConnection({ ...connectionConfig, connectTimeout: 10_000 });
  } catch (error) {
    log(`${c.red}  x  Cannot connect  (${error.code})${c.reset}`);
    log(`     ${error.message}`);
    log('');
    if (error.code === 'ECONNREFUSED') {
      log(`${c.yellow}     Nothing is listening there. Locally: start MySQL in the XAMPP${c.reset}`);
      log(`${c.yellow}     Control Panel. Remotely: check the host, port and firewall.${c.reset}`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      log(`${c.yellow}     Credentials rejected. On cPanel, confirm the database user is${c.reset}`);
      log(`${c.yellow}     added to the database, and that Remote MySQL allows your IP.${c.reset}`);
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      log(`${c.yellow}     Connected, but that database does not exist. Run: npm run db:setup${c.reset}`);
    } else if (error.code === 'ETIMEDOUT') {
      log(`${c.yellow}     Timed out. On cPanel this usually means Remote MySQL has not${c.reset}`);
      log(`${c.yellow}     whitelisted the connecting IP address.${c.reset}`);
    }
    log('');
    process.exit(1);
  }

  const latency = Date.now() - started;
  const [[version]] = await db.query('SELECT VERSION() AS v, NOW() AS now');
  log(`${c.green}  ok${c.reset} connected in ${latency}ms`);
  log(`     server version  ${version.v}`);
  log(`     server time     ${version.now}`);
  log('');

  /* ------------------------------- tables -------------------------------- */
  const [tables] = await db.query(
    'SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
    [cfg.database]
  );
  const present = new Set(tables.map((t) => t.name));
  const missing = EXPECTED_TABLES.filter((t) => !present.has(t));

  if (missing.length === 0) {
    log(`${c.green}  ok${c.reset} all ${EXPECTED_TABLES.length} expected tables present`);
  } else {
    log(`${c.red}  x  ${missing.length} table(s) missing:${c.reset} ${missing.join(', ')}`);
    log(`${c.yellow}     Run: npm run db:setup${c.reset}`);
  }

  /* -------------------------------- content ------------------------------ */
  if (missing.length === 0) {
    const [[counts]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM admin_users)       AS admins,
        (SELECT COUNT(*) FROM settings)          AS settings,
        (SELECT COUNT(*) FROM courses)           AS courses,
        (SELECT COUNT(*) FROM hero_slides)       AS slides,
        (SELECT COUNT(*) FROM enquiries)         AS enquiries
    `);

    log('');
    log(`${c.bold}  Content${c.reset}`);
    for (const [key, value] of Object.entries(counts)) {
      const flag = Number(value) === 0 && ['admins', 'settings'].includes(key) ? `${c.yellow} ← empty${c.reset}` : '';
      log(`     ${key.padEnd(12)} ${String(value).padStart(5)}${flag}`);
    }

    if (Number(counts.admins) === 0 || Number(counts.settings) === 0) {
      log('');
      log(`${c.yellow}  !  No admin account or settings found. Run: npm run db:seed${c.reset}`);
    }
  }

  await db.end();
  log('');
  log(`${c.green}${c.bold}  Healthy.${c.reset}`);
  log('');
}

main().catch((error) => {
  log(`${c.red}  Unexpected error: ${error.message}${c.reset}`);
  process.exit(1);
});
