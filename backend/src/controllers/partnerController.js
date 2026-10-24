/**
 * CareCompass Hospital Partner Controller
 * Handles claim submission, staff authentication, and tenant-isolated appointment management.
 */

const partnerService = require('../services/partnerService');
const authService = require('../services/authService');
const db = require('../db/supabase');

/**
 * POST /api/partner/claim
 * Public endpoint: Submit hospital ownership verification claim
 */
async function submitClaim(req, res, next) {
  try {
    const {
      hospitalId,
      applicantName,
      applicantDesignation,
      officialEmail,
      officialPhone,
      hospitalRegistrationNumber,
      password,
      documents
    } = req.body;

    const result = await partnerService.submitVerificationClaim({
      hospitalId,
      applicantName,
      applicantDesignation,
      officialEmail,
      officialPhone,
      hospitalRegistrationNumber,
      password,
      documents,
      ipAddress: req.ip
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * POST /api/partner/auth/login
 * Public endpoint: Authenticate verified hospital staff
 */
async function staffLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const authResult = await authService.staffLogin(email, password);
    res.json({
      success: true,
      token: authResult.token,
      staff: authResult.staff
    });
  } catch (err) {
    const statusCode = err.message.includes('verification status') ? 403 : 401;
    res.status(statusCode).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * GET /api/partner/profile
 * Protected (requireStaffAuth)
 */
async function getProfile(req, res, next) {
  try {
    const provRes = await db.query(
      'SELECT * FROM appointment_providers WHERE hospital_id = $1 LIMIT 1',
      [req.staff.hospitalId]
    );

    res.json({
      success: true,
      staff: req.staff,
      provider: provRes.rows[0] || null
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/partner/appointments
 * Protected (requireStaffAuth): Strictly tenant-isolated by req.staff.hospitalId
 */
async function getAppointments(req, res, next) {
  try {
    const { status, limit, offset } = req.query;
    const result = await partnerService.getHospitalInquiries(req.staff.hospitalId, {
      status,
      limit,
      offset
    });
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/partner/appointments/:ref/accept
 * Protected (requireStaffAuth): Strictly tenant-isolated
 */
async function acceptAppointment(req, res, next) {
  try {
    const { ref } = req.params;
    const result = await partnerService.acceptInquiry({
      bookingReference: ref,
      hospitalId: req.staff.hospitalId,
      staffId: req.staff.id,
      ipAddress: req.ip
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
 * POST /api/partner/appointments/:ref/reject
 * Protected (requireStaffAuth): Strictly tenant-isolated
 */
async function rejectAppointment(req, res, next) {
  try {
    const { ref } = req.params;
    const { reason } = req.body;
    const result = await partnerService.rejectInquiry({
      bookingReference: ref,
      hospitalId: req.staff.hospitalId,
      staffId: req.staff.id,
      reason,
      ipAddress: req.ip
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
 * POST /api/partner/appointments/:ref/reschedule
 * Protected (requireStaffAuth): Strictly tenant-isolated
 */
async function rescheduleAppointment(req, res, next) {
  try {
    const { ref } = req.params;
    const { proposedDate, proposedTime, notes } = req.body;
    const result = await partnerService.rescheduleInquiry({
      bookingReference: ref,
      hospitalId: req.staff.hospitalId,
      staffId: req.staff.id,
      proposedDate,
      proposedTime,
      notes,
      ipAddress: req.ip
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
 * POST /api/partner/scheduling/activate
 * Protected (requireStaffAuth): Explicit direct booking activation (Requirement 3)
 */
async function activateScheduling(req, res, next) {
  try {
    const { consultationFee, departments } = req.body;
    const result = await partnerService.activateHospitalDirectBooking({
      hospitalId: req.staff.hospitalId,
      consultationFee,
      departments,
      staffId: req.staff.id,
      ipAddress: req.ip
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
  submitClaim,
  staffLogin,
  getProfile,
  getAppointments,
  acceptAppointment,
  rejectAppointment,
  rescheduleAppointment,
  activateScheduling
};
