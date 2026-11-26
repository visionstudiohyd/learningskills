import mysql from 'mysql2/promise';

/**
 * MySQL / MariaDB connection layer.
 *
 * Works unchanged in three environments:
 *   1. Local XAMPP (MariaDB 10.4)  -> discrete DB_* vars, no SSL
 *   2. cPanel remote MySQL          -> DATABASE_URL (+ ssl=true when required)
 *   3. Vercel serverless            -> pool cached on globalThis so warm
 *                                      lambdas reuse sockets instead of
 *                                      opening a connection per request.
 */

const DEFAULTS = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'course_enquiry_db',
};

function parseBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on', 'require', 'required'].includes(String(value).trim().toLowerCase());
}

/** Build a mysql2 pool config from either DATABASE_URL or discrete DB_* vars. */
export function buildConnectionConfig() {
  const base = {
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    maxIdle: Number(process.env.DB_CONNECTION_LIMIT || 10),
    idleTimeout: 60_000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,
    charset: 'utf8mb4',
    timezone: 'Z',
    dateStrings: false,
    // Keep DECIMAL/BIGINT readable as JS numbers for the dashboard charts.
    decimalNumbers: true,
    supportBigNumbers: true,
    multipleStatements: false,
  };

  const url = (process.env.DATABASE_URL || '').trim();

  if (url) {
    const parsed = new URL(url);
    const sslFromQuery = parsed.searchParams.get('ssl') ?? parsed.searchParams.get('sslmode');
    const config = {
      ...base,
      host: parsed.hostname,
      port: Number(parsed.port || DEFAULTS.port),
      user: decodeURIComponent(parsed.username || DEFAULTS.user),
      password: decodeURIComponent(parsed.password || ''),
      database: decodeURIComponent((parsed.pathname || '').replace(/^\//, '')) || DEFAULTS.database,
    };
    if (parseBool(sslFromQuery) || parseBool(process.env.DB_SSL)) {
      // Shared hosts commonly use self-signed certs; encrypt but do not reject.
      config.ssl = { rejectUnauthorized: parseBool(process.env.DB_SSL_STRICT, false) };
    }
    return config;
  }

  const config = {
    ...base,
    host: process.env.DB_HOST || DEFAULTS.host,
    port: Number(process.env.DB_PORT || DEFAULTS.port),
    user: process.env.DB_USER || DEFAULTS.user,
    password: process.env.DB_PASSWORD ?? DEFAULTS.password,
    database: process.env.DB_NAME || DEFAULTS.database,
  };

  if (parseBool(process.env.DB_SSL)) {
    config.ssl = { rejectUnauthorized: parseBool(process.env.DB_SSL_STRICT, false) };
  }

  return config;
}

// Cache the pool across hot reloads (dev) and warm invocations (serverless).
const globalForDb = globalThis;

export function getPool() {
  if (!globalForDb.__cepMysqlPool) {
    globalForDb.__cepMysqlPool = mysql.createPool(buildConnectionConfig());
  }
  return globalForDb.__cepMysqlPool;
}

/**
 * Run a parameterised query. Always use `?` placeholders - never string
 * concatenation - so user input can never alter the statement.
 */
export async function query(sql, params = []) {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/** Same as query() but for statements mysql2 cannot prepare (e.g. dynamic LIMIT). */
export async function queryRaw(sql, params = []) {
  const pool = getPool();
  const [rows] = await pool.query(sql, params);
  return rows;
}

/** First row or null. */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

/** Single scalar value from the first row, or null. */
export async function queryValue(sql, params = []) {
  const row = await queryOne(sql, params);
  if (!row) return null;
  const keys = Object.keys(row);
  return keys.length ? row[keys[0]] : null;
}

/** INSERT helper -> returns the new auto-increment id. */
export async function insert(sql, params = []) {
  const pool = getPool();
  const [result] = await pool.execute(sql, params);
  return result.insertId;
}

/** UPDATE / DELETE helper -> returns affected row count. */
export async function execute(sql, params = []) {
  const pool = getPool();
  const [result] = await pool.execute(sql, params);
  return result.affectedRows;
}

/**
 * Run several statements atomically.
 *   await transaction(async (conn) => { await conn.execute(...); });
 */
export async function transaction(callback) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    try {
      await conn.rollback();
    } catch {
      /* connection already gone - nothing to roll back */
    }
    throw error;
  } finally {
    conn.release();
  }
}

/** Connectivity probe used by the admin dashboard and /api/health. */
export async function checkConnection() {
  const config = buildConnectionConfig();
  try {
    const row = await queryOne('SELECT VERSION() AS version, DATABASE() AS db, NOW() AS server_time');
    return {
      ok: true,
      host: config.host,
      port: config.port,
      database: row?.db ?? config.database,
      version: row?.version ?? null,
      serverTime: row?.server_time ?? null,
    };
  } catch (error) {
    return {
      ok: false,
      host: config.host,
      port: config.port,
      database: config.database,
      code: error.code || null,
      message: error.message,
    };
  }
}

export default { query, queryRaw, queryOne, queryValue, insert, execute, transaction, getPool, checkConnection };
