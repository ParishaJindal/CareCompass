/**
 * CareCompass — Appointment & Payment API Controller
 * Express controller handling appointment booking, slot queries,
 * Razorpay order creation, payment signature verification, and cancellations.
 */

const appointmentService = require('../services/appointmentService');
const razorpayService = require('../services/razorpayService');

/**
 * GET /api/appointments/config
 * Returns public payment configuration (key ID, mode, currency)
 */
function getConfig(req, res) {
  try {
    const config = razorpayService.getPublicConfig();
    res.json({
      success: true,
      config
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve payment configuration.'
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
 * POST /api/appointments/create-order
 * Create temporary reservation, calculate authorized fee, and generate Razorpay payment order
 */
async function createOrder(req, res, next) {
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

    const orderData = await appointmentService.createBookingAndOrder({
      slotId,
      sessionId,
      patientName,
      patientPhone,
      patientEmail,
      notes
    });

    res.json({
      success: true,
      ...orderData
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * POST /api/appointments/verify-payment
 * Verify cryptographic Razorpay signature and confirm appointment
 */
async function verifyPayment(req, res, next) {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing orderId or paymentId.'
      });
    }

    const confirmation = await appointmentService.verifyPaymentAndConfirm({
      orderId,
      paymentId,
      signature
    });

    res.json(confirmation);
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
 * Cancel booking and initiate refund if eligible
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

/**
 * POST /api/appointments/webhook
 * Razorpay asynchronous webhook for reconciliation
 */
async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = JSON.stringify(req.body);

    const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    console.log(`[Razorpay Webhook] Received event: ${event}`);

    // If payment captured event received asynchronously
    if (event === 'payment.captured' && req.body.payload?.payment?.entity) {
      const entity = req.body.payload.payment.entity;
      const orderId = entity.order_id;
      const paymentId = entity.id;

      if (orderId && paymentId) {
        try {
          await appointmentService.verifyPaymentAndConfirm({
            orderId,
            paymentId,
            signature: 'webhook_verified'
          });
          console.log(`[Razorpay Webhook] Asynchronously confirmed appointment for order: ${orderId}`);
        } catch (e) {
          // May already be confirmed
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('[Razorpay Webhook Error]:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
}

module.exports = {
  getConfig,
  getProvider,
  getSlots,
  reserveSlot,
  createOrder,
  verifyPayment,
  lookupAppointment,
  cancelAppointment,
  handleWebhook
};
