-- ============================================================================
-- CareCompass: Supabase PostgreSQL Database Migration
-- Migration: 002_create_appointments_and_payments.sql
-- Description: Hospital appointment scheduling & appointment requests with
--              "Pay at Hospital OPD Counter" workflow (No online payment gateway).
-- ============================================================================

-- 1. Appointment Providers Table
-- Stores authorized hospital scheduling partnerships and OPD consultation fees.
CREATE TABLE IF NOT EXISTS appointment_providers (
    id BIGSERIAL PRIMARY KEY,
    hospital_id VARCHAR(100) NOT NULL UNIQUE,
    integration_type VARCHAR(50) NOT NULL DEFAULT 'carecompass_partner',
    booking_enabled BOOLEAN NOT NULL DEFAULT true,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'Verified',
    consultation_fee NUMERIC(10,2) NOT NULL DEFAULT 500.00,
    carecompass_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'pay_at_hospital',
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    cancellation_deadline_hours INTEGER NOT NULL DEFAULT 4,
    departments JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_consultation_fee CHECK (consultation_fee >= 0),
    CONSTRAINT chk_carecompass_fee CHECK (carecompass_fee >= 0)
);

-- 2. Appointment Slots Table
-- Available consultation slots for partner healthcare facilities.
CREATE TABLE IF NOT EXISTS appointment_slots (
    id BIGSERIAL PRIMARY KEY,
    hospital_id VARCHAR(100) NOT NULL,
    department_id VARCHAR(100) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(100),
    doctor_name VARCHAR(255),
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    availability_status VARCHAR(50) NOT NULL DEFAULT 'available',
    reserved_by_session VARCHAR(100),
    reservation_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_slot_status CHECK (
        availability_status IN ('available', 'reserved', 'booked', 'blocked')
    ),
    CONSTRAINT uq_hospital_slot UNIQUE (hospital_id, department_id, slot_date, start_time)
);

-- 3. Appointments Table
-- Secure booking & appointment request records (Pay at Hospital).
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    booking_reference VARCHAR(64) UNIQUE NOT NULL,
    booking_type VARCHAR(50) NOT NULL DEFAULT 'direct_booking', -- 'direct_booking' or 'appointment_request'
    hospital_id VARCHAR(100) NOT NULL,
    hospital_name TEXT NOT NULL,
    hospital_phone VARCHAR(50),
    hospital_address TEXT,
    department_id VARCHAR(100) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(100),
    doctor_name VARCHAR(255),
    slot_id BIGINT, -- Nullable for facility appointment requests
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    patient_email VARCHAR(255),
    notes TEXT,
    booking_status VARCHAR(50) NOT NULL DEFAULT 'pending_confirmation',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pay_at_hospital',
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'pay_at_hospital',
    consultation_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    service_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    confirmed_by_system VARCHAR(100),
    confirmed_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_booking_status CHECK (
        booking_status IN ('pending_confirmation', 'confirmed', 'cancelled', 'completed', 'rescheduled')
    ),
    CONSTRAINT chk_payment_status CHECK (
        payment_status IN ('pay_at_hospital', 'pending', 'paid', 'waived')
    )
);

-- 4. Audit & Payment Receipts Table (Pay at Hospital Ledger)
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    booking_reference VARCHAR(64) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'hospital_counter',
    provider_order_id VARCHAR(100) UNIQUE NOT NULL,
    provider_payment_id VARCHAR(100),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'pay_at_hospital',
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pay_at_hospital',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_appointment_providers_hosp ON appointment_providers (hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_query ON appointment_slots (hospital_id, slot_date, availability_status);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_cleanup ON appointment_slots (availability_status, reservation_expires_at)
    WHERE availability_status = 'reserved';
CREATE INDEX IF NOT EXISTS idx_appointments_ref ON appointments (booking_reference);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments (patient_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_hosp ON appointments (hospital_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (booking_status);
CREATE INDEX IF NOT EXISTS idx_payments_ref ON payments (booking_reference);

-- 6. Trigger for Automatic updated_at
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_providers_updated_at ON appointment_providers;
CREATE TRIGGER trg_providers_updated_at
    BEFORE UPDATE ON appointment_providers
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON appointments;
CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- 7. Row Level Security (RLS) Policies
ALTER TABLE appointment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Public can view enabled providers and slots
DROP POLICY IF EXISTS "Public can view active appointment providers" ON appointment_providers;
CREATE POLICY "Public can view active appointment providers"
    ON appointment_providers FOR SELECT
    USING (booking_enabled = true);

DROP POLICY IF EXISTS "Public can view available appointment slots" ON appointment_slots;
CREATE POLICY "Public can view available appointment slots"
    ON appointment_slots FOR SELECT
    USING (true);

-- Backend service role has full access
DROP POLICY IF EXISTS "Service role access for appointment_providers" ON appointment_providers;
CREATE POLICY "Service role access for appointment_providers"
    ON appointment_providers FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access for appointment_slots" ON appointment_slots;
CREATE POLICY "Service role access for appointment_slots"
    ON appointment_slots FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access for appointments" ON appointments;
CREATE POLICY "Service role access for appointments"
    ON appointments FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role access for payments" ON payments;
CREATE POLICY "Service role access for payments"
    ON payments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed Initial Authorized Partner Hospitals with Authentic OPD Fee Schedule
INSERT INTO appointment_providers (
    hospital_id,
    integration_type,
    booking_enabled,
    verification_status,
    consultation_fee,
    carecompass_fee,
    payment_mode,
    cancellation_deadline_hours,
    departments
) VALUES
(
    'IN-HOSP-11299',
    'carecompass_partner',
    true,
    'Verified',
    400.00,
    0.00,
    'pay_at_hospital',
    4,
    '[
        {"id": "gen-med", "name": "General Medicine", "consultationFee": 400, "description": "Consultation with certified General Physician"},
        {"id": "gen-surg", "name": "General Surgery", "consultationFee": 500, "description": "Surgical evaluations and post-op consultation"},
        {"id": "emerg-opd", "name": "Emergency & Urgent Care OPD", "consultationFee": 450, "description": "Urgent outpatient triage and specialist review"}
    ]'::jsonb
),
(
    'IN-HOSP-11383',
    'carecompass_partner',
    true,
    'Verified',
    500.00,
    0.00,
    'pay_at_hospital',
    4,
    '[
        {"id": "gen-med", "name": "General Medicine", "consultationFee": 500, "description": "Consultation with certified General Physician"},
        {"id": "cardio", "name": "Cardiology Consultation", "consultationFee": 750, "description": "Cardiovascular assessment & ECG review"}
    ]'::jsonb
)
ON CONFLICT (hospital_id) DO UPDATE SET
    booking_enabled = EXCLUDED.booking_enabled,
    consultation_fee = EXCLUDED.consultation_fee,
    payment_mode = EXCLUDED.payment_mode,
    departments = EXCLUDED.departments;
