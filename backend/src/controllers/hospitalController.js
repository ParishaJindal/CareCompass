/**
 * CareCompass Hospital Controller
 * Validates inputs, handles HTTP requests/responses, and formats errors safely.
 */

const hospitalService = require('../services/hospitalService');

/**
 * GET /api/hospitals
 * Master hospital search and filtering endpoint
 */
async function getHospitals(req, res, next) {
  try {
    const params = req.query;
    const data = await hospitalService.searchHospitals(params);
    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/hospitals/search
 * Dedicated location/keyword search endpoint
 * Example: /api/hospitals/search?location=Kharar
 * Example: /api/hospitals/search?location=140301
 */
async function searchHospitals(req, res, next) {
  try {
    const params = {
      ...req.query,
      location: req.query.location || req.query.q || req.query.query || ''
    };
    const data = await hospitalService.searchHospitals(params);
    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/hospitals/:id
 * Single hospital lookup by ID or slug
 */
async function getHospitalById(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || id.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Hospital ID is required.'
      });
    }

    const hospital = await hospitalService.getHospitalById(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: `Hospital with identifier '${id}' was not found.`
      });
    }

    res.json({
      success: true,
      hospital
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/locations
 * Location autocomplete endpoint
 */
async function getLocations(req, res, next) {
  try {
    const query = req.query.q || '';
    const results = await hospitalService.getLocationsAutocomplete(query);
    res.json({
      success: true,
      results
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/stats
 * Aggregate directory statistics
 */
async function getStats(req, res, next) {
  try {
    const stats = await hospitalService.getDirectoryStats();
    res.json({
      success: true,
      ...stats
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getHospitals,
  searchHospitals,
  getHospitalById,
  getLocations,
  getStats
};
