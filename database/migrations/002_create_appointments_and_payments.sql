-- ============================================================================
-- CareCompass: Supabase PostgreSQL Database Migration
-- Migration: 002_create_appointments_and_payments.sql
-- Description: Production-ready appointment scheduling & appointment requests with
--              "Pay at Hospital OPD Counter" workflow (No online payment gateway).
--
-- COMPLIANCE & SAFETY GUARANTEES:
-- 1. Strictly DDL only. NO fake/pilot hospital provider records are inserted.
-- 2. Fully idempotent with safe CREATE TABLE and ALTER TABLE ADD COLUMN IF NOT EXISTS.
-- 3. Does NOT modify, truncate, or delete any records in the master 'hospitals' table.
-- 4. Secure RLS policies: Sensitive patient data, medical notes, payment records,
--    and session reservation tokens are strictly protected (service_role only).
-- ============================================================================

-- ============================================================================
-- 1. APPOINTMENT PROVIDERS TABLE & IDEMPOTENT ALTERS
-- Stores authorized hospital scheduling partnerships and OPD fee structures.
-- ============================================================================

CREATE TABLE IF NOT EXISTS appointment_providers (
    id BIGSERIAL PRIMARY KEY,
    hospital_id VARCHAR(100) NOT NULL UNIQUE,
    integration_type VARCHAR(50) NOT NULL DEFAULT 'carecompass_partner',
    booking_enabled BOOLEAN NOT NULL DEFAULT false,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'Not Verified',
    consultation_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
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

-- Idempotent column additions for partially existing tables
ALTER TABLE appointment_providers ADD COLUMN IF NOT EXISTS hospital_id VARCHAR(100);
ALTER TABLE appointment_providers ADD COLUMN IF NOT EXISTS integration_type VARCHAR(50) DEFAULT 'carecompass_partner';
ALTER TABLE appointment_providers ADD COLUMN IF NOT EXISTS booking_enabled BOOLEAN DEFAULT false;
ALTER TABLE appointment_providers ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'Not Verified';
ALTER TABLE appointment_providers ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE appointment_providers ADD COLUMN IF NOT EXISTS carecompass_fee NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE appointment_providers ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50) DEFAULT 'pay_at_hospital';
ALTER TABLE appointment_providers ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';
ALTER TABLE appointment_providers ADD COLUMN IF NOT EXISTS cancellation_deadline_hours INTEGER DEFAULT 4;
ALTER TABLE appointment_providers ADD COLUMN IF NOT EXISTS departments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE appointment_providers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE appointment_providers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Explicitly enforce unverified / disabled defaults on pre-existing tables
ALTER TABLE appointment_providers ALTER COLUMN booking_enabled SET DEFAULT false;
ALTER TABLE appointment_providers ALTER COLUMN verification_status SET DEFAULT 'Not Verified';
ALTER TABLE appointment_providers ALTER COLUMN consultation_fee SET DEFAULT 0.00;
ALTER TABLE appointment_providers ALTER COLUMN payment_mode SET DEFAULT 'pay_at_hospital';

-- ============================================================================
-- 2. APPOINTMENT SLOTS TABLE & IDEMPOTENT ALTERS
-- Available consultation slots for genuinely integrated healthcare facilities.
-- ============================================================================

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

-- Idempotent column additions
ALTER TABLE appointment_slots ADD COLUMN IF NOT EXISTS hospital_id VARCHAR(100);
ALTER TABLE appointment_slots ADD COLUMN IF NOT EXISTS department_id VARCHAR(100);
ALTER TABLE appointment_slots ADD COLUMN IF NOT EXISTS department_name VARCHAR(255);
ALTER TABLE appointment_slots ADD COLUMN IF NOT EXISTS doctor_id VARCHAR(100);
ALTER TABLE appointment_slots ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255);
ALTER TABLE appointment_slots ADD COLUMN IF NOT EXISTS slot_date DATE;
ALTER TABLE appointment_slots ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE appointment_slots ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE appointment_slots ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'available';
ALTER TABLE appointment_slots ADD COLUMN IF NOT EXISTS reserved_by_session VARCHAR(100);
ALTER TABLE appointment_slots ADD COLUMN IF NOT EXISTS reservation_expires_at TIMESTAMPTZ;
ALTER TABLE appointment_slots ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Re-verify slot status check constraint
ALTER TABLE appointment_slots DROP CONSTRAINT IF EXISTS chk_slot_status;
ALTER TABLE appointment_slots ADD CONSTRAINT chk_slot_status 
    CHECK (availability_status IN ('available', 'reserved', 'booked', 'blocked'));

-- ============================================================================
-- 3. APPOINTMENTS TABLE & IDEMPOTENT ALTERS
-- Stores verified bookings (confirmed) and facility appointment requests (pending_confirmation).
-- ============================================================================

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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Idempotent column additions for existing tables
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(64);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booking_type VARCHAR(50) DEFAULT 'direct_booking';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS hospital_id VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS hospital_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS hospital_phone VARCHAR(50);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS hospital_address TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS department_id VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS department_name VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_id VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS slot_id BIGINT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_date DATE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_name VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_phone VARCHAR(20);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_email VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booking_status VARCHAR(50) DEFAULT 'pending_confirmation';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pay_at_hospital';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50) DEFAULT 'pay_at_hospital';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_fee NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS confirmed_by_system VARCHAR(100);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- CRITICAL SAFETY FIX: Ensure slot_id is nullable on existing tables to support appointment requests
ALTER TABLE appointments ALTER COLUMN slot_id DROP NOT NULL;
ALTER TABLE appointments ALTER COLUMN consultation_fee SET DEFAULT 0.00;
ALTER TABLE appointments ALTER COLUMN total_amount SET DEFAULT 0.00;
ALTER TABLE appointments ALTER COLUMN booking_status SET DEFAULT 'pending_confirmation';
ALTER TABLE appointments ALTER COLUMN payment_status SET DEFAULT 'pay_at_hospital';
ALTER TABLE appointments ALTER COLUMN payment_mode SET DEFAULT 'pay_at_hospital';

-- Update check constraints safely
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS chk_booking_status;
ALTER TABLE appointments ADD CONSTRAINT chk_booking_status 
    CHECK (booking_status IN ('pending_confirmation', 'confirmed', 'cancelled', 'completed', 'rescheduled'));

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS chk_payment_status;
ALTER TABLE appointments ADD CONSTRAINT chk_payment_status 
    CHECK (payment_status IN ('pay_at_hospital', 'pending', 'paid', 'waived', 'cancelled'));

-- ============================================================================
-- 4. PAYMENTS & AUDIT LEDGER TABLE & IDEMPOTENT ALTERS
-- Tracks OPD counter billing records and audit logs.
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    booking_reference VARCHAR(64) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'hospital_counter',
    provider_order_id VARCHAR(100) UNIQUE NOT NULL,
    provider_payment_id VARCHAR(100),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'pay_at_hospital',
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pay_at_hospital',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Idempotent column additions for payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS appointment_id BIGINT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(64);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'hospital_counter';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_order_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider_payment_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'pay_at_hospital';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pay_at_hospital';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Safe foreign key constraint for partially existing tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_payments_appointment'
    ) THEN
        ALTER TABLE payments 
            ADD CONSTRAINT fk_payments_appointment 
            FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- 5. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_appointment_providers_hosp ON appointment_providers (hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_query ON appointment_slots (hospital_id, slot_date, availability_status);
CREATE INDEX IF NOT EXISTS idx_appointment_slots_cleanup ON appointment_slots (availability_status, reservation_expires_at)
    WHERE availability_status = 'reserved';
CREATE INDEX IF NOT EXISTS idx_appointments_ref ON appointments (booking_reference);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments (patient_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_hosp ON appointments (hospital_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (booking_status);
CREATE INDEX IF NOT EXISTS idx_payments_ref ON payments (booking_reference);

-- ============================================================================
-- 6. AUTOMATIC UPDATED_AT TIMESTAMP TRIGGER
-- ============================================================================

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

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES & ACCESS CONTROL
-- ZERO DATA LEAKAGE ENFORCEMENT
-- ============================================================================

ALTER TABLE appointment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Clean up existing legacy policies
DROP POLICY IF EXISTS "Public can view active appointment providers" ON appointment_providers;
DROP POLICY IF EXISTS "Public can view available appointment slots" ON appointment_slots;
DROP POLICY IF EXISTS "Public can view appointments" ON appointments;
DROP POLICY IF EXISTS "Public can view payments" ON payments;
DROP POLICY IF EXISTS "Service role access for appointment_providers" ON appointment_providers;
DROP POLICY IF EXISTS "Service role access for appointment_slots" ON appointment_slots;
DROP POLICY IF EXISTS "Service role access for appointments" ON appointments;
DROP POLICY IF EXISTS "Service role access for payments" ON payments;

-- 7.1. Appointment Providers: Public can ONLY view genuinely verified & active facilities
CREATE POLICY "Public can view active appointment providers"
    ON appointment_providers FOR SELECT
    USING (booking_enabled = true AND verification_status = 'Verified');

-- 7.2. Appointment Slots: NO direct public SELECT access.
-- Slot availability is queried exclusively via backend API (/api/appointments/slots),
-- preventing public scraping of doctor schedules or reservation session tokens.
-- (Public direct select is intentionally omitted)

-- 7.3. Appointments: NO direct public SELECT or modification.
-- Patient names, telephone numbers, emails, and medical notes are protected.
-- Patient lookup is handled strictly via backend API with phone verification.

-- 7.4. Payments: NO direct public access.
-- All financial records are restricted.

-- 7.5. Backend Service Role: Full administrative access for API execution
CREATE POLICY "Service role access for appointment_providers"
    ON appointment_providers FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role access for appointment_slots"
    ON appointment_slots FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role access for appointments"
    ON appointments FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role access for payments"
    ON payments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Explicitly revoke sensitive table permissions from anon & authenticated public roles
REVOKE ALL ON appointments FROM anon, authenticated;
REVOKE ALL ON payments FROM anon, authenticated;
REVOKE ALL ON appointment_slots FROM anon, authenticated;
REVOKE ALL ON appointment_providers FROM anon, authenticated;

-- Grant selective read access on appointment_providers (filtered strictly by RLS policy)
GRANT SELECT ON appointment_providers TO anon, authenticated;

-- NOTE: Demo provider seeds have been separated into:
-- database/seeds/demo_appointment_providers.sql
-- Never run demo seeds in a production environment.
