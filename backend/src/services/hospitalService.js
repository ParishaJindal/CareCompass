/**
 * CareCompass Hospital Directory Service
 * Handles database operations, parameterization, searching, filtering, and pagination.
 */

const db = require('../db/supabase');

/**
 * Calculate Haversine distance in kilometers between two GPS coordinates
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Safely parse JSON or return original value/empty default
 */
function safeJsonParse(val, fallback = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
}

/**
 * Format raw hospital record for API response
 */
function formatHospitalRecord(h, userLat = null, userLng = null) {
  const specs = safeJsonParse(h.specializations || h.available_specializations, []);
  const services = safeJsonParse(h.services || h.available_services, []);
  const acc = safeJsonParse(h.accessibility_features, {});
  const missing = safeJsonParse(h.missing_fields, []);

  const emergencyStr = h.emergency_availability || h.emergency_service_status || '';
  const hasEmergency = /24\/7|emergency/i.test(emergencyStr);

  let distKm = h.distance_km != null ? parseFloat(h.distance_km) : null;
  if (distKm == null && userLat != null && userLng != null && h.latitude != null && h.longitude != null) {
    distKm = calculateDistanceKm(userLat, userLng, h.latitude, h.longitude);
  }

  return {
    id: h.hospital_id || String(h.id),
    numeric_id: h.id,
    hospital_id: h.hospital_id || String(h.id),
    source_record_id: h.source_record_id || null,
    hospital_name: h.hospital_name,
    alternate_name: h.alternate_name || null,
    facility_type: h.facility_type,
    ownership_type: h.ownership_type,
    healthcare_category: h.healthcare_category || null,
    address: h.address,
    locality: h.locality || null,
    village: h.village || null,
    subdistrict_or_taluka: h.subdistrict_or_taluka || null,
    district: h.district,
    state: h.state,
    state_code: h.state_code || null,
    country: h.country || 'India',
    pin_code: h.pin_code || null,
    latitude: h.latitude != null ? parseFloat(h.latitude) : null,
    longitude: h.longitude != null ? parseFloat(h.longitude) : null,
    phone: h.phone || null,
    alternate_phone: h.alternate_phone || null,
    email: h.email || null,
    website: h.website || h.official_website || null,
    official_website: h.official_website || h.website || null,
    specializations: specs,
    services: services,
    available_specializations: specs,
    available_services: services,
    emergency_availability: emergencyStr,
    emergency_service_status: emergencyStr,
    operating_hours: h.operating_hours || 'OPD: 09:00 - 17:00',
    accessibility_features: acc,
    verification_status: h.verification_status || 'Partially Verified',
    data_confidence: h.data_confidence != null ? parseFloat(h.data_confidence) : 0.85,
    missing_fields: missing,
    last_verified_at: h.last_verified_at || null,
    source_name: h.source_name || 'MoHFW / PM-JAY Registry',
    source_url: h.source_url || null,
    source_license: h.source_license || null,
    created_at: h.created_at || null,
    updated_at: h.updated_at || null,
    has_emergency: hasEmergency,
    is_verified: h.verification_status === 'Verified',
    distance_km: distKm != null ? Math.round(distKm * 10) / 10 : null
  };
}

/**
 * Search and filter hospitals with parameterized queries
 */
async function searchHospitals(params = {}) {
  const serviceQ = (params.q || params.query || '').trim();
  const locQ = (params.location || '').trim();
  const stateFilter = (params.state || '').trim();
  const districtFilter = (params.district || '').trim();
  const ownershipFilter = (params.ownership || params.ownership_type || 'all').trim();
  const typeFilter = (params.type || params.facility_type || 'all').trim();
  const verFilter = (params.verification || 'all').trim();
  const availFilter = (params.availability || 'all').trim();
  const openNow = params.open_now === 'true' || params.open_now === true;
  const sortBy = params.sort || 'suitable';

  const page = Math.max(1, parseInt(params.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(params.limit || '24', 10)));
  const offset = (page - 1) * limit;

  const userLat = params.lat != null ? parseFloat(params.lat) : null;
  const userLng = params.lng != null ? parseFloat(params.lng) : null;
  const maxDistance = params.distance != null ? parseFloat(params.distance) : null;

  const conditions = [];
  const queryParams = [];

  // 1. Location Matching (PIN Code, District, State, Locality, Village, Address)
  if (locQ && locQ.toLowerCase() !== 'all' && locQ.toLowerCase() !== 'whole india (all)') {
    if (/^\d{6}$/.test(locQ)) {
      queryParams.push(locQ);
      conditions.push(`pin_code = $${queryParams.length}`);
    } else {
      const wildcard = `%${locQ}%`;
      const orClauses = [];
      const fields = ['district', 'state', 'locality', 'subdistrict_or_taluka', 'address', 'village'];
      fields.forEach(f => {
        queryParams.push(wildcard);
        orClauses.push(`${f} ILIKE $${queryParams.length}`);
      });
      conditions.push(`(${orClauses.join(' OR ')})`);
    }
  }

  // 2. Keyword / Service / Name Query
  if (serviceQ) {
    const sWildcard = `%${serviceQ}%`;
    const orClauses = [];
    const fields = ['hospital_name', 'address', 'facility_type'];
    fields.forEach(f => {
      queryParams.push(sWildcard);
      orClauses.push(`${f} ILIKE $${queryParams.length}`);
    });

    // Also search JSON / text arrays
    queryParams.push(sWildcard);
    orClauses.push(`CAST(available_services AS TEXT) ILIKE $${queryParams.length}`);
    queryParams.push(sWildcard);
    orClauses.push(`CAST(available_specializations AS TEXT) ILIKE $${queryParams.length}`);

    conditions.push(`(${orClauses.join(' OR ')})`);
  }

  // 3. State Filter
  if (stateFilter && stateFilter.toLowerCase() !== 'all') {
    queryParams.push(`%${stateFilter}%`);
    const p1 = queryParams.length;
    queryParams.push(stateFilter.toUpperCase());
    const p2 = queryParams.length;
    conditions.push(`(state ILIKE $${p1} OR state_code = $${p2})`);
  }

  // 4. District Filter
  if (districtFilter && districtFilter.toLowerCase() !== 'all') {
    queryParams.push(`%${districtFilter}%`);
    conditions.push(`district ILIKE $${queryParams.length}`);
  }

  // 5. Ownership Filter
  if (ownershipFilter && ownershipFilter.toLowerCase() !== 'all') {
    queryParams.push(ownershipFilter);
    conditions.push(`ownership_type = $${queryParams.length}`);
  }

  // 6. Facility Type Filter (or ownership type if Government / Private specified as type)
  if (typeFilter && typeFilter.toLowerCase() !== 'all') {
    queryParams.push(`%${typeFilter}%`);
    const p1 = queryParams.length;
    queryParams.push(`%${typeFilter}%`);
    const p2 = queryParams.length;
    conditions.push(`(facility_type ILIKE $${p1} OR ownership_type ILIKE $${p2})`);
  }

  // 7. Verification Filter
  if (verFilter && verFilter.toLowerCase() !== 'all') {
    queryParams.push(verFilter);
    conditions.push(`verification_status = $${queryParams.length}`);
  }

  // 8. Availability Filter
  if (availFilter === 'available_only') {
    conditions.push("verification_status IN ('Verified', 'Partially Verified')");
  } else if (availFilter === 'unverified_only') {
    conditions.push("verification_status = 'Not Verified'");
  }

  // 9. Open Now / Emergency
  if (openNow) {
    conditions.push("(emergency_service_status ILIKE '%24/7%' OR emergency_availability ILIKE '%24/7%' OR operating_hours ILIKE '%24/7%' OR operating_hours ILIKE '%Open%')");
  }

  // 10. Accessibility Features
  if (params.wheelchair === 'true' || params.wheelchair === true) {
    conditions.push("CAST(accessibility_features AS TEXT) ILIKE '%\"wheelchairRamp\":true%'");
  }
  if (params.elevator === 'true' || params.elevator === true) {
    conditions.push("CAST(accessibility_features AS TEXT) ILIKE '%\"elevator\":true%'");
  }
  if (params.ground_floor === 'true' || params.ground_floor === true) {
    conditions.push("CAST(accessibility_features AS TEXT) ILIKE '%\"groundFloorServices\":true%'");
  }
  if (params.restroom === 'true' || params.restroom === true) {
    conditions.push("CAST(accessibility_features AS TEXT) ILIKE '%\"accessibleRestroom\":true%'");
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Total count query
  const countSql = `SELECT COUNT(*) AS total FROM hospitals ${whereClause}`;
  const countRes = await db.query(countSql, queryParams);
  const totalCount = countRes.rows.length > 0 ? parseInt(countRes.rows[0].total || countRes.rows[0].count || 0, 10) : 0;

  // Sorting
  let orderClause = 'ORDER BY data_confidence DESC, hospital_name ASC';
  if (sortBy === 'name') {
    orderClause = 'ORDER BY hospital_name ASC';
  }

  let results = [];

  // Proximity search if GPS coordinates supplied
  if (userLat != null && userLng != null && !isNaN(userLat) && !isNaN(userLng)) {
    // Retrieve up to 500 candidates for client radius and distance sorting
    const candidateSql = `SELECT * FROM hospitals ${whereClause} ${orderClause} LIMIT 500`;
    const candRes = await db.query(candidateSql, queryParams);
    
    let enriched = candRes.rows.map(r => {
      const d = calculateDistanceKm(userLat, userLng, r.latitude, r.longitude);
      return { ...r, distance_km: d };
    });

    if (maxDistance) {
      enriched = enriched.filter(r => r.distance_km != null && r.distance_km <= maxDistance);
    }

    if (sortBy === 'distance') {
      enriched.sort((a, b) => (a.distance_km ?? 9999) - (b.distance_km ?? 9999));
    }

    const paged = enriched.slice(offset, offset + limit);
    results = paged.map(r => formatHospitalRecord(r, userLat, userLng));
  } else {
    // Standard pagination via SQL LIMIT & OFFSET
    const pagedParams = [...queryParams];
    pagedParams.push(limit);
    const limitPlaceholder = `$${pagedParams.length}`;
    pagedParams.push(offset);
    const offsetPlaceholder = `$${pagedParams.length}`;

    const dataSql = `SELECT * FROM hospitals ${whereClause} ${orderClause} LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`;
    const dataRes = await db.query(dataSql, pagedParams);
    results = dataRes.rows.map(r => formatHospitalRecord(r, userLat, userLng));
  }

  // Suggest alternatives if 0 results found for a small locality/village
  let suggestedLocations = [];
  if (totalCount === 0 && locQ) {
    try {
      const tokens = locQ.split(/[,\s]+/).map(t => t.trim()).filter(t => t.length >= 3);
      for (const token of tokens) {
        const sRes = await db.query(
          'SELECT DISTINCT district, state FROM hospitals WHERE district ILIKE $1 OR state ILIKE $2 LIMIT 4',
          [`%${token}%`, `%${token}%`]
        );
        sRes.rows.forEach(f => {
          if (!suggestedLocations.some(s => s.district === f.district && s.state === f.state)) {
            suggestedLocations.push(f);
          }
        });
        if (suggestedLocations.length >= 4) break;
      }

      if (suggestedLocations.length === 0 && stateFilter && stateFilter !== 'all') {
        const sRes = await db.query('SELECT DISTINCT district, state FROM hospitals WHERE state ILIKE $1 LIMIT 4', [`%${stateFilter}%`]);
        suggestedLocations = sRes.rows;
      }
    } catch (e) {
      // Non-critical fallback
    }
  }

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit) || 1,
    hasMore: offset + limit < totalCount,
    results,
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
  };
}

/**
 * Retrieve single hospital by numeric ID or string hospital_id
 */
async function getHospitalById(id) {
  if (!id) return null;
  const trimmed = String(id).trim();

  // 1. Try matching hospital_id or source_record_id
  const sql = `
    SELECT * FROM hospitals 
    WHERE hospital_id = $1 
       OR source_record_id = $2
    LIMIT 1
  `;
  let res = await db.query(sql, [trimmed, trimmed]);

  // 2. If not found and input is numeric, match primary key id (or rowid in SQLite)
  if ((!res.rows || res.rows.length === 0) && /^\d+$/.test(trimmed)) {
    const numId = parseInt(trimmed, 10);
    const numSql = db.dbType === 'local_sqlite_fallback'
      ? 'SELECT * FROM hospitals WHERE rowid = $1 LIMIT 1'
      : 'SELECT * FROM hospitals WHERE id = $1 LIMIT 1';
    try {
      res = await db.query(numSql, [numId]);
    } catch (e) {
      // Ignore fallback error
    }
  }

  if (!res.rows || res.rows.length === 0) {
    return null;
  }
  return formatHospitalRecord(res.rows[0]);
}

/**
 * Location Autocomplete for PIN codes, Districts, and States
 */
async function getLocationsAutocomplete(queryStr = '') {
  const q = (queryStr || '').trim();
  if (!q || q.length < 2) {
    return [
      { name: 'Chandigarh', type: 'city', state: 'Chandigarh' },
      { name: 'Mohali (SAS Nagar)', type: 'district', state: 'Punjab' },
      { name: 'Ludhiana', type: 'district', state: 'Punjab' },
      { name: 'New Delhi', type: 'city', state: 'Delhi' },
      { name: 'Pune', type: 'district', state: 'Maharashtra' },
      { name: 'Bengaluru', type: 'district', state: 'Karnataka' },
      { name: 'Hyderabad', type: 'district', state: 'Telangana' },
      { name: 'Jaipur', type: 'district', state: 'Rajasthan' },
      { name: 'Lucknow', type: 'district', state: 'Uttar Pradesh' }
    ];
  }

  // 1. PIN Code lookup
  if (/^\d{2,6}$/.test(q)) {
    const pinRes = await db.query(
      'SELECT DISTINCT pin_code, district, state FROM hospitals WHERE pin_code ILIKE $1 LIMIT 6',
      [`${q}%`]
    );
    return pinRes.rows.map(r => ({
      name: `${r.pin_code} (${r.district}, ${r.state})`,
      pin: r.pin_code,
      district: r.district,
      state: r.state,
      type: 'pincode'
    }));
  }

  // 2. District & State lookup
  const distRes = await db.query(
    'SELECT DISTINCT district, state FROM hospitals WHERE district ILIKE $1 LIMIT 6',
    [`%${q}%`]
  );
  const stateRes = await db.query(
    'SELECT DISTINCT state FROM hospitals WHERE state ILIKE $1 LIMIT 4',
    [`%${q}%`]
  );

  const results = [];
  distRes.rows.forEach(d => results.push({
    name: `${d.district}, ${d.state}`,
    district: d.district,
    state: d.state,
    type: 'district'
  }));

  stateRes.rows.forEach(s => {
    if (!results.some(r => r.state === s.state && r.type === 'state')) {
      results.push({ name: s.state, state: s.state, type: 'state' });
    }
  });

  return results.slice(0, 8);
}

/**
 * Aggregated directory statistics
 */
async function getDirectoryStats() {
  const totalRes = await db.query('SELECT COUNT(*) AS total FROM hospitals');
  const stateRes = await db.query(
    'SELECT state, COUNT(*) as count FROM hospitals GROUP BY state ORDER BY count DESC LIMIT 15'
  );
  const typeRes = await db.query(
    'SELECT facility_type, COUNT(*) as count FROM hospitals GROUP BY facility_type ORDER BY count DESC'
  );
  const ownershipRes = await db.query(
    'SELECT ownership_type, COUNT(*) as count FROM hospitals GROUP BY ownership_type ORDER BY count DESC'
  );
  const verRes = await db.query(
    'SELECT verification_status, COUNT(*) as count FROM hospitals GROUP BY verification_status'
  );

  return {
    totalHospitals: parseInt(totalRes.rows[0]?.total || 0, 10),
    breakdownByState: stateRes.rows,
    breakdownByType: typeRes.rows,
    breakdownByOwnership: ownershipRes.rows,
    breakdownByVerification: verRes.rows,
    lastUpdated: '2026-10-21T09:00:00Z',
    sourceSummary: 'Government of India MoHFW / PM-JAY & State Health Registries'
  };
}

module.exports = {
  searchHospitals,
  getHospitalById,
  getLocationsAutocomplete,
  getDirectoryStats
};
