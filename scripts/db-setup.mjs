/**
 * Creates the project database (if missing) and applies database/schema.sql.
 *
 *   npm run db:setup            -> create database + tables (safe / idempotent)
 *   npm run db:setup -- --force -> DROP the database first, then recreate
 *
 * Reads .env.local, so it works against XAMPP locally and against cPanel MySQL
 * (via DATABASE_URL) when preparing the live database.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });

const FORCE = process.argv.includes('--force');
const ROOT = process.cwd();

const c = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(msg) {
  console.log(msg);
}

function resolveConfig() {
  const url = (process.env.DATABASE_URL || '').trim();
  if (url) {
    const parsed = new URL(url);
    const ssl = parsed.searchParams.get('ssl') || parsed.searchParams.get('sslmode');
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username || 'root'),
      password: decodeURIComponent(parsed.password || ''),
      database: decodeURIComponent((parsed.pathname || '').replace(/^\//, '')) || 'course_enquiry_db',
      ssl: ['1', 'true', 'yes', 'require', 'required'].includes(String(ssl).toLowerCase())
        ? { rejectUnauthorized: false }
        : undefined,
    };
  }
  return {
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

/** Split a .sql file into executable statements, ignoring comments. */
function splitStatements(sql) {
  const withoutComments = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  return withoutComments
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function main() {
  const cfg = resolveConfig();

  log('');
  log(`${c.bold}${c.cyan}  Course Enquiry Platform - database setup${c.reset}`);
  log(`${c.dim}  ---------------------------------------------${c.reset}`);
  log(`  server    ${cfg.host}:${cfg.port}`);
  log(`  user      ${cfg.user}`);
  log(`  database  ${cfg.database}`);
  log(`  mode      ${FORCE ? `${c.yellow}FORCE (drops existing database)${c.reset}` : 'safe (create if not exists)'}`);
  log('');

  let server;
  try {
    server = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      ssl: cfg.ssl,
      multipleStatements: false,
    });
  } catch (error) {
    log(`${c.red}  x  Cannot reach MySQL at ${cfg.host}:${cfg.port}${c.reset}`);
    log(`     ${error.code || ''} ${error.message}`);
    log('');
    if (error.code === 'ECONNREFUSED') {
      log(`${c.yellow}     MySQL is not listening. Open the XAMPP Control Panel and${c.reset}`);
      log(`${c.yellow}     click Start next to "MySQL", then run this command again.${c.reset}`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      log(`${c.yellow}     Credentials rejected. Check DB_USER / DB_PASSWORD in .env.local${c.reset}`);
    }
    log('');
    process.exit(1);
  }

  const [verRows] = await server.query('SELECT VERSION() AS v');
  log(`${c.green}  ok${c.reset} connected - server version ${verRows[0].v}`);

  if (FORCE) {
    await server.query(`DROP DATABASE IF EXISTS \`${cfg.database}\``);
    log(`${c.yellow}  !!${c.reset} dropped existing database \`${cfg.database}\``);
  }

  await server.query(
    `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  log(`${c.green}  ok${c.reset} database \`${cfg.database}\` ready`);

  await server.changeUser({ database: cfg.database });

  const schemaPath = path.join(ROOT, 'database', 'schema.sql');
  const sql = await readFile(schemaPath, 'utf8');
  const statements = splitStatements(sql);

  let created = 0;
  for (const statement of statements) {
    try {
      await server.query(statement);
      if (/^CREATE TABLE/i.test(statement)) created += 1;
    } catch (error) {
      const name = statement.match(/CREATE TABLE IF NOT EXISTS `([^`]+)`/i);
      log(`${c.red}  x  failed on ${name ? name[1] : statement.slice(0, 60)}${c.reset}`);
      log(`     ${error.code} ${error.sqlMessage || error.message}`);
      await server.end();
      process.exit(1);
    }
  }
  log(`${c.green}  ok${c.reset} applied schema.sql (${created} CREATE TABLE statements)`);

  const [tables] = await server.query(
    'SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
    [cfg.database]
  );
  log('');
  log(`${c.bold}  ${tables.length} tables in \`${cfg.database}\`:${c.reset}`);
  const names = tables.map((t) => t.name);
  for (let i = 0; i < names.length; i += 3) {
    log(`  ${c.dim}-${c.reset} ${names.slice(i, i + 3).map((n) => n.padEnd(24)).join('')}`);
  }

  await server.end();
  log('');
  log(`${c.green}${c.bold}  Done.${c.reset} Next: ${c.cyan}npm run db:seed${c.reset}`);
  log('');
}

main().catch((error) => {
  log(`${c.red}  Unexpected error: ${error.message}${c.reset}`);
  console.error(error);
  process.exit(1);
});
