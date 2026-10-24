/**
 * CareCompass — Appointments and Scheduling Routes
 * Pay at Hospital workflow without external online payment gateway.
 */

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { lookupLimiter } = require('../middleware/rateLimiter');

// Appointment Configuration (Pay at Hospital mode, policies)
router.get('/config', appointmentController.getConfig);

// Provider Information & Department Catalog
router.get('/provider/:hospitalId', appointmentController.getProvider);

// Available Consultation Slots
router.get('/slots', appointmentController.getSlots);

// Temporary Slot Hold / Reservation (Double-booking prevention)
router.post('/reserve', appointmentController.reserveSlot);

// Direct Booking for Partner Hospitals (Confirmed by Authorized Scheduling System, Pay at Hospital)
router.post('/book', appointmentController.bookAppointment);

// Appointment Request for Non-Partner Hospitals (Pending Confirmation, Pay at Hospital)
router.post('/request', appointmentController.requestAppointment);

// Secure Patient Appointment Lookup (Reference + Phone, rate limited)
router.post('/lookup', lookupLimiter, appointmentController.lookupAppointment);

// Cancellation Request (rate limited)
router.post('/cancel', lookupLimiter, appointmentController.cancelAppointment);

// Patient Reschedule Acceptance / Decline (rate limited)
router.post('/:ref/reschedule/accept', lookupLimiter, appointmentController.acceptReschedule);
router.post('/:ref/reschedule/decline', lookupLimiter, appointmentController.declineReschedule);

module.exports = router;
