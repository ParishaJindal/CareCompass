const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const appointmentService = require('../src/services/appointmentService');

describe('CareCompass Hospital Appointments & Scheduling Service (Pay at Hospital Mode)', () => {

  it('1. Public config should specify Pay at Hospital mode without online gateway requirements', () => {
    const config = appointmentService.getPublicConfig();
    assert.equal(config.onlinePayment, false);
    assert.equal(config.paymentMode, 'pay_at_hospital');
    assert.equal(config.currency, 'INR');
    assert.equal(config.serviceFee, 0.00);
    assert.equal(typeof config.companyName, 'string');
    // Ensure no secret keys exist
    assert.equal(config.keySecret, undefined);
    assert.equal(config.webhookSecret, undefined);
  });

  it('2. Partner hospital should be recognized with genuine scheduling enabled', async () => {
    const info = await appointmentService.getProviderInfo('IN-HOSP-11299');
    assert.equal(info.success, true);
    assert.equal(info.bookingEnabled, true);
    assert.ok(info.provider);
    assert.equal(info.provider.paymentMode, 'pay_at_hospital');
    assert.ok(Array.isArray(info.provider.departments));
    assert.ok(info.provider.departments.length > 0);
  });

  it('3. Non-partner hospital should report direct slot booking disabled with contact information', async () => {
    const info = await appointmentService.getProviderInfo('IN-HOSP-11300');
    assert.equal(info.success, true);
    assert.equal(info.bookingEnabled, false);
    assert.ok(info.hospital);
    assert.ok(info.hospital.phone);
    assert.equal(typeof info.message, 'string');
  });

  it('4. Available consultation slots should be queryable for future dates', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const dateStr = futureDate.toISOString().slice(0, 10);

    const slots = await appointmentService.getAvailableSlots('IN-HOSP-11299', 'gen-med', dateStr);
    assert.ok(Array.isArray(slots));
    assert.ok(slots.length > 0);
    const firstSlot = slots[0];
    assert.ok(firstSlot.id);
    assert.ok(firstSlot.startTime);
    assert.ok(firstSlot.endTime);
  });

  it('5. Direct booking at partner hospital should confirm with authorized scheduling system and Pay at Hospital', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateStr = futureDate.toISOString().slice(0, 10);

    const slots = await appointmentService.getAvailableSlots('IN-HOSP-11299', 'gen-med', dateStr);
    const targetSlot = slots.find(s => s.isAvailable);
    assert.ok(targetSlot, 'Available slot should exist for test');

    const booking = await appointmentService.createDirectBooking({
      slotId: targetSlot.id,
      sessionId: 'sess_test_direct_suite',
      patientName: 'Dev Test Patient',
      patientPhone: '9876543299',
      patientEmail: 'devpatient@example.com',
      notes: 'Automated test suite consultation'
    });

    assert.equal(booking.success, true);
    assert.ok(booking.bookingReference.startsWith('CC-'));
    assert.equal(booking.bookingType, 'direct_booking');
    assert.equal(booking.bookingStatus, 'confirmed');
    assert.equal(booking.paymentStatus, 'pay_at_hospital');
    assert.equal(booking.paymentMode, 'pay_at_hospital');
    assert.ok(booking.confirmedBySystem.includes('Authorized Hospital Scheduling System'));

    // Verify lookup matches
    const lookup = await appointmentService.lookupAppointment({
      reference: booking.bookingReference,
      phone: '9876543299'
    });
    assert.equal(lookup.bookingReference, booking.bookingReference);
    assert.equal(lookup.bookingStatus, 'confirmed');
    assert.equal(lookup.patientName, 'Dev Test Patient');
  });

  it('6. Non-partner hospital appointment request should register as pending_confirmation', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 4);
    const dateStr = futureDate.toISOString().slice(0, 10);

    const request = await appointmentService.createAppointmentRequest({
      hospitalId: 'IN-HOSP-11300',
      departmentName: 'Pediatric Care Request',
      preferredDate: dateStr,
      preferredTime: '10:30:00',
      patientName: 'Kavita Iyer',
      patientPhone: '9812345600',
      patientEmail: 'kavita@example.com',
      notes: 'Vaccination inquiry'
    });

    assert.equal(request.success, true);
    assert.ok(request.bookingReference.startsWith('CC-'));
    assert.equal(request.bookingType, 'appointment_request');
    assert.equal(request.bookingStatus, 'pending_confirmation');
    assert.equal(request.paymentStatus, 'pay_at_hospital');
    assert.equal(request.paymentMode, 'pay_at_hospital');

    // Verify lookup returns pending confirmation
    const lookup = await appointmentService.lookupAppointment({
      reference: request.bookingReference,
      phone: '9812345600'
    });
    assert.equal(lookup.bookingStatus, 'pending_confirmation');
    assert.equal(lookup.confirmedBySystem, null);

    // Cancel the appointment request safely
    const cancelRes = await appointmentService.cancelAppointment({
      reference: request.bookingReference,
      phone: '9812345600',
      reason: 'Test cancellation'
    });
    assert.equal(cancelRes.success, true);
    assert.equal(cancelRes.bookingStatus, 'cancelled');
  });

  it('7. Patient lookup should fail securely if mobile number does not match', async () => {
    await assert.rejects(
      async () => {
        await appointmentService.lookupAppointment({
          reference: 'CC-20261023-1174',
          phone: '9000000000'
        });
      },
      /Verification failed: Mobile number does not match/
    );
  });
});
