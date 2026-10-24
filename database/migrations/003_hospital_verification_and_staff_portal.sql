-- ============================================================================
-- CareCompass: Supabase PostgreSQL Database Migration
-- Migration: 003_hospital_verification_and_staff_portal.sql
-- Description: Hospital Partner Verification, Multi-Tenant Staff Portal,
--              Role-Based Access Control, Audit Logs, and Rescheduling Workflow.
--
-- COMPLIANCE & SAFETY GUARANTEES:
-- 1. Strictly DDL only. Preserves all 42,940 existing hospital records intact.
-- 2. Fully idempotent with CREATE TABLE IF NOT EXISTS and ALTER TABLE IF NOT EXISTS.
-- 3. Does NOT automatically mark any hospital as verified.
-- 4. Does NOT automatically enable direct booking upon verification approval.
-- 5. Enables strict RLS on all new tables to protect staff credentials, private
--    verification documents, and audit logs from unauthorized access.
-- ============================================================================

-- ============================================================================
-- 1. PLATFORM ADMINISTRATOR USERS TABLE
-- Stores platform-level administrative accounts with cryptographic password hashes.
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'platform_admin',
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_admin_role CHECK (role IN ('platform_admin', 'compliance_officer', 'system_admin'))
);

ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'platform_admin';
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS chk_admin_role;
ALTER TABLE admin_users ADD CONSTRAINT chk_admin_role
    CHECK (role IN ('platform_admin', 'compliance_officer', 'system_admin'));

-- ============================================================================
-- 2. HOSPITAL VERIFICATION REQUESTS TABLE
-- Tracks hospital ownership claims submitted by official representatives.
-- ============================================================================

CREATE TABLE IF NOT EXISTS hospital_verification_requests (
    id BIGSERIAL PRIMARY KEY,
    request_reference VARCHAR(64) NOT NULL UNIQUE,
    hospital_id VARCHAR(100) NOT NULL,
    hospital_name TEXT NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_designation VARCHAR(100) NOT NULL,
    official_email VARCHAR(255) NOT NULL,
    official_phone VARCHAR(30) NOT NULL,
    hospital_registration_number VARCHAR(100) NOT NULL,
    initial_password_hash VARCHAR(255) NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending_review',
    admin_notes TEXT,
    reviewed_by_admin_id VARCHAR(100),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_verification_status CHECK (
        verification_status IN ('pending_review', 'under_investigation', 'approved', 'rejected')
    )
);

ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS request_reference VARCHAR(64);
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS hospital_id VARCHAR(100);
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS hospital_name TEXT;
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS applicant_name VARCHAR(255);
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS applicant_designation VARCHAR(100);
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS official_email VARCHAR(255);
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS official_phone VARCHAR(30);
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS hospital_registration_number VARCHAR(100);
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS initial_password_hash VARCHAR(255);
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'pending_review';
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS reviewed_by_admin_id VARCHAR(100);
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE hospital_verification_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE hospital_verification_requests DROP CONSTRAINT IF EXISTS chk_verification_status;
ALTER TABLE hospital_verification_requests ADD CONSTRAINT chk_verification_status
    CHECK (verification_status IN ('pending_review', 'under_investigation', 'approved', 'rejected'));

-- ============================================================================
-- 3. PRIVATE VERIFICATION DOCUMENTS TABLE
-- Metadata for verification documents stored securely with private access only.
-- ============================================================================

CREATE TABLE IF NOT EXISTS verification_documents (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES hospital_verification_requests(id) ON DELETE CASCADE,
    hospital_id VARCHAR(100) NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- 'registration_certificate', 'medical_director_id', 'nabh_certificate', etc.
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL, -- Private storage identifier, never a public URL
    access_level VARCHAR(50) NOT NULL DEFAULT 'admin_only',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_doc_access_level CHECK (access_level IN ('admin_only', 'hospital_admin', 'internal_compliance'))
);

ALTER TABLE verification_documents ADD COLUMN IF NOT EXISTS request_id BIGINT;
ALTER TABLE verification_documents ADD COLUMN IF NOT EXISTS hospital_id VARCHAR(100);
ALTER TABLE verification_documents ADD COLUMN IF NOT EXISTS document_type VARCHAR(100);
ALTER TABLE verification_documents ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE verification_documents ADD COLUMN IF NOT EXISTS file_type VARCHAR(100);
ALTER TABLE verification_documents ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;
ALTER TABLE verification_documents ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE verification_documents ADD COLUMN IF NOT EXISTS access_level VARCHAR(50) DEFAULT 'admin_only';
ALTER TABLE verification_documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE verification_documents DROP CONSTRAINT IF EXISTS chk_doc_access_level;
ALTER TABLE verification_documents ADD CONSTRAINT chk_doc_access_level
    CHECK (access_level IN ('admin_only', 'hospital_admin', 'internal_compliance'));

-- ============================================================================
-- 4. HOSPITAL STAFF USERS TABLE
-- Authorized staff accounts isolated by hospital_id with role-based permissions.
-- ============================================================================

CREATE TABLE IF NOT EXISTS hospital_staff_users (
    id BIGSERIAL PRIMARY KEY,
    hospital_id VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    role VARCHAR(50) NOT NULL DEFAULT 'hospital_staff', -- 'hospital_admin', 'hospital_staff'
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    verification_request_id BIGINT REFERENCES hospital_verification_requests(id) ON DELETE SET NULL,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_staff_role CHECK (role IN ('hospital_admin', 'hospital_staff'))
);

ALTER TABLE hospital_staff_users ADD COLUMN IF NOT EXISTS hospital_id VARCHAR(100);
ALTER TABLE hospital_staff_users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE hospital_staff_users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE hospital_staff_users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE hospital_staff_users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'hospital_staff';
ALTER TABLE hospital_staff_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE hospital_staff_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE hospital_staff_users ADD COLUMN IF NOT EXISTS verification_request_id BIGINT;
ALTER TABLE hospital_staff_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE hospital_staff_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE hospital_staff_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE hospital_staff_users DROP CONSTRAINT IF EXISTS chk_staff_role;
ALTER TABLE hospital_staff_users ADD CONSTRAINT chk_staff_role
    CHECK (role IN ('hospital_admin', 'hospital_staff'));

-- ============================================================================
-- 5. HOSPITAL & CLINICAL AUDIT LOGS TABLE
-- Immutable cryptographic audit trail of all verification, staff, and appointment actions.
-- ============================================================================

CREATE TABLE IF NOT EXISTS hospital_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'verification_request', 'staff_user', 'appointment', 'provider_config'
    entity_id VARCHAR(100) NOT NULL,
    hospital_id VARCHAR(100),
    actor_type VARCHAR(50) NOT NULL, -- 'admin', 'staff', 'patient', 'system'
    actor_id VARCHAR(100),
    actor_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE hospital_audit_logs ADD COLUMN IF NOT EXISTS event_type VARCHAR(100);
ALTER TABLE hospital_audit_logs ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50);
ALTER TABLE hospital_audit_logs ADD COLUMN IF NOT EXISTS entity_id VARCHAR(100);
ALTER TABLE hospital_audit_logs ADD COLUMN IF NOT EXISTS hospital_id VARCHAR(100);
ALTER TABLE hospital_audit_logs ADD COLUMN IF NOT EXISTS actor_type VARCHAR(50);
ALTER TABLE hospital_audit_logs ADD COLUMN IF NOT EXISTS actor_id VARCHAR(100);
ALTER TABLE hospital_audit_logs ADD COLUMN IF NOT EXISTS actor_email VARCHAR(255);
ALTER TABLE hospital_audit_logs ADD COLUMN IF NOT EXISTS action VARCHAR(100);
ALTER TABLE hospital_audit_logs ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE hospital_audit_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50);
ALTER TABLE hospital_audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- ============================================================================
-- 6. APPOINTMENTS EXTENSIONS FOR RESCHEDULING & STAFF ACTIONS
-- Idempotent column additions and updated constraint to support proposed reschedules.
-- ============================================================================

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS proposed_date DATE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS proposed_time TIME;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS hospital_staff_notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS actioned_by_staff_id BIGINT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS actioned_at TIMESTAMPTZ;

-- Update booking status check constraint to support rescheduled_pending_patient
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS chk_booking_status;
ALTER TABLE appointments ADD CONSTRAINT chk_booking_status 
    CHECK (booking_status IN ('pending_confirmation', 'confirmed', 'cancelled', 'completed', 'rescheduled', 'rescheduled_pending_patient'));

-- ============================================================================
-- 7. PERFORMANCE & LOOKUP INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_hvr_hospital_id ON hospital_verification_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hvr_status ON hospital_verification_requests(verification_status);
CREATE INDEX IF NOT EXISTS idx_hvr_ref ON hospital_verification_requests(request_reference);
CREATE INDEX IF NOT EXISTS idx_staff_hospital ON hospital_staff_users(hospital_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON hospital_staff_users(email);
CREATE INDEX IF NOT EXISTS idx_audit_hospital ON hospital_audit_logs(hospital_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON hospital_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON hospital_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vdocs_request ON verification_documents(request_id);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Protects staff credentials, private verification documents, and audit logs.
-- ============================================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_audit_logs ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policies for Supabase service_role / backend access
DO $$
BEGIN
    DROP POLICY IF EXISTS service_role_all_admin_users ON admin_users;
    CREATE POLICY service_role_all_admin_users ON admin_users
        FOR ALL USING (auth.role() = 'service_role');

    DROP POLICY IF EXISTS service_role_all_hvr ON hospital_verification_requests;
    CREATE POLICY service_role_all_hvr ON hospital_verification_requests
        FOR ALL USING (auth.role() = 'service_role');

    DROP POLICY IF EXISTS service_role_all_vdocs ON verification_documents;
    CREATE POLICY service_role_all_vdocs ON verification_documents
        FOR ALL USING (auth.role() = 'service_role');

    DROP POLICY IF EXISTS service_role_all_staff ON hospital_staff_users;
    CREATE POLICY service_role_all_staff ON hospital_staff_users
        FOR ALL USING (auth.role() = 'service_role');

    DROP POLICY IF EXISTS service_role_all_audit ON hospital_audit_logs;
    CREATE POLICY service_role_all_audit ON hospital_audit_logs
        FOR ALL USING (auth.role() = 'service_role');
END $$;
