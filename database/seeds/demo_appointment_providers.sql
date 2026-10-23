-- ============================================================================
-- CareCompass: DEMO / STAGING SEED DATA ONLY
-- File: database/seeds/demo_appointment_providers.sql
-- Description: Sample partner provider integrations and consultation slots
--              for local development and sandbox testing ONLY.
--
-- WARNING: DO NOT RUN THIS SCRIPT IN PRODUCTION!
-- Real healthcare facilities must only be activated upon executing formal
-- scheduling agreements and hospital scheduling API onboarding.
-- ============================================================================

-- 1. Insert Demo Partner Hospital Providers
INSERT INTO appointment_providers (
    hospital_id,
    integration_type,
    booking_enabled,
    verification_status,
    consultation_fee,
    carecompass_fee,
    payment_mode,
    currency,
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
    'INR',
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
    'INR',
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

-- 2. Insert Sample Consultation Slots for Demo Testing (Next 7 Days)
-- Generates authentic testing slots for IN-HOSP-11299
DO $$
DECLARE
    curr_date DATE;
    day_offset INTEGER;
BEGIN
    FOR day_offset IN 1..7 LOOP
        curr_date := CURRENT_DATE + day_offset;
        
        INSERT INTO appointment_slots (hospital_id, department_id, department_name, slot_date, start_time, end_time, availability_status)
        VALUES 
            ('IN-HOSP-11299', 'gen-med', 'General Medicine', curr_date, '09:30:00', '10:00:00', 'available'),
            ('IN-HOSP-11299', 'gen-med', 'General Medicine', curr_date, '10:15:00', '10:45:00', 'available'),
            ('IN-HOSP-11299', 'gen-med', 'General Medicine', curr_date, '11:00:00', '11:30:00', 'available'),
            ('IN-HOSP-11299', 'gen-med', 'General Medicine', curr_date, '11:45:00', '12:15:00', 'available'),
            ('IN-HOSP-11299', 'gen-med', 'General Medicine', curr_date, '14:00:00', '14:30:00', 'available'),
            ('IN-HOSP-11299', 'gen-med', 'General Medicine', curr_date, '14:45:00', '15:15:00', 'available'),
            ('IN-HOSP-11299', 'gen-med', 'General Medicine', curr_date, '15:30:00', '16:00:00', 'available'),
            ('IN-HOSP-11299', 'gen-med', 'General Medicine', curr_date, '16:15:00', '16:45:00', 'available')
        ON CONFLICT (hospital_id, department_id, slot_date, start_time) DO NOTHING;
    END LOOP;
END $$;
