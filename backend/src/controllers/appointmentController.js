/**
 * CareCompass — Appointment API Controller
 * Express controller handling appointment booking, slot queries,
 * appointment requests, and "Pay at Hospital" workflow.
 * (Zero external payment gateway credentials required).
 */

const appointmentService = require('../services/appointmentService');

/**
 * GET /api/appointments/config
 * Returns public payment configuration (paymentMode: 'pay_at_hospital')
 */
function getConfig(req, res) {
  try {
    const config = appointmentService.getPublicConfig();
    res.json({
      success: true,
      config
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve appointment configuration.'
    });
  }
}

/**
 * GET /api/appointments/provider/:hospitalId
 * Check if hospital is an authorized partner and get departments & fee structure
 */
async function getProvider(req, res, next) {
  try {
    const { hospitalId } = req.params;
    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required hospitalId parameter.'
      });
    }

    const result = await appointmentService.getProviderInfo(hospitalId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/appointments/slots
 * Query available consultation slots for a specific hospital, department, and date
 */
async function getSlots(req, res, next) {
  try {
    const { hospitalId, departmentId, date } = req.query;

    if (!hospitalId || !departmentId || !date) {
      return res.status(400).json({
        success: false,
        error: 'Please provide hospitalId, departmentId, and date (YYYY-MM-DD).'
      });
    }

    const slots = await appointmentService.getAvailableSlots(hospitalId, departmentId, date);
    res.json({
      success: true,
      hospitalId,
      departmentId,
      date,
      totalSlots: slots.length,
      availableCount: slots.filter(s => s.isAvailable).length,
      slots
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/appointments/reserve
 * Temporarily hold a slot for 10 minutes to prevent double booking
 */
async function reserveSlot(req, res, next) {
  try {
    const { slotId, sessionId } = req.body;
    if (!slotId || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required slotId or sessionId.'
      });
    }

    const slot = await appointmentService.reserveSlot(slotId, sessionId);
    res.json({
      success: true,
      message: 'Slot temporarily reserved for 10 minutes.',
      slot: {
        id: slot.id,
        hospitalId: slot.hospital_id,
        departmentId: slot.department_id,
        date: slot.slot_date,
        startTime: slot.start_time,
        expiresAt: slot.reservation_expires_at
      }
    });
  } catch (err) {
    res.status(409).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * POST /api/appointments/book
 * Direct booking for authorized partner hospitals with Pay at Hospital workflow.
 * Confirmed by CareCompass Authorized Hospital Scheduling System upon successful reservation.
 */
async function bookAppointment(req, res, next) {
  try {
    const {
      slotId,
      sessionId,
      patientName,
      patientPhone,
      patientEmail,
      notes
    } = req.body;

    if (!slotId || !sessionId || !patientName || !patientPhone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide slotId, sessionId, patientName, and patientPhone.'
      });
    }

    const bookingResult = await appointmentService.createDirectBooking({
      slotId,
      sessionId,
      patientName,
      patientPhone,
      patientEmail,
      notes
    });

    res.json(bookingResult);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * POST /api/appointments/request
 * Submit an Appointment Request for hospitals without automated slot booking.
 * Status is set to 'pending_confirmation' until hospital scheduling confirms.
 */
async function requestAppointment(req, res, next) {
  try {
    const {
      hospitalId,
      departmentId,
      departmentName,
      preferredDate,
      preferredTime,
      patientName,
      patientPhone,
      patientEmail,
      notes
    } = req.body;

    if (!hospitalId || !patientName || !patientPhone || !preferredDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide hospitalId, patientName, patientPhone, and preferredDate.'
      });
    }

    const requestResult = await appointmentService.createAppointmentRequest({
      hospitalId,
      departmentId,
      departmentName,
      preferredDate,
      preferredTime,
      patientName,
      patientPhone,
      patientEmail,
      notes
    });

    res.json(requestResult);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * POST /api/appointments/lookup
 * Securely retrieve booking details by Reference + Phone
 */
async function lookupAppointment(req, res, next) {
  try {
    const { reference, phone } = req.body;
    if (!reference || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both Booking Reference and registered Mobile Number.'
      });
    }

    const details = await appointmentService.lookupAppointment({ reference, phone });
    res.json({
      success: true,
      appointment: details
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * POST /api/appointments/cancel
 * Cancel booking safely without requiring payment gateway refunds
 */
async function cancelAppointment(req, res, next) {
  try {
    const { reference, phone, reason } = req.body;
    if (!reference || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both Booking Reference and registered Mobile Number.'
      });
    }

    const result = await appointmentService.cancelAppointment({
      reference,
      phone,
      reason
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

module.exports = {
  getConfig,
  getProvider,
  getSlots,
  reserveSlot,
  bookAppointment,
  requestAppointment,
  lookupAppointment,
  cancelAppointment
};
