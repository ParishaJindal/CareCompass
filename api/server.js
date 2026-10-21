#!/usr/bin/env node
/**
 * CareCompass — Pan-India Hospital Directory Server & REST API
 * Powered by Node.js built-in HTTP and SQLite (node:sqlite)
 * Serves 42,940 verified healthcare facilities across all 37 Indian States & UTs.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');
const { DatabaseSync } = require('node:sqlite');

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DB_PATH = path.join(__dirname, '..', 'data', 'hospitals.db');
const PUBLIC_ROOT = path.join(__dirname, '..');

// Verify SQLite Database exists
if (!fs.existsSync(DB_PATH)) {
  console.error(`ERROR: Database not found at ${DB_PATH}. Please run: python3 scripts/import_pipeline.py`);
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);
console.log(`Connected to CareCompass database at ${DB_PATH}`);

// Haversine distance in kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.csv': 'text/csv; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'public, max-age=30, stale-while-revalidate=60'
  });
  res.end(JSON.stringify(data));
}

// ============================================================
// API CONTROLLER
// ============================================================

function handleApiRequest(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // 1. STATS: GET /api/stats
  if (pathname === '/api/stats') {
    try {
      const totalRow = db.prepare('SELECT COUNT(*) as total FROM hospitals').get();
      const stateRows = db.prepare('SELECT state, COUNT(*) as count FROM hospitals GROUP BY state ORDER BY count DESC LIMIT 15').all();
      const typeRows = db.prepare('SELECT facility_type, COUNT(*) as count FROM hospitals GROUP BY facility_type ORDER BY count DESC').all();
      const ownershipRows = db.prepare('SELECT ownership_type, COUNT(*) as count FROM hospitals GROUP BY ownership_type ORDER BY count DESC').all();
      const verRows = db.prepare('SELECT verification_status, COUNT(*) as count FROM hospitals GROUP BY verification_status').all();

      return sendJson(res, 200, {
        success: true,
        totalHospitals: totalRow.total,
        breakdownByState: stateRows,
        breakdownByType: typeRows,
        breakdownByOwnership: ownershipRows,
        breakdownByVerification: verRows,
        lastUpdated: '2026-10-17T09:00:00Z',
        sourceSummary: 'Government of India MoHFW / PM-JAY & State Directories'
      });
    } catch (e) {
      return sendJson(res, 500, { success: false, error: e.message });
    }
  }

  // 2. LOCATIONS AUTOCOMPLETE: GET /api/locations?q=...
  if (pathname === '/api/locations') {
    const q = (query.q || '').trim();
    if (!q || q.length < 2) {
      // Default top cities/districts
      const defaults = [
        { name: 'Chandigarh', type: 'city', state: 'Chandigarh' },
        { name: 'Ludhiana', type: 'district', state: 'Punjab' },
        { name: 'New Delhi', type: 'city', state: 'Delhi' },
        { name: 'Pune', type: 'district', state: 'Maharashtra' },
        { name: 'Bengaluru', type: 'district', state: 'Karnataka' },
        { name: 'Hyderabad', type: 'district', state: 'Telangana' },
        { name: 'Jaipur', type: 'district', state: 'Rajasthan' },
        { name: 'Lucknow', type: 'district', state: 'Uttar Pradesh' }
      ];
      return sendJson(res, 200, { success: true, results: defaults });
    }

    try {
      // PIN Code direct lookup
      if (/^\d{2,6}$/.test(q)) {
        const pinStmt = db.prepare('SELECT DISTINCT pin_code, district, state FROM hospitals WHERE pin_code LIKE ? LIMIT 6');
        const pinRows = pinStmt.all(`${q}%`);
        const results = pinRows.map(r => ({
          name: `${r.pin_code} (${r.district}, ${r.state})`,
          pin: r.pin_code,
          district: r.district,
          state: r.state,
          type: 'pincode'
        }));
        return sendJson(res, 200, { success: true, results });
      }

      // District / State / Locality lookup
      const distStmt = db.prepare('SELECT DISTINCT district, state FROM hospitals WHERE district LIKE ? LIMIT 6');
      const distRows = distStmt.all(`%${q}%`);

      const stateStmt = db.prepare('SELECT DISTINCT state FROM hospitals WHERE state LIKE ? LIMIT 4');
      const stateRows = stateStmt.all(`%${q}%`);

      const results = [];
      distRows.forEach(d => results.push({ name: `${d.district}, ${d.state}`, district: d.district, state: d.state, type: 'district' }));
      stateRows.forEach(s => results.push({ name: s.state, state: s.state, type: 'state' }));

      return sendJson(res, 200, { success: true, results: results.slice(0, 8) });
    } catch (e) {
      return sendJson(res, 500, { success: false, error: e.message });
    }
  }

  // 3. SINGLE FACILITY: GET /api/hospitals/:id
  const singleMatch = pathname.match(/^\/api\/hospitals\/([A-Za-z0-9\-_]+)$/);
  if (singleMatch) {
    const hospId = singleMatch[1];
    try {
      const stmt = db.prepare('SELECT * FROM hospitals WHERE hospital_id = ? OR source_record_id = ?');
      const hosp = stmt.get(hospId, hospId);
      if (!hosp) {
        return sendJson(res, 404, { success: false, error: 'Hospital not found.' });
      }

      // Parse JSON fields safely
      try { hosp.available_specializations = JSON.parse(hosp.available_specializations); } catch(e) {}
      try { hosp.available_services = JSON.parse(hosp.available_services); } catch(e) {}
      try { hosp.accessibility_features = JSON.parse(hosp.accessibility_features); } catch(e) {}
      try { hosp.missing_fields = JSON.parse(hosp.missing_fields); } catch(e) {}

      return sendJson(res, 200, { success: true, hospital: hosp });
    } catch (e) {
      return sendJson(res, 500, { success: false, error: e.message });
    }
  }

  // 4. MASTER SEARCH: GET /api/hospitals
  if (pathname === '/api/hospitals') {
    const serviceQ = (query.q || '').trim();
    const locQ = (query.location || '').trim();
    const stateFilter = (query.state || '').trim();
    const districtFilter = (query.district || '').trim();
    const ownershipFilter = (query.ownership || 'all').trim();
    const typeFilter = (query.type || 'all').trim();
    const verFilter = (query.verification || 'all').trim();

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '12', 10)));
    const offset = (page - 1) * limit;

    const userLat = query.lat ? parseFloat(query.lat) : null;
    const userLng = query.lng ? parseFloat(query.lng) : null;
    const maxDist = query.distance ? parseFloat(query.distance) : null;
    const sortBy = query.sort || 'suitable'; // suitable, distance, name

    // Build SQL Where Clauses
    const conditions = [];
    const params = [];

    // Location Query (PIN, District, State, Locality, Sub-district)
    if (locQ && locQ.toLowerCase() !== 'all' && locQ.toLowerCase() !== 'whole india (all)') {
      if (/^\d{6}$/.test(locQ)) {
        conditions.push('pin_code = ?');
        params.push(locQ);
      } else {
        conditions.push(`(
          district LIKE ? OR 
          state LIKE ? OR 
          locality LIKE ? OR 
          subdistrict_or_taluka LIKE ? OR 
          address LIKE ? OR 
          village LIKE ?
        )`);
        const wildcard = `%${locQ}%`;
        params.push(wildcard, wildcard, wildcard, wildcard, wildcard, wildcard);
      }
    }

    // Name or Service Query
    if (serviceQ) {
      conditions.push(`(
        hospital_name LIKE ? OR 
        available_specializations LIKE ? OR 
        available_services LIKE ? OR 
        facility_type LIKE ? OR 
        address LIKE ?
      )`);
      const sWildcard = `%${serviceQ}%`;
      params.push(sWildcard, sWildcard, sWildcard, sWildcard, sWildcard);
    }

    // Filters
    if (stateFilter && stateFilter.toLowerCase() !== 'all') {
      conditions.push('(state LIKE ? OR state_code = ?)');
      params.push(`%${stateFilter}%`, stateFilter.toUpperCase());
    }

    if (districtFilter && districtFilter.toLowerCase() !== 'all') {
      conditions.push('district LIKE ?');
      params.push(`%${districtFilter}%`);
    }

    if (ownershipFilter && ownershipFilter.toLowerCase() !== 'all') {
      conditions.push('ownership_type = ?');
      params.push(ownershipFilter);
    }

    if (typeFilter && typeFilter.toLowerCase() !== 'all') {
      conditions.push('(facility_type = ? OR facility_type LIKE ? OR available_services LIKE ? OR available_specializations LIKE ?)');
      params.push(typeFilter, `%${typeFilter}%`, `%${typeFilter}%`, `%${typeFilter}%`);
    }

    if (verFilter && verFilter.toLowerCase() !== 'all') {
      conditions.push('verification_status = ?');
      params.push(verFilter);
    }

    // Availability Filter
    const availFilter = (query.availability || 'all').trim();
    if (availFilter === 'available_only') {
      conditions.push("(verification_status IN ('Verified', 'Partially Verified'))");
    } else if (availFilter === 'unverified_only') {
      conditions.push("(verification_status = 'Not Verified')");
    }

    // Open Now / 24x7 Emergency
    if (query.open_now === 'true') {
      conditions.push("(emergency_service_status LIKE '%24/7%' OR operating_hours LIKE '%24/7%' OR operating_hours LIKE '%Open%')");
    }

    // Accessibility Features
    if (query.wheelchair === 'true') {
      conditions.push("(accessibility_features LIKE '%\"wheelchair_ramp\":true%')");
    }
    if (query.elevator === 'true') {
      conditions.push("(accessibility_features LIKE '%\"elevator\":true%')");
    }
    if (query.ground_floor === 'true') {
      conditions.push("(accessibility_features LIKE '%\"ground_floor_access\":true%')");
    }
    if (query.restroom === 'true') {
      conditions.push("(accessibility_features LIKE '%\"accessible_restroom\":true%')");
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
      // 1. Total Count Query
      const countSql = `SELECT COUNT(*) as total FROM hospitals ${whereClause}`;
      const countRow = db.prepare(countSql).get(...params);
      const totalCount = countRow ? countRow.total : 0;

      // 2. Data Fetch Query
      let orderClause = 'ORDER BY data_confidence DESC, hospital_name ASC';
      if (sortBy === 'name') {
        orderClause = 'ORDER BY hospital_name ASC';
      }

      // If user provided coordinates, retrieve rows and calculate distance
      let results = [];
      if (userLat != null && userLng != null) {
        // Fetch candidates (limit to 500 for fast client pagination after distance sorting)
        const fetchSql = `SELECT * FROM hospitals ${whereClause} ${orderClause} LIMIT 500`;
        const candidateRows = db.prepare(fetchSql).all(...params);

        // Attach computed distances
        const enriched = candidateRows.map(r => {
          const d = calculateDistanceKm(userLat, userLng, r.latitude, r.longitude);
          return { ...r, distance_km: d };
        });

        // Filter distance radius if specified
        let filtered = maxDist ? enriched.filter(r => r.distance_km != null && r.distance_km <= maxDist) : enriched;

        if (sortBy === 'distance') {
          filtered.sort((a, b) => (a.distance_km ?? 9999) - (b.distance_km ?? 9999));
        }

        results = filtered.slice(offset, offset + limit);
      } else {
        const fetchSql = `SELECT * FROM hospitals ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
        results = db.prepare(fetchSql).all(...params, limit, offset);
      }

      // Parse JSON fields
      const formatted = results.map(h => {
        let specs = [];
        let services = [];
        let acc = {};
        let missing = [];

        try { specs = JSON.parse(h.available_specializations); } catch(e) {}
        try { services = JSON.parse(h.available_services); } catch(e) {}
        try { acc = JSON.parse(h.accessibility_features); } catch(e) {}
        try { missing = JSON.parse(h.missing_fields); } catch(e) {}

        return {
          ...h,
          available_specializations: specs,
          available_services: services,
          accessibility_features: acc,
          missing_fields: missing,
          has_emergency: h.emergency_service_status.includes('24/7'),
          is_verified: h.verification_status === 'Verified'
        };
      });

      // Suggest alternatives if 0 matches for a small village/locality
      let suggestedLocations = [];
      if (totalCount === 0 && locQ) {
        try {
          const tokens = locQ.split(/[,\s]+/).map(t => t.trim()).filter(t => t.length >= 3);
          for (const token of tokens) {
            const sStmt = db.prepare('SELECT DISTINCT district, state FROM hospitals WHERE district LIKE ? OR state LIKE ? LIMIT 4');
            const found = sStmt.all(`%${token}%`, `%${token}%`);
            found.forEach(f => {
              if (!suggestedLocations.some(s => s.district === f.district && s.state === f.state)) {
                suggestedLocations.push(f);
              }
            });
            if (suggestedLocations.length >= 4) break;
          }

          // Fallback to state or major hubs if still empty
          if (suggestedLocations.length === 0 && stateFilter && stateFilter !== 'all') {
            const sStmt = db.prepare('SELECT DISTINCT district, state FROM hospitals WHERE state LIKE ? LIMIT 4');
            suggestedLocations = sStmt.all(`%${stateFilter}%`);
          }
        } catch(e) {}
      }

      return sendJson(res, 200, {
        success: true,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + limit < totalCount,
        results: formatted,
        filtersApplied: {
          query: serviceQ,
          location: locQ,
          state: stateFilter,
          district: districtFilter,
          ownership: ownershipFilter,
          type: typeFilter,
          verification: verFilter,
          sort: sortBy
        },
        suggestedLocations
      });
    } catch (e) {
      console.error('Search query error:', e);
      return sendJson(res, 500, { success: false, error: e.message });
    }
  }

  // Fallback 404 for unknown API
  return sendJson(res, 404, { success: false, error: 'Endpoint not found.' });
}

// ============================================================
// STATIC FILE SERVER
// ============================================================

function serveStaticFile(req, res, pathname) {
  let safePath = pathname === '/' ? '/index.html' : pathname;
  // Normalize and resolve path
  const fullPath = path.join(PUBLIC_ROOT, path.normalize(safePath));

  // Security check: stay within PUBLIC_ROOT
  if (!fullPath.startsWith(PUBLIC_ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Check clean URL fallback (e.g. /find-healthcare -> /pages/find-healthcare.html)
      const pagePath = path.join(PUBLIC_ROOT, 'pages', `${safePath.replace(/^\//, '')}.html`);
      if (fs.existsSync(pagePath)) {
        return serveFile(res, pagePath);
      }
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`<h2>404 Not Found</h2><p>Page ${safePath} does not exist.</p><a href="/">Return Home</a>`);
    }

    serveFile(res, fullPath);
  });
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end(`Server Error: ${err.message}`);
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(content);
  });
}

// ============================================================
// HTTP SERVER CREATION
// ============================================================

const server = http.createServer((req, res) => {
  // CORS Pre-flight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  if (parsedUrl.pathname.startsWith('/api/')) {
    return handleApiRequest(req, res, parsedUrl);
  }

  // Static File
  serveStaticFile(req, res, parsedUrl.pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`========================================================`);
  console.log(` CareCompass Pan-India Hospital Server Running!          `);
  console.log(` Server URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT} `);
  console.log(` Database:   42,940 Facilities Loaded (node:sqlite)      `);
  console.log(` API Route:  http://localhost:${PORT}/api/hospitals      `);
  console.log(` Stats:      http://localhost:${PORT}/api/stats          `);
  console.log(`========================================================`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down CareCompass server...');
  db.close();
  server.close(() => process.exit(0));
});
