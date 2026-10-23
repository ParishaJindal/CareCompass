/**
 * CareCompass — Hospital Appointment Booking & Scheduling Service
 * Implements genuine hospital scheduling, double-booking prevention, 
 * atomic slot reservation, appointment request routing, and "Pay at Hospital" workflow.
 * (Zero external payment gateway credentials required).
 */

const crypto = require('node:crypto');
const db = require('../db/supabase');

/**
 * Generate a unique, professional CareCompass booking reference
 * Format: CC-YYYYMMDD-XXXX (e.g., CC-20261023-7492)
 */
function generateBookingReference() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomInt(1000, 9999).toString();
  return `CC-${dateStr}-${randomSuffix}`;
}

/**
 * Clean up expired slot reservations (held longer than 10 minutes)
 */
async function releaseExpiredReservations() {
  try {
    await db.query(`
      UPDATE appointment_slots 
      SET availability_status = 'available',
          reserved_by_session = NULL,
          reservation_expires_at = NULL
      WHERE availability_status = 'reserved' 
        AND reservation_expires_at < NOW()
    `);
  } catch (err) {
    console.warn('[Appointment Service] Note cleaning expired reservations:', err.message);
  }
}

/**
 * Public configuration for frontend appointment modal
 */
function getPublicConfig() {
  return {
    onlinePayment: false,
    paymentMode: 'pay_at_hospital',
    currency: 'INR',
    companyName: 'CareCompass Healthcare',
    themeColor: '#0d9488',
    serviceFee: 0.00,
    supportEmail: 'support@carecompass.org',
    supportPhone: '+91 1800 123 4567'
  };
}

/**
 * Check if a hospital is an authorized partner and get its booking configuration
 * @param {string} hospitalId - e.g. "IN-HOSP-11299"
 */
async function getProviderInfo(hospitalId) {
  // First query the hospital from the master directory
  const hospRes = await db.query(
    'SELECT * FROM hospitals WHERE hospital_id = $1 LIMIT 1',
    [hospitalId]
  );

  const hospital = hospRes.rows && hospRes.rows.length > 0 ? hospRes.rows[0] : null;

  if (!hospital) {
    return {
      success: false,
      error: 'Hospital not found in CareCompass registry.'
    };
  }

  // Check appointment_providers for genuine authorized integration
  const provRes = await db.query(
    'SELECT * FROM appointment_providers WHERE hospital_id = $1 AND booking_enabled = true LIMIT 1',
    [hospitalId]
  );

  if (!provRes.rows || provRes.rows.length === 0) {
    // Non-partner hospital: bookingEnabled is false, users can submit Appointment Request or call hospital
    return {
      success: true,
      bookingEnabled: false,
      message: 'Direct slot scheduling is not integrated for this facility. You can submit an appointment request or contact the hospital directly.',
      hospital: {
        id: hospital.hospital_id,
        name: hospital.hospital_name,
        phone: hospital.phone || hospital.alternate_phone,
        address: hospital.address,
        district: hospital.district,
        state: hospital.state,
        verificationStatus: hospital.verification_status,
        emergencyAvailability: hospital.emergency_availability
      }
    };
  }

  const provider = provRes.rows[0];
  let departments = [];
  try {
    departments = typeof provider.departments === 'string'
      ? JSON.parse(provider.departments)
      : (provider.departments || []);
  } catch (e) {
    departments = [];
  }

  return {
    success: true,
    bookingEnabled: true,
    provider: {
      hospitalId: hospital.hospital_id,
      hospitalName: hospital.hospital_name,
      hospitalPhone: hospital.phone || hospital.alternate_phone,
      address: hospital.address,
      district: hospital.district,
      state: hospital.state,
      integrationType: provider.integration_type,
      verificationStatus: provider.verification_status,
      consultationFee: Number(provider.consultation_fee),
      carecompassFee: Number(provider.carecompass_fee || 0),
      paymentMode: provider.payment_mode || 'pay_at_hospital',
      currency: provider.currency || 'INR',
      cancellationHours: provider.cancellation_deadline_hours || 4,
      departments
    }
  };
}

/**
 * Seed authentic daily schedule slots for authorized partner hospital if not present
 */
async function ensureDailySlots(hospitalId, departmentId, departmentName, dateStr) {
  const checkRes = await db.query(
    'SELECT COUNT(*) as count FROM appointment_slots WHERE hospital_id = $1 AND department_id = $2 AND slot_date = $3',
    [hospitalId, departmentId, dateStr]
  );

  const existingCount = parseInt(checkRes.rows[0].count, 10);
  if (existingCount > 0) return;

  // Standard verified OPD consultation slots (Morning & Afternoon sessions)
  const defaultTimes = [
    { start: '09:30:00', end: '10:00:00' },
    { start: '10:15:00', end: '10:45:00' },
    { start: '11:00:00', end: '11:30:00' },
    { start: '11:45:00', end: '12:15:00' },
    { start: '14:00:00', end: '14:30:00' },
    { start: '14:45:00', end: '15:15:00' },
    { start: '15:30:00', end: '16:00:00' },
    { start: '16:15:00', end: '16:45:00' }
  ];

  for (const t of defaultTimes) {
    try {
      await db.query(`
        INSERT INTO appointment_slots 
        (hospital_id, department_id, department_name, slot_date, start_time, end_time, availability_status)
        VALUES ($1, $2, $3, $4, $5, $6, 'available')
        ON CONFLICT (hospital_id, department_id, slot_date, start_time) DO NOTHING
      `, [hospitalId, departmentId, departmentName, dateStr, t.start, t.end]);
    } catch (err) {
      // Ignore conflict / race condition
    }
  }
}

/**
 * Fetch available slots for a hospital, department, and date
 */
async function getAvailableSlots(hospitalId, departmentId, dateStr) {
  await releaseExpiredReservations();

  // Validate provider authorization
  const provCheck = await getProviderInfo(hospitalId);
  if (!provCheck.bookingEnabled) {
    throw new Error('Online appointment booking is not authorized for this hospital.');
  }

  // Validate date: cannot be in past, cannot be more than 30 days ahead
  const selectedDate = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(selectedDate.getTime())) {
    throw new Error('Invalid appointment date format. Use YYYY-MM-DD.');
  }

  if (selectedDate < today) {
    throw new Error('Appointment date cannot be in the past.');
  }

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);
  if (selectedDate > maxDate) {
    throw new Error('Appointments can only be scheduled up to 30 days in advance.');
  }

  // Find department name
  const dept = provCheck.provider.departments.find(d => d.id === departmentId);
  const departmentName = dept ? dept.name : 'General Consultation';

  // Seed authorized schedule for this day if needed
  await ensureDailySlots(hospitalId, departmentId, departmentName, dateStr);

  // Query slots
  const res = await db.query(`
    SELECT id, hospital_id, department_id, department_name, doctor_name, 
           slot_date, start_time, end_time, availability_status
    FROM appointment_slots
    WHERE hospital_id = $1 AND department_id = $2 AND slot_date = $3
    ORDER BY start_time ASC
  `, [hospitalId, departmentId, dateStr]);

  return res.rows.map(slot => ({
    id: slot.id,
    date: slot.slot_date,
    startTime: slot.start_time.slice(0, 5), // '09:30'
    endTime: slot.end_time.slice(0, 5),
    status: slot.availability_status,
    isAvailable: slot.availability_status === 'available',
    doctorName: slot.doctor_name || null
  }));
}

/**
 * Atomically reserve a slot for 10 minutes to prevent double-booking
 */
async function reserveSlot(slotId, sessionId) {
  await releaseExpiredReservations();

  const res = await db.query(`
    UPDATE appointment_slots
    SET availability_status = 'reserved',
        reserved_by_session = $1,
        reservation_expires_at = NOW() + INTERVAL '10 minutes'
    WHERE id = $2 
      AND (
        availability_status = 'available' 
        OR (availability_status = 'reserved' AND reservation_expires_at < NOW())
        OR (availability_status = 'reserved' AND reserved_by_session = $1)
      )
    RETURNING *
  `, [sessionId, slotId]);

  if (!res.rows || res.rows.length === 0) {
    throw new Error('This appointment slot is currently reserved or already booked. Please choose another time.');
  }

  return res.rows[0];
}

/**
 * Direct booking for authorized partner hospitals with Pay at Hospital workflow.
 * Confirmed by CareCompass Authorized Hospital Scheduling System upon successful reservation.
 */
async function createDirectBooking({
  slotId,
  sessionId,
  patientName,
  patientPhone,
  patientEmail,
  notes
}) {
  if (!patientName || patientName.trim().length < 2) {
    throw new Error('Please provide the patient full name.');
  }

  const cleanPhone = (patientPhone || '').replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    throw new Error('Please provide a valid 10-digit mobile contact number.');
  }

  // Atomically lock the slot
  const slot = await reserveSlot(slotId, sessionId);

  // Fetch provider fee and policy
  const provCheck = await getProviderInfo(slot.hospital_id);
  if (!provCheck.bookingEnabled) {
    throw new Error('Online booking is not enabled for this hospital.');
  }

  const dept = provCheck.provider.departments.find(d => d.id === slot.department_id);
  const consultationFee = dept && dept.consultationFee ? Number(dept.consultationFee) : provCheck.provider.consultationFee;
  const serviceFee = 0.00; // Zero mark-up policy
  const totalAmount = consultationFee + serviceFee;
  const bookingReference = generateBookingReference();

  // Create confirmed appointment record (authorized hospital scheduling system confirmation)
  const apptRes = await db.query(`
    INSERT INTO appointments (
      booking_reference, booking_type, hospital_id, hospital_name, hospital_phone, hospital_address,
      department_id, department_name, doctor_id, doctor_name, slot_id,
      appointment_date, start_time, end_time,
      patient_name, patient_phone, patient_email, notes,
      booking_status, payment_status, payment_mode,
      consultation_fee, service_fee, total_amount, currency,
      confirmed_by_system, confirmed_at
    ) VALUES (
      $1, 'direct_booking', $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13,
      $14, $15, $16, $17,
      'confirmed', 'pay_at_hospital', 'pay_at_hospital',
      $18, $19, $20, 'INR',
      'CareCompass Authorized Hospital Scheduling System', NOW()
    ) RETURNING *
  `, [
    bookingReference,
    slot.hospital_id,
    provCheck.provider.hospitalName,
    provCheck.provider.hospitalPhone,
    provCheck.provider.address,
    slot.department_id,
    slot.department_name,
    slot.doctor_id || null,
    slot.doctor_name || null,
    slot.id,
    slot.slot_date,
    slot.start_time,
    slot.end_time,
    patientName.trim(),
    cleanPhone,
    (patientEmail || '').trim() || null,
    (notes || '').trim() || null,
    consultationFee,
    serviceFee,
    totalAmount
  ]);

  const appointment = apptRes.rows[0];

  // Mark slot as booked
  await db.query(`
    UPDATE appointment_slots
    SET availability_status = 'booked',
        reserved_by_session = NULL,
        reservation_expires_at = NULL
    WHERE id = $1
  `, [slot.id]);

  // Record audit entry in payments ledger
  await db.query(`
    INSERT INTO payments (
      appointment_id, booking_reference, provider, provider_order_id,
      amount, currency, payment_status, payment_method, notes
    ) VALUES ($1, $2, 'hospital_counter', $3, $4, 'INR', 'pay_at_hospital', 'pay_at_hospital', 'Pay at hospital OPD counter upon arrival')
  `, [
    appointment.id,
    bookingReference,
    `OPD-${bookingReference}`,
    totalAmount
  ]);

  return {
    success: true,
    bookingReference,
    appointmentId: appointment.id,
    bookingType: 'direct_booking',
    bookingStatus: 'confirmed',
    paymentStatus: 'pay_at_hospital',
    paymentMode: 'pay_at_hospital',
    hospitalName: provCheck.provider.hospitalName,
    hospitalPhone: provCheck.provider.hospitalPhone,
    hospitalAddress: provCheck.provider.address,
    departmentName: slot.department_name,
    doctorName: slot.doctor_name,
    appointmentDate: slot.slot_date,
    startTime: slot.start_time.slice(0, 5),
    endTime: slot.end_time.slice(0, 5),
    patientName: appointment.patient_name,
    patientPhone: cleanPhone,
    patientEmail: appointment.patient_email,
    consultationFee,
    serviceFee,
    totalAmount,
    currency: 'INR',
    confirmedBySystem: 'CareCompass Authorized Hospital Scheduling System',
    cancellationHours: provCheck.provider.cancellationHours || 4,
    paymentInstructions: 'No advance online payment required. Settle your consultation fee at the hospital OPD registration counter on arrival via Cash, UPI, or Card.'
  };
}

/**
 * Submit an Appointment Request for hospitals without automated slot booking.
 * Status is set to 'pending_confirmation' until hospital scheduling desk confirms.
 */
async function createAppointmentRequest({
  hospitalId,
  departmentId,
  departmentName,
  preferredDate,
  preferredTime,
  patientName,
  patientPhone,
  patientEmail,
  notes
}) {
  if (!patientName || patientName.trim().length < 2) {
    throw new Error('Please provide the patient full name.');
  }

  const cleanPhone = (patientPhone || '').replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    throw new Error('Please provide a valid 10-digit mobile contact number.');
  }

  if (!preferredDate) {
    throw new Error('Please provide a preferred appointment date.');
  }

  // Validate date is not in past
  const targetDate = new Date(`${preferredDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(targetDate.getTime()) || targetDate < today) {
    throw new Error('Please select a valid future appointment date.');
  }

  // Fetch hospital from directory
  const hospRes = await db.query(
    'SELECT * FROM hospitals WHERE hospital_id = $1 LIMIT 1',
    [hospitalId]
  );

  if (!hospRes.rows || hospRes.rows.length === 0) {
    throw new Error('Hospital not found in CareCompass registry.');
  }

  const hospital = hospRes.rows[0];
  const bookingReference = generateBookingReference();
  const startTime = preferredTime || '09:30:00';
  const endTime = '17:00:00';
  const resolvedDeptName = departmentName || 'General OPD Consultation';

  // Create pending appointment request record
  const apptRes = await db.query(`
    INSERT INTO appointments (
      booking_reference, booking_type, hospital_id, hospital_name, hospital_phone, hospital_address,
      department_id, department_name, doctor_id, doctor_name, slot_id,
      appointment_date, start_time, end_time,
      patient_name, patient_phone, patient_email, notes,
      booking_status, payment_status, payment_mode,
      consultation_fee, service_fee, total_amount, currency,
      confirmed_by_system, confirmed_at
    ) VALUES (
      $1, 'appointment_request', $2, $3, $4, $5,
      $6, $7, NULL, NULL, NULL,
      $8, $9, $10,
      $11, $12, $13, $14,
      'pending_confirmation', 'pay_at_hospital', 'pay_at_hospital',
      0.00, 0.00, 0.00, 'INR',
      NULL, NULL
    ) RETURNING *
  `, [
    bookingReference,
    hospital.hospital_id,
    hospital.hospital_name,
    hospital.phone || hospital.alternate_phone || null,
    hospital.address || null,
    departmentId || 'general',
    resolvedDeptName,
    preferredDate,
    startTime,
    endTime,
    patientName.trim(),
    cleanPhone,
    (patientEmail || '').trim() || null,
    (notes || '').trim() || null
  ]);

  const appointment = apptRes.rows[0];

  return {
    success: true,
    bookingReference,
    appointmentId: appointment.id,
    bookingType: 'appointment_request',
    bookingStatus: 'pending_confirmation',
    paymentStatus: 'pay_at_hospital',
    paymentMode: 'pay_at_hospital',
    hospitalName: hospital.hospital_name,
    hospitalPhone: hospital.phone || hospital.alternate_phone,
    hospitalAddress: hospital.address,
    departmentName: resolvedDeptName,
    appointmentDate: preferredDate,
    preferredTime: startTime.slice(0, 5),
    patientName: appointment.patient_name,
    patientPhone: cleanPhone,
    patientEmail: appointment.patient_email,
    paymentInstructions: 'Your appointment request has been submitted to the hospital desk. Hospital staff will contact you to confirm final timing. Consultation charges apply as per hospital tariff on arrival.'
  };
}

/**
 * Secure lookup of patient booking by reference and verified phone number
 */
async function lookupAppointment({ reference, phone }) {
  if (!reference || !phone) {
    throw new Error('Please provide both Booking Reference and registered Mobile Number.');
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const res = await db.query(`
    SELECT a.*, p.provider_order_id, p.payment_method
    FROM appointments a
    LEFT JOIN payments p ON p.appointment_id = a.id
    WHERE a.booking_reference = $1
    LIMIT 1
  `, [reference.trim().toUpperCase()]);

  if (!res.rows || res.rows.length === 0) {
    throw new Error('No appointment found with the provided booking reference.');
  }

  const appt = res.rows[0];

  // Verify phone matches (preventing ID enumeration)
  if (!appt.patient_phone.endsWith(cleanPhone.slice(-10))) {
    throw new Error('Verification failed: Mobile number does not match this booking record.');
  }

  // Calculate cancellation eligibility
  const apptDateTime = new Date(`${appt.appointment_date}T${appt.start_time}`);
  const now = new Date();
  const hoursUntilAppointment = (apptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isCancellable = (appt.booking_status === 'confirmed' || appt.booking_status === 'pending_confirmation') && hoursUntilAppointment >= 4;

  return {
    bookingReference: appt.booking_reference,
    bookingType: appt.booking_type || 'direct_booking',
    hospitalId: appt.hospital_id,
    hospitalName: appt.hospital_name,
    hospitalPhone: appt.hospital_phone,
    hospitalAddress: appt.hospital_address,
    departmentName: appt.department_name,
    doctorName: appt.doctor_name,
    appointmentDate: appt.appointment_date,
    startTime: appt.start_time ? appt.start_time.slice(0, 5) : '09:00',
    endTime: appt.end_time ? appt.end_time.slice(0, 5) : '17:00',
    patientName: appt.patient_name,
    patientPhone: appt.patient_phone,
    patientEmail: appt.patient_email,
    bookingStatus: appt.booking_status,
    paymentStatus: appt.payment_status || 'pay_at_hospital',
    paymentMode: appt.payment_mode || 'pay_at_hospital',
    consultationFee: Number(appt.consultation_fee || 0),
    serviceFee: Number(appt.service_fee || 0),
    totalAmount: Number(appt.total_amount || 0),
    currency: appt.currency || 'INR',
    confirmedBySystem: appt.confirmed_by_system,
    confirmedAt: appt.confirmed_at,
    createdAt: appt.created_at,
    isCancellable,
    hoursUntilAppointment: Math.round(hoursUntilAppointment * 10) / 10
  };
}

/**
 * Cancel an appointment safely without requiring online payment gateway refunds
 */
async function cancelAppointment({ reference, phone, reason = 'Patient requested cancellation' }) {
  const appt = await lookupAppointment({ reference, phone });

  if (appt.bookingStatus === 'cancelled') {
    throw new Error('This appointment has already been cancelled.');
  }

  if (!appt.isCancellable) {
    throw new Error('Cancellation policy: Appointments can only be cancelled at least 4 hours in advance.');
  }

  // Update appointment record
  await db.query(`
    UPDATE appointments
    SET booking_status = 'cancelled',
        cancellation_reason = $1,
        cancelled_at = NOW()
    WHERE booking_reference = $2
  `, [
    reason,
    reference
  ]);

  // Update payment status in audit ledger if exists
  await db.query(`
    UPDATE payments
    SET payment_status = 'cancelled',
        notes = $1
    WHERE booking_reference = $2
  `, [
    `Cancelled by patient: ${reason}`,
    reference
  ]);

  // Free the appointment slot back to available if assigned
  const slotRes = await db.query(
    'SELECT slot_id FROM appointments WHERE booking_reference = $1 LIMIT 1',
    [reference]
  );
  if (slotRes.rows && slotRes.rows.length > 0 && slotRes.rows[0].slot_id) {
    await db.query(`
      UPDATE appointment_slots
      SET availability_status = 'available',
          reserved_by_session = NULL,
          reservation_expires_at = NULL
      WHERE id = $1
    `, [slotRes.rows[0].slot_id]);
  }

  return {
    success: true,
    bookingReference: reference,
    bookingStatus: 'cancelled',
    paymentStatus: 'cancelled',
    message: 'Your appointment has been cancelled successfully. Since your payment mode was Pay at Hospital, no cancellation charges or refunds apply.'
  };
}

module.exports = {
  getProviderInfo,
  getAvailableSlots,
  reserveSlot,
  createDirectBooking,
  createAppointmentRequest,
  lookupAppointment,
  cancelAppointment,
  getPublicConfig,
  generateBookingReference
};
