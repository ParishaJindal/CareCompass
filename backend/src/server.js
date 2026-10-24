/**
 * CareCompass — Pan-India Healthcare Navigation Backend Server
 * Architecture: Vercel Frontend -> Render Backend API -> Supabase PostgreSQL
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const hospitalsRouter = require('./routes/hospitals');
const appointmentsRouter = require('./routes/appointments');
const partnerRouter = require('./routes/partner');
const adminRouter = require('./routes/admin');
const healthRouter = require('./routes/health');
const hospitalController = require('./controllers/hospitalController');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const db = require('./db/supabase');

const app = express();
const PORT = parseInt(process.env.PORT || '10000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// ============================================================
// 1. SECURITY & HEADERS
// ============================================================

app.use(helmet({
  contentSecurityPolicy: false, // APIs return JSON; frontend handles its own CSP
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Parse allowed CORS origins
const rawOrigins = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '';
const configuredOrigins = rawOrigins
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// CORS configuration supporting Vercel production, preview deployments, and local development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (Postman, curl, server-to-server health checks)
    if (!origin) return callback(null, true);

    // Check explicitly configured origins
    if (configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all Vercel deployments (*.vercel.app)
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Allow local development ports
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // In non-production, log and permit for ease of testing
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Allow if FRONTEND_URL matches
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CareCompass CORS policy.`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================================
// 2. ROOT & HEALTH CHECK
// ============================================================

// Service info on root
app.get('/', (req, res) => {
  res.json({
    service: 'CareCompass Healthcare Navigation REST API',
    status: 'online',
    version: '2.0.0',
    documentation: {
      healthCheck: '/api/health',
      hospitals: '/api/hospitals',
      search: '/api/hospitals/search?location=Kharar',
      locations: '/api/locations?q=Mohali',
      stats: '/api/stats'
    },
    message: 'CareCompass API is running securely on Render connected to Supabase PostgreSQL.'
  });
});

// Health check endpoint (exempt from rate limits for uptime monitors)
app.use('/api/health', healthRouter);

// Apply rate limiting to all public API endpoints
app.use('/api/', apiLimiter);

// ============================================================
// 3. API ROUTES
// ============================================================

// Hospital endpoints: /api/hospitals, /api/hospitals/search, /api/hospitals/:id
app.use('/api/hospitals', hospitalsRouter);

// Appointment & Scheduling endpoints: /api/appointments/*
app.use('/api/appointments', appointmentsRouter);

// Hospital Partner Portal endpoints: /api/partner/*
app.use('/api/partner', partnerRouter);

// Platform Administration endpoints: /api/admin/*
app.use('/api/admin', adminRouter);

// Autocomplete endpoint: /api/locations?q=...
app.get('/api/locations', hospitalController.getLocations);

// Directory statistics: /api/stats
app.get('/api/stats', hospitalController.getStats);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route '${req.originalUrl}' does not exist on CareCompass backend.`
  });
});

// Centralized error handler
app.use(errorHandler);

// ============================================================
// 4. SERVER INITIALIZATION & LIFECYCLE
// ============================================================

const server = app.listen(PORT, HOST, () => {
  console.log('================================================================');
  console.log('  CareCompass REST API Server Active (Render Deployment Target) ');
  console.log(`  Listening on: http://${HOST}:${PORT}                           `);
  console.log(`  Database Engine: ${db.dbType}                                 `);
  console.log(`  Health Check: http://localhost:${PORT}/api/health              `);
  console.log('================================================================');
});

// Graceful shutdown handling
async function gracefulShutdown(signal) {
  console.log(`\n[CareCompass API] Received ${signal}. Closing server gracefully...`);
  server.close(async () => {
    console.log('[CareCompass API] HTTP server closed.');
    try {
      await db.close();
      console.log('[CareCompass API] Database connections terminated.');
      process.exit(0);
    } catch (e) {
      console.error('[CareCompass API] Error closing database:', e);
      process.exit(1);
    }
  });

  // Force close if stuck
  setTimeout(() => {
    console.error('[CareCompass API] Shutdown timed out. Forcing termination.');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = app;
