-- ============================================================================
-- CareCompass: STAGING FICTIONAL HOSPITALS SEED SCRIPT
-- Strictly for staging environment testing & validation. Safe and repeatable.
-- 
-- WARNING: DO NOT RUN THIS SCRIPT IN PRODUCTION!
-- ============================================================================

INSERT INTO hospitals (
    hospital_id,
    hospital_name,
    facility_type,
    ownership_type,
    state,
    district,
    address,
    pin_code,
    phone,
    email,
    available_specializations,
    available_services
) VALUES 
(
    'STAGE-FICT-001',
    'CareCompass Test General Hospital (Fictional Sandbox)',
    'General Hospital',
    'Private',
    'Delhi',
    'New Delhi',
    'Plot 101, Fictional Health Corridor, Knowledge Park',
    '110001',
    '+91 99999 00001',
    'admin@fictional-hospital-alpha.carecompass.test',
    '["General Medicine", "Cardiology", "Pediatrics"]'::jsonb,
    '["OPD", "Emergency", "Diagnostics"]'::jsonb
),
(
    'STAGE-FICT-002',
    'Apex Memorial Specialty Center (Fictional Sandbox)',
    'Specialty Hospital',
    'Trust',
    'Maharashtra',
    'Mumbai',
    'Sector 4, Fictional Medical Enclave',
    '400001',
    '+91 99999 00002',
    'contact@fictional-apex-beta.carecompass.test',
    '["Neurology", "Orthopedics", "Oncology"]'::jsonb,
    '["Consultation", "Day Care", "MRI / CT"]'::jsonb
),
(
    'STAGE-FICT-003',
    'St. Jude Community Clinic (Fictional Sandbox - Unintegrated)',
    'Community Health Centre',
    'Government',
    'Karnataka',
    'Bengaluru Urban',
    'Phase 2, Synthetic Medical Road',
    '560001',
    '+91 99999 00003',
    'info@fictional-stjude-gamma.carecompass.test',
    '["General Medicine", "Family Practice"]'::jsonb,
    '["Basic OPD", "Immunization"]'::jsonb
)
ON CONFLICT (hospital_id) DO UPDATE SET
    hospital_name = EXCLUDED.hospital_name,
    facility_type = EXCLUDED.facility_type,
    ownership_type = EXCLUDED.ownership_type,
    state = EXCLUDED.state,
    district = EXCLUDED.district,
    address = EXCLUDED.address,
    pin_code = EXCLUDED.pin_code,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    available_specializations = EXCLUDED.available_specializations,
    available_services = EXCLUDED.available_services;
