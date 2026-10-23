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
}

// Always prepare local SQLite fallback if database file exists
if (fs.existsSync(SQLITE_FALLBACK_PATH)) {
  try {
    const { DatabaseSync } = require('node:sqlite');
    sqliteDb = new DatabaseSync(SQLITE_FALLBACK_PATH);
    initSqliteAppointmentTables(sqliteDb);
    if (dbType === 'none') {
      dbType = 'local_sqlite_fallback';
      console.log(`[CareCompass DB] Connected to local SQLite fallback database at ${SQLITE_FALLBACK_PATH}`);
    }
  } catch (err) {
    console.error('[CareCompass DB] Failed to open SQLite fallback database:', err.message);
  }
} else if (dbType === 'none') {
  console.warn(`[CareCompass DB] Warning: SQLite database file not found at ${SQLITE_FALLBACK_PATH}`);
}

/**
 * Initialize appointment tables in SQLite fallback if they don't exist
 */
function initSqliteAppointmentTables(db) {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS appointment_providers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_id TEXT UNIQUE NOT NULL,
        integration_type TEXT NOT NULL DEFAULT 'carecompass_partner',
        booking_enabled INTEGER NOT NULL DEFAULT 1,
        verification_status TEXT NOT NULL DEFAULT 'Verified',
        consultation_fee REAL NOT NULL DEFAULT 500.00,
        carecompass_fee REAL NOT NULL DEFAULT 0.00,
        payment_mode TEXT NOT NULL DEFAULT 'pay_at_hospital',
        currency TEXT NOT NULL DEFAULT 'INR',
        cancellation_deadline_hours INTEGER NOT NULL DEFAULT 4,
        departments TEXT NOT NULL DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS appointment_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospital_id TEXT NOT NULL,
        department_id TEXT NOT NULL,
        department_name TEXT NOT NULL,
        doctor_id TEXT,
        doctor_name TEXT,
        slot_date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        availability_status TEXT NOT NULL DEFAULT 'available',
        reserved_by_session TEXT,
        reservation_expires_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(hospital_id, department_id, slot_date, start_time)
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_reference TEXT UNIQUE NOT NULL,
        booking_type TEXT NOT NULL DEFAULT 'direct_booking',
        hospital_id TEXT NOT NULL,
        hospital_name TEXT NOT NULL,
        hospital_phone TEXT,
        hospital_address TEXT,
        department_id TEXT NOT NULL,
        department_name TEXT NOT NULL,
        doctor_id TEXT,
        doctor_name TEXT,
        slot_id INTEGER,
        appointment_date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        patient_phone TEXT NOT NULL,
        patient_email TEXT,
        notes TEXT,
        booking_status TEXT NOT NULL DEFAULT 'pending_confirmation',
        payment_status TEXT NOT NULL DEFAULT 'pay_at_hospital',
        payment_mode TEXT NOT NULL DEFAULT 'pay_at_hospital',
        consultation_fee REAL NOT NULL DEFAULT 0.00,
        service_fee REAL NOT NULL DEFAULT 0.00,
        total_amount REAL NOT NULL DEFAULT 0.00,
        currency TEXT NOT NULL DEFAULT 'INR',
        confirmed_by_system TEXT,
        confirmed_at TEXT,
        cancellation_reason TEXT,
        cancelled_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointment_id INTEGER NOT NULL,
        booking_reference TEXT NOT NULL,
        provider TEXT NOT NULL DEFAULT 'hospital_counter',
        provider_order_id TEXT UNIQUE NOT NULL,
        provider_payment_id TEXT,
        provider_signature TEXT,
        amount REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        payment_status TEXT NOT NULL DEFAULT 'pay_at_hospital',
        payment_method TEXT DEFAULT 'pay_at_hospital',
        refund_id TEXT,
        refund_amount REAL,
        refund_status TEXT,
        error_code TEXT,
        error_description TEXT,
        webhook_verified INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Ensure columns exist on older SQLite databases via safe migrations
    try {
      const apptCols = db.prepare("PRAGMA table_info(appointments)").all().map(c => c.name);
      if (!apptCols.includes('booking_type')) db.exec("ALTER TABLE appointments ADD COLUMN booking_type TEXT NOT NULL DEFAULT 'direct_booking'");
      if (!apptCols.includes('payment_mode')) db.exec("ALTER TABLE appointments ADD COLUMN payment_mode TEXT NOT NULL DEFAULT 'pay_at_hospital'");
      if (!apptCols.includes('confirmed_by_system')) db.exec("ALTER TABLE appointments ADD COLUMN confirmed_by_system TEXT");
      if (!apptCols.includes('confirmed_at')) db.exec("ALTER TABLE appointments ADD COLUMN confirmed_at TEXT");
      if (!apptCols.includes('cancellation_reason')) db.exec("ALTER TABLE appointments ADD COLUMN cancellation_reason TEXT");
      if (!apptCols.includes('cancelled_at')) db.exec("ALTER TABLE appointments ADD COLUMN cancelled_at TEXT");

      const provCols = db.prepare("PRAGMA table_info(appointment_providers)").all().map(c => c.name);
      if (!provCols.includes('payment_mode')) db.exec("ALTER TABLE appointment_providers ADD COLUMN payment_mode TEXT NOT NULL DEFAULT 'pay_at_hospital'");

      const payCols = db.prepare("PRAGMA table_info(payments)").all().map(c => c.name);
      if (!payCols.includes('notes')) db.exec("ALTER TABLE payments ADD COLUMN notes TEXT");
    } catch (migErr) {
      console.warn('[CareCompass DB] SQLite column check warning:', migErr.message);
    }
  } catch (err) {
    console.warn('[CareCompass DB] Note initializing SQLite appointment tables:', err.message);
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
      console.warn('[Supabase Query Warning]:', err.message);
      // If PostgreSQL fails due to auth, network, or connection issues, fall back to SQLite permanently for this session
      if (sqliteDb) {
        dbType = 'local_sqlite_fallback';
        console.log('[CareCompass DB] Permanently switched to local SQLite fallback database for session.');
        return querySqlite(text, params);
      }
      throw err;
    }
  }

  if (sqliteDb) {
    return querySqlite(text, params);
  }

  throw new Error('Database is not initialized. Please configure DATABASE_URL for Supabase PostgreSQL.');
}

function querySqlite(text, params = []) {
  // Map PostgreSQL $1, $2, ... placeholders to SQLite ? placeholders and align params
  const reorderedParams = [];
  let sqliteSql = text
    .replace(/\$(\d+)/g, (match, idx) => {
      const pIdx = parseInt(idx, 10) - 1;
      reorderedParams.push(params[pIdx]);
      return '?';
    })
    .replace(/\bILIKE\b/gi, 'LIKE')
    .replace(/\bNOW\(\)\s*\+\s*INTERVAL\s*'(\d+)\s*minutes'/gi, "datetime('now', '+$1 minutes')")
    .replace(/\bNOW\(\)/gi, "datetime('now')");

  try {
    const stmt = sqliteDb.prepare(sqliteSql);
    const isSelectOrReturning = /^\s*(SELECT|PRAGMA)/i.test(sqliteSql) || /\bRETURNING\b/i.test(sqliteSql);
    if (isSelectOrReturning) {
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
