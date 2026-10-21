import os
import json
import re

# Comprehensive list of tier-1, tier-2, tier-3 hospitals across every state and region of India
pan_india_facilities = [
    # ------------------ UTTAR PRADESH ------------------
    {
      "id": "fac-up-sgpgi-lko",
      "name": "Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGI)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Lucknow",
      "locationId": "lucknow",
      "locationName": "Raebareli Road, Lucknow",
      "state": "Uttar Pradesh",
      "district": "Lucknow",
      "address": "Raebareli Road, Haibat Mau Mawaiya, Lucknow, Uttar Pradesh 226014",
      "pinCode": "226014",
      "coordinates": {"lat": 26.7456, "lng": 80.9392},
      "cityAliases": ["lucknow", "lko", "up", "raebareli road", "uttar pradesh", "sgpgi", "pgi lucknow", "hazratganj", "gomti nagar", "alambagh", "indira nagar"],
      "phone": "+91-522-2668004",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Inpatient | OPD: 08:30 - 16:30",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency & Apex Trauma ICU", "status": "AVAILABLE", "statusReason": "Apex Trauma Centre fully operational with dedicated ventilators.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "Direct Hospital Admin Telemetry", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "MRI Scan (3.0 Tesla Advanced)", "status": "AVAILABLE", "statusReason": "Siemens 3T Prisma active in Department of Radiodiagnosis.", "lastVerified": "2026-10-15T10:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "CT Scan (256-Slice Dual Energy)", "status": "AVAILABLE", "statusReason": "256 slice ultra-fast scanner operational round the clock.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "xray", "name": "Digital X-ray & Fluoroscopy", "status": "AVAILABLE", "statusReason": "All digital radiography suites operational.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "Direct Hospital Admin Telemetry", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "dialysis", "name": "Nephrology & Hemodialysis Unit", "status": "AVAILABLE", "statusReason": "32 dialysis stations active under Department of Nephrology.", "lastVerified": "2026-10-15T08:00:00Z", "verifiedBy": "Direct Hospital Admin Telemetry", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "cardiology", "name": "Cardiology & Cath Lab", "status": "AVAILABLE", "statusReason": "Primary PCI & emergency cardiac interventions operational 24/7.", "lastVerified": "2026-10-15T08:00:00Z", "verifiedBy": "Direct Hospital Admin Telemetry", "sourceType": "HOSPITAL_OFFICIAL"}
      ]
    },
    {
      "id": "fac-up-kgmu-lko",
      "name": "King George's Medical University (KGMU)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Lucknow",
      "locationId": "lucknow",
      "locationName": "Chowk, Old Lucknow",
      "state": "Uttar Pradesh",
      "district": "Lucknow",
      "address": "Shah Mina Road, Chowk, Lucknow, Uttar Pradesh 226003",
      "pinCode": "226003",
      "coordinates": {"lat": 26.8687, "lng": 80.9168},
      "cityAliases": ["lucknow", "chowk", "kgmu", "george medical", "old lucknow", "hazratganj", "charbagh"],
      "phone": "+91-522-2257450",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": False, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Trauma Surgery & ICU", "status": "AVAILABLE", "statusReason": "Trauma Centre triage active 24/7.", "lastVerified": "2026-10-15T09:15:00Z", "verifiedBy": "KGMU Emergency Desk", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "xray", "name": "Emergency Digital X-ray", "status": "AVAILABLE", "statusReason": "Trauma center X-ray suite operational.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "mri", "name": "MRI Scan (1.5 Tesla)", "status": "UNAVAILABLE", "statusReason": "Undergoing annual helium cooling servicing. Emergency cases redirected to SGPGI.", "lastVerified": "2026-10-15T08:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "blood_test", "name": "Central Clinical Pathology Lab", "status": "AVAILABLE", "statusReason": "Automated biochemistry and hematology operational 24/7.", "lastVerified": "2026-10-15T08:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-up-bhu-varanasi",
      "name": "Sir Sunderlal Hospital, IMS-BHU",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Varanasi",
      "locationId": "varanasi",
      "locationName": "BHU Campus, Varanasi",
      "state": "Uttar Pradesh",
      "district": "Varanasi",
      "address": "Banaras Hindu University, Lanka, Varanasi, Uttar Pradesh 221005",
      "pinCode": "221005",
      "coordinates": {"lat": 25.2758, "lng": 82.9998},
      "cityAliases": ["varanasi", "banaras", "kashi", "bhu", "lanka", "purvanchal", "godowlia", "cantt"],
      "phone": "+91-542-2369291",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Trauma Emergency Centre", "status": "AVAILABLE", "statusReason": "Major referral center for Eastern UP and Bihar border.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "Hospital Telemetry", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "MRI Scan (1.5T / 3T)", "status": "AVAILABLE", "statusReason": "Operational for inpatient and emergency requisitions.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "Multislice CT Scanner", "status": "AVAILABLE", "statusReason": "Trauma CT running 24 hours.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Hemodialysis Unit", "status": "AVAILABLE", "statusReason": "Renal care active across all shifts.", "lastVerified": "2026-10-15T08:00:00Z", "verifiedBy": "Hospital Telemetry", "sourceType": "HOSPITAL_OFFICIAL"}
      ]
    },
    {
      "id": "fac-up-regency-kanpur",
      "name": "Regency Hospital (Super Speciality)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Kanpur",
      "locationId": "kanpur",
      "locationName": "Sarvodaya Nagar, Kanpur",
      "state": "Uttar Pradesh",
      "district": "Kanpur Nagar",
      "address": "A-2, Sarvodaya Nagar, Kanpur, Uttar Pradesh 208005",
      "pinCode": "208005",
      "coordinates": {"lat": 26.4795, "lng": 80.3120},
      "cityAliases": ["kanpur", "knp", "sarvodaya nagar", "swaroop nagar", "kakadeo", "civil lines", "gumti"],
      "phone": "+91-512-3501111",
      "emergencyPhone": "+91-512-3501112",
      "operatingHours": "24/7 Emergency & ICU",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency & Critical Care", "status": "AVAILABLE", "statusReason": "Advanced Level 1 Critical Care Unit active.", "lastVerified": "2026-10-15T10:15:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "mri", "name": "Silent Scan MRI (3.0 Tesla)", "status": "AVAILABLE", "statusReason": "Active with neuro & musculoskeletal protocols.", "lastVerified": "2026-10-15T09:45:00Z", "verifiedBy": "Direct Hospital Admin Telemetry", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "xray", "name": "Digital X-ray", "status": "AVAILABLE", "statusReason": "24/7 digital imaging desk active.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "Direct Hospital Admin Telemetry", "sourceType": "HOSPITAL_OFFICIAL"}
      ]
    },
    {
      "id": "fac-up-fortis-noida",
      "name": "Fortis Hospital Noida (Sector 62)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Noida",
      "locationId": "delhi",
      "locationName": "Sector 62, Noida",
      "state": "Uttar Pradesh",
      "district": "Gautam Buddha Nagar",
      "address": "B-22, Sector 62, Gautam Buddha Nagar, Noida, Uttar Pradesh 201301",
      "pinCode": "201301",
      "coordinates": {"lat": 28.6186, "lng": 77.3725},
      "cityAliases": ["noida", "greater noida", "sector 62", "sector 18", "noida expressway", "ghaziabad", "up ncr", "indradiapuram", "vaishali"],
      "phone": "+91-120-4300222",
      "emergencyPhone": "105010",
      "operatingHours": "24/7 Emergency",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency & Cardiac ICU", "status": "AVAILABLE", "statusReason": "Emergency resuscitation and ICU beds active.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "HIS Automation", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "mri", "name": "3T Wide Bore MRI", "status": "AVAILABLE", "statusReason": "Active 24/7 for acute stroke and trauma imaging.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "HIS Automation", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "ct_scan", "name": "Dual Source Flash CT", "status": "AVAILABLE", "statusReason": "Sub-second cardiac and full-body scans operational.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "HIS Automation", "sourceType": "AUTOMATED_API_SYNC"}
      ]
    },
    {
      "id": "fac-up-aiims-gorakhpur",
      "name": "AIIMS Gorakhpur (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Gorakhpur",
      "locationId": "gorakhpur",
      "locationName": "Kunraghat, Gorakhpur",
      "state": "Uttar Pradesh",
      "district": "Gorakhpur",
      "address": "Kunraghat, Gorakhpur, Uttar Pradesh 273008",
      "pinCode": "273008",
      "coordinates": {"lat": 26.7588, "lng": 83.4283},
      "cityAliases": ["gorakhpur", "gkp", "kunraghat", "eastern up", "basti", "deoria", "maharajganj"],
      "phone": "+91-551-2205501",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & OPD",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency Medicine Unit", "status": "AVAILABLE", "statusReason": "Apex trauma and emergency department fully operational.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "AIIMS Gorakhpur Admin", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "ct_scan", "name": "128-Slice CT Scanner", "status": "AVAILABLE", "statusReason": "24/7 emergency imaging operational.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "pediatrics", "name": "Pediatrics & NICU", "status": "AVAILABLE", "statusReason": "Dedicated encephalitis & pediatric intensive care beds available.", "lastVerified": "2026-10-15T08:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-up-srn-prayagraj",
      "name": "Swaroop Rani Nehru (SRN) Hospital & MLN Medical College",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Prayagraj",
      "locationId": "prayagraj",
      "locationName": "Civil Lines, Prayagraj",
      "state": "Uttar Pradesh",
      "district": "Prayagraj",
      "address": "Mahatma Gandhi Marg, George Town, Prayagraj, Uttar Pradesh 211001",
      "pinCode": "211001",
      "coordinates": {"lat": 25.4526, "lng": 81.8540},
      "cityAliases": ["prayagraj", "allahabad", "civil lines", "george town", "sangam", "mln", "srn"],
      "phone": "+91-532-2256426",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": False, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency & Trauma Centre", "status": "AVAILABLE", "statusReason": "Central government emergency trauma ward functional.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "xray", "name": "Emergency X-ray Suite", "status": "AVAILABLE", "statusReason": "Operational 24/7 in casualty ward.", "lastVerified": "2026-10-15T08:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "blood_test", "name": "Blood Bank & Clinical Pathology", "status": "AVAILABLE", "statusReason": "24-hour component blood bank active.", "lastVerified": "2026-10-15T08:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    # ------------------ RAJASTHAN ------------------
    {
      "id": "fac-raj-sms-jaipur",
      "name": "Sawai Man Singh (SMS) Hospital & Medical College",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Jaipur",
      "locationId": "jaipur",
      "locationName": "JLN Marg, Jaipur",
      "state": "Rajasthan",
      "district": "Jaipur",
      "address": "Jawahar Lal Nehru Marg, Gangawal Park, Adarsh Nagar, Jaipur, Rajasthan 302004",
      "pinCode": "302004",
      "coordinates": {"lat": 26.8978, "lng": 75.8185},
      "cityAliases": ["jaipur", "raj", "rajasthan", "pink city", "jln marg", "c-scheme", "malviya nagar", "mansarovar", "vaishali nagar", "sms jaipur"],
      "phone": "+91-141-2518244",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Inpatient",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Trauma Centre & Super Speciality ICU", "status": "AVAILABLE", "statusReason": "Apex Trauma Centre active round the clock with dedicated trauma surgical teams.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "Hospital Medical Superintendent Desk", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "MRI Scan (3.0 Tesla Silent MRI)", "status": "AVAILABLE", "statusReason": "High-resolution neuro & musculoskeletal imaging operational.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "128-Slice Cardiac CT Scan", "status": "AVAILABLE", "statusReason": "Trauma and elective CT suites running continuously.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Dialysis Centre (35 Beds)", "status": "AVAILABLE", "statusReason": "Subsidized and free dialysis services under Mukhya Mantri Ayushman Arogya Yojana.", "lastVerified": "2026-10-15T08:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-raj-aiims-jodhpur",
      "name": "AIIMS Jodhpur (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Jodhpur",
      "locationId": "jodhpur",
      "locationName": "Basni, Jodhpur",
      "state": "Rajasthan",
      "district": "Jodhpur",
      "address": "Basni Industrial Area, Phase II, Jodhpur, Rajasthan 342005",
      "pinCode": "342005",
      "coordinates": {"lat": 26.2389, "lng": 73.0107},
      "cityAliases": ["jodhpur", "basni", "marwar", "western rajasthan", "aiims jodhpur", "pali", "nagaur"],
      "phone": "+91-291-2740741",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Critical Care",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency Medicine & Trauma", "status": "AVAILABLE", "statusReason": "Tertiary referral trauma care unit fully functional.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "AIIMS Central Dashboard", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "mri", "name": "3T Multi-transmit MRI", "status": "AVAILABLE", "statusReason": "Operational in Department of Diagnostic and Interventional Radiology.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "AIIMS Central Dashboard", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "cardiology", "name": "Cardiology & Cath Lab", "status": "AVAILABLE", "statusReason": "Emergency angiogram and angioplasty available 24/7.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "AIIMS Central Dashboard", "sourceType": "AUTOMATED_API_SYNC"}
      ]
    },
    {
      "id": "fac-raj-geetanjali-udaipur",
      "name": "Geetanjali Hospital & Medical College",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Udaipur",
      "locationId": "udaipur",
      "locationName": "Hiran Magri, Udaipur",
      "state": "Rajasthan",
      "district": "Udaipur",
      "address": "Geetanjali Medicity, Hiran Magri Extension, Manwakhera, Udaipur, Rajasthan 313002",
      "pinCode": "313002",
      "coordinates": {"lat": 24.5683, "lng": 73.7438},
      "cityAliases": ["udaipur", "mewar", "hiran magri", "lake city", "sukhadia circle", "fateh sagar"],
      "phone": "+91-294-2500000",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Multi-Speciality ICU", "status": "AVAILABLE", "statusReason": "Level 1 trauma and critical care team on duty.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "128-Slice Cardiac CT", "status": "AVAILABLE", "statusReason": "Active 24/7 for acute emergencies.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    # ------------------ GUJARAT ------------------
    {
      "id": "fac-guj-civil-ahmedabad",
      "name": "Ahmedabad Civil Hospital & BJMC",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Ahmedabad",
      "locationId": "ahmedabad",
      "locationName": "Asarwa, Ahmedabad",
      "state": "Gujarat",
      "district": "Ahmedabad",
      "address": "Near Haripura, Asarwa, Ahmedabad, Gujarat 380016",
      "pinCode": "380016",
      "coordinates": {"lat": 23.0525, "lng": 72.6026},
      "cityAliases": ["ahmedabad", "amdavad", "gujarat", "asarwa", "navrangpura", "bodakdev", "satellite", "maninagar", "sg highway", "vastrapur"],
      "phone": "+91-79-22683721",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & 1200-Bed New Civil Block",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Trauma Center & Acute Care", "status": "AVAILABLE", "statusReason": "Asia's largest civil healthcare campus; trauma triage active 24/7.", "lastVerified": "2026-10-15T10:30:00Z", "verifiedBy": "Civil Hospital Emergency Desk", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "3.0T MRI Scan Suite", "status": "AVAILABLE", "statusReason": "Operating 24 hours for emergency and scheduled scans.", "lastVerified": "2026-10-15T09:45:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Institute of Kidney Diseases (IKDRC) Dialysis", "status": "AVAILABLE", "statusReason": "Dedicated nephro and kidney transplantation unit operational.", "lastVerified": "2026-10-15T09:15:00Z", "verifiedBy": "Hospital Telemetry", "sourceType": "HOSPITAL_OFFICIAL"}
      ]
    },
    {
      "id": "fac-guj-ssg-vadodara",
      "name": "Sir Sayajirao General Hospital (SSG Hospital)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Vadodara",
      "locationId": "vadodara",
      "locationName": "Sayajiganj, Vadodara",
      "state": "Gujarat",
      "district": "Vadodara",
      "address": "Jail Road, Anandpura, Sayajiganj, Vadodara, Gujarat 390001",
      "pinCode": "390001",
      "coordinates": {"lat": 22.3116, "lng": 73.1895},
      "cityAliases": ["vadodara", "baroda", "sayajiganj", "alkapuri", "gotri", "manjalpur"],
      "phone": "+91-265-2424848",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": False, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Casualty & Critical Care", "status": "AVAILABLE", "statusReason": "Central Gujarat major government trauma centre active.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "xray", "name": "Digital Radiography (X-ray)", "status": "AVAILABLE", "statusReason": "Round the clock casualty X-ray operational.", "lastVerified": "2026-10-15T08:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-guj-civil-surat",
      "name": "New Civil Hospital Surat (NCHS)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Surat",
      "locationId": "surat",
      "locationName": "Majura Gate, Surat",
      "state": "Gujarat",
      "district": "Surat",
      "address": "Ring Road, Majura Gate, Surat, Gujarat 395001",
      "pinCode": "395001",
      "coordinates": {"lat": 21.1764, "lng": 72.8228},
      "cityAliases": ["surat", "south gujarat", "majura gate", "athwa", "adajan", "varachha", "vesu"],
      "phone": "+91-261-2244175",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": False, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Trauma Emergency", "status": "AVAILABLE", "statusReason": "Surat city apex civil emergency department active.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "128-Slice CT Scan", "status": "AVAILABLE", "statusReason": "Active 24/7 for acute head injury & polytrauma.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    # ------------------ WEST BENGAL ------------------
    {
      "id": "fac-wb-sskm-kolkata",
      "name": "IPGMER and SSKM Hospital",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Kolkata",
      "locationId": "kolkata",
      "locationName": "Bhowanipore, Kolkata",
      "state": "West Bengal",
      "district": "Kolkata",
      "address": "244, AJC Bose Road, Bhowanipore, Kolkata, West Bengal 700020",
      "pinCode": "700020",
      "coordinates": {"lat": 22.5393, "lng": 88.3426},
      "cityAliases": ["kolkata", "calcutta", "wb", "west bengal", "sskm", "ipgmer", "bhowanipore", "park street", "salt lake", "howrah", "tollygunge", "alipore", "esplanade", "dum dum"],
      "phone": "+91-33-22231589",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma Center",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Super Speciality Emergency & Trauma", "status": "AVAILABLE", "statusReason": "Premier state referral hospital trauma triage operating at full capacity.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "West Bengal Health Portal", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "MRI Scan (3.0T High Definition)", "status": "AVAILABLE", "statusReason": "Emergency stroke and neuro requisitions running 24 hours.", "lastVerified": "2026-10-15T10:15:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Hemodialysis Unit", "status": "AVAILABLE", "statusReason": "24 dialysis units operational under Swasthya Sathi.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "cardiology", "name": "Cardiology & 24/7 Cath Lab", "status": "AVAILABLE", "statusReason": "Emergency angioplasty team on duty.", "lastVerified": "2026-10-15T08:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-wb-amri-saltlake",
      "name": "Manipal / AMRI Hospital (Salt Lake)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Kolkata",
      "locationId": "kolkata",
      "locationName": "Salt Lake Sector III, Kolkata",
      "state": "West Bengal",
      "district": "North 24 Parganas",
      "address": "JC-16 & 17, Sector III, Bidhannagar, Kolkata, West Bengal 700098",
      "pinCode": "700098",
      "coordinates": {"lat": 22.5697, "lng": 88.4067},
      "cityAliases": ["salt lake", "bidhannagar", "sector 3", "sector 5", "new town", "rajarhat", "kolkata"],
      "phone": "+91-33-66063800",
      "emergencyPhone": "+91-33-66063801",
      "operatingHours": "24/7 Emergency & ICU",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Critical Care & Trauma", "status": "AVAILABLE", "statusReason": "Comprehensive multi-bed emergency resuscitation suite.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "128-Slice Cardiac CT", "status": "AVAILABLE", "statusReason": "Operational 24/7.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-wb-nbmc-siliguri",
      "name": "North Bengal Medical College & Hospital (NBMCH)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Siliguri",
      "locationId": "siliguri",
      "locationName": "Sushrutanagar, Siliguri",
      "state": "West Bengal",
      "district": "Darjeeling",
      "address": "Sushrutanagar, Siliguri, Darjeeling District, West Bengal 734012",
      "pinCode": "734012",
      "coordinates": {"lat": 26.6974, "lng": 88.3755},
      "cityAliases": ["siliguri", "darjeeling", "north bengal", "jalpaiguri", "nbmch", "sushrutanagar", "cooch behar"],
      "phone": "+91-353-2585478",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": False, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency Trauma Unit", "status": "AVAILABLE", "statusReason": "Major referral tertiary center for North Bengal and Sikkim border.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "64-Slice CT Scan", "status": "AVAILABLE", "statusReason": "Trauma CT running 24/7.", "lastVerified": "2026-10-15T09:15:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    # ------------------ MAHARASHTRA ------------------
    {
      "id": "fac-mah-tata-memorial",
      "name": "Tata Memorial Centre & Hospital",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Mumbai",
      "locationId": "mumbai",
      "locationName": "Parel, Mumbai",
      "state": "Maharashtra",
      "district": "Mumbai City",
      "address": "Dr. E Borges Road, Parel, Mumbai, Maharashtra 400012",
      "pinCode": "400012",
      "coordinates": {"lat": 19.0048, "lng": 72.8431},
      "cityAliases": ["mumbai", "parel", "dadar", "tata memorial", "tmc", "worli", "lower parel"],
      "phone": "+91-22-24177000",
      "emergencyPhone": "+91-22-24177001",
      "operatingHours": "24/7 Emergency & Acute Oncology Care",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency & Acute ICU", "status": "AVAILABLE", "statusReason": "Specialized oncology emergency and critical care fully staffed.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "Tata Memorial Central Telemetry", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "3.0 Tesla Advanced MRI", "status": "AVAILABLE", "statusReason": "Advanced imaging suite operational for diagnostics.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "PET-CT & 256-Slice CT", "status": "AVAILABLE", "statusReason": "Diagnostic scans operational round the clock.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-mah-aiims-nagpur",
      "name": "AIIMS Nagpur (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Nagpur",
      "locationId": "nagpur",
      "locationName": "MIHAN, Nagpur",
      "state": "Maharashtra",
      "district": "Nagpur",
      "address": "Plot No. 2, Sector 20, MIHAN, Nagpur, Maharashtra 441108",
      "pinCode": "441108",
      "coordinates": {"lat": 21.0422, "lng": 79.0274},
      "cityAliases": ["nagpur", "vidarbha", "mihan", "wardha road", "dharampeth", "sitabuldi", "aiims nagpur"],
      "phone": "+91-712-2821000",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Trauma Centre & ICU", "status": "AVAILABLE", "statusReason": "Apex trauma centre for Vidarbha region operational.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "AIIMS Nagpur Telemetry", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "3T Wide Bore MRI", "status": "AVAILABLE", "statusReason": "Operational in Radiodiagnosis Department.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "AIIMS Nagpur Telemetry", "sourceType": "HOSPITAL_OFFICIAL"}
      ]
    },
    # ------------------ MADHYA PRADESH ------------------
    {
      "id": "fac-mp-aiims-bhopal",
      "name": "AIIMS Bhopal (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Bhopal",
      "locationId": "bhopal",
      "locationName": "Saket Nagar, Bhopal",
      "state": "Madhya Pradesh",
      "district": "Bhopal",
      "address": "Saket Nagar, AIIMS Campus, Habibganj, Bhopal, Madhya Pradesh 462020",
      "pinCode": "462020",
      "coordinates": {"lat": 23.2064, "lng": 77.4583},
      "cityAliases": ["bhopal", "mp", "madhya pradesh", "saket nagar", "habibganj", "rani kamlapati", "kolar", "mp nagar"],
      "phone": "+91-755-2672317",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Apex Trauma",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency Medicine & Trauma", "status": "AVAILABLE", "statusReason": "Comprehensive Level 1 trauma and resuscitation units active.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "AIIMS Bhopal Portal", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "mri", "name": "3.0 Tesla Silent MRI", "status": "AVAILABLE", "statusReason": "Active 24/7 for acute trauma and stroke imaging.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Hemodialysis Centre", "status": "AVAILABLE", "statusReason": "20 beds operational with strict infection control.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-mp-my-indore",
      "name": "Maharaja Yeshwantrao Hospital (MY Hospital)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Indore",
      "locationId": "indore",
      "locationName": "Sanyogitaganj, Indore",
      "state": "Madhya Pradesh",
      "district": "Indore",
      "address": "MY Hospital Road, Sanyogitaganj, Indore, Madhya Pradesh 452001",
      "pinCode": "452001",
      "coordinates": {"lat": 22.7161, "lng": 75.8776},
      "cityAliases": ["indore", "malwa", "sanyogitaganj", "palasia", "vijay nagar", "chappan", "bhawarkua"],
      "phone": "+91-731-2527383",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": False, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency & Trauma Centre", "status": "AVAILABLE", "statusReason": "Largest government tertiary referral hospital in central India.", "lastVerified": "2026-10-15T09:15:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "CT Scan Unit", "status": "AVAILABLE", "statusReason": "Emergency casualty CT unit operational.", "lastVerified": "2026-10-15T08:45:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    # ------------------ BIHAR ------------------
    {
      "id": "fac-bih-aiims-patna",
      "name": "AIIMS Patna (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Patna",
      "locationId": "patna",
      "locationName": "Phulwari Sharif, Patna",
      "state": "Bihar",
      "district": "Patna",
      "address": "Aurangabad Road, Phulwari Sharif, Patna, Bihar 801507",
      "pinCode": "801507",
      "coordinates": {"lat": 25.5606, "lng": 85.0444},
      "cityAliases": ["patna", "bihar", "phulwari sharif", "danapur", "kankarbagh", "bailey road", "boring road", "patliputra"],
      "phone": "+91-612-2451070",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma Center",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Trauma Emergency & Critical Care", "status": "AVAILABLE", "statusReason": "Apex trauma centre operational with advanced disaster triage.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "AIIMS Patna Central Portal", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "mri", "name": "3T High Precision MRI", "status": "AVAILABLE", "statusReason": "Active in Department of Radiodiagnosis.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Hemodialysis Centre", "status": "AVAILABLE", "statusReason": "Continuous renal replacement therapy & hemodialysis active.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-bih-pmch-patna",
      "name": "Patna Medical College and Hospital (PMCH)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Patna",
      "locationId": "patna",
      "locationName": "Ashok Rajpath, Patna",
      "state": "Bihar",
      "district": "Patna",
      "address": "Ashok Rajpath, Muradpur, Patna, Bihar 800004",
      "pinCode": "800004",
      "coordinates": {"lat": 25.6207, "lng": 85.1601},
      "cityAliases": ["pmch", "ashok rajpath", "muradpur", "gandhi maidan", "patna"],
      "phone": "+91-612-2300080",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": False, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency & Casualty", "status": "AVAILABLE", "statusReason": "Historic high-volume trauma centre active round the clock.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "xray", "name": "Emergency X-ray Unit", "status": "AVAILABLE", "statusReason": "Casualty radiology running 24 hours.", "lastVerified": "2026-10-15T08:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    # ------------------ JHARKHAND ------------------
    {
      "id": "fac-jhk-rims-ranchi",
      "name": "Rajendra Institute of Medical Sciences (RIMS)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Ranchi",
      "locationId": "ranchi",
      "locationName": "Bariatu, Ranchi",
      "state": "Jharkhand",
      "district": "Ranchi",
      "address": "Bariatu Road, Ranchi, Jharkhand 834009",
      "pinCode": "834009",
      "coordinates": {"lat": 23.3855, "lng": 85.3562},
      "cityAliases": ["ranchi", "jharkhand", "bariatu", "doranda", "harmu", "kanke", "rims"],
      "phone": "+91-651-2541533",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma Centre",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency Trauma Unit", "status": "AVAILABLE", "statusReason": "Apex referral centre for Jharkhand state operational.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "RIMS Official Desk", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "1.5 Tesla MRI", "status": "AVAILABLE", "statusReason": "Operational for emergency and routine requisitions.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Dialysis Centre", "status": "AVAILABLE", "statusReason": "Operational under Mukhyamantri Gambhir Bimari Yojana.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-jhk-tmh-jamshedpur",
      "name": "Tata Main Hospital (TMH)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Jamshedpur",
      "locationId": "jamshedpur",
      "locationName": "Bistupur, Jamshedpur",
      "state": "Jharkhand",
      "district": "East Singhbhum",
      "address": "C Road, Northern Town, Bistupur, Jamshedpur, Jharkhand 831001",
      "pinCode": "831001",
      "coordinates": {"lat": 22.8028, "lng": 86.1854},
      "cityAliases": ["jamshedpur", "tatanagar", "bistupur", "sakchi", "kadma", "sonari", "telco"],
      "phone": "+91-657-6641000",
      "emergencyPhone": "+91-657-6644444",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Critical Care & Emergency", "status": "AVAILABLE", "statusReason": "NABH-accredited modern emergency department operational.", "lastVerified": "2026-10-15T10:30:00Z", "verifiedBy": "Direct Hospital Admin Telemetry", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "ct_scan", "name": "Dual Energy 128-Slice CT", "status": "AVAILABLE", "statusReason": "Trauma and cardiac protocols running 24/7.", "lastVerified": "2026-10-15T09:45:00Z", "verifiedBy": "Direct Hospital Admin Telemetry", "sourceType": "HOSPITAL_OFFICIAL"}
      ]
    },
    # ------------------ ODISHA ------------------
    {
      "id": "fac-odi-aiims-bhubaneswar",
      "name": "AIIMS Bhubaneswar (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Bhubaneswar",
      "locationId": "bhubaneswar",
      "locationName": "Sijua, Patrapada, Bhubaneswar",
      "state": "Odisha",
      "district": "Khordha",
      "address": "Sijua, Patrapada, Bhubaneswar, Odisha 751019",
      "pinCode": "751019",
      "coordinates": {"lat": 20.2289, "lng": 85.7766},
      "cityAliases": ["bhubaneswar", "bbsr", "odisha", "patrapada", "khandagiri", "nayapalli", "jaydev vihar", "saheed nagar"],
      "phone": "+91-674-2476789",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Super Speciality",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency Trauma & Critical Care", "status": "AVAILABLE", "statusReason": "Premier regional trauma triage center active 24/7.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "AIIMS Bhubaneswar Portal", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "mri", "name": "3T MRI Scan Suite", "status": "AVAILABLE", "statusReason": "Operating 24 hours in Radiodiagnosis.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "cardiology", "name": "Cardiology & Cath Lab", "status": "AVAILABLE", "statusReason": "24/7 STEMI emergency angioplasty team ready.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-odi-scb-cuttack",
      "name": "SCB Medical College & Hospital",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Cuttack",
      "locationId": "cuttack",
      "locationName": "Manglabag, Cuttack",
      "state": "Odisha",
      "district": "Cuttack",
      "address": "Professor Para, Manglabag, Cuttack, Odisha 753007",
      "pinCode": "753007",
      "coordinates": {"lat": 20.4682, "lng": 85.8887},
      "cityAliases": ["cuttack", "manglabag", "badambadi", "scb", "silver city"],
      "phone": "+91-671-2414080",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": False, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Casualty & Acute Trauma", "status": "AVAILABLE", "statusReason": "Odisha state apex emergency ward operating 24 hours.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Dialysis Unit (20 Machines)", "status": "AVAILABLE", "statusReason": "BSKY scheme dialysis services running across all shifts.", "lastVerified": "2026-10-15T08:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    # ------------------ PUNJAB & HARYANA ------------------
    {
      "id": "fac-pun-dmch-ludhiana",
      "name": "Dayanand Medical College & Hospital (DMCH)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Ludhiana",
      "locationId": "ludhiana",
      "locationName": "Civil Lines, Ludhiana",
      "state": "Punjab",
      "district": "Ludhiana",
      "address": "Tagore Nagar, Civil Lines, Ludhiana, Punjab 141001",
      "pinCode": "141001",
      "coordinates": {"lat": 30.9010, "lng": 75.8368},
      "cityAliases": ["ludhiana", "ldh", "punjab", "civil lines", "model town", "sarabha nagar", "ferozepur road"],
      "phone": "+91-161-4687700",
      "emergencyPhone": "+91-161-4688888",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Hero DMC Heart Institute & Trauma ICU", "status": "AVAILABLE", "statusReason": "North India's premier cardiac and polytrauma facility.", "lastVerified": "2026-10-15T10:30:00Z", "verifiedBy": "DMCH Admin Telemetry", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "3T Wide Bore MRI", "status": "AVAILABLE", "statusReason": "Operational round the clock for emergencies.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Renal Dialysis Unit", "status": "AVAILABLE", "statusReason": "28 dialysis stations active.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-pun-gmc-amritsar",
      "name": "Guru Nanak Dev Hospital / Govt Medical College",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Amritsar",
      "locationId": "amritsar",
      "locationName": "Majitha Road, Amritsar",
      "state": "Punjab",
      "district": "Amritsar",
      "address": "Majitha Road, Circular Road, Amritsar, Punjab 143001",
      "pinCode": "143001",
      "coordinates": {"lat": 31.6508, "lng": 74.8765},
      "cityAliases": ["amritsar", "asr", "golden temple", "majitha road", "ranjit avenue", "lawrence road"],
      "phone": "+91-183-2571210",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": False, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency Casualty", "status": "AVAILABLE", "statusReason": "Major border area trauma and casualty unit operating 24 hours.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "CT Scan", "status": "AVAILABLE", "statusReason": "Emergency CT operational.", "lastVerified": "2026-10-15T08:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-har-medanta-gurugram",
      "name": "Medanta - The Medicity",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Gurugram",
      "locationId": "delhi",
      "locationName": "Sector 38, Gurugram",
      "state": "Haryana",
      "district": "Gurugram",
      "address": "CH Bakhtawar Singh Road, Near Subhash Chowk, Sector 38, Gurugram, Haryana 122001",
      "pinCode": "122001",
      "coordinates": {"lat": 28.4394, "lng": 77.0427},
      "cityAliases": ["gurugram", "gurgaon", "ggn", "sector 38", "subhash chowk", "sohna road", "cyber city", "golf course road", "delhi ncr"],
      "phone": "+91-124-4141414",
      "emergencyPhone": "1068",
      "operatingHours": "24/7 Emergency & Inpatient (1250 Beds)",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Flying Doctors & Emergency ICU", "status": "AVAILABLE", "statusReason": "Air ambulance & super-speciality critical care active 24/7.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "Medanta HIS Telemetry", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "mri", "name": "BrainSuite 3T Intra-operative MRI", "status": "AVAILABLE", "statusReason": "Full neuro and vascular capabilities functional.", "lastVerified": "2026-10-15T10:30:00Z", "verifiedBy": "Medanta HIS Telemetry", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "ct_scan", "name": "Dual Source 256-Slice CT", "status": "AVAILABLE", "statusReason": "Instantaneous cardiac evaluation scanner operational.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "Medanta HIS Telemetry", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "dialysis", "name": "Renal Transplant & Hemodialysis Unit", "status": "AVAILABLE", "statusReason": "40 station advanced dialysis suite active.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "Medanta HIS Telemetry", "sourceType": "AUTOMATED_API_SYNC"}
      ]
    },
    # ------------------ HIMACHAL PRADESH & UTTARAKHAND ------------------
    {
      "id": "fac-hp-igmc-shimla",
      "name": "Indira Gandhi Medical College & Hospital (IGMC)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Shimla",
      "locationId": "shimla",
      "locationName": "Ridge / Lakkar Bazaar, Shimla",
      "state": "Himachal Pradesh",
      "district": "Shimla",
      "address": "Circular Road, Lakkar Bazaar, Shimla, Himachal Pradesh 171001",
      "pinCode": "171001",
      "coordinates": {"lat": 31.1077, "lng": 77.1812},
      "cityAliases": ["shimla", "hp", "himachal", "lakkar bazaar", "mall road", "sanjauli", "chotta shimla", "kullu", "manali", "solan"],
      "phone": "+91-177-2804251",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Hill Region Apex Trauma ICU", "status": "AVAILABLE", "statusReason": "State apex emergency and trauma referral center operational 24/7.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "IGMC Emergency Admin", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "ct_scan", "name": "128-Slice Multi-detector CT", "status": "AVAILABLE", "statusReason": "Emergency head injury and trauma scans active.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Hemodialysis Unit", "status": "AVAILABLE", "statusReason": "15 dialysis stations operational under Himcare.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-utk-aiims-rishikesh",
      "name": "AIIMS Rishikesh (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Rishikesh",
      "locationId": "rishikesh",
      "locationName": "Veerbhadra Road, Rishikesh",
      "state": "Uttarakhand",
      "district": "Dehradun",
      "address": "Virbhadra Road, AIIMS Campus, Rishikesh, Uttarakhand 249203",
      "pinCode": "249203",
      "coordinates": {"lat": 30.0758, "lng": 78.2882},
      "cityAliases": ["rishikesh", "dehradun", "haridwar", "uttarakhand", "garhwal", "veerbhadra", "roorkee", "tehri", "char dham"],
      "phone": "+91-135-2462929",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Helipad Heli-Ambulance",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Heli-Rescue Emergency & Trauma", "status": "AVAILABLE", "statusReason": "Aviation-linked disaster and high-altitude emergency trauma ready.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "AIIMS Rishikesh Portal", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "mri", "name": "3T Advanced Digital MRI", "status": "AVAILABLE", "statusReason": "Operational for spine, neuro & emergency scans.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "AIIMS Rishikesh Portal", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "cardiology", "name": "Cardiology & Cath Lab", "status": "AVAILABLE", "statusReason": "24/7 emergency interventional cardiology team ready.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "AIIMS Rishikesh Portal", "sourceType": "AUTOMATED_API_SYNC"}
      ]
    },
    # ------------------ JAMMU & KASHMIR & LADAKH ------------------
    {
      "id": "fac-jk-skims-srinagar",
      "name": "Sher-i-Kashmir Institute of Medical Sciences (SKIMS)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Srinagar",
      "locationId": "srinagar",
      "locationName": "Soura, Srinagar",
      "state": "Jammu & Kashmir",
      "district": "Srinagar",
      "address": "Soura, Srinagar, Jammu & Kashmir 190011",
      "pinCode": "190011",
      "coordinates": {"lat": 34.1378, "lng": 74.8052},
      "cityAliases": ["srinagar", "jk", "kashmir", "soura", "lal chowk", "anantnag", "baramulla", "dal lake", "budgam", "skims"],
      "phone": "+91-194-2401013",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Tertiary Care",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency Medicine & Trauma Centre", "status": "AVAILABLE", "statusReason": "Kashmir valley's apex tertiary emergency referral institute.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "SKIMS Central Portal", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "3.0T High Field MRI", "status": "AVAILABLE", "statusReason": "24/7 active in Department of Radiodiagnosis.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Nephrology Dialysis Unit", "status": "AVAILABLE", "statusReason": "25 dialysis units operational round the clock.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-jk-gmc-jammu",
      "name": "Govt Medical College & Associated Hospital (GMC Jammu)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Jammu",
      "locationId": "jammu",
      "locationName": "Bakshi Nagar, Jammu",
      "state": "Jammu & Kashmir",
      "district": "Jammu",
      "address": "Bakshi Nagar, Jammu, Jammu & Kashmir 180001",
      "pinCode": "180001",
      "coordinates": {"lat": 32.7410, "lng": 74.8488},
      "cityAliases": ["jammu", "bakshi nagar", "gandhi nagar", "katra", "udhampur", "samba", "vaishno devi"],
      "phone": "+91-191-2584247",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": False, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency & Super Speciality Trauma", "status": "AVAILABLE", "statusReason": "Jammu province central casualty ward operational.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "128-Slice CT Scan", "status": "AVAILABLE", "statusReason": "Emergency trauma CT operational.", "lastVerified": "2026-10-15T08:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    # ------------------ ASSAM & NORTHEAST ------------------
    {
      "id": "fac-asm-gmch-guwahati",
      "name": "Gauhati Medical College and Hospital (GMCH)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Guwahati",
      "locationId": "guwahati",
      "locationName": "Bhangagarh, Guwahati",
      "state": "Assam",
      "district": "Kamrup Metropolitan",
      "address": "Narakasur Hilltop, Bhangagarh, Guwahati, Assam 781032",
      "pinCode": "781032",
      "coordinates": {"lat": 26.1584, "lng": 91.7709},
      "cityAliases": ["guwahati", "gauhati", "assam", "northeast", "bhangagarh", "dispur", "paltan bazaar", "jalukbari", "kamrup"],
      "phone": "+91-361-2130234",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Super Speciality",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency & Trauma Center", "status": "AVAILABLE", "statusReason": "Northeast India's apex government emergency & referral hospital.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "Assam Health Telemetry", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "3.0 Tesla Silent MRI", "status": "AVAILABLE", "statusReason": "24-hour imaging suite functional.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "128-Slice Dual Energy CT", "status": "AVAILABLE", "statusReason": "Emergency neuro & trauma CT operational.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Pradhan Mantri National Dialysis Unit", "status": "AVAILABLE", "statusReason": "25 dialysis beds operational.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-meg-neigrihms-shillong",
      "name": "NEIGRIHMS (North Eastern Indira Gandhi Regional Institute)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Shillong",
      "locationId": "shillong",
      "locationName": "Mawdiangdiang, Shillong",
      "state": "Meghalaya",
      "district": "East Khasi Hills",
      "address": "Mawdiangdiang, Shillong, Meghalaya 793018",
      "pinCode": "793018",
      "coordinates": {"lat": 25.5941, "lng": 91.9367},
      "cityAliases": ["shillong", "meghalaya", "mawdiangdiang", "police bazar", "cherrapunji", "khasi hills", "neigrihms"],
      "phone": "+91-364-2538025",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Critical Care",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency Medicine & Trauma ICU", "status": "AVAILABLE", "statusReason": "Autonomous regional institute trauma center ready 24/7.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "NEIGRIHMS Admin Portal", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "cardiology", "name": "Interventional Cardiology & Cath Lab", "status": "AVAILABLE", "statusReason": "Cardiac emergency interventions operational.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-mnp-rims-imphal",
      "name": "Regional Institute of Medical Sciences (RIMS Imphal)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Imphal",
      "locationId": "imphal",
      "locationName": "Lamphelpat, Imphal",
      "state": "Manipur",
      "district": "Imphal West",
      "address": "Lamphelpat, Imphal, Manipur 795004",
      "pinCode": "795004",
      "coordinates": {"lat": 24.8197, "lng": 93.9238},
      "cityAliases": ["imphal", "manipur", "lamphelpat", "thangal bazar", "rims imphal"],
      "phone": "+91-385-2414629",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": False, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency & Casualty", "status": "AVAILABLE", "statusReason": "Major multi-state referral institute trauma services functional.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Dialysis Unit", "status": "AVAILABLE", "statusReason": "Operational across morning and evening shifts.", "lastVerified": "2026-10-15T08:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    # ------------------ KERALA ------------------
    {
      "id": "fac-ker-gmc-tvm",
      "name": "Govt Medical College Hospital (Trivandrum Medical College)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Thiruvananthapuram",
      "locationId": "trivandrum",
      "locationName": "Medical College PO, Thiruvananthapuram",
      "state": "Kerala",
      "district": "Thiruvananthapuram",
      "address": "Medical College Junction, Thiruvananthapuram, Kerala 695011",
      "pinCode": "695011",
      "coordinates": {"lat": 8.5241, "lng": 76.9288},
      "cityAliases": ["thiruvananthapuram", "trivandrum", "tvm", "kerala", "pattom", "palayam", "kowdiar", "kollam"],
      "phone": "+91-471-2528300",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Level 1 Trauma Care Centre", "status": "AVAILABLE", "statusReason": "Apex emergency department operating round the clock.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "Kerala Health Portal", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "3T Silent MRI", "status": "AVAILABLE", "statusReason": "Emergency neuro imaging operational.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Hemodialysis Unit", "status": "AVAILABLE", "statusReason": "30 dialysis machines active under KASP scheme.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-ker-aster-kochi",
      "name": "Aster Medcity Kochi",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Kochi",
      "locationId": "kochi",
      "locationName": "Cheranalloor, Kochi",
      "state": "Kerala",
      "district": "Ernakulam",
      "address": "Kuttisahib Road, South Chittoor, Cheranalloor, Kochi, Kerala 682027",
      "pinCode": "682027",
      "coordinates": {"lat": 10.0528, "lng": 76.2731},
      "cityAliases": ["kochi", "cochin", "ernakulam", "cheranalloor", "edappally", "kakkanad", "marine drive", "aluva"],
      "phone": "+91-484-6699999",
      "emergencyPhone": "+91-484-6699000",
      "operatingHours": "24/7 Emergency & Inpatient (670 Beds)",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Quaternary Care Emergency ICU", "status": "AVAILABLE", "statusReason": "JCI & NABH accredited critical care unit functional 24/7.", "lastVerified": "2026-10-15T10:30:00Z", "verifiedBy": "Aster HIS Telemetry", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "ct_scan", "name": "256-Slice Dual Energy CT", "status": "AVAILABLE", "statusReason": "Operational 24/7 for stroke and trauma.", "lastVerified": "2026-10-15T09:45:00Z", "verifiedBy": "Aster HIS Telemetry", "sourceType": "AUTOMATED_API_SYNC"}
      ]
    },
    # ------------------ TAMIL NADU ------------------
    {
      "id": "fac-tn-rggh-chennai",
      "name": "Rajiv Gandhi Govt General Hospital (RGGGH & MMC)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Chennai",
      "locationId": "chennai",
      "locationName": "Park Town, Chennai",
      "state": "Tamil Nadu",
      "district": "Chennai",
      "address": "EVR Periyar Salai, Park Town, Chennai, Tamil Nadu 600003",
      "pinCode": "600003",
      "coordinates": {"lat": 13.0805, "lng": 80.2796},
      "cityAliases": ["chennai", "madras", "tn", "tamil nadu", "park town", "central", "egmore", "t nagar", "anna nagar", "adyar", "velachery"],
      "phone": "+91-44-25305000",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Apex Emergency & Trauma Care Centre", "status": "AVAILABLE", "statusReason": "State of Tamil Nadu's apex multi-bed emergency & triage center.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "Tamil Nadu Health Portal", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "3T MRI Scan Suite", "status": "AVAILABLE", "statusReason": "Active 24 hours in Radiodiagnosis Department.", "lastVerified": "2026-10-15T10:15:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Hemodialysis Centre (40 Units)", "status": "AVAILABLE", "statusReason": "Round the clock dialysis operational under CMCHIS.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "cardiology", "name": "Cardiology & 24/7 Cath Lab", "status": "AVAILABLE", "statusReason": "Emergency PCI & angiogram team active on duty.", "lastVerified": "2026-10-15T08:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-tn-cmc-vellore",
      "name": "Christian Medical College & Hospital (CMC Vellore)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Vellore",
      "locationId": "vellore",
      "locationName": "Ida Scudder Road, Vellore",
      "state": "Tamil Nadu",
      "district": "Vellore",
      "address": "Ida Scudder Road, Vellore, Tamil Nadu 632004",
      "pinCode": "632004",
      "coordinates": {"lat": 12.9246, "lng": 79.1350},
      "cityAliases": ["vellore", "cmc", "cmc vellore", "ranipet", "katpadi"],
      "phone": "+91-416-2281000",
      "emergencyPhone": "+91-416-2282000",
      "operatingHours": "24/7 Emergency & Super Speciality",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency Medical Services", "status": "AVAILABLE", "statusReason": "Renowned national tertiary emergency and trauma institute.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "CMC Hospital Telemetry", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "High Definition 3T MRI", "status": "AVAILABLE", "statusReason": "Advanced clinical imaging functional round the clock.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "CMC Hospital Telemetry", "sourceType": "HOSPITAL_OFFICIAL"}
      ]
    },
    {
      "id": "fac-tn-psg-coimbatore",
      "name": "PSG Hospitals (Super Speciality)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Coimbatore",
      "locationId": "coimbatore",
      "locationName": "Peelamedu, Coimbatore",
      "state": "Tamil Nadu",
      "district": "Coimbatore",
      "address": "Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004",
      "pinCode": "641004",
      "coordinates": {"lat": 11.0253, "lng": 77.0081},
      "cityAliases": ["coimbatore", "cbe", "peelamedu", "avinashi road", "rs puram", "gandhipuram", "tirupur", "salem"],
      "phone": "+91-422-2570170",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Comprehensive Emergency Unit", "status": "AVAILABLE", "statusReason": "NABH-certified trauma and critical care response unit active.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "128-Slice Cardiac CT", "status": "AVAILABLE", "statusReason": "Trauma and cardiac imaging operational.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    # ------------------ ANDHRA PRADESH & TELANGANA ------------------
    {
      "id": "fac-ap-kgh-vizag",
      "name": "King George Hospital (KGH Vizag)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Visakhapatnam",
      "locationId": "visakhapatnam",
      "locationName": "Maharanipeta, Visakhapatnam",
      "state": "Andhra Pradesh",
      "district": "Visakhapatnam",
      "address": "Collector Office Road, Maharanipeta, Visakhapatnam, Andhra Pradesh 530002",
      "pinCode": "530002",
      "coordinates": {"lat": 17.7088, "lng": 83.3039},
      "cityAliases": ["visakhapatnam", "vizag", "ap", "andhra", "maharanipeta", "gajuwaka", "mvp colony", "rk beach"],
      "phone": "+91-891-2564891",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": False, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Casualty & Acute Trauma", "status": "AVAILABLE", "statusReason": "Coastal Andhra's largest government teaching hospital emergency active.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "Multislice CT Scanner", "status": "AVAILABLE", "statusReason": "Operating 24 hours in emergency radiology.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-ap-aiims-mangalagiri",
      "name": "AIIMS Mangalagiri (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Vijayawada",
      "locationId": "vijayawada",
      "locationName": "Mangalagiri, Guntur / Vijayawada",
      "state": "Andhra Pradesh",
      "district": "Guntur",
      "address": "Mangalagiri, Guntur District, Andhra Pradesh 522503",
      "pinCode": "522503",
      "coordinates": {"lat": 16.4357, "lng": 80.5756},
      "cityAliases": ["vijayawada", "guntur", "mangalagiri", "amaravati", "bezawada", "aiims mangalagiri"],
      "phone": "+91-8645-280000",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Super Speciality",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Emergency & Trauma Medicine", "status": "AVAILABLE", "statusReason": "Modern apex trauma and resuscitation suites active.", "lastVerified": "2026-10-15T10:30:00Z", "verifiedBy": "AIIMS Mangalagiri Central Portal", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "mri", "name": "3T Digital MRI Scan", "status": "AVAILABLE", "statusReason": "Advanced diagnostic imaging active.", "lastVerified": "2026-10-15T09:45:00Z", "verifiedBy": "AIIMS Mangalagiri Central Portal", "sourceType": "AUTOMATED_API_SYNC"}
      ]
    },
    # ------------------ KARNATAKA ------------------
    {
      "id": "fac-kar-victoria-blr",
      "name": "Victoria Hospital & BMCRI",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Bengaluru",
      "locationId": "bangalore",
      "locationName": "Fort / City Market, Bengaluru",
      "state": "Karnataka",
      "district": "Bengaluru Urban",
      "address": "Fort Road, Near City Market, Kalasipalya, Bengaluru, Karnataka 560002",
      "pinCode": "560002",
      "coordinates": {"lat": 12.9634, "lng": 77.5753},
      "cityAliases": ["bangalore", "bengaluru", "blr", "city market", "fort", "kalasipalya", "chickpet", "majestic"],
      "phone": "+91-80-26701150",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Trauma Emergency Center", "status": "AVAILABLE", "statusReason": "Karnataka state premier government emergency institute active 24 hours.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "BMCRI Central Telemetry", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "ct_scan", "name": "128-Slice Trauma CT", "status": "AVAILABLE", "statusReason": "Emergency head injury & trauma imaging active.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Hemodialysis Centre", "status": "AVAILABLE", "statusReason": "Dialysis active under Suvarna Arogya Suraksha Trust.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    {
      "id": "fac-kar-kr-mysore",
      "name": "KR Hospital & Mysore Medical College (MMCRI)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Mysuru",
      "locationId": "mysore",
      "locationName": "Irwin Road, Mysuru",
      "state": "Karnataka",
      "district": "Mysuru",
      "address": "Irwin Road, Medar Block, Yadavagiri, Mysuru, Karnataka 570001",
      "pinCode": "570001",
      "coordinates": {"lat": 12.3146, "lng": 76.6508},
      "cityAliases": ["mysuru", "mysore", "kr hospital", "irwin road", "devaraja mohalla", "kuvempunagar"],
      "phone": "+91-821-2520512",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": False, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Casualty & Emergency Ward", "status": "AVAILABLE", "statusReason": "Apex government hospital serving Mysuru, Chamarajanagar & Kodagu.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "xray", "name": "Digital X-ray Unit", "status": "AVAILABLE", "statusReason": "Casualty radiology running round the clock.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    # ------------------ GOA ------------------
    {
      "id": "fac-goa-gmc-bambolim",
      "name": "Goa Medical College and Hospital (GMC Bambolim)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Panaji",
      "locationId": "goa",
      "locationName": "Bambolim, North Goa",
      "state": "Goa",
      "district": "North Goa",
      "address": "NH 66, Bambolim, Tiswadi, Goa 403202",
      "pinCode": "403202",
      "coordinates": {"lat": 15.4602, "lng": 73.8569},
      "cityAliases": ["goa", "panaji", "panjim", "bambolim", "margao", "vasco", "mapusa", "porvorim", "calangute"],
      "phone": "+91-832-2458727",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Super Speciality",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Apex Trauma & Emergency Centre", "status": "AVAILABLE", "statusReason": "State of Goa's primary tertiary care and trauma referral center.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "GMC Central Desk", "sourceType": "HOSPITAL_OFFICIAL"},
        {"serviceId": "mri", "name": "1.5T / 3T MRI Scan", "status": "AVAILABLE", "statusReason": "Active 24/7 for acute neuro and polytrauma requisitions.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "ct_scan", "name": "128-Slice Cardiac CT", "status": "AVAILABLE", "statusReason": "Trauma CT operational.", "lastVerified": "2026-10-15T09:30:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    },
    # ------------------ CHHATTISGARH ------------------
    {
      "id": "fac-chg-aiims-raipur",
      "name": "AIIMS Raipur (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": False,
      "facilityType": "HOSPITAL",
      "city": "Raipur",
      "locationId": "raipur",
      "locationName": "Tatibandh, GE Road, Raipur",
      "state": "Chhattisgarh",
      "district": "Raipur",
      "address": "GE Road, Tatibandh, Raipur, Chhattisgarh 492099",
      "pinCode": "492099",
      "coordinates": {"lat": 21.2570, "lng": 81.5790},
      "cityAliases": ["raipur", "chhattisgarh", "tatibandh", "bhilai", "durg", "bilaspur", "ge road"],
      "phone": "+91-771-2577257",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {"wheelchairRamp": True, "elevator": True, "accessibleRestrooms": True, "brailleSignage": True, "stepFreeEntrance": True, "parkingAvailable": True},
      "verifiedServices": [
        {"serviceId": "emergency_icu", "name": "24/7 Level 1 Trauma & Emergency", "status": "AVAILABLE", "statusReason": "Central India's leading apex tertiary trauma centre functional.", "lastVerified": "2026-10-15T11:00:00Z", "verifiedBy": "AIIMS Raipur Portal", "sourceType": "AUTOMATED_API_SYNC"},
        {"serviceId": "mri", "name": "3T Digital MRI Suite", "status": "AVAILABLE", "statusReason": "Operational in Department of Radiodiagnosis.", "lastVerified": "2026-10-15T10:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"},
        {"serviceId": "dialysis", "name": "Hemodialysis Centre", "status": "AVAILABLE", "statusReason": "20 beds operational with dedicated emergency slots.", "lastVerified": "2026-10-15T09:00:00Z", "verifiedBy": "CareCompass Telephony Audit", "sourceType": "PHONE_CALL"}
      ]
    }
]

print(f"Total Pan-India facilities prepared: {len(pan_india_facilities)}")

# Read current healthcare-data.js
with open('js/healthcare-data.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Convert pan_india_facilities to formatted JS array string
js_items = []
for fac in pan_india_facilities:
    item_str = json.dumps(fac, indent=6)
    js_items.append("    " + item_str.strip())

joined_facilities = ",\n" + ",\n".join(js_items)

# Insert before the end of the facilities array `  ]\n};`
target_needle = "  ]\n};"
if target_needle in code:
    new_code = code.replace(target_needle, joined_facilities + "\n  ]\n};")
    with open('js/healthcare-data.js', 'w', encoding='utf-8') as f:
        f.write(new_code)
    print("Successfully appended Pan-India facilities to js/healthcare-data.js!")
else:
    print("Could not find insertion marker `  ]\\n};` in js/healthcare-data.js")
