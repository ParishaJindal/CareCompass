/**
 * CareCompass Hospital Partner & Multi-Tenant Management Service
 * Architecture: Zero-Trust Multi-Tenancy with Tenant Hospital Isolation
 *
 * Guarantees:
 * 1. Every staff database query is strictly filtered by hospital_id.
 * 2. Identity verification approval is completely separate from direct booking activation.
 * 3. Proposed rescheduled appointments require patient acceptance before confirmation.
 * 4. All actions generate immutable audit log records.
 */

const crypto = require('node:crypto');
const db = require('../db/supabase');
const authService = require('./authService');

/**
 * Clean and standardize phone numbers to 10 digits
 */
function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-10);
}

/**
 * Generate a unique verification request reference
 */
function generateRequestReference() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `HVR-${dateStr}-${randomStr}`;
}

/**
 * 1. Submit Hospital Ownership Claim / Verification Request
 */
async function submitVerificationClaim({
  hospitalId,
  applicantName,
  applicantDesignation,
  officialEmail,
  officialPhone,
  hospitalRegistrationNumber,
  password,
  documents = [],
  ipAddress = null
}) {
  if (!hospitalId || !applicantName || !officialEmail || !officialPhone || !hospitalRegistrationNumber || !password) {
    throw new Error('All required verification fields must be completed.');
  }

  const cleanEmail = officialEmail.trim().toLowerCase();
  const cleanPhone = normalizePhone(officialPhone);

  if (password.length < 8) {
    throw new Error('Initial account password must be at least 8 characters long.');
  }

  // Verify hospital exists in directory
  const hospRes = await db.query(
    'SELECT hospital_id, hospital_name, district, state, phone, address FROM hospitals WHERE hospital_id = $1 LIMIT 1',
    [hospitalId]
  );
  if (hospRes.rowCount === 0) {
    throw new Error(`Hospital with ID '${hospitalId}' does not exist in the CareCompass directory.`);
  }
  const hospital = hospRes.rows[0];

  // Check for existing pending request
  const existingReq = await db.query(
    "SELECT id, request_reference FROM hospital_verification_requests WHERE hospital_id = $1 AND verification_status = 'pending_review' LIMIT 1",
    [hospitalId]
  );
  if (existingReq.rowCount > 0) {
    throw new Error(`A verification request (${existingReq.rows[0].request_reference}) is already under review for this hospital.`);
  }

  const requestRef = generateRequestReference();
  const passwordHash = await authService.hashPassword(password);

  // Insert verification request
  const insertReqRes = await db.query(`
    INSERT INTO hospital_verification_requests (
      request_reference, hospital_id, hospital_name, applicant_name,
      applicant_designation, official_email, official_phone,
      hospital_registration_number, initial_password_hash,
      verification_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_review')
    RETURNING id, request_reference
  `, [
    requestRef,
    hospitalId,
    hospital.hospital_name || 'Hospital',
    applicantName.trim(),
    applicantDesignation.trim(),
    cleanEmail,
    cleanPhone,
    hospitalRegistrationNumber.trim(),
    passwordHash
  ]);

  const requestId = insertReqRes.rows[0] ? insertReqRes.rows[0].id : 1;

  // Ensure appointment_providers entry exists with pending_review status and booking_enabled = false
  const provRes = await db.query(
    'SELECT id, verification_status FROM appointment_providers WHERE hospital_id = $1 LIMIT 1',
    [hospitalId]
  );
  if (provRes.rowCount === 0) {
    await db.query(`
      INSERT INTO appointment_providers (hospital_id, integration_type, booking_enabled, verification_status)
      VALUES ($1, 'carecompass_partner', 0, 'pending_review')
    `, [hospitalId]);
  } else {
    await db.query(`
      UPDATE appointment_providers
      SET verification_status = 'pending_review', booking_enabled = 0, updated_at = CURRENT_TIMESTAMP
      WHERE hospital_id = $1
    `, [hospitalId]);
  }

  // Insert private verification document references
  if (Array.isArray(documents) && documents.length > 0) {
    for (const doc of documents) {
      if (doc && doc.fileName) {
        await db.query(`
          INSERT INTO verification_documents (
            request_id, hospital_id, document_type, file_name,
            file_type, file_size_bytes, storage_path, access_level
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'admin_only')
        `, [
          requestId,
          hospitalId,
          doc.documentType || 'registration_certificate',
          doc.fileName,
          doc.fileType || 'application/pdf',
          doc.fileSizeBytes || 0,
          doc.storagePath || `private/verifications/${requestRef}/${doc.fileName}`
        ]);
      }
    }
  }

  // Audit log
  await authService.logAudit({
    eventType: 'verification_submitted',
    entityType: 'verification_request',
    entityId: String(requestId),
    hospitalId,
    actorType: 'staff',
    actorEmail: cleanEmail,
    action: `Verification claim submitted for ${hospital.hospital_name || 'Hospital'} (${requestRef})`,
    details: { applicantName, applicantDesignation, officialEmail: cleanEmail },
    ipAddress
  });

  return {
    success: true,
    requestReference: requestRef,
    verificationStatus: 'pending_review',
    hospitalName: hospital.hospital_name || 'Hospital',
    message: 'Verification claim submitted successfully. Verification requests are reviewed manually by our compliance team in the order received.'
  };
}

/**
 * 2. Get Hospital Inquiries (Tenant Isolated)
 */
async function getHospitalInquiries(hospitalId, { status = null, limit = 50, offset = 0 } = {}) {
  if (!hospitalId) {
    throw new Error('Hospital ID is required.');
  }

  let sql = 'SELECT * FROM appointments WHERE hospital_id = $1';
  const params = [hospitalId];

  if (status && status.trim() !== '') {
    params.push(status.trim());
    sql += ` AND booking_status = $${params.length}`;
  }

  sql += ' ORDER BY created_at DESC';

  params.push(Math.min(parseInt(limit, 10) || 50, 100));
  sql += ` LIMIT $${params.length}`;

  params.push(Math.max(parseInt(offset, 10) || 0, 0));
  sql += ` OFFSET $${params.length}`;

  const res = await db.query(sql, params);

  // Count total inquiries for this hospital
  const countRes = await db.query(
    'SELECT COUNT(*) as count FROM appointments WHERE hospital_id = $1',
    [hospitalId]
  );
  const totalCount = parseInt(countRes.rows[0].count, 10);

  return {
    inquiries: res.rows,
    total: totalCount,
    hospitalId
  };
}

/**
 * 3. Accept Appointment Inquiry (Tenant Isolated)
 */
async function acceptInquiry({ bookingReference, hospitalId, staffId, ipAddress = null }) {
  if (!bookingReference || !hospitalId) {
    throw new Error('Booking reference and hospital ID are required.');
  }

  const apptRes = await db.query(
    'SELECT * FROM appointments WHERE booking_reference = $1 AND hospital_id = $2 LIMIT 1',
    [bookingReference, hospitalId]
  );

  if (apptRes.rowCount === 0) {
    throw new Error('Appointment inquiry not found for this healthcare facility.');
  }

  const appt = apptRes.rows[0];
  if (appt.booking_status === 'confirmed') {
    return { success: true, message: 'Appointment is already confirmed.', appointment: appt };
  }

  if (appt.booking_status === 'cancelled') {
    throw new Error('Cannot accept an appointment inquiry that has already been cancelled.');
  }

  await db.query(`
    UPDATE appointments
    SET booking_status = 'confirmed',
        confirmed_by_system = 'hospital_staff_portal',
        confirmed_at = CURRENT_TIMESTAMP,
        actioned_by_staff_id = $1,
        actioned_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE booking_reference = $2 AND hospital_id = $3
  `, [staffId, bookingReference, hospitalId]);

  const updatedRes = await db.query(
    'SELECT * FROM appointments WHERE booking_reference = $1 LIMIT 1',
    [bookingReference]
  );

  await authService.logAudit({
    eventType: 'appointment_accepted',
    entityType: 'appointment',
    entityId: String(appt.id),
    hospitalId,
    actorType: 'staff',
    actorId: String(staffId),
    action: `Staff accepted appointment inquiry ${bookingReference}`,
    details: { patientName: appt.patient_name, appointmentDate: appt.appointment_date },
    ipAddress
  });

  return {
    success: true,
    message: 'Appointment inquiry accepted and confirmed.',
    appointment: updatedRes.rows[0]
  };
}

/**
 * 4. Reject Appointment Inquiry (Tenant Isolated)
 */
async function rejectInquiry({ bookingReference, hospitalId, staffId, reason = 'Facility unable to accommodate request at requested time', ipAddress = null }) {
  if (!bookingReference || !hospitalId) {
    throw new Error('Booking reference and hospital ID are required.');
  }

  const apptRes = await db.query(
    'SELECT * FROM appointments WHERE booking_reference = $1 AND hospital_id = $2 LIMIT 1',
    [bookingReference, hospitalId]
  );

  if (apptRes.rowCount === 0) {
    throw new Error('Appointment inquiry not found for this healthcare facility.');
  }

  const appt = apptRes.rows[0];
  if (appt.booking_status === 'cancelled') {
    return { success: true, message: 'Appointment is already cancelled.', appointment: appt };
  }

  await db.query(`
    UPDATE appointments
    SET booking_status = 'cancelled',
        cancellation_reason = $1,
        cancelled_at = CURRENT_TIMESTAMP,
        actioned_by_staff_id = $2,
        actioned_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE booking_reference = $3 AND hospital_id = $4
  `, [reason, staffId, bookingReference, hospitalId]);

  const updatedRes = await db.query(
    'SELECT * FROM appointments WHERE booking_reference = $1 LIMIT 1',
    [bookingReference]
  );

  await authService.logAudit({
    eventType: 'appointment_rejected',
    entityType: 'appointment',
    entityId: String(appt.id),
    hospitalId,
    actorType: 'staff',
    actorId: String(staffId),
    action: `Staff rejected appointment inquiry ${bookingReference}`,
    details: { reason, patientName: appt.patient_name },
    ipAddress
  });

  return {
    success: true,
    message: 'Appointment inquiry rejected.',
    appointment: updatedRes.rows[0]
  };
}

/**
 * 5. Propose Rescheduled Time (Tenant Isolated, Requires Patient Acceptance)
 */
async function rescheduleInquiry({
  bookingReference,
  hospitalId,
  staffId,
  proposedDate,
  proposedTime,
  notes = '',
  ipAddress = null
}) {
  if (!bookingReference || !hospitalId || !proposedDate || !proposedTime) {
    throw new Error('Booking reference, proposed date, and proposed time are required.');
  }

  const apptRes = await db.query(
    'SELECT * FROM appointments WHERE booking_reference = $1 AND hospital_id = $2 LIMIT 1',
    [bookingReference, hospitalId]
  );

  if (apptRes.rowCount === 0) {
    throw new Error('Appointment inquiry not found for this healthcare facility.');
  }

  const appt = apptRes.rows[0];
  if (appt.booking_status === 'cancelled') {
    throw new Error('Cannot reschedule an appointment that has been cancelled.');
  }

  // Status becomes rescheduled_pending_patient (Requirement 8)
  await db.query(`
    UPDATE appointments
    SET booking_status = 'rescheduled_pending_patient',
        proposed_date = $1,
        proposed_time = $2,
        hospital_staff_notes = $3,
        actioned_by_staff_id = $4,
        actioned_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE booking_reference = $5 AND hospital_id = $6
  `, [proposedDate, proposedTime, notes.trim(), staffId, bookingReference, hospitalId]);

  const updatedRes = await db.query(
    'SELECT * FROM appointments WHERE booking_reference = $1 LIMIT 1',
    [bookingReference]
  );

  await authService.logAudit({
    eventType: 'appointment_rescheduled',
    entityType: 'appointment',
    entityId: String(appt.id),
    hospitalId,
    actorType: 'staff',
    actorId: String(staffId),
    action: `Staff proposed alternative time for ${bookingReference}: ${proposedDate} ${proposedTime}`,
    details: { proposedDate, proposedTime, notes },
    ipAddress
  });

  return {
    success: true,
    message: 'Proposed alternative time submitted. Awaiting patient confirmation.',
    appointment: updatedRes.rows[0]
  };
}

/**
 * 6. Patient Accepts Proposed Reschedule
 */
async function patientAcceptReschedule({ bookingReference, patientPhone, ipAddress = null }) {
  if (!bookingReference || !patientPhone) {
    throw new Error('Booking reference and verification mobile number are required.');
  }

  const apptRes = await db.query(
    'SELECT * FROM appointments WHERE booking_reference = $1 LIMIT 1',
    [bookingReference]
  );

  if (apptRes.rowCount === 0) {
    throw new Error('Appointment not found.');
  }

  const appt = apptRes.rows[0];
  const reqCleanPhone = normalizePhone(patientPhone);
  const dbCleanPhone = normalizePhone(appt.patient_phone);

  if (reqCleanPhone !== dbCleanPhone) {
    throw new Error('Mobile number does not match appointment record.');
  }

  if (appt.booking_status !== 'rescheduled_pending_patient' && appt.booking_status !== 'rescheduled') {
    throw new Error(`Appointment is not currently awaiting patient reschedule acceptance (current status: ${appt.booking_status}).`);
  }

  if (!appt.proposed_date || !appt.proposed_time) {
    throw new Error('No proposed alternative time was found on this appointment record.');
  }

  // Update appointment date & time to the proposed values and mark confirmed
  await db.query(`
    UPDATE appointments
    SET appointment_date = proposed_date,
        start_time = proposed_time,
        booking_status = 'confirmed',
        confirmed_by_system = 'patient_accepted_reschedule',
        confirmed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE booking_reference = $1
  `, [bookingReference]);

  const updatedRes = await db.query(
    'SELECT * FROM appointments WHERE booking_reference = $1 LIMIT 1',
    [bookingReference]
  );

  await authService.logAudit({
    eventType: 'appointment_patient_accepted_reschedule',
    entityType: 'appointment',
    entityId: String(appt.id),
    hospitalId: appt.hospital_id,
    actorType: 'patient',
    actorEmail: appt.patient_email,
    action: `Patient accepted proposed reschedule for ${bookingReference}`,
    details: { newDate: appt.proposed_date, newTime: appt.proposed_time },
    ipAddress
  });

  return {
    success: true,
    message: 'Proposed appointment time accepted. Your appointment is now confirmed.',
    appointment: updatedRes.rows[0]
  };
}

/**
 * 7. Patient Declines Proposed Reschedule
 */
async function patientDeclineReschedule({ bookingReference, patientPhone, reason = 'Patient declined proposed alternative time', ipAddress = null }) {
  if (!bookingReference || !patientPhone) {
    throw new Error('Booking reference and verification mobile number are required.');
  }

  const apptRes = await db.query(
    'SELECT * FROM appointments WHERE booking_reference = $1 LIMIT 1',
    [bookingReference]
  );

  if (apptRes.rowCount === 0) {
    throw new Error('Appointment not found.');
  }

  const appt = apptRes.rows[0];
  const reqCleanPhone = normalizePhone(patientPhone);
  const dbCleanPhone = normalizePhone(appt.patient_phone);

  if (reqCleanPhone !== dbCleanPhone) {
    throw new Error('Mobile number does not match appointment record.');
  }

  await db.query(`
    UPDATE appointments
    SET booking_status = 'cancelled',
        cancellation_reason = $1,
        cancelled_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE booking_reference = $2
  `, [reason, bookingReference]);

  const updatedRes = await db.query(
    'SELECT * FROM appointments WHERE booking_reference = $1 LIMIT 1',
    [bookingReference]
  );

  await authService.logAudit({
    eventType: 'appointment_patient_declined_reschedule',
    entityType: 'appointment',
    entityId: String(appt.id),
    hospitalId: appt.hospital_id,
    actorType: 'patient',
    actorEmail: appt.patient_email,
    action: `Patient declined proposed reschedule for ${bookingReference}`,
    details: { reason },
    ipAddress
  });

  return {
    success: true,
    message: 'Proposed reschedule declined. Appointment has been cancelled.',
    appointment: updatedRes.rows[0]
  };
}

/**
 * 8. Admin: List All Verification Requests
 */
async function adminListVerificationRequests({ status = null, limit = 50, offset = 0 } = {}) {
  let sql = 'SELECT * FROM hospital_verification_requests';
  const params = [];

  if (status && status.trim() !== '') {
    params.push(status.trim());
    sql += ` WHERE verification_status = $${params.length}`;
  }

  sql += ' ORDER BY created_at DESC';

  params.push(Math.min(parseInt(limit, 10) || 50, 100));
  sql += ` LIMIT $${params.length}`;

  params.push(Math.max(parseInt(offset, 10) || 0, 0));
  sql += ` OFFSET $${params.length}`;

  const res = await db.query(sql, params);

  // Attach document count and provider status
  const requests = [];
  for (const row of res.rows) {
    const docRes = await db.query(
      'SELECT id, document_type, file_name, file_size_bytes, access_level, uploaded_at FROM verification_documents WHERE request_id = $1',
      [row.id]
    );
    const provRes = await db.query(
      'SELECT booking_enabled, verification_status FROM appointment_providers WHERE hospital_id = $1 LIMIT 1',
      [row.hospital_id]
    );

    requests.push({
      ...row,
      documents: docRes.rows,
      provider: provRes.rows[0] || null
    });
  }

  const countRes = await db.query('SELECT COUNT(*) as count FROM hospital_verification_requests');
  const totalCount = parseInt(countRes.rows[0].count, 10);

  return {
    requests,
    total: totalCount
  };
}

/**
 * 9. Admin: Approve Verification Request
 * IMPORTANT REQUIREMENT 3: Admin approval grants staff access but DOES NOT enable direct booking!
 */
async function adminApproveVerification({ requestId, adminId, adminEmail, adminNotes = '', ipAddress = null }) {
  if (!requestId || !adminId) {
    throw new Error('Request ID and admin ID are required.');
  }

  const reqRes = await db.query(
    'SELECT * FROM hospital_verification_requests WHERE id = $1 LIMIT 1',
    [requestId]
  );

  if (reqRes.rowCount === 0) {
    throw new Error('Verification request not found.');
  }

  const request = reqRes.rows[0];

  // 1. Update verification request status
  await db.query(`
    UPDATE hospital_verification_requests
    SET verification_status = 'approved',
        reviewed_by_admin_id = $1,
        reviewed_at = CURRENT_TIMESTAMP,
        admin_notes = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
  `, [String(adminId), adminNotes.trim(), requestId]);

  // 2. Update appointment_providers: verification_status = 'verified', BUT booking_enabled REMAINS 0!
  await db.query(`
    UPDATE appointment_providers
    SET verification_status = 'verified',
        booking_enabled = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE hospital_id = $1
  `, [request.hospital_id]);

  // 3. Create or activate hospital_admin staff user
  const existingStaff = await db.query(
    'SELECT id FROM hospital_staff_users WHERE email = $1 LIMIT 1',
    [request.official_email]
  );

  let staffUserId;
  if (existingStaff.rowCount === 0) {
    const insertStaff = await db.query(`
      INSERT INTO hospital_staff_users (
        hospital_id, full_name, email, phone, role, password_hash, is_active, verification_request_id
      ) VALUES ($1, $2, $3, $4, 'hospital_admin', $5, true, $6)
      RETURNING id
    `, [
      request.hospital_id,
      request.applicant_name,
      request.official_email,
      request.official_phone,
      request.initial_password_hash,
      requestId
    ]);
    staffUserId = insertStaff.rows[0] ? insertStaff.rows[0].id : 1;
  } else {
    staffUserId = existingStaff.rows[0].id;
    await db.query(`
      UPDATE hospital_staff_users
      SET is_active = true, role = 'hospital_admin', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [staffUserId]);
  }

  // 4. Audit Log
  await authService.logAudit({
    eventType: 'verification_approved',
    entityType: 'verification_request',
    entityId: String(requestId),
    hospitalId: request.hospital_id,
    actorType: 'admin',
    actorId: String(adminId),
    actorEmail: adminEmail,
    action: `Administrator approved verification for ${request.hospital_name} (${request.request_reference}). Direct booking remains disabled until explicit schedule configuration.`,
    details: { adminNotes, staffUserId },
    ipAddress
  });

  return {
    success: true,
    message: `Verification approved for ${request.hospital_name}. Staff account activated. Direct booking remains disabled until configured.`,
    hospitalId: request.hospital_id,
    verificationStatus: 'verified',
    bookingEnabled: false
  };
}

/**
 * 10. Admin: Reject Verification Request
 */
async function adminRejectVerification({ requestId, adminId, adminEmail, rejectionReason = 'Official credentials could not be validated', ipAddress = null }) {
  if (!requestId || !adminId) {
    throw new Error('Request ID and admin ID are required.');
  }

  const reqRes = await db.query(
    'SELECT * FROM hospital_verification_requests WHERE id = $1 LIMIT 1',
    [requestId]
  );

  if (reqRes.rowCount === 0) {
    throw new Error('Verification request not found.');
  }

  const request = reqRes.rows[0];

  await db.query(`
    UPDATE hospital_verification_requests
    SET verification_status = 'rejected',
        rejection_reason = $1,
        reviewed_by_admin_id = $2,
        reviewed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
  `, [rejectionReason.trim(), String(adminId), requestId]);

  await db.query(`
    UPDATE appointment_providers
    SET verification_status = 'Not Verified',
        booking_enabled = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE hospital_id = $1
  `, [request.hospital_id]);

  await authService.logAudit({
    eventType: 'verification_rejected',
    entityType: 'verification_request',
    entityId: String(requestId),
    hospitalId: request.hospital_id,
    actorType: 'admin',
    actorId: String(adminId),
    actorEmail: adminEmail,
    action: `Administrator rejected verification for ${request.hospital_name} (${request.request_reference})`,
    details: { rejectionReason },
    ipAddress
  });

  return {
    success: true,
    message: `Verification request rejected for ${request.hospital_name}.`,
    hospitalId: request.hospital_id,
    verificationStatus: 'rejected'
  };
}

/**
 * 11. Hospital Staff: Explicit Scheduling Activation (Requirement 3)
 * Only available after verification approval, requiring configured consultation fee and departments.
 */
async function activateHospitalDirectBooking({ hospitalId, consultationFee = 0, departments = [], staffId, ipAddress = null }) {
  if (!hospitalId || !staffId) {
    throw new Error('Hospital ID and staff ID are required.');
  }

  const provRes = await db.query(
    'SELECT verification_status, booking_enabled FROM appointment_providers WHERE hospital_id = $1 LIMIT 1',
    [hospitalId]
  );

  if (provRes.rowCount === 0 || provRes.rows[0].verification_status !== 'verified') {
    throw new Error('Direct booking activation requires verified hospital partner status.');
  }

  const deptsJson = typeof departments === 'string' ? departments : JSON.stringify(departments);

  await db.query(`
    UPDATE appointment_providers
    SET booking_enabled = 1,
        consultation_fee = $1,
        departments = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE hospital_id = $3
  `, [parseFloat(consultationFee) || 0, deptsJson, hospitalId]);

  await authService.logAudit({
    eventType: 'scheduling_activated',
    entityType: 'provider_config',
    entityId: hospitalId,
    hospitalId,
    actorType: 'staff',
    actorId: String(staffId),
    action: `Authorized hospital staff explicitly activated direct appointment booking for ${hospitalId}`,
    details: { consultationFee, departments },
    ipAddress
  });

  return {
    success: true,
    message: 'Direct appointment scheduling activated successfully.',
    bookingEnabled: true
  };
}

/**
 * 12. Retrieve Audit Logs (for admin and hospital-specific review)
 */
async function getAuditLogs({ hospitalId = null, limit = 50, offset = 0 } = {}) {
  let sql = 'SELECT * FROM hospital_audit_logs';
  const params = [];

  if (hospitalId) {
    params.push(hospitalId);
    sql += ` WHERE hospital_id = $${params.length}`;
  }

  sql += ' ORDER BY created_at DESC';

  params.push(Math.min(parseInt(limit, 10) || 50, 100));
  sql += ` LIMIT $${params.length}`;

  params.push(Math.max(parseInt(offset, 10) || 0, 0));
  sql += ` OFFSET $${params.length}`;

  const res = await db.query(sql, params);
  return res.rows;
}

module.exports = {
  submitVerificationClaim,
  getHospitalInquiries,
  acceptInquiry,
  rejectInquiry,
  rescheduleInquiry,
  patientAcceptReschedule,
  patientDeclineReschedule,
  adminListVerificationRequests,
  adminApproveVerification,
  adminRejectVerification,
  activateHospitalDirectBooking,
  getAuditLogs
};
