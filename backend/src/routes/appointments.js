/**
 * CareCompass — Appointments and Razorpay Payment Routes
 */

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Gateway Configuration (Public key ID and policies)
router.get('/config', appointmentController.getConfig);

// Provider Information & Department Catalog
router.get('/provider/:hospitalId', appointmentController.getProvider);

// Available Consultation Slots
router.get('/slots', appointmentController.getSlots);

// Temporary Slot Hold / Reservation (Double-booking prevention)
router.post('/reserve', appointmentController.reserveSlot);

// Create Booking & Razorpay Payment Order
router.post('/create-order', appointmentController.createOrder);

// Verify Razorpay Payment Signature & Confirm Booking
router.post('/verify-payment', appointmentController.verifyPayment);

// Secure Patient Appointment Lookup (Reference + Phone)
router.post('/lookup', appointmentController.lookupAppointment);

// Cancellation & Refund Request
router.post('/cancel', appointmentController.cancelAppointment);

// Razorpay Webhook Endpoint
router.post('/webhook', appointmentController.handleWebhook);

module.exports = router;
