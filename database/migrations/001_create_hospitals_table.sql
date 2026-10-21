-- ============================================================================
-- CareCompass: Supabase PostgreSQL Database Migration
-- Migration: 001_create_hospitals_table.sql
-- Description: Creates the master hospitals table, indexes, constraints, 
--              PostGIS/Trigram extensions, auto-updating triggers, and RLS policies.
-- ============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Optional PostGIS extension for geographic distance queries
DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS "postgis";
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'PostGIS extension not available; standard Haversine mathematical queries will be used.';
END $$;

-- 2. Create Master 'hospitals' Table
CREATE TABLE IF NOT EXISTS hospitals (
    -- Primary Identifiers
    id BIGSERIAL PRIMARY KEY,
    hospital_id VARCHAR(100) UNIQUE,
    source_record_id VARCHAR(100),

    -- Hospital Identity
    hospital_name TEXT NOT NULL,
    alternate_name TEXT,
    facility_type VARCHAR(100) NOT NULL DEFAULT 'General Hospital',
    ownership_type VARCHAR(50) NOT NULL DEFAULT 'Government',
    healthcare_category VARCHAR(100),

    -- Geographic & Administrative Location
    address TEXT,
    locality TEXT,
    village TEXT,
    subdistrict_or_taluka TEXT,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    state_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'India',
    pin_code VARCHAR(10),

    -- GPS Coordinates (Validated to Indian Geographical Bounding Box)
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    -- Official Communication Channels (Authentic data only, never fabricated)
    phone VARCHAR(50),
    alternate_phone VARCHAR(50),
    email VARCHAR(255),
    website TEXT,
    official_website TEXT,

    -- Services & Clinical Specializations (Structured JSONB)
    specializations JSONB DEFAULT '[]'::jsonb,
    services JSONB DEFAULT '[]'::jsonb,
    available_specializations JSONB DEFAULT '[]'::jsonb,
    available_services JSONB DEFAULT '[]'::jsonb,

    -- Operational Schedule & Emergency Status
    emergency_availability VARCHAR(100) DEFAULT 'Regular Hours',
    emergency_service_status VARCHAR(100) DEFAULT 'Regular Hours',
    operating_hours TEXT DEFAULT 'OPD: 09:00 - 17:00',

    -- Physical Accessibility Infrastructure
    accessibility_features JSONB DEFAULT '{"wheelchairRamp":false,"elevator":false,"accessibleRestroom":false,"groundFloorServices":false}'::jsonb,

    -- Trust, Verification & Audit Metrics
    verification_status VARCHAR(50) NOT NULL DEFAULT 'Partially Verified',
    data_confidence NUMERIC(3,2) DEFAULT 0.85,
    missing_fields JSONB DEFAULT '[]'::jsonb,
    duplicate_group_id VARCHAR(100),
    last_verified_at TIMESTAMPTZ,

    -- Attribution & Provenance
    source_name TEXT DEFAULT 'MoHFW / PM-JAY National Health Facility Registry',
    source_url TEXT,
    source_license TEXT DEFAULT 'Government Open Data License (GODL)',
    source_last_updated TIMESTAMPTZ,

    -- Record Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Data Integrity Constraints
    CONSTRAINT chk_pin_code CHECK (
        pin_code IS NULL OR pin_code ~ '^[1-9][0-9]{5}$'
    ),
    CONSTRAINT chk_coordinates CHECK (
        (latitude IS NULL AND longitude IS NULL) OR
        (latitude BETWEEN 6.0 AND 38.0 AND longitude BETWEEN 68.0 AND 98.0)
    ),
    CONSTRAINT chk_verification_status CHECK (
        verification_status IN ('Verified', 'Partially Verified', 'Not Verified')
    ),
    CONSTRAINT chk_ownership_type CHECK (
        ownership_type IN ('Government', 'Private', 'Public-Sector', 'Trust/NGO')
    )
);

-- 3. Automatic 'updated_at' Timestamp Trigger
CREATE OR REPLACE FUNCTION update_hospitals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hospitals_updated_at ON hospitals;
CREATE TRIGGER trg_hospitals_updated_at
    BEFORE UPDATE ON hospitals
    FOR EACH ROW
    EXECUTE FUNCTION update_hospitals_updated_at();

-- 4. High-Performance Search & Filter Indexes

-- Exact & Prefix Lookups
CREATE INDEX IF NOT EXISTS idx_hospitals_state ON hospitals (state);
CREATE INDEX IF NOT EXISTS idx_hospitals_district ON hospitals (district);
CREATE INDEX IF NOT EXISTS idx_hospitals_state_district ON hospitals (state, district);
CREATE INDEX IF NOT EXISTS idx_hospitals_pincode ON hospitals (pin_code);
CREATE INDEX IF NOT EXISTS idx_hospitals_facility_type ON hospitals (facility_type);
CREATE INDEX IF NOT EXISTS idx_hospitals_ownership_type ON hospitals (ownership_type);
CREATE INDEX IF NOT EXISTS idx_hospitals_verification ON hospitals (verification_status);
CREATE INDEX IF NOT EXISTS idx_hospitals_confidence ON hospitals (data_confidence DESC);

-- GPS Coordinate Index for Spatial Filtering
CREATE INDEX IF NOT EXISTS idx_hospitals_coords ON hospitals (latitude, longitude)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Trigram Indexes for Substring & Fuzzy Text Search (pg_trgm)
CREATE INDEX IF NOT EXISTS idx_hospitals_name_trgm ON hospitals USING gin (hospital_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hospitals_locality_trgm ON hospitals USING gin (locality gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hospitals_district_trgm ON hospitals USING gin (district gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hospitals_address_trgm ON hospitals USING gin (address gin_trgm_ops);

-- JSONB GIN Indexes for Clinical Services & Specializations
CREATE INDEX IF NOT EXISTS idx_hospitals_services_gin ON hospitals USING gin (services);
CREATE INDEX IF NOT EXISTS idx_hospitals_specializations_gin ON hospitals USING gin (specializations);

-- 5. Row Level Security (RLS) Policies
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Public Anonymous & Authenticated Read Access (for directory visitors)
DROP POLICY IF EXISTS "Public can view hospital directory records" ON hospitals;
CREATE POLICY "Public can view hospital directory records"
    ON hospitals FOR SELECT
    USING (true);

-- Service Role Full Privileges (for backend API & batch data migration scripts)
DROP POLICY IF EXISTS "Service role has full management access" ON hospitals;
CREATE POLICY "Service role has full management access"
    ON hospitals FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Documentation Metadata
COMMENT ON TABLE hospitals IS 'CareCompass Pan-India Healthcare Facility Registry (MoHFW, PM-JAY & State Directories)';
COMMENT ON COLUMN hospitals.hospital_id IS 'Unique slug/ID identifying the facility across national registries';
COMMENT ON COLUMN hospitals.data_confidence IS 'Score from 0.0 to 1.0 based on phone, GPS coordinates, and recent audit status';
