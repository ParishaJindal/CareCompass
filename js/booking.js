/**
 * CareCompass — Hospital Appointment Booking & Scheduling Flow
 * "Pay at Hospital OPD Counter" workflow (Zero online payment gateway).
 * Architected for responsive mobile devices, strict data integrity,
 * and zero-leakage patient privacy.
 */

window.CareCompassBooking = (function () {
  'use strict';

  // State management for the current booking session
  const state = {
    sessionId: 'cc_sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now(),
    currentStep: 1,
    bookingMode: 'direct_booking', // 'direct_booking' or 'appointment_request'
    hospitalId: null,
    hospitalData: null,
    providerConfig: null,
    selectedDepartment: null,
    selectedDate: null,
    selectedSlot: null,
    preferredTimeSlot: 'Morning (09:30 AM - 12:30 PM)',
    requestDepartmentName: 'General OPD Consultation',
    slotsCache: {},
    patient: {
      name: '',
      phone: '',
      email: '',
      notes: '',
      consent: false
    },
    confirmedBooking: null
  };

  /**
   * Helper to resolve API URLs
   */
  function getApiUrl(endpoint) {
    if (window.CARECOMPASS_CONFIG && typeof window.CARECOMPASS_CONFIG.getApiUrl === 'function') {
      return window.CARECOMPASS_CONFIG.getApiUrl(endpoint);
    }
    return endpoint;
  }

  /**
   * Open the appointment booking modal or request flow
   * @param {string} hospitalId - e.g. "IN-HOSP-11299"
   * @param {string} hospitalName
   * @param {Object} [fallbackData] - Local hospital object
   */
  async function openBookingModal(hospitalId, hospitalName, fallbackData = {}) {
    if (!hospitalId) return;

    // Reset session state
    state.hospitalId = hospitalId;
    state.hospitalData = fallbackData;
    state.currentStep = 1;
    state.bookingMode = 'direct_booking';
    state.selectedDepartment = null;
    state.selectedDate = new Date().toISOString().slice(0, 10);
    state.selectedSlot = null;
    state.confirmedBooking = null;

    ensureModalElements();
    showLoadingModal('Checking Hospital Scheduling Integration...');

    try {
      const res = await fetch(getApiUrl(`/api/appointments/provider/${encodeURIComponent(hospitalId)}`));
      const data = await res.json();

      if (!data || !data.success) {
        showErrorNotice(data?.error || 'Unable to check hospital scheduling availability.');
        return;
      }

      if (!data.bookingEnabled) {
        // Hospital does not have automated slot booking: allow user to Call or Request Appointment
        state.hospitalData = data.hospital || fallbackData;
        showNonIntegratedNotice(state.hospitalData);
        return;
      }

      // Hospital IS an authorized partner with genuine appointment scheduling
      state.providerConfig = data.provider;
      state.hospitalData = {
        id: data.provider.hospitalId,
        name: data.provider.hospitalName,
        phone: data.provider.hospitalPhone,
        address: data.provider.address,
        district: data.provider.district,
        state: data.provider.state,
        verificationStatus: data.provider.verificationStatus
      };

      // Select first department by default if available
      if (data.provider.departments && data.provider.departments.length > 0) {
        state.selectedDepartment = data.provider.departments[0];
      }

      renderWizardStep(1);
    } catch (err) {
      showErrorNotice(`Unable to connect to hospital booking server: ${err.message}`);
    }
  }

  /**
   * Ensure modal container exists in DOM
   */
  function ensureModalElements() {
    let modal = document.getElementById('carecompass-booking-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'carecompass-booking-modal';
      modal.className = 'modal booking-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'booking-modal-title');
      modal.innerHTML = `
        <div class="modal-backdrop booking-backdrop" id="booking-modal-backdrop"></div>
        <div class="modal-dialog booking-dialog">
          <div class="booking-dialog-header">
            <div class="bd-brand">
              <span class="bd-logo-icon">🧭</span>
              <div>
                <h3 id="booking-modal-title">Hospital Appointment Scheduling</h3>
                <p id="booking-modal-subtitle">Pay at Hospital OPD Counter • Zero Advance Online Fee</p>
              </div>
            </div>
            <button type="button" class="modal-close-btn" id="booking-modal-close" aria-label="Close booking">&times;</button>
          </div>
          <div class="booking-dialog-body" id="booking-dialog-body">
            <!-- Dynamic step contents rendered here -->
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Attach close handlers
      modal.querySelector('#booking-modal-close').addEventListener('click', closeModal);
      modal.querySelector('#booking-modal-backdrop').addEventListener('click', closeModal);
    }
  }

  function closeModal() {
    const modal = document.getElementById('carecompass-booking-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }
  }

  function showLoadingModal(message = 'Loading...') {
    const modal = document.getElementById('carecompass-booking-modal');
    const body = document.getElementById('booking-dialog-body');
    if (!modal || !body) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    body.innerHTML = `
      <div class="booking-loading-state">
        <div class="loading-spinner-circle" aria-hidden="true"></div>
        <h4>${escapeHtml(message)}</h4>
        <p>Connecting to hospital OPD scheduling services...</p>
      </div>
    `;
  }

  /**
   * Display notice for facilities without automated real-time slot booking.
   * Fulfills Requirement 11: Allow user to Request Appointment or Contact Hospital.
   */
  function showNonIntegratedNotice(hospital) {
    const body = document.getElementById('booking-dialog-body');
    if (!body) return;

    const phone = hospital.phone || hospital.alternate_phone || null;
    const name = hospital.name || hospital.hospital_name || 'Healthcare Facility';
    const address = hospital.address || (hospital.district ? `${hospital.district}, ${hospital.state}` : 'India');

    body.innerHTML = `
      <div class="booking-notice-card">
        <div class="notice-icon-box notice-info">
          ℹ️
        </div>
        <div class="notice-content">
          <span class="badge-notice-unavail">Direct Slot Booking Not Active</span>
          <h3>Direct calendar slot scheduling is not integrated for this facility yet.</h3>
          <p class="notice-explainer">
            CareCompass partners with healthcare facilities for authorized slot booking. For this facility, you can either call the reception desk directly or submit an official <strong>Appointment Request</strong>.
          </p>

          <div class="notice-facility-info">
            <h4>${escapeHtml(name)}</h4>
            <p>📍 ${escapeHtml(address)}</p>
            
            <div class="notice-contact-action-box">
              ${phone ? `
                <a href="tel:${escapeHtml(phone)}" class="btn btn-outline btn-call-direct">
                  📞 Call Hospital: ${escapeHtml(phone)}
                </a>
              ` : `
                <p class="notice-phone-missing">Telephone contact pending verification for this registry record.</p>
              `}
              <button type="button" class="btn btn-primary" id="btn-start-appointment-request">
                📝 Request an Appointment
              </button>
            </div>
          </div>

          <div class="notice-actions-footer">
            <button type="button" class="btn btn-outline" id="btn-notice-dismiss">Close Notice</button>
            <a href="find-healthcare.html" class="btn btn-secondary">Find Nearby Partner Hospitals</a>
          </div>
        </div>
      </div>
    `;

    body.querySelector('#btn-notice-dismiss')?.addEventListener('click', closeModal);
    body.querySelector('#btn-start-appointment-request')?.addEventListener('click', () => {
      openAppointmentRequestFlow(hospital);
    });
  }

  function showErrorNotice(errorMessage) {
    const body = document.getElementById('booking-dialog-body');
    if (!body) return;

    body.innerHTML = `
      <div class="booking-notice-card">
        <div class="notice-icon-box notice-error">⚠️</div>
        <div class="notice-content">
          <h3>Scheduling Notice</h3>
          <p>${escapeHtml(errorMessage)}</p>
          <div class="notice-actions-footer">
            <button type="button" class="btn btn-primary" id="btn-err-dismiss">OK</button>
          </div>
        </div>
      </div>
    `;
    body.querySelector('#btn-err-dismiss')?.addEventListener('click', closeModal);
  }

  /**
   * Start Appointment Request flow for non-partner hospitals (Requirement 11)
   */
  function openAppointmentRequestFlow(hospital) {
    state.bookingMode = 'appointment_request';
    state.hospitalData = hospital;
    state.selectedDate = new Date().toISOString().slice(0, 10);
    renderRequestStep(1);
  }

  /**
   * Render Steps for Appointment Request Flow
   */
  function renderRequestStep(stepNumber) {
    const body = document.getElementById('booking-dialog-body');
    if (!body) return;

    const hosp = state.hospitalData;
    const name = hosp.name || hosp.hospital_name || 'Hospital';

    if (stepNumber === 1) {
      body.innerHTML = `
        <div class="booking-step-content step-request-form">
          <div class="wizard-header">
            <h4>Request an Appointment at ${escapeHtml(name)}</h4>
            <p>Submit your preferred date and consultation details. Hospital staff will confirm your slot.</p>
          </div>

          <form id="appointment-request-form" class="booking-form-grid" novalidate>
            <div class="booking-form-group">
              <label for="req-patient-name">Patient Full Name <span class="required-star">*</span></label>
              <input type="text" id="req-patient-name" class="booking-input" placeholder="Full name as per ID / Aadhaar" value="${escapeHtml(state.patient.name)}" required autocomplete="name">
              <span class="field-error-msg" id="err-req-name"></span>
            </div>

            <div class="booking-form-group">
              <label for="req-patient-phone">Mobile Contact Number <span class="required-star">*</span></label>
              <div class="phone-input-group">
                <span class="country-prefix">+91</span>
                <input type="tel" id="req-patient-phone" class="booking-input" placeholder="10-digit mobile number" maxlength="10" value="${escapeHtml(state.patient.phone)}" required autocomplete="tel">
              </div>
              <span class="field-help-text">Hospital reception will call this number to confirm the appointment</span>
              <span class="field-error-msg" id="err-req-phone"></span>
            </div>

            <div class="booking-form-group">
              <label for="req-patient-email">Email Address <span class="optional-tag">(Optional)</span></label>
              <input type="email" id="req-patient-email" class="booking-input" placeholder="patient@example.com" value="${escapeHtml(state.patient.email)}" autocomplete="email">
            </div>

            <div class="booking-form-group">
              <label for="req-preferred-date">Preferred Consultation Date <span class="required-star">*</span></label>
              <input type="date" id="req-preferred-date" class="booking-input" min="${new Date().toISOString().slice(0, 10)}" value="${state.selectedDate || new Date().toISOString().slice(0, 10)}" required>
              <span class="field-error-msg" id="err-req-date"></span>
            </div>

            <div class="booking-form-group">
              <label for="req-preferred-time">Preferred Time Window <span class="required-star">*</span></label>
              <select id="req-preferred-time" class="booking-input">
                <option value="09:30:00" ${state.preferredTimeSlot.includes('09:30') ? 'selected' : ''}>Morning (09:30 AM – 12:30 PM)</option>
                <option value="14:00:00" ${state.preferredTimeSlot.includes('14:00') ? 'selected' : ''}>Afternoon (02:00 PM – 04:30 PM)</option>
                <option value="17:00:00" ${state.preferredTimeSlot.includes('17:00') ? 'selected' : ''}>Evening (05:00 PM – 07:30 PM)</option>
              </select>
            </div>

            <div class="booking-form-group">
              <label for="req-department-name">Clinical Department / Concern</label>
              <input type="text" id="req-department-name" class="booking-input" placeholder="e.g. General Medicine, Pediatrics, Orthopedics, Fever" value="${escapeHtml(state.requestDepartmentName || 'General OPD Consultation')}">
            </div>

            <div class="booking-form-group">
              <label for="req-notes">Symptoms / Notes for Doctor <span class="optional-tag">(Optional)</span></label>
              <textarea id="req-notes" class="booking-textarea" rows="2" placeholder="Brief description of symptoms...">${escapeHtml(state.patient.notes)}</textarea>
            </div>

            <div class="review-pricing-card" style="margin-top: 10px;">
              <h5>Payment Notice</h5>
              <div class="pricing-row total-row">
                <strong>Payment Mode</strong>
                <strong class="total-price" style="color: #0d9488;">Pay at Hospital Counter</strong>
              </div>
              <p style="font-size: 0.85rem; color: #64748b; margin-top: 6px;">
                Zero payment required online. Consultation fees apply as per hospital standard tariff upon arrival.
              </p>
            </div>

            <div class="booking-consent-box">
              <label class="consent-checkbox-label">
                <input type="checkbox" id="req-privacy-consent" ${state.patient.consent ? 'checked' : ''} required>
                <span>
                  I understand this request is recorded on CareCompass as an inquiry, and I may contact <strong>${escapeHtml(name)}</strong> directly to confirm scheduling.
                </span>
              </label>
              <span class="field-error-msg" id="err-req-consent"></span>
            </div>
          </form>

          <div class="wizard-footer-actions">
            <button type="button" class="btn btn-outline" id="btn-req-cancel">Cancel</button>
            <button type="button" class="btn btn-primary" id="btn-submit-request">
              📝 Submit Appointment Request
            </button>
          </div>
        </div>
      `;

      body.querySelector('#btn-req-cancel')?.addEventListener('click', closeModal);
      body.querySelector('#btn-submit-request')?.addEventListener('click', submitAppointmentRequest);
    }
  }

  /**
   * Submit Appointment Request (Requirement 11)
   */
  async function submitAppointmentRequest() {
    const nameInput = document.getElementById('req-patient-name');
    const phoneInput = document.getElementById('req-patient-phone');
    const emailInput = document.getElementById('req-patient-email');
    const dateInput = document.getElementById('req-preferred-date');
    const timeSelect = document.getElementById('req-preferred-time');
    const deptInput = document.getElementById('req-department-name');
    const notesInput = document.getElementById('req-notes');
    const consentInput = document.getElementById('req-privacy-consent');

    const errName = document.getElementById('err-req-name');
    const errPhone = document.getElementById('err-req-phone');
    const errDate = document.getElementById('err-req-date');
    const errConsent = document.getElementById('err-req-consent');

    if (errName) errName.textContent = '';
    if (errPhone) errPhone.textContent = '';
    if (errDate) errDate.textContent = '';
    if (errConsent) errConsent.textContent = '';

    let isValid = true;
    const name = (nameInput?.value || '').trim();
    if (name.length < 2) {
      if (errName) errName.textContent = 'Please enter patient full name.';
      nameInput?.focus();
      isValid = false;
    }

    const rawPhone = (phoneInput?.value || '').replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      if (errPhone) errPhone.textContent = 'Please enter a valid 10-digit mobile number.';
      if (isValid) phoneInput?.focus();
      isValid = false;
    }

    const dateVal = dateInput?.value;
    if (!dateVal) {
      if (errDate) errDate.textContent = 'Please select a preferred date.';
      isValid = false;
    }

    const consent = Boolean(consentInput?.checked);
    if (!consent) {
      if (errConsent) errConsent.textContent = 'Please accept consent to submit appointment request.';
      isValid = false;
    }

    if (!isValid) return;

    const submitBtn = document.getElementById('btn-submit-request');
    if (submitBtn) {
      submitBtn.setAttribute('disabled', 'true');
      submitBtn.innerHTML = 'Submitting Request...';
    }

    try {
      const res = await fetch(getApiUrl('/api/appointments/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: state.hospitalId,
          departmentName: (deptInput?.value || '').trim() || 'General OPD Consultation',
          preferredDate: dateVal,
          preferredTime: timeSelect?.value || '09:30:00',
          patientName: name,
          patientPhone: rawPhone,
          patientEmail: (emailInput?.value || '').trim(),
          notes: (notesInput?.value || '').trim()
        })
      });

      const data = await res.json();
      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to submit appointment request.');
      }

      state.confirmedBooking = data;
      saveLocalAppointmentReference(data.bookingReference, rawPhone);
      renderRequestConfirmation();
    } catch (err) {
      alert(`Submission Error: ${err.message}`);
      if (submitBtn) {
        submitBtn.removeAttribute('disabled');
        submitBtn.innerHTML = '📝 Submit Appointment Request';
      }
    }
  }

  /**
   * Render Request Confirmation Screen (Requirement 9 & 10: Status is Pending Confirmation)
   */
  function renderRequestConfirmation() {
    const body = document.getElementById('booking-dialog-body');
    if (!body || !state.confirmedBooking) return;

    const b = state.confirmedBooking;
    body.innerHTML = `
      <div class="booking-step-content step-6-confirmed">
        <div class="confirmation-success-hero">
          <div class="success-animated-icon" style="background: #f59e0b; color: #fff;">⏳</div>
          <span class="badge-confirmed-live" style="background: #fef3c7; color: #92400e; border-color: #fde68a;">
            ● PENDING CONFIRMATION
          </span>
          <h3>Appointment Request Recorded!</h3>
          <p>Your inquiry for <strong>${escapeHtml(b.hospitalName)}</strong> has been recorded on CareCompass.</p>
          <div style="font-size: 0.83rem; color: #78350f; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; margin: 12px 0; text-align: left; line-height: 1.4;">
            ℹ️ <strong>Please note:</strong> This hospital does not currently have automated scheduling integration with CareCompass. The hospital has <strong>not yet received or confirmed</strong> this appointment. Please contact the hospital directly or present this reference code at their OPD registration counter.
          </div>
        </div>

        <!-- Reference Code Card -->
        <div class="booking-reference-card">
          <span class="brc-label">YOUR APPOINTMENT REQUEST REFERENCE</span>
          <div class="brc-code-row">
            <span class="brc-code" id="confirmed-booking-ref">${escapeHtml(b.bookingReference)}</span>
            <button type="button" class="btn btn-outline btn-sm" id="btn-copy-ref" title="Copy reference number">
              📋 Copy
            </button>
          </div>
          <p class="brc-hint">Save this reference code to track or reference your inquiry.</p>
        </div>

        <!-- Details Card -->
        <div class="confirmed-info-table">
          <div class="cit-row">
            <span class="cit-lbl">Hospital:</span>
            <span class="cit-val"><strong>${escapeHtml(b.hospitalName)}</strong></span>
          </div>
          <div class="cit-row">
            <span class="cit-lbl">Requested Date:</span>
            <span class="cit-val">📅 ${formatReadableDate(b.appointmentDate)} (${b.preferredTime || 'Morning'})</span>
          </div>
          <div class="cit-row">
            <span class="cit-lbl">Department:</span>
            <span class="cit-val">${escapeHtml(b.departmentName)}</span>
          </div>
          <div class="cit-row">
            <span class="cit-lbl">Patient:</span>
            <span class="cit-val">${escapeHtml(b.patientName)} (+91 ${escapeHtml(b.patientPhone)})</span>
          </div>
          <div class="cit-row">
            <span class="cit-lbl">Status:</span>
            <span class="cit-val"><strong style="color: #d97706;">Pending Confirmation</strong> (Inquiry recorded on CareCompass)</span>
          </div>
          <div class="cit-row">
            <span class="cit-lbl">Payment Mode:</span>
            <span class="cit-val"><span class="badge-pay-hospital">Pay at Hospital Counter on Arrival</span></span>
          </div>
          ${b.hospitalPhone ? `
            <div class="cit-row">
              <span class="cit-lbl">Hospital Phone:</span>
              <span class="cit-val"><a href="tel:${escapeHtml(b.hospitalPhone)}">📞 ${escapeHtml(b.hospitalPhone)}</a></span>
            </div>
          ` : ''}
        </div>

        <!-- Action Buttons -->
        <div class="confirmed-action-buttons">
          <button type="button" class="btn btn-outline" id="btn-print-receipt">🖨️ Print Request Slip</button>
          <a href="my-appointments.html?ref=${encodeURIComponent(b.bookingReference)}&phone=${encodeURIComponent(b.patientPhone)}" class="btn btn-secondary">
            📂 View in My Appointments
          </a>
          <button type="button" class="btn btn-primary" id="btn-done-booking">Done</button>
        </div>
      </div>
    `;

    body.querySelector('#btn-copy-ref')?.addEventListener('click', () => {
      navigator.clipboard.writeText(b.bookingReference).then(() => {
        const btn = body.querySelector('#btn-copy-ref');
        if (btn) {
          btn.textContent = '✓ Copied!';
          setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
        }
      });
    });

    body.querySelector('#btn-print-receipt')?.addEventListener('click', () => window.print());
    body.querySelector('#btn-done-booking')?.addEventListener('click', closeModal);
  }

  /**
   * Render Steps 1 through 6 of the Direct Booking Wizard (Authorized Partners)
   */
  async function renderWizardStep(stepNumber) {
    state.currentStep = stepNumber;
    const body = document.getElementById('booking-dialog-body');
    if (!body) return;

    const prov = state.providerConfig;
    const hosp = state.hospitalData;

    // Progress bar navigation (5 steps)
    const progressHtml = `
      <div class="booking-progress-tracker" role="progressbar" aria-valuenow="${stepNumber}" aria-valuemin="1" aria-valuemax="5">
        <div class="step-progress-item ${stepNumber >= 1 ? 'completed' : ''} ${stepNumber === 1 ? 'active' : ''}">
          <span class="step-num">1</span>
          <span class="step-lbl">Hospital</span>
        </div>
        <div class="step-progress-divider"></div>
        <div class="step-progress-item ${stepNumber >= 2 ? 'completed' : ''} ${stepNumber === 2 ? 'active' : ''}">
          <span class="step-num">2</span>
          <span class="step-lbl">Dept</span>
        </div>
        <div class="step-progress-divider"></div>
        <div class="step-progress-item ${stepNumber >= 3 ? 'completed' : ''} ${stepNumber === 3 ? 'active' : ''}">
          <span class="step-num">3</span>
          <span class="step-lbl">Slot</span>
        </div>
        <div class="step-progress-divider"></div>
        <div class="step-progress-item ${stepNumber >= 4 ? 'completed' : ''} ${stepNumber === 4 ? 'active' : ''}">
          <span class="step-num">4</span>
          <span class="step-lbl">Details</span>
        </div>
        <div class="step-progress-divider"></div>
        <div class="step-progress-item ${stepNumber >= 5 ? 'completed' : ''} ${stepNumber === 5 ? 'active' : ''}">
          <span class="step-num">5</span>
          <span class="step-lbl">Confirm</span>
        </div>
      </div>
    `;

    // -----------------------------------------------------------------
    // STEP 1: Hospital Overview & Authorized Integration Verification
    // -----------------------------------------------------------------
    if (stepNumber === 1) {
      body.innerHTML = `
        ${progressHtml}
        <div class="booking-step-content step-1-hospital">
          <div class="wizard-header">
            <h4>Step 1: Hospital Verification & Accreditation</h4>
            <p>You are booking with an authorized CareCompass scheduling partner.</p>
          </div>

          <div class="step-hospital-card">
            <div class="shc-badge-row">
              <span class="badge-partner-verified">✓ Authorized Scheduling Partner</span>
              <span class="badge-audit-status">${escapeHtml(hosp.verificationStatus || 'Verified')}</span>
            </div>
            <h3 class="shc-title">${escapeHtml(hosp.name)}</h3>
            <p class="shc-address">📍 ${escapeHtml(hosp.address || `${hosp.district}, ${hosp.state}`)}</p>
            ${hosp.phone ? `<p class="shc-phone">📞 Official Hospital Phone: <strong>${escapeHtml(hosp.phone)}</strong></p>` : ''}

            <div class="shc-guarantees">
              <div class="guarantee-item">
                <span class="gi-icon">🛡️</span>
                <div>
                  <strong>Genuine Schedule</strong>
                  <p>Real-time slot synchronization directly with hospital OPD administration.</p>
                </div>
              </div>
              <div class="guarantee-item">
                <span class="gi-icon">🏥</span>
                <div>
                  <strong>Pay at Hospital Counter</strong>
                  <p>Zero advance online fee. Settle consultation fee on arrival via Cash, UPI, or Card.</p>
                </div>
              </div>
              <div class="guarantee-item">
                <span class="gi-icon">⏱️</span>
                <div>
                  <strong>Transparent Cancellation</strong>
                  <p>Free cancellation available up to ${prov.cancellationHours || 4} hours before appointment.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="wizard-footer-actions">
            <button type="button" class="btn btn-outline" id="btn-cancel-booking">Cancel</button>
            <button type="button" class="btn btn-primary" id="btn-step1-next">Continue to Select Department &rarr;</button>
          </div>
        </div>
      `;

      body.querySelector('#btn-cancel-booking')?.addEventListener('click', closeModal);
      body.querySelector('#btn-step1-next')?.addEventListener('click', () => renderWizardStep(2));
    }

    // -----------------------------------------------------------------
    // STEP 2: Department Selection & Transparent Consultation Fee
    // -----------------------------------------------------------------
    else if (stepNumber === 2) {
      const depts = prov.departments || [];
      const deptsHtml = depts.map(d => {
        const isSelected = state.selectedDepartment && state.selectedDepartment.id === d.id;
        const fee = d.consultationFee || prov.consultationFee;
        return `
          <label class="department-choice-card ${isSelected ? 'selected' : ''}" data-dept-id="${escapeHtml(d.id)}">
            <input type="radio" name="booking-dept" value="${escapeHtml(d.id)}" ${isSelected ? 'checked' : ''}>
            <div class="dcc-info">
              <span class="dcc-name">${escapeHtml(d.name)}</span>
              <p class="dcc-desc">${escapeHtml(d.description || 'Outpatient clinical consultation with licensed specialist.')}</p>
            </div>
            <div class="dcc-fee">
              <span class="dcc-fee-label">Consultation Fee</span>
              <span class="dcc-fee-amount">₹${fee}</span>
              <span class="dcc-fee-note">Pay at Hospital</span>
            </div>
          </label>
        `;
      }).join('');

      body.innerHTML = `
        ${progressHtml}
        <div class="booking-step-content step-2-dept">
          <div class="wizard-header">
            <h4>Step 2: Select Clinical Department</h4>
            <p>Choose the medical service or OPD department for your consultation.</p>
          </div>

          <div class="departments-list-group" role="radiogroup" aria-label="Available hospital departments">
            ${deptsHtml}
          </div>

          <div class="wizard-footer-actions">
            <button type="button" class="btn btn-outline" id="btn-step2-back">&larr; Back</button>
            <button type="button" class="btn btn-primary" id="btn-step2-next">Select Date & Time &rarr;</button>
          </div>
        </div>
      `;

      // Department selection event listeners
      body.querySelectorAll('.department-choice-card').forEach(card => {
        card.addEventListener('click', () => {
          body.querySelectorAll('.department-choice-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          const deptId = card.getAttribute('data-dept-id');
          state.selectedDepartment = depts.find(d => d.id === deptId);
        });
      });

      body.querySelector('#btn-step2-back')?.addEventListener('click', () => renderWizardStep(1));
      body.querySelector('#btn-step2-next')?.addEventListener('click', () => {
        if (!state.selectedDepartment && depts.length > 0) {
          state.selectedDepartment = depts[0];
        }
        renderWizardStep(3);
      });
    }

    // -----------------------------------------------------------------
    // STEP 3: Responsive Calendar Date & Real-Time Slot Selection
    // -----------------------------------------------------------------
    else if (stepNumber === 3) {
      body.innerHTML = `
        ${progressHtml}
        <div class="booking-step-content step-3-slots">
          <div class="wizard-header">
            <h4>Step 3: Choose Appointment Date & Time</h4>
            <p>Department: <strong>${escapeHtml(state.selectedDepartment?.name || 'General OPD')}</strong></p>
          </div>

          <!-- Quick Date Picker Pills -->
          <div class="date-selector-wrapper">
            <label class="wizard-field-label">Select Date (Next 7 Days)</label>
            <div class="date-pills-row" id="date-pills-container">
              <!-- Dynamically rendered date pills -->
            </div>
          </div>

          <!-- Slots Container -->
          <div class="slots-selection-wrapper">
            <div class="slots-header-row">
              <label class="wizard-field-label">Available Consultation Slots</label>
              <span class="slot-legend-hint">
                <span class="dot-legend-avail"></span> Available
                <span class="dot-legend-booked"></span> Reserved / Booked
              </span>
            </div>
            <div id="slots-grid-container" class="slots-grid-box" role="radiogroup" aria-label="Available appointment time slots">
              <div class="slots-loading-text">Loading verified schedule for selected date...</div>
            </div>
          </div>

          <div class="wizard-footer-actions">
            <button type="button" class="btn btn-outline" id="btn-step3-back">&larr; Back</button>
            <button type="button" class="btn btn-primary" id="btn-step3-next" disabled>Enter Patient Details &rarr;</button>
          </div>
        </div>
      `;

      renderDatePills();
      await loadSlotsForDate(state.selectedDate);

      body.querySelector('#btn-step3-back')?.addEventListener('click', () => renderWizardStep(2));
      body.querySelector('#btn-step3-next')?.addEventListener('click', () => {
        if (!state.selectedSlot) {
          alert('Please select an available consultation slot.');
          return;
        }
        renderWizardStep(4);
      });
    }

    // -----------------------------------------------------------------
    // STEP 4: Minimal Patient Booking Form (Strict Privacy)
    // -----------------------------------------------------------------
    else if (stepNumber === 4) {
      body.innerHTML = `
        ${progressHtml}
        <div class="booking-step-content step-4-patient">
          <div class="wizard-header">
            <h4>Step 4: Patient Contact Information</h4>
            <p>Required for hospital appointment registration and SMS/WhatsApp confirmation.</p>
          </div>

          <form id="booking-patient-form" class="booking-form-grid" novalidate>
            <div class="booking-form-group">
              <label for="patient-full-name">Patient Full Name <span class="required-star">*</span></label>
              <input type="text" id="patient-full-name" class="booking-input" placeholder="Full name as per ID / Aadhaar" value="${escapeHtml(state.patient.name)}" required autocomplete="name">
              <span class="field-error-msg" id="err-patient-name"></span>
            </div>

            <div class="booking-form-group">
              <label for="patient-phone-number">Mobile Contact Number <span class="required-star">*</span></label>
              <div class="phone-input-group">
                <span class="country-prefix">+91</span>
                <input type="tel" id="patient-phone-number" class="booking-input" placeholder="10-digit mobile number" maxlength="10" value="${escapeHtml(state.patient.phone)}" required autocomplete="tel">
              </div>
              <span class="field-help-text">Used for appointment confirmation SMS & booking lookup</span>
              <span class="field-error-msg" id="err-patient-phone"></span>
            </div>

            <div class="booking-form-group">
              <label for="patient-email">Email Address <span class="optional-tag">(Optional)</span></label>
              <input type="email" id="patient-email" class="booking-input" placeholder="patient@example.com" value="${escapeHtml(state.patient.email)}" autocomplete="email">
              <span class="field-help-text">Receives appointment confirmation slip & calendar reminder</span>
              <span class="field-error-msg" id="err-patient-email"></span>
            </div>

            <div class="booking-form-group">
              <label for="patient-notes">Medical Inquiry / Reason for Visit <span class="optional-tag">(Optional)</span></label>
              <textarea id="patient-notes" class="booking-textarea" rows="2" placeholder="Briefly describe symptoms (e.g. general checkup, high fever, post-op consultation)...">${escapeHtml(state.patient.notes)}</textarea>
              <span class="field-help-text">Do not include sensitive confidential health data.</span>
            </div>

            <div class="booking-consent-box">
              <label class="consent-checkbox-label">
                <input type="checkbox" id="booking-privacy-consent" ${state.patient.consent ? 'checked' : ''} required>
                <span>
                  I consent to sharing these contact details with <strong>${escapeHtml(hosp.name)}</strong> 
                  solely for scheduling this medical consultation. CareCompass never sells patient data.
                </span>
              </label>
              <span class="field-error-msg" id="err-patient-consent"></span>
            </div>
          </form>

          <div class="wizard-footer-actions">
            <button type="button" class="btn btn-outline" id="btn-step4-back">&larr; Back</button>
            <button type="button" class="btn btn-primary" id="btn-step4-next">Review & Confirm Booking &rarr;</button>
          </div>
        </div>
      `;

      body.querySelector('#btn-step4-back')?.addEventListener('click', () => renderWizardStep(3));
      body.querySelector('#btn-step4-next')?.addEventListener('click', validateAndProceedToStep5);
    }

    // -----------------------------------------------------------------
    // STEP 5: Review Appointment & "Pay at Hospital" Confirmation
    // (Requirement 4 & 6: Hide Pay Now, Add Pay at Hospital)
    // -----------------------------------------------------------------
    else if (stepNumber === 5) {
      const deptFee = state.selectedDepartment?.consultationFee || prov.consultationFee;
      const carecompassFee = 0.00;
      const totalAmount = deptFee + carecompassFee;

      body.innerHTML = `
        ${progressHtml}
        <div class="booking-step-content step-5-review">
          <div class="wizard-header">
            <h4>Step 5: Review & Confirm Appointment</h4>
            <p>Verify your details. Zero advance payment online — settle fee at the hospital OPD counter.</p>
          </div>

          <!-- Summary Card -->
          <div class="review-appointment-summary">
            <div class="ras-header">
              <span class="ras-label">Appointment Summary</span>
              <span class="ras-date">📅 ${formatReadableDate(state.selectedDate)} • ⏰ ${state.selectedSlot.startTime} - ${state.selectedSlot.endTime}</span>
            </div>
            <div class="ras-details-grid">
              <div class="ras-item">
                <span class="ras-item-lbl">Hospital</span>
                <span class="ras-item-val">${escapeHtml(hosp.name)}</span>
              </div>
              <div class="ras-item">
                <span class="ras-item-lbl">Department</span>
                <span class="ras-item-val">${escapeHtml(state.selectedDepartment.name)}</span>
              </div>
              <div class="ras-item">
                <span class="ras-item-lbl">Patient Name</span>
                <span class="ras-item-val">${escapeHtml(state.patient.name)}</span>
              </div>
              <div class="ras-item">
                <span class="ras-item-lbl">Contact Phone</span>
                <span class="ras-item-val">+91 ${escapeHtml(state.patient.phone)}</span>
              </div>
            </div>
          </div>

          <!-- Transparent Fee Ledger -->
          <div class="review-pricing-card">
            <h5>Fee Breakdown & Payment Mode</h5>
            <div class="pricing-row">
              <span>Hospital Outpatient Consultation Fee</span>
              <span>₹${deptFee.toFixed(2)}</span>
            </div>
            <div class="pricing-row fee-free">
              <span>CareCompass Platform Convenience Fee</span>
              <span>₹0.00 <span class="badge-free">FREE</span></span>
            </div>
            <div class="pricing-divider"></div>
            <div class="pricing-row total-row">
              <strong>Total Payable at Hospital OPD Counter</strong>
              <strong class="total-price" style="color: #0d9488;">₹${totalAmount.toFixed(2)}</strong>
            </div>
          </div>

          <!-- Pay at Hospital Explainer Box -->
          <div class="review-policies-box">
            <div class="policy-item">
              <span class="pol-icon">🏥</span>
              <span><strong>Payment Mode: Pay at Hospital Counter.</strong> No credit card or online payment required. Pay directly at the hospital registration counter on arrival via Cash, UPI, or Card.</span>
            </div>
            <div class="policy-item">
              <span class="pol-icon">⏱️</span>
              <span><strong>Cancellation Policy:</strong> Free cancellation up to ${prov.cancellationHours || 4} hours before appointment. No cancellation penalties.</span>
            </div>
          </div>

          <div class="wizard-footer-actions">
            <button type="button" class="btn btn-outline" id="btn-step5-back">&larr; Back</button>
            <button type="button" class="btn btn-primary btn-confirm-booking" id="btn-trigger-booking">
              ✓ Confirm Booking (Pay at Hospital)
            </button>
          </div>
        </div>
      `;

      body.querySelector('#btn-step5-back')?.addEventListener('click', () => renderWizardStep(4));
      body.querySelector('#btn-trigger-booking')?.addEventListener('click', executeDirectBooking);
    }

    // -----------------------------------------------------------------
    // STEP 6: Booking Confirmation & Digital Receipt
    // -----------------------------------------------------------------
    else if (stepNumber === 6 && state.confirmedBooking) {
      const b = state.confirmedBooking;
      body.innerHTML = `
        <div class="booking-step-content step-6-confirmed">
          <div class="confirmation-success-hero">
            <div class="success-animated-icon">✓</div>
            <span class="badge-confirmed-live">● CONFIRMED WITH HOSPITAL</span>
            <h3>Appointment Successfully Confirmed!</h3>
            <p>Your appointment has been confirmed by the <strong>CareCompass Authorized Hospital Scheduling System</strong> for <strong>${escapeHtml(b.hospitalName)}</strong>.</p>
          </div>

          <!-- Reference Code Card -->
          <div class="booking-reference-card">
            <span class="brc-label">YOUR OFFICIAL BOOKING REFERENCE NUMBER</span>
            <div class="brc-code-row">
              <span class="brc-code" id="confirmed-booking-ref">${escapeHtml(b.bookingReference)}</span>
              <button type="button" class="btn btn-outline btn-sm" id="btn-copy-ref" title="Copy reference number">
                📋 Copy
              </button>
            </div>
            <p class="brc-hint">Please present this reference number at the hospital OPD registration counter on arrival.</p>
          </div>

          <!-- Confirmation Details Card -->
          <div class="confirmed-info-table">
            <div class="cit-row">
              <span class="cit-lbl">Hospital:</span>
              <span class="cit-val"><strong>${escapeHtml(b.hospitalName)}</strong></span>
            </div>
            <div class="cit-row">
              <span class="cit-lbl">Address:</span>
              <span class="cit-val">${escapeHtml(b.hospitalAddress || 'Hospital Main Campus')}</span>
            </div>
            <div class="cit-row">
              <span class="cit-lbl">Department:</span>
              <span class="cit-val">${escapeHtml(b.departmentName)}</span>
            </div>
            <div class="cit-row">
              <span class="cit-lbl">Date & Time:</span>
              <span class="cit-val"><strong>📅 ${formatReadableDate(b.appointmentDate)} at ⏰ ${b.startTime} - ${b.endTime}</strong></span>
            </div>
            <div class="cit-row">
              <span class="cit-lbl">Patient:</span>
              <span class="cit-val">${escapeHtml(b.patientName)} (+91 ${escapeHtml(b.patientPhone)})</span>
            </div>
            <div class="cit-row">
              <span class="cit-lbl">Payment Mode:</span>
              <span class="cit-val"><span class="badge-pay-hospital">Pay at Hospital OPD Desk: ₹${Number(b.totalAmount).toFixed(2)}</span> (Cash/UPI/Card)</span>
            </div>
            ${b.hospitalPhone ? `
              <div class="cit-row">
                <span class="cit-lbl">Hospital Phone:</span>
                <span class="cit-val"><a href="tel:${escapeHtml(b.hospitalPhone)}">📞 ${escapeHtml(b.hospitalPhone)}</a></span>
              </div>
            ` : ''}
          </div>

          <!-- Action Buttons -->
          <div class="confirmed-action-buttons">
            <button type="button" class="btn btn-outline" id="btn-print-receipt">🖨️ Print / Save Slip</button>
            <a href="my-appointments.html?ref=${encodeURIComponent(b.bookingReference)}&phone=${encodeURIComponent(b.patientPhone)}" class="btn btn-secondary">
              📂 Manage in My Appointments
            </a>
            <button type="button" class="btn btn-primary" id="btn-done-booking">Done</button>
          </div>
        </div>
      `;

      // Copy reference button
      body.querySelector('#btn-copy-ref')?.addEventListener('click', () => {
        navigator.clipboard.writeText(b.bookingReference).then(() => {
          const btn = body.querySelector('#btn-copy-ref');
          if (btn) {
            btn.textContent = '✓ Copied!';
            setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
          }
        });
      });

      // Print receipt button
      body.querySelector('#btn-print-receipt')?.addEventListener('click', () => window.print());
      body.querySelector('#btn-done-booking')?.addEventListener('click', closeModal);
    }
  }

  /**
   * Render horizontal date picker pills for the next 7 days
   */
  function renderDatePills() {
    const container = document.getElementById('date-pills-container');
    if (!container) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let html = '';

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const isSelected = iso === state.selectedDate;
      const dayName = i === 0 ? 'Today' : (i === 1 ? 'Tmrw' : days[d.getDay()]);

      html += `
        <button type="button" class="date-pill-btn ${isSelected ? 'selected' : ''}" data-date="${iso}" aria-pressed="${isSelected}">
          <span class="dp-day">${dayName}</span>
          <span class="dp-num">${d.getDate()}</span>
          <span class="dp-month">${months[d.getMonth()]}</span>
        </button>
      `;
    }

    container.innerHTML = html;

    container.querySelectorAll('.date-pill-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        container.querySelectorAll('.date-pill-btn').forEach(b => {
          b.classList.remove('selected');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');

        state.selectedDate = btn.getAttribute('data-date');
        state.selectedSlot = null;
        document.getElementById('btn-step3-next')?.setAttribute('disabled', 'true');
        await loadSlotsForDate(state.selectedDate);
      });
    });
  }

  /**
   * Fetch verified slots from server for chosen hospital, department, and date
   */
  async function loadSlotsForDate(dateStr) {
    const container = document.getElementById('slots-grid-container');
    if (!container) return;

    container.innerHTML = '<div class="slots-loading-text"><div class="loading-spinner-circle-sm"></div> Synchronizing appointment availability...</div>';

    try {
      const hospitalId = state.hospitalId;
      const departmentId = state.selectedDepartment?.id || 'gen-med';
      const url = getApiUrl(`/api/appointments/slots?hospitalId=${encodeURIComponent(hospitalId)}&departmentId=${encodeURIComponent(departmentId)}&date=${encodeURIComponent(dateStr)}`);

      const res = await fetch(url);
      const data = await res.json();

      if (!data || !data.success || !Array.isArray(data.slots)) {
        container.innerHTML = `<div class="slots-empty-notice">No appointment slots available for this date. Please choose another date.</div>`;
        return;
      }

      const slots = data.slots;
      if (slots.length === 0) {
        container.innerHTML = `<div class="slots-empty-notice">No slots scheduled for this day. Please select another date.</div>`;
        return;
      }

      container.innerHTML = slots.map(slot => {
        const isAvail = slot.isAvailable;
        const isSelected = state.selectedSlot && state.selectedSlot.id === slot.id;
        return `
          <button type="button" 
                  class="slot-choice-btn ${isAvail ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''}" 
                  data-slot-id="${slot.id}"
                  ${isAvail ? '' : 'disabled aria-disabled="true"'}
                  aria-pressed="${isSelected}">
            <span class="slot-time">${slot.startTime}</span>
            <span class="slot-status-indicator">${isAvail ? 'Available' : 'Booked'}</span>
          </button>
        `;
      }).join('');

      container.querySelectorAll('.slot-choice-btn.available').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.slot-choice-btn').forEach(b => {
            b.classList.remove('selected');
            b.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('selected');
          btn.setAttribute('aria-pressed', 'true');

          const slotId = parseInt(btn.getAttribute('data-slot-id'), 10);
          state.selectedSlot = slots.find(s => s.id === slotId);

          const nextBtn = document.getElementById('btn-step3-next');
          if (nextBtn) nextBtn.removeAttribute('disabled');
        });
      });
    } catch (err) {
      container.innerHTML = `<div class="slots-error-notice">Failed to fetch slots: ${escapeHtml(err.message)}</div>`;
    }
  }

  /**
   * Validate patient booking form inputs
   */
  function validateAndProceedToStep5() {
    const nameInput = document.getElementById('patient-full-name');
    const phoneInput = document.getElementById('patient-phone-number');
    const emailInput = document.getElementById('patient-email');
    const notesInput = document.getElementById('patient-notes');
    const consentInput = document.getElementById('booking-privacy-consent');

    const errName = document.getElementById('err-patient-name');
    const errPhone = document.getElementById('err-patient-phone');
    const errEmail = document.getElementById('err-patient-email');
    const errConsent = document.getElementById('err-patient-consent');

    // Reset error messages
    if (errName) errName.textContent = '';
    if (errPhone) errPhone.textContent = '';
    if (errEmail) errEmail.textContent = '';
    if (errConsent) errConsent.textContent = '';

    let isValid = true;

    const name = (nameInput?.value || '').trim();
    if (name.length < 2) {
      if (errName) errName.textContent = 'Please enter patient full name (at least 2 letters).';
      nameInput?.focus();
      isValid = false;
    }

    const rawPhone = (phoneInput?.value || '').replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      if (errPhone) errPhone.textContent = 'Please enter a valid 10-digit Indian mobile number.';
      if (isValid) phoneInput?.focus();
      isValid = false;
    }

    const email = (emailInput?.value || '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (errEmail) errEmail.textContent = 'Please enter a valid email address.';
      if (isValid) emailInput?.focus();
      isValid = false;
    }

    const consent = Boolean(consentInput?.checked);
    if (!consent) {
      if (errConsent) errConsent.textContent = 'Please provide consent to proceed with appointment booking.';
      isValid = false;
    }

    if (!isValid) return;

    // Save validated patient state
    state.patient = {
      name,
      phone: rawPhone,
      email,
      notes: (notesInput?.value || '').trim(),
      consent
    };

    renderWizardStep(5);
  }

  /**
   * Execute Direct Booking (Pay at Hospital workflow)
   * Calls POST /api/appointments/book directly with zero external payment gateway.
   */
  async function executeDirectBooking() {
    const confirmBtn = document.getElementById('btn-trigger-booking');
    if (confirmBtn) {
      confirmBtn.setAttribute('disabled', 'true');
      confirmBtn.innerHTML = 'Confirming Appointment with Hospital...';
    }

    try {
      const res = await fetch(getApiUrl('/api/appointments/book'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: state.selectedSlot.id,
          sessionId: state.sessionId,
          patientName: state.patient.name,
          patientPhone: state.patient.phone,
          patientEmail: state.patient.email,
          notes: state.patient.notes
        })
      });

      const bookingData = await res.json();
      if (!bookingData || !bookingData.success) {
        throw new Error(bookingData?.error || 'Unable to confirm appointment. Slot may have been reserved by another patient.');
      }

      state.confirmedBooking = bookingData;

      // Save reference to localStorage so user can access it easily in My Appointments
      saveLocalAppointmentReference(bookingData.bookingReference, bookingData.patientPhone);

      renderWizardStep(6);
    } catch (err) {
      alert(`Booking Error: ${err.message}`);
      if (confirmBtn) {
        confirmBtn.removeAttribute('disabled');
        confirmBtn.innerHTML = '✓ Confirm Booking (Pay at Hospital)';
      }
    }
  }

  /**
   * Save confirmed reference into user browser storage for easy retrieval
   */
  function saveLocalAppointmentReference(reference, phone) {
    try {
      const stored = JSON.parse(localStorage.getItem('carecompass_user_bookings') || '[]');
      if (!stored.find(b => b.reference === reference)) {
        stored.unshift({ reference, phone, savedAt: new Date().toISOString() });
        localStorage.setItem('carecompass_user_bookings', JSON.stringify(stored.slice(0, 10)));
      }
    } catch (e) {}
  }

  /**
   * Helper date formatter
   */
  function formatReadableDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(`${dateStr}T00:00:00`);
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return str || '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (typeof window !== 'undefined' && !window.escapeHtml) {
    window.escapeHtml = escapeHtml;
  }

  return {
    openBookingModal,
    openAppointmentRequestFlow,
    closeModal,
    getApiUrl,
    escapeHtml
  };
})();
