/**
 * CareCompass Database Client
 * Primary: Supabase PostgreSQL via connection pool (pg.Pool) with SSL
 * Local Fallback: Local SQLite database (node:sqlite) if DATABASE_URL is not provided
 */

const { Pool } = require('pg');
const fs = require('node:fs');
const path = require('node:path');

const DATABASE_URL = process.env.DATABASE_URL;
const SQLITE_FALLBACK_PATH = path.join(__dirname, '..', '..', '..', 'data', 'hospitals.db');

let pool = null;
let sqliteDb = null;
let dbType = 'none';

if (DATABASE_URL && DATABASE_URL.trim() !== '' && !DATABASE_URL.includes('YOUR_SUPABASE')) {
  // Production / Staging Supabase PostgreSQL
  const sslConfig = process.env.DATABASE_SSL === 'false' 
    ? false 
    : { rejectUnauthorized: false };

  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: sslConfig,
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_TIMEOUT_MS || '5000', 10)
  });

  pool.on('error', (err) => {
    console.error('[Supabase DB Pool Error]:', err.message);
  });

  dbType = 'supabase_postgresql';
  console.log('[CareCompass DB] Configured for Supabase PostgreSQL Connection Pool.');
} else {
  // Local Development SQLite Fallback
  console.warn('[CareCompass DB] Notice: DATABASE_URL not configured. Checking local SQLite fallback...');
  if (fs.existsSync(SQLITE_FALLBACK_PATH)) {
    try {
      const { DatabaseSync } = require('node:sqlite');
      sqliteDb = new DatabaseSync(SQLITE_FALLBACK_PATH);
      dbType = 'local_sqlite_fallback';
      console.log(`[CareCompass DB] Connected to local SQLite fallback database at ${SQLITE_FALLBACK_PATH}`);
    } catch (err) {
      console.error('[CareCompass DB] Failed to open SQLite fallback database:', err.message);
    }
  } else {
    console.warn(`[CareCompass DB] Warning: SQLite database file not found at ${SQLITE_FALLBACK_PATH}`);
  }
}

/**
 * Execute parameterized query
 * @param {string} text - SQL query (uses $1, $2, ... for PostgreSQL)
 * @param {Array} params - Parameters array
 */
async function query(text, params = []) {
  if (dbType === 'supabase_postgresql' && pool) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV !== 'production' && duration > 100) {
        console.log(`[Supabase Query] ${duration}ms: ${text.slice(0, 80)}...`);
      }
      return res;
    } catch (err) {
      console.error('[Supabase Query Error]:', err.message, '| SQL:', text.slice(0, 100));
      throw err;
    }
  }

  if (dbType === 'local_sqlite_fallback' && sqliteDb) {
    // Map PostgreSQL $1, $2, ... placeholders to SQLite ? placeholders and align params
    const reorderedParams = [];
    let sqliteSql = text
      .replace(/\$(\d+)/g, (match, idx) => {
        const pIdx = parseInt(idx, 10) - 1;
        reorderedParams.push(params[pIdx]);
        return '?';
      })
      .replace(/\bILIKE\b/gi, 'LIKE')
      .replace(/\bNOW\(\)/gi, "datetime('now')");

    try {
      const stmt = sqliteDb.prepare(sqliteSql);
      if (/^\s*(SELECT|PRAGMA)/i.test(sqliteSql)) {
        const rows = stmt.all(...reorderedParams);
        return { rows, rowCount: rows.length };
      } else {
        const info = stmt.run(...reorderedParams);
        return { rows: [], rowCount: info.changes };
      }
    } catch (err) {
      console.error('[SQLite Fallback Query Error]:', err.message, '| SQL:', sqliteSql.slice(0, 100));
      throw err;
    }
  }

  throw new Error('Database is not initialized. Please configure DATABASE_URL for Supabase PostgreSQL.');
}

/**
 * Health check helper to verify database connection
 */
async function checkHealth() {
  try {
    if (dbType === 'supabase_postgresql' && pool) {
      const result = await pool.query('SELECT COUNT(*) AS count FROM hospitals');
      return {
        status: 'connected',
        type: 'supabase_postgresql',
        totalHospitals: parseInt(result.rows[0].count, 10),
        ssl: true
      };
    }

    if (dbType === 'local_sqlite_fallback' && sqliteDb) {
      const row = sqliteDb.prepare('SELECT COUNT(*) as count FROM hospitals').get();
      return {
        status: 'connected',
        type: 'local_sqlite_fallback',
        totalHospitals: row ? row.count : 0,
        note: 'Using local SQLite fallback until Supabase DATABASE_URL is provided in environment variables.'
      };
    }

    return {
      status: 'disconnected',
      type: 'none',
      error: 'No database connection configured.'
    };
  } catch (err) {
    return {
      status: 'error',
      type: dbType,
      error: err.message
    };
  }
}

/**
 * Graceful shutdown of database pool
 */
async function close() {
  if (pool) {
    await pool.end();
  }
  if (sqliteDb) {
    sqliteDb.close();
  }
}

module.exports = {
  query,
  checkHealth,
  close,
  get dbType() {
    return dbType;
  }
};
