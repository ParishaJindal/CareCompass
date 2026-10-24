/**
 * CareCompass Hospital Partner Routes
 * Multi-tenant hospital staff portal endpoints with tenant isolation.
 */

const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { requireStaffAuth } = require('../middleware/authMiddleware');
const { lookupLimiter } = require('../middleware/rateLimiter');

// Public endpoints (rate limited)
router.post('/claim', lookupLimiter, partnerController.submitClaim);
router.post('/auth/login', lookupLimiter, partnerController.staffLogin);

// Protected staff endpoints (Zero-trust tenant isolation)
router.get('/profile', requireStaffAuth, partnerController.getProfile);
router.get('/appointments', requireStaffAuth, partnerController.getAppointments);
router.post('/appointments/:ref/accept', requireStaffAuth, partnerController.acceptAppointment);
router.post('/appointments/:ref/reject', requireStaffAuth, partnerController.rejectAppointment);
router.post('/appointments/:ref/reschedule', requireStaffAuth, partnerController.rescheduleAppointment);
router.post('/scheduling/activate', requireStaffAuth, partnerController.activateScheduling);

module.exports = router;
