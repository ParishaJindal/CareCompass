/**
 * CareCompass Automated Test Suite: Hospital Partner Verification,
 * Multi-Tenant Data Isolation, Role-Based Access Control, and Rescheduling.
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const db = require('../src/db/supabase');
const authService = require('../src/services/authService');
const partnerService = require('../src/services/partnerService');
const appointmentService = require('../src/services/appointmentService');

// Fictional test IDs and mock data
const TEST_HOSPITAL_A = 'TEST-HOSP-ALPHA';
const TEST_HOSPITAL_B = 'TEST-HOSP-BETA';

describe('CareCompass Hospital Partner Verification & Multi-Tenant Isolation Suite', () => {

  before(async () => {
    // Insert fictional test hospitals into directory if not already present
    await db.query(`
      INSERT OR IGNORE INTO hospitals (
        hospital_id, hospital_name, district, state, healthcare_category, phone, address, verification_status
      ) VALUES 
      ('${TEST_HOSPITAL_A}', 'Alpha Memorial Hospital (Fictional Test)', 'Ludhiana', 'Punjab', 'Hospital', '+91 161 555 0101', 'Test Address Alpha', 'Available'),
      ('${TEST_HOSPITAL_B}', 'Beta Healthcare Institute (Fictional Test)', 'Jalandhar', 'Punjab', 'Hospital', '+91 181 555 0202', 'Test Address Beta', 'Available')
    `);
  });

  after(async () => {
    // Clean up test data
    try {
      await db.query(`DELETE FROM appointments WHERE hospital_id IN ('${TEST_HOSPITAL_A}', '${TEST_HOSPITAL_B}')`);
      await db.query(`DELETE FROM appointment_providers WHERE hospital_id IN ('${TEST_HOSPITAL_A}', '${TEST_HOSPITAL_B}')`);
      await db.query(`DELETE FROM hospital_staff_users WHERE hospital_id IN ('${TEST_HOSPITAL_A}', '${TEST_HOSPITAL_B}')`);
      await db.query(`DELETE FROM hospital_verification_requests WHERE hospital_id IN ('${TEST_HOSPITAL_A}', '${TEST_HOSPITAL_B}')`);
      await db.query(`DELETE FROM verification_documents WHERE hospital_id IN ('${TEST_HOSPITAL_A}', '${TEST_HOSPITAL_B}')`);
      await db.query(`DELETE FROM hospital_audit_logs WHERE hospital_id IN ('${TEST_HOSPITAL_A}', '${TEST_HOSPITAL_B}')`);
      await db.query(`DELETE FROM hospitals WHERE hospital_id IN ('${TEST_HOSPITAL_A}', '${TEST_HOSPITAL_B}')`);
    } catch (e) {
      // Ignored in cleanup
    }
  });

  let claimRefA;
  let requestIdA;
  let adminToken;
  let staffTokenA;
  let staffUserA;
  let apptRefA;
  let apptRefB;

  test('1. Hospital claim submission creates pending request without auto-verification', async () => {
    const claimRes = await partnerService.submitVerificationClaim({
      hospitalId: TEST_HOSPITAL_A,
      applicantName: 'Dr. Anita Sharma',
      applicantDesignation: 'Medical Superintendent',
      officialEmail: 'anita.sharma@alphahosp-test.org',
      officialPhone: '9876543210',
      hospitalRegistrationNumber: 'REG-PB-2026-ALPHA',
      password: 'SecureAlphaPassword2026!',
      documents: [{
        fileName: 'hospital_registration_cert.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 1048576,
        documentType: 'registration_certificate'
      }]
    });

    assert.equal(claimRes.success, true);
    assert.equal(claimRes.verificationStatus, 'pending_review');
    assert.ok(claimRes.requestReference.startsWith('HVR-'));
    claimRefA = claimRes.requestReference;

    // Check appointment_providers status
    const provRes = await db.query(
      'SELECT verification_status, booking_enabled FROM appointment_providers WHERE hospital_id = $1 LIMIT 1',
      [TEST_HOSPITAL_A]
    );
    assert.equal(provRes.rowCount, 1);
    assert.equal(provRes.rows[0].verification_status, 'pending_review');
    assert.equal(provRes.rows[0].booking_enabled, 0, 'Booking must remain disabled (0)');

    // Check private document
    const docRes = await db.query(
      'SELECT access_level, file_name FROM verification_documents WHERE hospital_id = $1 LIMIT 1',
      [TEST_HOSPITAL_A]
    );
    assert.equal(docRes.rowCount, 1);
    assert.equal(docRes.rows[0].access_level, 'admin_only', 'Documents must be private admin_only');
  });

  test('2. Unverified hospital staff login must be strictly rejected', async () => {
    await assert.rejects(
      async () => {
        await authService.staffLogin('anita.sharma@alphahosp-test.org', 'SecureAlphaPassword2026!');
      },
      (err) => {
        // Staff account is not yet active or hospital is pending review
        return err.message.includes('verification status') || err.message.includes('does not exist');
      }
    );
  });

  test('3. Platform Administrator login generates signed secure token', async () => {
    const loginRes = await authService.adminLogin('admin@carecompass.org', 'CareCompass#Admin2026');
    assert.ok(loginRes.token);
    assert.equal(loginRes.admin.email, 'admin@carecompass.org');
    adminToken = loginRes.token;

    const decoded = authService.verifyToken(adminToken);
    assert.equal(decoded.role, 'platform_admin');
  });

  test('4. Admin approval verifies hospital identity but keeps direct booking disabled', async () => {
    const listRes = await partnerService.adminListVerificationRequests({ status: 'pending_review' });
    const reqItem = listRes.requests.find(r => r.hospital_id === TEST_HOSPITAL_A);
    assert.ok(reqItem, 'Pending request should be present');
    requestIdA = reqItem.id;

    const approvalRes = await partnerService.adminApproveVerification({
      requestId: requestIdA,
      adminId: '1',
      adminEmail: 'admin@carecompass.org',
      adminNotes: 'All official government registration credentials verified.'
    });

    assert.equal(approvalRes.success, true);
    assert.equal(approvalRes.verificationStatus, 'verified');
    assert.equal(approvalRes.bookingEnabled, false, 'CRITICAL: Direct booking MUST remain disabled');

    // Verify in database
    const provCheck = await db.query(
      'SELECT verification_status, booking_enabled FROM appointment_providers WHERE hospital_id = $1',
      [TEST_HOSPITAL_A]
    );
    assert.equal(provCheck.rows[0].verification_status, 'verified');
    assert.equal(provCheck.rows[0].booking_enabled, 0);
  });

  test('5. Verified hospital staff can log in and receive scoped credentials', async () => {
    const loginRes = await authService.staffLogin('anita.sharma@alphahosp-test.org', 'SecureAlphaPassword2026!');
    assert.ok(loginRes.token);
    assert.equal(loginRes.staff.hospitalId, TEST_HOSPITAL_A);
    assert.equal(loginRes.staff.bookingEnabled, false);
    staffTokenA = loginRes.token;
    staffUserA = loginRes.staff;

    const decoded = authService.verifyToken(staffTokenA);
    assert.equal(decoded.hospitalId, TEST_HOSPITAL_A);
    assert.equal(decoded.role, 'hospital_admin');
  });

  test('6. Cross-Hospital Tenant Isolation: Staff of Hospital A cannot view Hospital B inquiries', async () => {
    // Create an inquiry for Hospital A
    const apptARes = await appointmentService.createAppointmentRequest({
      hospitalId: TEST_HOSPITAL_A,
      departmentId: 'cardiology',
      departmentName: 'Cardiology',
      preferredDate: '2026-12-01',
      preferredTime: '10:00:00',
      patientName: 'Rohan Verma',
      patientPhone: '9876541111',
      patientEmail: 'rohan.verma@example.com',
      notes: 'Routine cardiac checkup'
    });
    apptRefA = apptARes.bookingReference;

    // Create an inquiry for Hospital B
    const apptBRes = await appointmentService.createAppointmentRequest({
      hospitalId: TEST_HOSPITAL_B,
      departmentId: 'neurology',
      departmentName: 'Neurology',
      preferredDate: '2026-12-02',
      preferredTime: '11:00:00',
      patientName: 'Simran Kaur',
      patientPhone: '9876542222',
      patientEmail: 'simran.kaur@example.com',
      notes: 'Consultation for headaches'
    });
    apptRefB = apptBRes.bookingReference;

    // Query inquiries scoped to Hospital A
    const inquiriesA = await partnerService.getHospitalInquiries(TEST_HOSPITAL_A);
    const hasA = inquiriesA.inquiries.some(i => i.booking_reference === apptRefA);
    const hasB = inquiriesA.inquiries.some(i => i.booking_reference === apptRefB);

    assert.equal(hasA, true, 'Hospital A should see its own inquiry');
    assert.equal(hasB, false, 'CRITICAL: Hospital A must NEVER see Hospital B inquiries');
  });

  test('7. Cross-Hospital Tenant Isolation: Staff of Hospital A cannot action Hospital B appointment', async () => {
    // Staff A attempts to accept Hospital B's appointment
    await assert.rejects(
      async () => {
        await partnerService.acceptInquiry({
          bookingReference: apptRefB,
          hospitalId: TEST_HOSPITAL_A, // Scoped to A
          staffId: staffUserA.id
        });
      },
      (err) => {
        return err.message.includes('not found for this healthcare facility');
      }
    );

    // Verify Hospital B's appointment is still pending_confirmation
    const checkApptB = await db.query(
      'SELECT booking_status FROM appointments WHERE booking_reference = $1',
      [apptRefB]
    );
    assert.equal(checkApptB.rows[0].booking_status, 'pending_confirmation');
  });

  test('8. Staff Reschedule requires patient confirmation before status becomes confirmed', async () => {
    const reschedResult = await partnerService.rescheduleInquiry({
      bookingReference: apptRefA,
      hospitalId: TEST_HOSPITAL_A,
      staffId: staffUserA.id,
      proposedDate: '2026-12-05',
      proposedTime: '14:30:00',
      notes: 'Doctor is available in the afternoon slot.'
    });

    assert.equal(reschedResult.success, true);
    assert.equal(reschedResult.appointment.booking_status, 'rescheduled_pending_patient');
    assert.equal(reschedResult.appointment.proposed_date, '2026-12-05');
    assert.equal(reschedResult.appointment.proposed_time, '14:30:00');

    // Verify patient lookup displays the proposed time
    const patientView = await appointmentService.lookupAppointment({
      reference: apptRefA,
      phone: '9876541111'
    });
    assert.equal(patientView.bookingStatus, 'rescheduled_pending_patient');
    assert.equal(patientView.proposedDate, '2026-12-05');
    assert.equal(patientView.proposedTime, '14:30');
    assert.equal(patientView.hospitalStaffNotes, 'Doctor is available in the afternoon slot.');
  });

  test('9. Patient acceptance confirms rescheduled appointment', async () => {
    const acceptRes = await partnerService.patientAcceptReschedule({
      bookingReference: apptRefA,
      patientPhone: '9876541111'
    });

    assert.equal(acceptRes.success, true);
    assert.equal(acceptRes.appointment.booking_status, 'confirmed');
    assert.equal(acceptRes.appointment.appointment_date, '2026-12-05');
    assert.equal(acceptRes.appointment.start_time, '14:30:00');
    assert.equal(acceptRes.appointment.confirmed_by_system, 'patient_accepted_reschedule');
  });

  test('10. Patient decline cancels rescheduled appointment with reason', async () => {
    // Reschedule B first
    await db.query(`
      UPDATE appointments
      SET booking_status = 'rescheduled_pending_patient',
          proposed_date = '2026-12-10',
          proposed_time = '11:00:00',
          hospital_staff_notes = 'Alternative doctor'
      WHERE booking_reference = $1
    `, [apptRefB]);

    const declineRes = await partnerService.patientDeclineReschedule({
      bookingReference: apptRefB,
      patientPhone: '9876542222',
      reason: 'Patient unavailable at proposed time'
    });

    assert.equal(declineRes.success, true);
    assert.equal(declineRes.appointment.booking_status, 'cancelled');
    assert.equal(declineRes.appointment.cancellation_reason, 'Patient unavailable at proposed time');
  });

  test('11. Explicit direct booking activation requires verified status', async () => {
    // Unverified hospital cannot activate direct booking
    await assert.rejects(
      async () => {
        await partnerService.activateHospitalDirectBooking({
          hospitalId: TEST_HOSPITAL_B, // Unverified
          consultationFee: 500,
          departments: [{ id: 'general', name: 'General Medicine' }],
          staffId: 99
        });
      },
      (err) => err.message.includes('requires verified hospital partner status')
    );

    // Verified hospital can activate
    const activateRes = await partnerService.activateHospitalDirectBooking({
      hospitalId: TEST_HOSPITAL_A,
      consultationFee: 400,
      departments: [{ id: 'cardiology', name: 'Cardiology OPD' }],
      staffId: staffUserA.id
    });
    assert.equal(activateRes.success, true);
    assert.equal(activateRes.bookingEnabled, true);

    const provCheck = await db.query(
      'SELECT booking_enabled, consultation_fee FROM appointment_providers WHERE hospital_id = $1',
      [TEST_HOSPITAL_A]
    );
    assert.equal(provCheck.rows[0].booking_enabled, 1);
    assert.equal(provCheck.rows[0].consultation_fee, 400);
  });

  test('12. Audit log records are generated for all key actions', async () => {
    const logs = await partnerService.getAuditLogs({ hospitalId: TEST_HOSPITAL_A });
    assert.ok(logs.length >= 4, 'Should have recorded multiple audit log entries');

    const eventTypes = logs.map(l => l.event_type);
    assert.ok(eventTypes.includes('verification_submitted'));
    assert.ok(eventTypes.includes('verification_approved'));
    assert.ok(eventTypes.includes('appointment_rescheduled'));
    assert.ok(eventTypes.includes('scheduling_activated'));
  });

  test('13. Token tamper and expiry validation', async () => {
    // Invalid signature token
    assert.throws(
      () => authService.verifyToken(staffTokenA + 'tampered'),
      (err) => err.message.includes('signature') || err.message.includes('Malformed')
    );

    // Empty or non-bearer token
    assert.throws(
      () => authService.verifyToken(''),
      (err) => err.message.includes('Missing')
    );
  });

});
