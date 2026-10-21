/**
 * CareCompass Health Check Route
 * Monitored by Render and automated uptime trackers.
 */

const express = require('express');
const router = express.Router();
const db = require('../db/supabase');

router.get('/', async (req, res) => {
  const dbHealth = await db.checkHealth();
  const isHealthy = dbHealth.status === 'connected';

  const responsePayload = {
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'CareCompass Healthcare API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    database: dbHealth,
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0'
  };

  const statusCode = isHealthy ? 200 : 503;
  res.status(statusCode).json(responsePayload);
});

module.exports = router;
