/**
 * CareCompass Hospital Directory Routes
 */

const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');

// Search endpoint: GET /api/hospitals/search?location=Kharar
router.get('/search', hospitalController.searchHospitals);

// Master list & query endpoint: GET /api/hospitals
router.get('/', hospitalController.getHospitals);

// Single hospital lookup: GET /api/hospitals/:id
router.get('/:id', hospitalController.getHospitalById);

module.exports = router;
