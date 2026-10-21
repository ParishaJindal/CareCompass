/**
 * CareCompass - Healthcare Navigation for Everyone
 * 
 * healthcare-data.js
 * Comprehensive demonstration dataset for healthcare facilities across major Indian cities:
 * Chandigarh (CHD / Tricity), Delhi NCR, Bangalore (Bengaluru), Mumbai, Hyderabad, Pune,
 * and Central District Demonstration Zone.
 * 
 * Features realistic verified, unverified, and confirmed unavailable services
 * with timestamps, verification sources, and accessibility features.
 */

const HEALTHCARE_DATA = {
  metadata: {
    datasetVersion: "3.0.0",
    isSampleData: true,
    lastSystemSync: "2026-10-15T10:00:00Z",
    supportedMajorCities: ["Chandigarh (CHD)", "Delhi NCR", "Bangalore (Bengaluru)", "Mumbai", "Hyderabad", "Pune"],
    disclaimer: "This directory contains simulated demonstration data for testing the CareCompass verification and recommendation engine. Always contact facilities directly to confirm critical services before travelling."
  },

  // Standard medical service categories for quick search and autocomplete
  servicesList: [
    { id: "xray", name: "X-ray", category: "Radiology & Imaging", commonKeywords: ["x-ray", "xray", "radiography", "chest x-ray", "bone scan"] },
    { id: "mri", name: "MRI Scan", category: "Radiology & Imaging", commonKeywords: ["mri", "magnetic resonance", "brain scan", "3t mri"] },
    { id: "ct_scan", name: "CT Scan", category: "Radiology & Imaging", commonKeywords: ["ct scan", "computed tomography", "cat scan"] },
    { id: "ultrasound", name: "Ultrasound (USG)", category: "Radiology & Imaging", commonKeywords: ["ultrasound", "sonography", "usg", "abdominal scan", "doppler"] },
    { id: "blood_test", name: "Blood Test (CBC & Bio)", category: "Pathology & Lab", commonKeywords: ["blood test", "cbc", "haemogram", "lipid profile", "blood sugar", "pathology"] },
    { id: "dialysis", name: "Hemodialysis", category: "Specialized Care", commonKeywords: ["dialysis", "kidney care", "renal", "nephrology"] },
    { id: "emergency_icu", name: "24/7 Emergency & ICU", category: "Emergency Care", commonKeywords: ["emergency", "icu", "trauma", "critical care", "casualty", "ambulance"] },
    { id: "pediatrics", name: "Pediatric Consultation", category: "Specialist OPD", commonKeywords: ["pediatrician", "child doctor", "infant care", "kids clinic", "pediatric"] },
    { id: "cardiology", name: "Cardiology & ECG", category: "Specialist OPD", commonKeywords: ["cardiologist", "heart doctor", "ecg", "echo", "cardiac"] },
    { id: "dental", name: "Dental Procedures", category: "Outpatient Care", commonKeywords: ["dentist", "tooth extraction", "root canal", "dental", "teeth"] },
    { id: "pharmacy_247", name: "24/7 Pharmacy Dispensing", category: "Pharmacy", commonKeywords: ["pharmacy", "chemist", "medicines", "drugs", "prescription", "24/7 medicine"] },
    { id: "vaccination", name: "Routine Vaccination", category: "Preventive Care", commonKeywords: ["vaccine", "immunization", "flu shot", "covid shot", "polio"] }
  ],

  // Major cities and locations for quick filtering and autocomplete across India
  locations: [
    { id: "all_india", name: "All India (Pan-India)", landmark: "National Healthcare Network", coordinates: { lat: 20.5937, lng: 78.9629 }, aliases: ["all", "india", "pan-india", "everywhere", "all cities"] },
    { id: "chandigarh", name: "Chandigarh (CHD / Tricity)", landmark: "Sector 17 Plaza", coordinates: { lat: 30.7333, lng: 76.7794 }, aliases: ["chd", "chandigarh", "mohali", "panchkula", "tricity", "sector 12", "sector 32", "sector 16", "sector 11", "sector 15", "sector 22", "sector 34", "pgi", "pgimer"] },
    { id: "delhi", name: "Delhi NCR", landmark: "Connaught Place / AIIMS", coordinates: { lat: 28.6139, lng: 77.2090 }, aliases: ["delhi", "new delhi", "del", "ncr", "south delhi", "central delhi", "saket", "noida", "gurugram", "gurgaon", "okhla", "ghaziabad", "faridabad"] },
    { id: "pune", name: "Pune (Maharashtra)", landmark: "Pune Railway Station / Sassoon Road", coordinates: { lat: 18.5204, lng: 73.8567 }, aliases: ["pune", "pnq", "sassoon", "kothrud", "deccan", "viman nagar", "hinjewadi", "ruby hall", "hadapsar", "wakad", "baner", "aundh", "pcmc", "erandwane"] },
    { id: "mumbai", name: "Mumbai (MMR)", landmark: "Bandra Reclamation / Parel", coordinates: { lat: 19.0760, lng: 72.8777 }, aliases: ["mumbai", "bombay", "bom", "maharashtra", "bandra", "andheri", "dadar", "parel", "thane", "navi mumbai", "borivali", "colaba", "juhu", "kurla"] },
    { id: "bangalore", name: "Bangalore (Bengaluru) & Karnataka", landmark: "MG Road / Victoria", coordinates: { lat: 12.9716, lng: 77.5946 }, aliases: ["bangalore", "bengaluru", "banglore", "blr", "karnataka", "mysuru", "mysore", "mangaluru", "hubli"] },
    { id: "hyderabad", name: "Hyderabad & Telangana", landmark: "Hitec City / NIMS", coordinates: { lat: 17.3850, lng: 78.4867 }, aliases: ["hyderabad", "hyd", "telangana", "secunderabad", "jubilee hills", "warangal"] },
    { id: "kolkata", name: "Kolkata & West Bengal", landmark: "SSKM / Park Street", coordinates: { lat: 22.5726, lng: 88.3639 }, aliases: ["kolkata", "calcutta", "west bengal", "wb", "salt lake", "howrah", "siliguri", "durgapur", "asansol"] },
    { id: "chennai", name: "Chennai & Tamil Nadu", landmark: "Park Town / RGGGH", coordinates: { lat: 13.0827, lng: 80.2707 }, aliases: ["chennai", "madras", "tamil nadu", "tn", "coimbatore", "madurai", "vellore", "salem", "trichy"] },
    { id: "lucknow", name: "Lucknow & UP", landmark: "Hazratganj / SGPGI", coordinates: { lat: 26.8467, lng: 80.9462 }, aliases: ["lucknow", "lko", "uttar pradesh", "up", "kanpur", "varanasi", "agra", "prayagraj", "gorakhpur", "meerut"] },
    { id: "jaipur", name: "Jaipur & Rajasthan", landmark: "SMS Hospital / JLN Marg", coordinates: { lat: 26.9124, lng: 75.7873 }, aliases: ["jaipur", "jpr", "rajasthan", "raj", "jodhpur", "udaipur", "kota", "bikaner", "ajmer"] },
    { id: "ahmedabad", name: "Ahmedabad & Gujarat", landmark: "Civil Hospital / SG Highway", coordinates: { lat: 23.0225, lng: 72.5714 }, aliases: ["ahmedabad", "amdavad", "gujarat", "guj", "surat", "vadodara", "baroda", "rajkot", "gandhinagar"] },
    { id: "kochi", name: "Kochi, Trivandrum & Kerala", landmark: "Ernakulam / Cheranalloor", coordinates: { lat: 9.9312, lng: 76.2673 }, aliases: ["kerala", "kochi", "cochin", "thiruvananthapuram", "trivandrum", "kozhikode", "calicut", "thrissur"] },
    { id: "patna", name: "Patna & Bihar", landmark: "AIIMS / PMCH", coordinates: { lat: 25.5941, lng: 85.1376 }, aliases: ["patna", "bihar", "gaya", "muzaffarpur", "bhagalpur", "darbhanga"] },
    { id: "ranchi", name: "Ranchi & Jharkhand", landmark: "RIMS / Bariatu", coordinates: { lat: 23.3441, lng: 85.3096 }, aliases: ["ranchi", "jharkhand", "jamshedpur", "tatanagar", "dhanbad", "bokaro"] },
    { id: "bhubaneswar", name: "Bhubaneswar & Odisha", landmark: "AIIMS / Patrapada", coordinates: { lat: 20.2961, lng: 85.8245 }, aliases: ["bhubaneswar", "bbsr", "odisha", "cuttack", "rourkela", "puri"] },
    { id: "bhopal", name: "Bhopal, Indore & MP", landmark: "AIIMS Saket Nagar", coordinates: { lat: 23.2599, lng: 77.4126 }, aliases: ["bhopal", "indore", "madhya pradesh", "mp", "gwalior", "jabalpur", "ujjain"] },
    { id: "guwahati", name: "Guwahati & Northeast", landmark: "GMCH Bhangagarh", coordinates: { lat: 26.1445, lng: 91.7362 }, aliases: ["guwahati", "assam", "northeast", "shillong", "meghalaya", "imphal", "manipur", "agartala", "tripura", "aizawl", "kohima", "gangtok"] },
    { id: "shimla", name: "Shimla & Himachal", landmark: "IGMC Circular Road", coordinates: { lat: 31.1048, lng: 77.1734 }, aliases: ["shimla", "himachal", "hp", "dharamshala", "kullu", "manali", "solan", "mandi"] },
    { id: "srinagar", name: "Srinagar, Jammu & J&K", landmark: "SKIMS Soura", coordinates: { lat: 34.0837, lng: 74.7973 }, aliases: ["srinagar", "jammu", "kashmir", "j&k", "ladakh", "leh", "anantnag"] },
    { id: "dehradun", name: "Dehradun & Uttarakhand", landmark: "AIIMS Rishikesh / Clock Tower", coordinates: { lat: 30.3165, lng: 78.0322 }, aliases: ["dehradun", "rishikesh", "uttarakhand", "haridwar", "haldwani", "roorkee"] },
    { id: "goa", name: "Goa (North & South)", landmark: "GMC Bambolim", coordinates: { lat: 15.2993, lng: 74.1240 }, aliases: ["goa", "panaji", "panjim", "margao", "bambolim", "vasco"] }
  ],

  // Primary facility directory
  facilities: [
    // =============================================================
    // CHANDIGARH / TRICITY (chd, mohali, panchkula)
    // =============================================================
    {
      id: "fac-chd-pgimer",
      name: "PGIMER (Post Graduate Institute of Medical Education & Research)",
      isDemoCoreFacility: false,
      type: "Premier Super-Speciality Research Institute",
      category: "hospital",
      city: "Chandigarh",
      state: "Chandigarh (UT)",
      pinCode: "160012",
      cityAliases: ["chd", "chandigarh", "pgi", "pgimer", "sector 12", "tricity", "punjab"],
      locationId: "chandigarh",
      locationName: "Sector 12, Chandigarh",
      address: "Sector 12, Near Panjab University, Chandigarh, 160012",
      distanceKm: 1.2,
      coordinates: { lat: 30.7656, lng: 76.7766 },
      phone: "+91 172 274 7585",
      emergencyPhone: "+91 172 275 6565",
      email: "helpdesk@pgimer.edu.in",
      website: "https://pgimer.edu.in",
      operatingHours: "Open 24/7 (Emergency & Advanced Trauma); OPD: 8:00 AM - 1:00 PM",
      isOpenNow: true,
      rating: 4.8,
      reviewCount: 1420,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:00:00Z",
        verifiedBy: "Hospital Administration via Verified Integration",
        sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
      },
      services: [
        {
          serviceId: "xray",
          name: "X-ray",
          status: "UNAVAILABLE",
          statusReason: "Nehru Hospital OPD digital X-ray machine undergoing scheduled tube recalibration until Oct 20. Emergency trauma X-ray operational at ATC. OPD patients advised to visit Atulaya Healthcare in Sector 11.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Radiology In-Charge",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION",
          estimatedWaitHours: null,
          operationalNotes: "Non-emergency walk-in X-rays redirected to Sector 11 Atulaya Healthcare."
        },
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Advanced Trauma Centre (ATC) running with 34 active ICU beds and 24/7 triage.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "ER Duty Medical Officer",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION",
          operationalNotes: "Dedicated ambulance ramp on ATC Gate 2."
        },
        {
          serviceId: "mri",
          name: "MRI Scan (3.0 Tesla)",
          status: "AVAILABLE",
          statusReason: "Dual 3T Siemens MRI scanners operational in Research Block B.",
          lastVerified: "2026-10-14T16:00:00Z",
          verifiedBy: "Chief Radiologist",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION",
          operationalNotes: "Prior slot booking recommended for non-emergency scans."
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "Central Automated Biochemistry laboratory functional.",
          lastVerified: "2026-10-15T07:30:00Z",
          verifiedBy: "Pathology Head",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION",
          operationalNotes: "Reports available online on PGI patient portal."
        },
        {
          serviceId: "pediatrics",
          name: "Pediatric Consultation",
          status: "AVAILABLE",
          statusReason: "Advanced Pediatrics Centre (APC) OPD fully staffed.",
          lastVerified: "2026-10-15T08:45:00Z",
          verifiedBy: "APC Coordinator",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION",
          operationalNotes: "Specialized pediatric emergency 24/7."
        },
        {
          serviceId: "dialysis",
          name: "Hemodialysis",
          status: "AVAILABLE",
          statusReason: "Department of Nephrology running 24 dialysis stations.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Nephrology Unit",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        }
      ]
    },

    {
      id: "fac-chd-atulaya",
      name: "Atulaya Healthcare & Imaging Centre",
      isDemoCoreFacility: false,
      type: "Comprehensive Diagnostic & Imaging Centre",
      category: "diagnostic",
      city: "Chandigarh",
      state: "Chandigarh (UT)",
      pinCode: "160011",
      cityAliases: ["chd", "chandigarh", "atulaya", "sector 11", "sector 35", "madhya marg", "tricity"],
      locationId: "chandigarh",
      locationName: "Sector 11-D, Chandigarh",
      address: "SCO 112-113, Madhya Marg, Sector 11-D, Chandigarh, 160011",
      distanceKm: 1.8,
      coordinates: { lat: 30.7570, lng: 76.7840 },
      phone: "+91 172 500 5000",
      emergencyPhone: "+91 172 500 5001",
      email: "care@atulaya.com",
      website: "https://atulaya.com",
      operatingHours: "Open Monday - Sunday: 7:00 AM - 9:00 PM",
      isOpenNow: true,
      rating: 4.7,
      reviewCount: 890,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: false,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:20:00Z",
        verifiedBy: "Lead Radiographer via Direct Verification",
        sourceType: "FACILITY_PORTAL_SYNC"
      },
      services: [
        {
          serviceId: "xray",
          name: "X-ray (Digital & Contrast)",
          status: "AVAILABLE",
          statusReason: "Dual high-frequency digital X-ray suites fully operational with 2 certified technicians on duty.",
          lastVerified: "2026-10-15T09:20:00Z",
          verifiedBy: "Lead Radiographer - K. Gill",
          sourceType: "FACILITY_PORTAL_SYNC",
          estimatedWaitHours: "15 - 20 minutes",
          operationalNotes: "Walk-ins accepted. Instant digital image and verified report delivered within 40 minutes."
        },
        {
          serviceId: "mri",
          name: "MRI Scan (1.5 Tesla Wide Bore)",
          status: "AVAILABLE",
          statusReason: "Silent MRI scanner operational with claustrophobia support.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Duty Technologist",
          sourceType: "FACILITY_PORTAL_SYNC",
          operationalNotes: "Prior slot booking recommended."
        },
        {
          serviceId: "ultrasound",
          name: "Ultrasound (4D Color Doppler)",
          status: "AVAILABLE",
          statusReason: "Senior consultant radiologist available on site.",
          lastVerified: "2026-10-15T09:15:00Z",
          verifiedBy: "Lab Administrator",
          sourceType: "FACILITY_PORTAL_SYNC",
          operationalNotes: "Fasting required for abdominal scans."
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "NABL & CAP accredited automated pathology laboratory active.",
          lastVerified: "2026-10-15T07:00:00Z",
          verifiedBy: "Quality In-Charge",
          sourceType: "FACILITY_PORTAL_SYNC",
          operationalNotes: "Home sample collection available in Chandigarh Tricity."
        }
      ]
    },

    {
      id: "fac-chd-max",
      name: "Max Super Speciality Hospital, Mohali",
      isDemoCoreFacility: false,
      type: "Tertiary Care Multi-Speciality Hospital",
      category: "hospital",
      city: "Chandigarh",
      state: "Punjab / Tricity",
      pinCode: "160055",
      cityAliases: ["chd", "chandigarh", "mohali", "max", "phase 6", "tricity"],
      locationId: "chandigarh",
      locationName: "Phase 6, Mohali (Chandigarh Tricity)",
      address: "Near Civil Hospital, Phase 6, Sector 56, Mohali, Chandigarh Tricity, 160055",
      distanceKm: 4.5,
      coordinates: { lat: 30.7258, lng: 76.7124 },
      phone: "+91 172 665 2000",
      emergencyPhone: "+91 172 665 2001",
      email: "helpdesk.mohali@maxhealthcare.com",
      website: "https://maxhealthcare.in",
      operatingHours: "Open 24/7 (Emergency, Trauma & IPD); OPD: 8:30 AM - 6:00 PM",
      isOpenNow: true,
      rating: 4.6,
      reviewCount: 950,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:10:00Z",
        verifiedBy: "Hospital Portal API Integration",
        sourceType: "AUTOMATED_API_SYNC"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Level 1 Trauma Unit and 32 ICU beds active with emergency physicians.",
          lastVerified: "2026-10-15T09:10:00Z",
          verifiedBy: "Max Emergency Triage",
          sourceType: "AUTOMATED_API_SYNC",
          operationalNotes: "Direct ambulance entrance off Phase 6 highway."
        },
        {
          serviceId: "cardiology",
          name: "Cardiology & ECG",
          status: "AVAILABLE",
          statusReason: "Dual flat-panel cath labs active for emergency angioplasty and ECG.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Cardiology Admin",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "24/7 emergency digital radiology operational.",
          lastVerified: "2026-10-15T09:10:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "ct_scan",
          name: "CT Scan (128 Slice)",
          status: "AVAILABLE",
          statusReason: "High-speed cardiac and neuro CT scanner active.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Radiology Desk",
          sourceType: "AUTOMATED_API_SYNC"
        }
      ]
    },

    {
      id: "fac-chd-gmch32",
      name: "GMCH Sector 32 (Govt Medical College & Hospital)",
      isDemoCoreFacility: false,
      type: "Government Medical College & Tertiary Hospital",
      category: "hospital",
      city: "Chandigarh",
      state: "Chandigarh (UT)",
      pinCode: "160032",
      cityAliases: ["chd", "chandigarh", "gmch", "gmch 32", "sector 32", "tricity"],
      locationId: "chandigarh",
      locationName: "Sector 32, Chandigarh",
      address: "Chandi Path, Sector 32-B, Chandigarh, 160032",
      distanceKm: 3.8,
      coordinates: { lat: 30.7088, lng: 76.7788 },
      phone: "+91 172 266 5253",
      emergencyPhone: "+91 172 266 5254",
      email: "gmch-chd@nic.in",
      website: "https://gmch.gov.in",
      operatingHours: "Open 24/7 (Emergency & Casualty); OPD: 8:00 AM - 1:00 PM",
      isOpenNow: true,
      rating: 4.1,
      reviewCount: 680,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: false,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-14T17:30:00Z",
        verifiedBy: "Medical Superintendent Desk",
        sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Emergency casualty and trauma resuscitation block fully functional.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Casualty Medical Officer",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "OPD and emergency digital X-ray services running.",
          lastVerified: "2026-10-14T16:00:00Z",
          verifiedBy: "Radiology Staff",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "Central hospital biochemistry lab active.",
          lastVerified: "2026-10-14T15:00:00Z",
          verifiedBy: "Pathology Duty Officer",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "ultrasound",
          name: "Ultrasound (USG)",
          status: "NOT_VERIFIED",
          statusReason: "Radiologist afternoon shift roster under review.",
          lastVerified: "2026-09-25T11:00:00Z",
          verifiedBy: "Historical record",
          sourceType: "UNVERIFIED_DIRECTORY_LISTING",
          operationalNotes: "Please contact OPD counter to verify sonologist availability."
        }
      ]
    },

    {
      id: "fac-chd-healthfirst-pharmacy",
      name: "HealthFirst 24/7 Pharmacy & Medical Store",
      isDemoCoreFacility: false,
      type: "24/7 Pharmacy & First Aid Clinic",
      category: "pharmacy",
      city: "Chandigarh",
      state: "Chandigarh (UT)",
      pinCode: "160015",
      cityAliases: ["chd", "chandigarh", "sector 15", "pharmacy", "chemist", "tricity"],
      locationId: "chandigarh",
      locationName: "Sector 15-D, Chandigarh",
      address: "SCO 45, Sector 15-D Market, Near Patel Market, Chandigarh, 160015",
      distanceKm: 1.5,
      coordinates: { lat: 30.7540, lng: 76.7680 },
      phone: "+91 172 277 8899",
      emergencyPhone: "+91 172 277 8890",
      email: "orders@healthfirst-chd.in",
      website: "https://healthfirst-chd.in",
      operatingHours: "Open 24 Hours, 7 Days a Week",
      isOpenNow: true,
      rating: 4.5,
      reviewCount: 310,
      accessibility: {
        wheelchairRamp: true,
        elevator: false,
        accessibleRestroom: false,
        brailleSignage: false,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T06:30:00Z",
        verifiedBy: "Registered Pharmacist - Harpreet S.",
        sourceType: "STORE_AUDIT"
      },
      services: [
        {
          serviceId: "pharmacy_247",
          name: "24/7 Pharmacy Dispensing",
          status: "AVAILABLE",
          statusReason: "Round-the-clock registered pharmacist present. Critical emergency drugs and surgicals in stock.",
          lastVerified: "2026-10-15T06:30:00Z",
          verifiedBy: "Store Manager",
          sourceType: "STORE_AUDIT"
        },
        {
          serviceId: "vaccination",
          name: "Routine Vaccination",
          status: "AVAILABLE",
          statusReason: "Cold storage facility active for routine adult and flu vaccines.",
          lastVerified: "2026-10-14T18:00:00Z",
          verifiedBy: "Duty Nurse",
          sourceType: "STORE_AUDIT"
        }
      ]
    },
    {
      id: "fac-chd-gmsh16",
      name: "Government Multi-Specialty Hospital (GMSH Sector 16)",
      isDemoCoreFacility: false,
      type: "Premier Government Multi-Speciality Hospital",
      category: "hospital",
      city: "Chandigarh",
      state: "Chandigarh (UT)",
      pinCode: "160015",
      cityAliases: ["chd", "chandigarh", "gmsh", "gmsh 16", "sector 16", "tricity"],
      locationId: "chandigarh",
      locationName: "Sector 16, Chandigarh",
      address: "Sector 16-A, Madhya Marg, Chandigarh, 160015",
      distanceKm: 2.1,
      coordinates: { lat: 30.7482, lng: 76.7820 },
      phone: "+91 172 275 2000",
      emergencyPhone: "+91 172 275 2222",
      email: "gmsh16-chd@nic.in",
      website: "https://chdgmsh.gov.in",
      operatingHours: "Open 24/7 (Emergency & Advanced Trauma Wing)",
      isOpenNow: true,
      rating: 4.5,
      reviewCount: 980,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:00:00Z",
        verifiedBy: "Chandigarh Health Administration",
        sourceType: "GOVERNMENT_HEALTH_BULLETIN"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Emergency round-the-clock wing with 30 intensive care beds.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Casualty Medical Officer",
          sourceType: "GOVERNMENT_HEALTH_BULLETIN"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "Digital X-ray operational in Casualty block.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Radiology In-Charge",
          sourceType: "GOVERNMENT_HEALTH_BULLETIN"
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "24/7 Central clinical biochemistry & pathology lab operational.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Lab Technician",
          sourceType: "GOVERNMENT_HEALTH_BULLETIN"
        }
      ]
    },
    {
      id: "fac-chd-fortis",
      name: "Fortis Hospital Mohali",
      isDemoCoreFacility: false,
      type: "JCI & NABH Accredited Multi-Super Speciality Hospital",
      category: "hospital",
      city: "Chandigarh",
      state: "Punjab (Tricity)",
      pinCode: "160062",
      cityAliases: ["chd", "chandigarh", "mohali", "fortis", "fortis mohali", "phase 8", "sector 62", "tricity"],
      locationId: "chandigarh",
      locationName: "Sector 62, Mohali",
      address: "Sector 62, Phase 8, SAS Nagar, Mohali, Punjab 160062",
      distanceKm: 7.2,
      coordinates: { lat: 30.7073, lng: 76.7214 },
      phone: "+91 172 469 2222",
      emergencyPhone: "+91 172 469 2200",
      email: "contactus.mohali@fortishealthcare.com",
      website: "https://fortishealthcare.com",
      operatingHours: "Open 24/7 (Emergency, Trauma & Cardiac Sciences)",
      isOpenNow: true,
      rating: 4.8,
      reviewCount: 2890,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:30:00Z",
        verifiedBy: "Fortis Clinical Telemetry & Admin Sync",
        sourceType: "AUTOMATED_API_SYNC"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Level 1 emergency trauma care & cardiac ICU active 24/7.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "Emergency Head",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "cardiology",
          name: "Cardiology & Cath Lab",
          status: "AVAILABLE",
          statusReason: "Advanced cath lab active with emergency coronary angioplasty support.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "Cardiology Unit",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "mri",
          name: "MRI Scan (3.0 Tesla)",
          status: "AVAILABLE",
          statusReason: "High precision 3T MRI fully operational.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "Digital 24/7 flat-panel detector X-ray active.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "AUTOMATED_API_SYNC"
        }
      ]
    },
    {
      id: "fac-chd-mukat",
      name: "Mukat Hospital & Heart Institute",
      isDemoCoreFacility: false,
      type: "Super Speciality Cardiac & Critical Care Hospital",
      category: "hospital",
      city: "Chandigarh",
      state: "Chandigarh (UT)",
      pinCode: "160022",
      cityAliases: ["chd", "chandigarh", "mukat", "sector 34", "heart institute", "tricity"],
      locationId: "chandigarh",
      locationName: "Sector 34, Chandigarh",
      address: "SCO 47-49, Sector 34-A, Sub. City Center, Chandigarh, 160022",
      distanceKm: 3.4,
      coordinates: { lat: 30.7225, lng: 76.7682 },
      phone: "+91 172 434 4444",
      emergencyPhone: "+91 172 434 4400",
      email: "info@mukathospital.com",
      website: "https://mukathospital.com",
      operatingHours: "Open 24/7 (Emergency & Heart Institute)",
      isOpenNow: true,
      rating: 4.6,
      reviewCount: 1120,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: false,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T08:00:00Z",
        verifiedBy: "Hospital Administration via Verified Portal",
        sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Emergency casualty and cardiac care unit active 24/7.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Casualty Officer",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "Digital radiology operational.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "On-site emergency laboratory active 24/7.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Lab In-Charge",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        }
      ]
    },

    // =============================================================
    // DELHI NCR (delhi, new delhi, del, ncr, saket, cp, okhla)
    // =============================================================
    {
      id: "fac-del-aiims",
      name: "AIIMS (All India Institute of Medical Sciences)",
      isDemoCoreFacility: false,
      type: "Apex Tertiary Care Institute & Research Hospital",
      category: "hospital",
      city: "Delhi",
      state: "Delhi NCR",
      pinCode: "110029",
      cityAliases: ["delhi", "new delhi", "del", "ncr", "aiims", "ansari nagar", "south delhi", "safdarjung"],
      locationId: "delhi",
      locationName: "Ansari Nagar, New Delhi",
      address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi, 110029",
      distanceKm: 1.5,
      coordinates: { lat: 28.5672, lng: 77.2100 },
      phone: "+91 11 2658 8500",
      emergencyPhone: "+91 11 2658 8700",
      email: "info@aiims.edu",
      website: "https://aiims.edu",
      operatingHours: "Open 24/7 (Emergency, Trauma & Critical Care)",
      isOpenNow: true,
      rating: 4.9,
      reviewCount: 3840,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:30:00Z",
        verifiedBy: "AIIMS Central Information Desk",
        sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "JPN Apex Trauma Centre running 24/7 with specialized emergency trauma teams.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "Trauma Coordinator",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "24/7 Emergency Digital Radiography operational.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Chief Radiographer",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "mri",
          name: "MRI Scan (3.0 Tesla)",
          status: "AVAILABLE",
          statusReason: "High-field 3T MRI units fully functional in neuro-radiology.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "MRI Centre",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "ct_scan",
          name: "CT Scan",
          status: "AVAILABLE",
          statusReason: "Dual 256-slice CT scanners active 24/7.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "CT Division",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "dialysis",
          name: "Hemodialysis",
          status: "AVAILABLE",
          statusReason: "Department of Nephrology active.",
          lastVerified: "2026-10-15T07:30:00Z",
          verifiedBy: "Nephrology Unit",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        }
      ]
    },

    {
      id: "fac-del-safdarjung",
      name: "Safdarjung Hospital & VMMC",
      isDemoCoreFacility: false,
      type: "Premier Central Government Hospital",
      category: "hospital",
      city: "Delhi",
      state: "Delhi NCR",
      pinCode: "110029",
      cityAliases: ["delhi", "new delhi", "del", "safdarjung", "ring road", "ncr", "south delhi"],
      locationId: "delhi",
      locationName: "Ring Road, New Delhi",
      address: "Ring Road, Opposite AIIMS, Ansari Nagar West, New Delhi, 110029",
      distanceKm: 1.8,
      coordinates: { lat: 28.5702, lng: 77.2075 },
      phone: "+91 11 2616 5060",
      emergencyPhone: "+91 11 2616 5070",
      email: "helpdesk@safdarjunghospital.in",
      website: "https://vmmc-sjh.nic.in",
      operatingHours: "Open 24/7 (Emergency & Casualty); OPD: 8:00 AM - 1:00 PM",
      isOpenNow: true,
      rating: 4.2,
      reviewCount: 1120,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: false,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T08:45:00Z",
        verifiedBy: "Emergency Care Administrator",
        sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
      },
      services: [
        {
          serviceId: "xray",
          name: "X-ray",
          status: "UNAVAILABLE",
          statusReason: "OPD Block digital X-ray machine undergoing sensor replacement. Non-emergency walk-in patients redirected to Dr. Lal PathLabs Connaught Place or AIIMS.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Radiology Technician",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION",
          operationalNotes: "Emergency casualty X-rays operational for trauma only."
        },
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "New Emergency Block active with 50 emergency resuscitation beds.",
          lastVerified: "2026-10-15T08:45:00Z",
          verifiedBy: "Casualty Officer",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "Central automated pathology lab running.",
          lastVerified: "2026-10-15T07:15:00Z",
          verifiedBy: "Pathologist on duty",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        }
      ]
    },

    {
      id: "fac-del-lalpathlabs",
      name: "Dr. Lal PathLabs & Reference Imaging Centre",
      isDemoCoreFacility: false,
      type: "Comprehensive Diagnostic & Imaging Centre",
      category: "diagnostic",
      city: "Delhi",
      state: "Delhi NCR",
      pinCode: "110001",
      cityAliases: ["delhi", "new delhi", "del", "lal pathlabs", "connaught place", "central delhi", "cp", "ncr"],
      locationId: "delhi",
      locationName: "Connaught Place, Central Delhi",
      address: "Block E, Inner Circle, Connaught Place, New Delhi, 110001",
      distanceKm: 2.1,
      coordinates: { lat: 28.6328, lng: 77.2197 },
      phone: "+91 11 3988 5050",
      emergencyPhone: null,
      email: "customercare@lalpathlabs.com",
      website: "https://lalpathlabs.com",
      operatingHours: "Monday - Sunday: 7:00 AM - 9:00 PM",
      isOpenNow: true,
      rating: 4.7,
      reviewCount: 920,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: false,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:15:00Z",
        verifiedBy: "Chief Medical Technologist via Portal Sync",
        sourceType: "FACILITY_PORTAL_SYNC"
      },
      services: [
        {
          serviceId: "xray",
          name: "X-ray (Digital & Fluoroscopy)",
          status: "AVAILABLE",
          statusReason: "Dual digital X-ray suites functional with immediate radiologist review.",
          lastVerified: "2026-10-15T09:15:00Z",
          verifiedBy: "Radiologist on duty",
          sourceType: "FACILITY_PORTAL_SYNC",
          estimatedWaitHours: "15 - 20 minutes",
          operationalNotes: "Walk-in appointments accepted. Digital report + film within 45 mins."
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "NABL & CAP accredited automated robotic test analyzer.",
          lastVerified: "2026-10-15T07:00:00Z",
          verifiedBy: "Quality Manager",
          sourceType: "FACILITY_PORTAL_SYNC"
        },
        {
          serviceId: "ultrasound",
          name: "Ultrasound (USG)",
          status: "AVAILABLE",
          statusReason: "Sonologist available in two rotating shifts.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Duty Doctor",
          sourceType: "FACILITY_PORTAL_SYNC"
        }
      ]
    },

    {
      id: "fac-del-max-saket",
      name: "Max Super Speciality Hospital, Saket",
      isDemoCoreFacility: false,
      type: "Quaternary Care Multi-Speciality Hospital",
      category: "hospital",
      city: "Delhi",
      state: "Delhi NCR",
      pinCode: "110017",
      cityAliases: ["delhi", "new delhi", "del", "max", "saket", "south delhi", "ncr"],
      locationId: "delhi",
      locationName: "Saket, South Delhi",
      address: "1 & 2 Press Enclave Road, Saket, New Delhi, 110017",
      distanceKm: 5.6,
      coordinates: { lat: 28.5276, lng: 77.2132 },
      phone: "+91 11 2651 5050",
      emergencyPhone: "+91 11 2651 5051",
      email: "saket@maxhealthcare.com",
      website: "https://maxhealthcare.in",
      operatingHours: "Open 24/7 (Emergency & IPD); OPD: 8:00 AM - 8:00 PM",
      isOpenNow: true,
      rating: 4.7,
      reviewCount: 1640,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:00:00Z",
        verifiedBy: "Max HIS Automation API",
        sourceType: "AUTOMATED_API_SYNC"
      },
      services: [
        {
          serviceId: "cardiology",
          name: "Cardiology & ECG",
          status: "AVAILABLE",
          statusReason: "Max Heart & Vascular Institute active with 24/7 primary angioplasty.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Cardiology Unit",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "NABH accredited Level 1 Emergency centre.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "ER Desk",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "mri",
          name: "MRI Scan (3.0 Tesla)",
          status: "AVAILABLE",
          statusReason: "High-resolution 3T MRI functional.",
          lastVerified: "2026-10-14T20:00:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "Digital X-ray suites functional 24/7.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "AUTOMATED_API_SYNC"
        }
      ]
    },
    {
      id: "fac-del-gangaram",
      name: "Sir Ganga Ram Hospital",
      isDemoCoreFacility: false,
      type: "Premier Multi-Super Speciality Tertiary Hospital",
      category: "hospital",
      city: "Delhi",
      state: "Delhi NCR",
      pinCode: "110060",
      cityAliases: ["delhi", "new delhi", "del", "gangaram", "rajinder nagar", "karol bagh", "central delhi", "ncr"],
      locationId: "delhi",
      locationName: "Old Rajinder Nagar, New Delhi",
      address: "Sir Ganga Ram Hospital Marg, Old Rajinder Nagar, New Delhi, 110060",
      distanceKm: 4.8,
      coordinates: { lat: 28.6385, lng: 77.1895 },
      phone: "+91 11 2575 0000",
      emergencyPhone: "+91 11 4225 1000",
      email: "gangaram@sgrh.com",
      website: "https://sgrh.com",
      operatingHours: "Open 24/7 (Emergency & Advanced Critical Care)",
      isOpenNow: true,
      rating: 4.7,
      reviewCount: 3100,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:00:00Z",
        verifiedBy: "Hospital Administration via Verified Portal",
        sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "60+ bed emergency critical care unit active 24/7.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Casualty Head",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "Digital high-frequency X-ray operational around the clock.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "mri",
          name: "MRI Scan (3.0 Tesla)",
          status: "AVAILABLE",
          statusReason: "3.0T MRI active for cranial, spinal, and body imaging.",
          lastVerified: "2026-10-14T20:00:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "NABL-accredited robotic clinical biochemistry laboratory active.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Chief Pathologist",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        }
      ]
    },
    {
      id: "fac-del-apollo",
      name: "Indraprastha Apollo Hospitals, Sarita Vihar",
      isDemoCoreFacility: false,
      type: "JCI Accredited Multi-Super Speciality Quaternary Care Hospital",
      category: "hospital",
      city: "Delhi",
      state: "Delhi NCR",
      pinCode: "110076",
      cityAliases: ["delhi", "new delhi", "del", "apollo", "apollo delhi", "sarita vihar", "mathura road", "south delhi", "ncr"],
      locationId: "delhi",
      locationName: "Sarita Vihar, New Delhi",
      address: "Delhi Mathura Road, Sarita Vihar, New Delhi, 110076",
      distanceKm: 8.5,
      coordinates: { lat: 28.5386, lng: 77.2832 },
      phone: "+91 11 2692 5858",
      emergencyPhone: "+91 11 2692 5801",
      email: "assistance@apollohospitalsdelhi.com",
      website: "https://delhi.apollohospitals.com",
      operatingHours: "Open 24/7 (Emergency, Trauma & Transplant Institute)",
      isOpenNow: true,
      rating: 4.8,
      reviewCount: 4200,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:30:00Z",
        verifiedBy: "Apollo Telemetry & Hospital API Sync",
        sourceType: "AUTOMATED_API_SYNC"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "JCI-accredited Emergency Emergency response with dedicated cardiac and stroke teams.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "ER Director",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "cardiology",
          name: "Cardiology & Cath Lab",
          status: "AVAILABLE",
          statusReason: "Round-the-clock cardiac intervention and primary angioplasty team ready.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "Cardiac Unit",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "24/7 Digital X-ray and tele-radiology active.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "Emergency laboratory turnaround under 45 minutes.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Laboratory Head",
          sourceType: "AUTOMATED_API_SYNC"
        }
      ]
    },

    // =============================================================
    // BANGALORE / BENGALURU (bangalore, bengaluru, blr, karnataka)
    // =============================================================
    {
      id: "fac-blr-manipal",
      name: "Manipal Hospital, HAL Airport Road",
      isDemoCoreFacility: false,
      type: "Multi-Speciality Quaternary Care Hospital",
      category: "hospital",
      city: "Bangalore",
      state: "Karnataka",
      pinCode: "560017",
      cityAliases: ["bangalore", "bengaluru", "blr", "manipal", "hal airport road", "indiranagar", "kodihalli", "karnataka"],
      locationId: "bangalore",
      locationName: "HAL Airport Road, Bengaluru",
      address: "98 HAL Airport Road, Kodihalli, Bengaluru, Karnataka, 560017",
      distanceKm: 1.4,
      coordinates: { lat: 12.9592, lng: 77.6534 },
      phone: "+91 80 2502 4444",
      emergencyPhone: "+91 80 2502 3344",
      email: "info@manipalhospitals.com",
      website: "https://manipalhospitals.com",
      operatingHours: "Open 24/7 (Emergency & Critical Care); OPD: 8:00 AM - 6:00 PM",
      isOpenNow: true,
      rating: 4.7,
      reviewCount: 2100,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:00:00Z",
        verifiedBy: "Manipal Information Desk",
        sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
      },
      services: [
        {
          serviceId: "xray",
          name: "X-ray",
          status: "UNAVAILABLE",
          statusReason: "Outpatient radiology wing digital X-ray system undergoing software calibration until 4:00 PM today. Patients needing confirmed X-rays recommended to Anand Diagnostics or Aster CMI.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Head Radiographer",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION",
          operationalNotes: "Emergency trauma X-ray operational in Casualty only."
        },
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Full Level 1 Emergency with dedicated cardiac & neuro resuscitation.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "ER Triage Officer",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "mri",
          name: "MRI Scan (3.0 Tesla)",
          status: "AVAILABLE",
          statusReason: "3.0 Tesla high-resolution MRI scanner operational.",
          lastVerified: "2026-10-14T19:00:00Z",
          verifiedBy: "Imaging Supervisor",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "pediatrics",
          name: "Pediatric Consultation",
          status: "AVAILABLE",
          statusReason: "Manipal Child Care clinic running with senior pediatricians.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Pediatric OPD Desk",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "ct_scan",
          name: "CT Scan (256 Slice)",
          status: "AVAILABLE",
          statusReason: "Ultra high speed CT scanner active 24/7.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Radiology Desk",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        }
      ]
    },

    {
      id: "fac-blr-anand",
      name: "Anand Diagnostic Laboratory (Neuberg Anand)",
      isDemoCoreFacility: false,
      type: "Comprehensive Diagnostic & Imaging Centre",
      category: "diagnostic",
      city: "Bangalore",
      state: "Karnataka",
      pinCode: "560051",
      cityAliases: ["bangalore", "bengaluru", "blr", "anand", "shivaji nagar", "central bangalore", "karnataka"],
      locationId: "bangalore",
      locationName: "Shivaji Nagar, Bengaluru",
      address: "11 Bowring Hospital Road, Shivaji Nagar, Bengaluru, Karnataka, 560051",
      distanceKm: 3.2,
      coordinates: { lat: 12.9830, lng: 77.6040 },
      phone: "+91 80 2286 1102",
      emergencyPhone: "+91 80 2286 1103",
      email: "care@neuberganand.com",
      website: "https://neuberganand.com",
      operatingHours: "Monday - Sunday: 6:30 AM - 9:00 PM",
      isOpenNow: true,
      rating: 4.8,
      reviewCount: 1280,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: false,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:15:00Z",
        verifiedBy: "Lab Director via Verified API",
        sourceType: "FACILITY_PORTAL_SYNC"
      },
      services: [
        {
          serviceId: "xray",
          name: "X-ray (Digital)",
          status: "AVAILABLE",
          statusReason: "Ground floor digital X-ray suite fully functional with certified radiographers on duty.",
          lastVerified: "2026-10-15T09:15:00Z",
          verifiedBy: "Lead Radiographer",
          sourceType: "FACILITY_PORTAL_SYNC",
          estimatedWaitHours: "15 - 25 minutes",
          operationalNotes: "Walk-ins accepted. Instant digital PACS link and report delivered promptly."
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "NABL & CAP accredited automated robotic test analyzer running round the clock.",
          lastVerified: "2026-10-15T07:00:00Z",
          verifiedBy: "Chief Pathologist",
          sourceType: "FACILITY_PORTAL_SYNC"
        },
        {
          serviceId: "ultrasound",
          name: "Ultrasound (Color Doppler)",
          status: "AVAILABLE",
          statusReason: "Consultant radiologists available for abdominal and vascular scans.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Ultrasound Wing",
          sourceType: "FACILITY_PORTAL_SYNC"
        }
      ]
    },

    {
      id: "fac-blr-narayana",
      name: "Narayana Institute of Cardiac Sciences (Health City)",
      isDemoCoreFacility: false,
      type: "Cardiac & Multi-Speciality Health City",
      category: "hospital",
      city: "Bangalore",
      state: "Karnataka",
      pinCode: "560099",
      cityAliases: ["bangalore", "bengaluru", "blr", "narayana", "bommasandra", "electronic city", "karnataka"],
      locationId: "bangalore",
      locationName: "Bommasandra, Bengaluru",
      address: "258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru, Karnataka, 560099",
      distanceKm: 8.5,
      coordinates: { lat: 12.8188, lng: 77.6946 },
      phone: "+91 80 7122 2222",
      emergencyPhone: "+91 80 7122 2200",
      email: "info.nics@narayanahealth.org",
      website: "https://narayanahealth.org",
      operatingHours: "Open 24/7 (Emergency & Cardiac Care); OPD: 8:00 AM - 5:00 PM",
      isOpenNow: true,
      rating: 4.8,
      reviewCount: 3100,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:30:00Z",
        verifiedBy: "NH Portal API",
        sourceType: "AUTOMATED_API_SYNC"
      },
      services: [
        {
          serviceId: "cardiology",
          name: "Cardiology & ECG",
          status: "AVAILABLE",
          statusReason: "World renowned cardiac institute with 6 active cath labs.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "Cardiology Division",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Coronary care unit & trauma emergency active 24/7.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "ER Desk",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "dialysis",
          name: "Hemodialysis",
          status: "AVAILABLE",
          statusReason: "30-station dialysis unit functional.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Renal Care",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "24/7 emergency digital radiology operational.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "AUTOMATED_API_SYNC"
        }
      ]
    },

    {
      id: "fac-blr-aster",
      name: "Aster CMI Hospital, Hebbal",
      isDemoCoreFacility: false,
      type: "Quaternary Care Multi-Speciality Hospital",
      category: "hospital",
      city: "Bangalore",
      state: "Karnataka",
      pinCode: "560092",
      cityAliases: ["bangalore", "bengaluru", "blr", "aster", "hebbal", "north bangalore", "karnataka"],
      locationId: "bangalore",
      locationName: "Hebbal, Bengaluru",
      address: "New Airport Road, NH 44, Sahakar Nagar, Hebbal, Bengaluru, Karnataka, 560092",
      distanceKm: 6.2,
      coordinates: { lat: 13.0560, lng: 77.5925 },
      phone: "+91 80 4342 0100",
      emergencyPhone: "+91 80 4342 0111",
      email: "astercmi@asterhospital.com",
      website: "https://asterhospitals.in",
      operatingHours: "Open 24/7 (Emergency & Critical Care); OPD: 8:30 AM - 7:00 PM",
      isOpenNow: true,
      rating: 4.6,
      reviewCount: 1450,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T08:50:00Z",
        verifiedBy: "Aster Hospital HIS API",
        sourceType: "AUTOMATED_API_SYNC"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Full emergency trauma center active.",
          lastVerified: "2026-10-15T08:50:00Z",
          verifiedBy: "Emergency Desk",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "Emergency and OPD digital X-ray suites functional.",
          lastVerified: "2026-10-15T08:50:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "ct_scan",
          name: "CT Scan (128 Slice)",
          status: "AVAILABLE",
          statusReason: "Computed tomography unit functional 24/7.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Radiology Desk",
          sourceType: "AUTOMATED_API_SYNC"
        }
      ]
    },

    // =============================================================
    // MUMBAI (mumbai, bombay, bom, bandra, andheri, dadar)
    // =============================================================
    {
      id: "fac-mum-lilavati",
      name: "Lilavati Hospital & Research Centre",
      isDemoCoreFacility: false,
      type: "Premier Multi-Speciality Tertiary Hospital",
      category: "hospital",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400050",
      cityAliases: ["mumbai", "bombay", "bom", "lilavati", "bandra", "bandra west", "maharashtra"],
      locationId: "mumbai",
      locationName: "Bandra West, Mumbai",
      address: "A-791 Bandra Reclamation, Bandra West, Mumbai, Maharashtra, 400050",
      distanceKm: 1.5,
      coordinates: { lat: 19.0514, lng: 72.8295 },
      phone: "+91 22 2675 1000",
      emergencyPhone: "+91 22 2675 1111",
      email: "info@lilavatihospital.com",
      website: "https://lilavatihospital.com",
      operatingHours: "Open 24/7 (Emergency & IPD); OPD: 8:00 AM - 6:00 PM",
      isOpenNow: true,
      rating: 4.6,
      reviewCount: 2200,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:00:00Z",
        verifiedBy: "Lilavati Information Center",
        sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "State-of-the-art emergency casualty unit operational.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Casualty In-Charge",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "Digital X-ray units active 24/7.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Radiology Staff",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "mri",
          name: "MRI Scan (3.0 Tesla)",
          status: "AVAILABLE",
          statusReason: "3 Tesla MRI scanner functional.",
          lastVerified: "2026-10-14T18:00:00Z",
          verifiedBy: "Radiology Desk",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "cardiology",
          name: "Cardiology & ECG",
          status: "AVAILABLE",
          statusReason: "Interventional cardiology and ECG active.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Cardiology Unit",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        }
      ]
    },

    {
      id: "fac-mum-kokilaben",
      name: "Kokilaben Dhirubhai Ambani Hospital",
      isDemoCoreFacility: false,
      type: "Quaternary Care Multi-Speciality Hospital",
      category: "hospital",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400053",
      cityAliases: ["mumbai", "bombay", "bom", "kokilaben", "andheri", "andheri west", "western suburbs", "maharashtra"],
      locationId: "mumbai",
      locationName: "Andheri West, Mumbai",
      address: "Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai, 400053",
      distanceKm: 4.8,
      coordinates: { lat: 19.1311, lng: 72.8252 },
      phone: "+91 22 4269 6969",
      emergencyPhone: "+91 22 4269 9999",
      email: "helpdesk.kdah@relianceada.com",
      website: "https://kokilabenhospital.com",
      operatingHours: "Open 24/7 (Emergency & Critical Care)",
      isOpenNow: true,
      rating: 4.8,
      reviewCount: 3400,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T08:30:00Z",
        verifiedBy: "Hospital Administration via Verified Portal",
        sourceType: "FACILITY_PORTAL_SYNC"
      },
      services: [
        {
          serviceId: "xray",
          name: "X-ray",
          status: "UNAVAILABLE",
          statusReason: "Outpatient X-ray Suite 2 undergoing mandatory radiation safety inspection. Patients advised to visit SRL Diagnostics Dadar or Lilavati Hospital for routine outpatient radiographs.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Radiology Safety Officer",
          sourceType: "FACILITY_PORTAL_SYNC",
          operationalNotes: "Emergency trauma X-ray reserved for critical ambulance arrivals."
        },
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Certified Full Capacity Emergency Trauma Centre active.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "ER Desk",
          sourceType: "FACILITY_PORTAL_SYNC"
        },
        {
          serviceId: "ct_scan",
          name: "CT Scan (Dual Source)",
          status: "AVAILABLE",
          statusReason: "Dual source CT operational 24/7.",
          lastVerified: "2026-10-15T07:45:00Z",
          verifiedBy: "CT Division",
          sourceType: "FACILITY_PORTAL_SYNC"
        },
        {
          serviceId: "dialysis",
          name: "Hemodialysis",
          status: "AVAILABLE",
          statusReason: "Modern nephrology dialysis unit running.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Renal Unit",
          sourceType: "FACILITY_PORTAL_SYNC"
        }
      ]
    },

    {
      id: "fac-mum-srl",
      name: "SRL Diagnostics & Imaging Centre, Dadar",
      isDemoCoreFacility: false,
      type: "Comprehensive Diagnostic Lab & Imaging",
      category: "diagnostic",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400028",
      cityAliases: ["mumbai", "bombay", "bom", "srl", "dadar", "central mumbai", "maharashtra"],
      locationId: "mumbai",
      locationName: "Dadar West, Mumbai",
      address: "Ranade Road, Near Dadar Railway Station, Dadar West, Mumbai, 400028",
      distanceKm: 3.1,
      coordinates: { lat: 19.0195, lng: 72.8427 },
      phone: "+91 22 2430 4567",
      emergencyPhone: null,
      email: "dadar@srl.in",
      website: "https://srlworld.com",
      operatingHours: "Monday - Sunday: 7:00 AM - 9:00 PM",
      isOpenNow: true,
      rating: 4.6,
      reviewCount: 780,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: false,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:20:00Z",
        verifiedBy: "SRL Duty Radiographer",
        sourceType: "FACILITY_PORTAL_SYNC"
      },
      services: [
        {
          serviceId: "xray",
          name: "X-ray (Digital)",
          status: "AVAILABLE",
          statusReason: "Dual digital X-ray suites fully operational with certified technicians.",
          lastVerified: "2026-10-15T09:20:00Z",
          verifiedBy: "Lead Radiographer",
          sourceType: "FACILITY_PORTAL_SYNC",
          estimatedWaitHours: "15 - 20 minutes",
          operationalNotes: "Walk-ins accepted. Instant digital image and report delivered within 35 minutes."
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "Automated NABL accredited laboratory assays.",
          lastVerified: "2026-10-15T07:15:00Z",
          verifiedBy: "Pathology Quality Lead",
          sourceType: "FACILITY_PORTAL_SYNC"
        },
        {
          serviceId: "ultrasound",
          name: "Ultrasound (USG)",
          status: "AVAILABLE",
          statusReason: "Resident sonologist available on site.",
          lastVerified: "2026-10-15T08:45:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "FACILITY_PORTAL_SYNC"
        }
      ]
    },

    // =============================================================
    // HYDERABAD (hyderabad, hyd, secunderabad, jubilee hills)
    // =============================================================
    {
      id: "fac-hyd-apollo",
      name: "Apollo Hospitals, Jubilee Hills",
      isDemoCoreFacility: false,
      type: "Super Speciality Tertiary Hospital",
      category: "hospital",
      city: "Hyderabad",
      state: "Telangana",
      pinCode: "500033",
      cityAliases: ["hyderabad", "hyd", "apollo", "jubilee hills", "telangana", "secunderabad"],
      locationId: "hyderabad",
      locationName: "Jubilee Hills, Hyderabad",
      address: "Road No 72, Film Nagar, Jubilee Hills, Hyderabad, Telangana, 500033",
      distanceKm: 2.5,
      coordinates: { lat: 17.4239, lng: 78.4116 },
      phone: "+91 40 2360 7777",
      emergencyPhone: "+91 40 2360 8888",
      email: "apollo_hyd@apollohospitals.com",
      website: "https://hyderabad.apollohospitals.com",
      operatingHours: "Open 24/7 (Emergency & IPD); OPD: 8:00 AM - 6:00 PM",
      isOpenNow: true,
      rating: 4.8,
      reviewCount: 2900,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:00:00Z",
        verifiedBy: "Apollo HIS Integration",
        sourceType: "AUTOMATED_API_SYNC"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Full emergency trauma centre with dedicated cardiac response.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "ER Desk",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "Digital X-ray units fully functional 24/7.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "cardiology",
          name: "Cardiology & ECG",
          status: "AVAILABLE",
          statusReason: "Apollo Heart Institute active.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Heart Centre",
          sourceType: "AUTOMATED_API_SYNC"
        }
      ]
    },

    {
      id: "fac-hyd-vijaya",
      name: "Vijaya Diagnostic Centre, Himayatnagar",
      isDemoCoreFacility: false,
      type: "Comprehensive Diagnostic & Imaging Network",
      category: "diagnostic",
      city: "Hyderabad",
      state: "Telangana",
      pinCode: "500029",
      cityAliases: ["hyderabad", "hyd", "vijaya", "himayatnagar", "telangana"],
      locationId: "hyderabad",
      locationName: "Himayatnagar, Hyderabad",
      address: "Street No 19, Himayatnagar, Hyderabad, Telangana, 500029",
      distanceKm: 1.8,
      coordinates: { lat: 17.4019, lng: 78.4897 },
      phone: "+91 40 2342 0420",
      emergencyPhone: null,
      email: "info@vijayadiagnostic.com",
      website: "https://vijayadiagnostic.com",
      operatingHours: "Monday - Sunday: 7:00 AM - 9:00 PM",
      isOpenNow: true,
      rating: 4.7,
      reviewCount: 1100,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: false,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:15:00Z",
        verifiedBy: "Vijaya Diagnostic Portal Sync",
        sourceType: "FACILITY_PORTAL_SYNC"
      },
      services: [
        {
          serviceId: "xray",
          name: "X-ray (Digital)",
          status: "AVAILABLE",
          statusReason: "Digital X-ray suites functional with immediate radiologist reporting.",
          lastVerified: "2026-10-15T09:15:00Z",
          verifiedBy: "Lead Radiographer",
          sourceType: "FACILITY_PORTAL_SYNC",
          estimatedWaitHours: "15 - 20 minutes"
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "Automated laboratory assays running.",
          lastVerified: "2026-10-15T07:30:00Z",
          verifiedBy: "Quality In-Charge",
          sourceType: "FACILITY_PORTAL_SYNC"
        }
      ]
    },

    // =============================================================
    // PUNE (pune, pnq, sassoon road)
    // =============================================================
    {
      id: "fac-pune-ruby",
      name: "Ruby Hall Clinic, Sassoon Road",
      isDemoCoreFacility: false,
      type: "Multi-Speciality Tertiary Care Hospital",
      category: "hospital",
      city: "Pune",
      state: "Maharashtra",
      pinCode: "411001",
      cityAliases: ["pune", "pnq", "ruby hall", "sassoon road", "station", "maharashtra"],
      locationId: "pune",
      locationName: "Sassoon Road, Pune",
      address: "40 Sassoon Road, Near Pune Railway Station, Pune, Maharashtra, 411001",
      distanceKm: 1.2,
      coordinates: { lat: 18.5284, lng: 73.8743 },
      phone: "+91 20 6645 5100",
      emergencyPhone: "+91 20 6645 5200",
      email: "info@rubyhall.com",
      website: "https://rubyhall.com",
      operatingHours: "Open 24/7 (Emergency & Critical Care)",
      isOpenNow: true,
      rating: 4.7,
      reviewCount: 1850,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:00:00Z",
        verifiedBy: "Ruby Hall Clinic Portal Sync",
        sourceType: "FACILITY_PORTAL_SYNC"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Trauma and emergency department active 24/7.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Casualty In-Charge",
          sourceType: "FACILITY_PORTAL_SYNC"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "Digital X-ray operational around the clock.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "FACILITY_PORTAL_SYNC"
        },
        {
          serviceId: "cardiology",
          name: "Cardiology & ECG",
          status: "AVAILABLE",
          statusReason: "24/7 Cath lab and cardiac critical care.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Cardiac Unit",
          sourceType: "FACILITY_PORTAL_SYNC"
        }
      ]
    },
    {
      id: "fac-pune-jehangir",
      name: "Jehangir Hospital, Sassoon Road",
      isDemoCoreFacility: false,
      type: "Super Speciality Tertiary Care Hospital",
      category: "hospital",
      city: "Pune",
      state: "Maharashtra",
      pinCode: "411001",
      cityAliases: ["pune", "pnq", "jehangir", "sassoon road", "station", "maharashtra"],
      locationId: "pune",
      locationName: "Sassoon Road, Pune",
      address: "32 Sassoon Road, Opposite Pune Railway Station, Pune, Maharashtra, 411001",
      distanceKm: 1.1,
      coordinates: { lat: 18.5298, lng: 73.8732 },
      phone: "+91 20 6681 9999",
      emergencyPhone: "+91 20 6681 1100",
      email: "contact@jehangirhospital.com",
      website: "https://jehangirhospital.com",
      operatingHours: "Open 24/7 (Emergency & Advanced Critical Care)",
      isOpenNow: true,
      rating: 4.6,
      reviewCount: 1640,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:00:00Z",
        verifiedBy: "Hospital Administration via Verified Portal",
        sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Level 1 Trauma & 42 critical care beds operational.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Casualty In-Charge",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "Dual digital X-ray suites functional 24/7.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "mri",
          name: "MRI Scan (3.0 Tesla)",
          status: "AVAILABLE",
          statusReason: "3T MRI scanner active with dedicated emergency slots.",
          lastVerified: "2026-10-14T17:00:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "NABL-accredited diagnostic laboratory 24/7.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Chief Biochemist",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        }
      ]
    },
    {
      id: "fac-pune-kem",
      name: "K.E.M. Hospital Pune",
      isDemoCoreFacility: false,
      type: "Tertiary Teaching & Multi-Speciality Hospital",
      category: "hospital",
      city: "Pune",
      state: "Maharashtra",
      pinCode: "411011",
      cityAliases: ["pune", "pnq", "kem", "rasta peth", "sardar moodliar", "maharashtra"],
      locationId: "pune",
      locationName: "Rasta Peth, Pune",
      address: "489 Rasta Peth, Sardar Moodliar Road, Pune, Maharashtra, 411011",
      distanceKm: 1.2,
      coordinates: { lat: 18.5218, lng: 73.8679 },
      phone: "+91 20 6603 7300",
      emergencyPhone: "+91 20 6603 7333",
      email: "info@kemhospitalpune.org",
      website: "https://kemhospitalpune.org",
      operatingHours: "Open 24/7 (Emergency, Casualty & OPD)",
      isOpenNow: true,
      rating: 4.5,
      reviewCount: 1420,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: false,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T08:30:00Z",
        verifiedBy: "KEM Administration",
        sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Full emergency response unit & intensive care operational.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Casualty Medical Officer",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "Digital radiodiagnostic department operational.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "dialysis",
          name: "Dialysis Unit",
          status: "AVAILABLE",
          statusReason: "20-bed hemodialysis unit running 3 daily shifts.",
          lastVerified: "2026-10-14T19:00:00Z",
          verifiedBy: "Nephrology Dept",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        }
      ]
    },
    {
      id: "fac-pune-sassoon",
      name: "Sassoon General Hospital & B.J. Govt Medical College",
      isDemoCoreFacility: false,
      type: "Premier Government Multi-Speciality Hospital",
      category: "hospital",
      city: "Pune",
      state: "Maharashtra",
      pinCode: "411001",
      cityAliases: ["pune", "pnq", "sassoon", "bjmc", "station", "maharashtra"],
      locationId: "pune",
      locationName: "Station Road, Pune",
      address: "Jai Prakash Narayan Road, Near Pune Railway Station, Pune, Maharashtra, 411001",
      distanceKm: 0.8,
      coordinates: { lat: 18.5262, lng: 73.8715 },
      phone: "+91 20 2612 8000",
      emergencyPhone: "+91 20 2612 8001",
      email: "contact@bjgmcpune.org",
      website: "https://bjgmcpune.org",
      operatingHours: "Open 24/7 (Emergency & Trauma Centre)",
      isOpenNow: true,
      rating: 4.4,
      reviewCount: 2210,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:30:00Z",
        verifiedBy: "Dept of Medical Education & Research",
        sourceType: "GOVERNMENT_HEALTH_BULLETIN"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Government multi-speciality trauma centre with 60 ICU beds.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "Duty Medical Officer",
          sourceType: "GOVERNMENT_HEALTH_BULLETIN"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "High capacity digital X-ray active for trauma and OPD.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "GOVERNMENT_HEALTH_BULLETIN"
        },
        {
          serviceId: "ct_scan",
          name: "CT Scan (128 Slice)",
          status: "AVAILABLE",
          statusReason: "State-of-the-art CT scanner functional around the clock.",
          lastVerified: "2026-10-14T21:00:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "GOVERNMENT_HEALTH_BULLETIN"
        }
      ]
    },
    {
      id: "fac-pune-sahyadri",
      name: "Sahyadri Super Speciality Hospital, Deccan Gymkhana",
      isDemoCoreFacility: false,
      type: "Super Speciality Tertiary Hospital",
      category: "hospital",
      city: "Pune",
      state: "Maharashtra",
      pinCode: "411004",
      cityAliases: ["pune", "pnq", "sahyadri", "deccan", "karve road", "erandwane", "maharashtra"],
      locationId: "pune",
      locationName: "Deccan Gymkhana, Pune",
      address: "Plot No. 30-C, Karve Road, Deccan Gymkhana, Pune, Maharashtra, 411004",
      distanceKm: 3.2,
      coordinates: { lat: 18.5132, lng: 73.8378 },
      phone: "+91 20 6721 3000",
      emergencyPhone: "+91 20 6721 3100",
      email: "feedback@sahyadrihospitals.com",
      website: "https://sahyadrihospital.com",
      operatingHours: "Open 24/7 (Emergency & Critical Care)",
      isOpenNow: true,
      rating: 4.7,
      reviewCount: 1530,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:00:00Z",
        verifiedBy: "Hospital Administration via Verified Integration",
        sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Critical care & cardiac emergency response active 24/7.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "ER Duty In-Charge",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "cardiology",
          name: "Cardiology & ECG",
          status: "AVAILABLE",
          statusReason: "Dual catheterization laboratories active for emergency angioplasty.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Cardiac Unit",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "Digital X-ray fully operational.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
        }
      ]
    },
    {
      id: "fac-pune-deenanath",
      name: "Deenanath Mangeshkar Hospital & Research Center",
      isDemoCoreFacility: false,
      type: "Super Speciality Charitable Research Hospital",
      category: "hospital",
      city: "Pune",
      state: "Maharashtra",
      pinCode: "411004",
      cityAliases: ["pune", "pnq", "deenanath", "mangeshkar", "erandwane", "mhatre bridge", "maharashtra"],
      locationId: "pune",
      locationName: "Erandwane, Pune",
      address: "Near Mhatre Bridge, Vakil Nagar, Erandwane, Pune, Maharashtra, 411004",
      distanceKm: 4.1,
      coordinates: { lat: 18.5025, lng: 73.8340 },
      phone: "+91 20 4015 1000",
      emergencyPhone: "+91 20 4015 1100",
      email: "info@dmhospital.org",
      website: "https://dmhospital.org",
      operatingHours: "Open 24/7 (Emergency & Advanced Surgery)",
      isOpenNow: true,
      rating: 4.8,
      reviewCount: 2450,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T08:30:00Z",
        verifiedBy: "Hospital Information System API",
        sourceType: "AUTOMATED_API_SYNC"
      },
      services: [
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "100+ intensive care beds across surgical, medical, and pediatric ICU.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Duty Medical Officer",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "xray",
          name: "X-ray",
          status: "AVAILABLE",
          statusReason: "High-speed digital X-ray and fluoroscopy active 24/7.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Radiology Unit",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "Fully automated central diagnostic laboratory active.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Pathology Dept",
          sourceType: "AUTOMATED_API_SYNC"
        }
      ]
    },

    // =============================================================
    // CORE DEMONSTRATION FACILITIES (Central District Zone / Delhi)
    // =============================================================
    {
      id: "fac-citycare",
      name: "CityCare Hospital",
      isDemoCoreFacility: true,
      type: "Tertiary Care Hospital",
      category: "hospital",
      city: "Delhi",
      state: "Delhi NCR",
      pinCode: "110003",
      cityAliases: ["central", "central district", "delhi", "new delhi", "ncr", "demo"],
      locationId: "central",
      locationName: "Central District",
      address: "14 Health Avenue, Near Central Metro, Sector 3, Central District, 110003",
      distanceKm: 0.8,
      coordinates: { lat: 28.6152, lng: 77.2115 },
      phone: "+91 11 2345 6780",
      emergencyPhone: "+91 11 2345 6799",
      email: "helpdesk@citycare-demo.org",
      website: "https://citycare-demo.org",
      operatingHours: "Open 24/7 (Emergency & IPD); OPD: 8:00 AM - 6:00 PM",
      isOpenNow: true,
      rating: 4.2,
      reviewCount: 312,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: false
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T08:30:00Z",
        verifiedBy: "Radiology Desk via Direct Verification Call",
        sourceType: "DIRECT_HOSPITAL_COMMUNICATION"
      },
      services: [
        {
          serviceId: "xray",
          name: "X-ray",
          status: "UNAVAILABLE",
          statusReason: "Main digital X-ray machine undergoing tube recalibration and safety inspection until Oct 20, 2026.",
          lastVerified: "2026-10-15T08:30:00Z",
          verifiedBy: "Senior Radiographer - Dr. S. Rao",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION",
          estimatedWaitHours: null,
          operationalNotes: "Do not visit for X-rays. Redirecting patients to Sunrise Diagnostic Centre."
        },
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Level 1 Trauma unit fully functional with 8 active ICU beds.",
          lastVerified: "2026-10-15T08:00:00Z",
          verifiedBy: "ER Triage Officer",
          sourceType: "DIRECT_HOSPITAL_COMMUNICATION",
          operationalNotes: "24/7 emergency entrance on East Gate."
        },
        {
          serviceId: "mri",
          name: "MRI Scan (1.5 Tesla)",
          status: "AVAILABLE",
          statusReason: "MRI operational. Prior slot booking recommended.",
          lastVerified: "2026-10-14T17:00:00Z",
          verifiedBy: "Diagnostic Admin Desk",
          sourceType: "ADMIN_PORTAL",
          operationalNotes: "Prior fasting may be required for abdominal scans."
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Bio)",
          status: "AVAILABLE",
          statusReason: "Automated sample analyzer active.",
          lastVerified: "2026-10-15T07:45:00Z",
          verifiedBy: "Pathology Head",
          sourceType: "ADMIN_PORTAL",
          operationalNotes: "Reports generated within 3 hours online."
        },
        {
          serviceId: "ultrasound",
          name: "Ultrasound (USG)",
          status: "NOT_VERIFIED",
          statusReason: "Sonologist duty schedule for afternoon shift pending confirmation.",
          lastVerified: "2026-09-28T10:00:00Z",
          verifiedBy: "Historical Listing",
          sourceType: "UNVERIFIED_DIRECTORY_LISTING",
          operationalNotes: "Please call hospital desk to verify if sonologist is in clinic today."
        }
      ]
    },

    {
      id: "fac-sunrise",
      name: "Sunrise Diagnostic Centre",
      isDemoCoreFacility: true,
      type: "Comprehensive Diagnostic Lab",
      category: "diagnostic",
      city: "Delhi",
      state: "Delhi NCR",
      pinCode: "110003",
      cityAliases: ["central", "central district", "delhi", "new delhi", "ncr", "demo"],
      locationId: "central",
      locationName: "Central District",
      address: "88 Ring Road Square, Central District (Opposite Green Park)",
      distanceKm: 2.4,
      coordinates: { lat: 28.6210, lng: 77.2280 },
      phone: "+91 11 4567 8901",
      emergencyPhone: "+91 11 4567 8902",
      email: "info@sunrisediagnostic-demo.com",
      website: "https://sunrisediagnostic-demo.com",
      operatingHours: "Open Monday - Sunday: 7:00 AM - 9:00 PM",
      isOpenNow: true,
      rating: 4.7,
      reviewCount: 489,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: false,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:15:00Z",
        verifiedBy: "Duty Laboratory Director via Portal Sync",
        sourceType: "FACILITY_PORTAL_SYNC"
      },
      services: [
        {
          serviceId: "xray",
          name: "X-ray (High-Res Digital)",
          status: "AVAILABLE",
          statusReason: "Dual digital X-ray suites fully operational with 2 certified technicians on duty.",
          lastVerified: "2026-10-15T09:15:00Z",
          verifiedBy: "Lead Radiographer - K. Verma",
          sourceType: "FACILITY_PORTAL_SYNC",
          estimatedWaitHours: "15 - 25 minutes",
          operationalNotes: "Walk-in appointments accepted. Digital report + film provided within 45 mins."
        },
        {
          serviceId: "ultrasound",
          name: "Ultrasound (4D Color Doppler)",
          status: "AVAILABLE",
          statusReason: "Resident radiologist present on site.",
          lastVerified: "2026-10-15T09:00:00Z",
          verifiedBy: "Lab Manager",
          sourceType: "FACILITY_PORTAL_SYNC",
          operationalNotes: "Prior appointment recommended for targeted obstetric scans."
        },
        {
          serviceId: "blood_test",
          name: "Blood Test (CBC & Biochemistry)",
          status: "AVAILABLE",
          statusReason: "NABL accredited lab running automated Beckman Coulter assays.",
          lastVerified: "2026-10-15T07:30:00Z",
          verifiedBy: "Quality Incharge",
          sourceType: "FACILITY_PORTAL_SYNC",
          operationalNotes: "Fasting samples collected from 7:00 AM."
        },
        {
          serviceId: "ecg",
          name: "ECG & Cardiac Screening",
          status: "AVAILABLE",
          statusReason: "12-lead digital ECG available with immediate cardiology tele-reporting.",
          lastVerified: "2026-10-14T18:00:00Z",
          verifiedBy: "Duty Technologist",
          sourceType: "ADMIN_PORTAL",
          operationalNotes: "Immediate printout issued."
        }
      ]
    },

    {
      id: "fac-greenvalley",
      name: "Green Valley Clinic",
      isDemoCoreFacility: true,
      type: "Community Health Clinic",
      category: "clinic",
      city: "Delhi",
      state: "Delhi NCR",
      pinCode: "110003",
      cityAliases: ["central", "central district", "delhi", "new delhi", "ncr", "demo"],
      locationId: "central",
      locationName: "Central District",
      address: "21 Orchard Lane, Near Community Market, Central District",
      distanceKm: 3.5,
      coordinates: { lat: 28.6080, lng: 77.1950 },
      phone: "+91 11 3456 7890",
      emergencyPhone: null,
      email: "contact@greenvalley-demo.in",
      website: null,
      operatingHours: "Monday - Saturday: 9:00 AM - 1:00 PM, 5:00 PM - 8:30 PM (Sunday Closed)",
      isOpenNow: true,
      rating: 3.8,
      reviewCount: 94,
      accessibility: {
        wheelchairRamp: true,
        elevator: false,
        accessibleRestroom: false,
        brailleSignage: false,
        disabledParking: false,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-08-31T12:00:00Z",
        verifiedBy: "Old Directory Listing (Unconfirmed)",
        sourceType: "OUTDATED_DIRECTORY_LISTING"
      },
      services: [
        {
          serviceId: "xray",
          name: "X-ray (Basic Chest & Limbs)",
          status: "NOT_VERIFIED",
          statusReason: "Last verified 45 days ago. Technician contract renewal status unconfirmed.",
          lastVerified: "2026-08-31T12:00:00Z",
          verifiedBy: "Old Telephone Query",
          sourceType: "OUTDATED_DIRECTORY_LISTING",
          estimatedWaitHours: "Unknown",
          operationalNotes: "Caution: Do not travel without calling first. Availability cannot be guaranteed."
        },
        {
          serviceId: "consultation_gp",
          name: "General Physician Consultation",
          status: "AVAILABLE",
          statusReason: "Dr. A. Sharma on duty for morning and evening clinic.",
          lastVerified: "2026-10-14T11:00:00Z",
          verifiedBy: "Receptionist - Anita",
          sourceType: "COMMUNITY_VERIFICATION"
        }
      ]
    },

    {
      id: "fac-lifeline-pharmacy",
      name: "LifeLine 24/7 Pharmacy & Medical Store",
      isDemoCoreFacility: false,
      type: "24/7 Pharmacy & First Aid",
      category: "pharmacy",
      city: "Delhi",
      state: "Delhi NCR",
      pinCode: "110003",
      cityAliases: ["central", "central district", "delhi", "new delhi", "ncr", "demo"],
      locationId: "central",
      locationName: "Central District",
      address: "5 Civil Lines, Opposite Metro Gate 2, Central District",
      distanceKm: 1.1,
      coordinates: { lat: 28.6185, lng: 77.2140 },
      phone: "+91 11 2341 9900",
      emergencyPhone: "+91 11 2341 9901",
      email: "orders@lifelinepharmacy-demo.com",
      website: "https://lifelinepharmacy-demo.com",
      operatingHours: "Open 24 Hours, 7 Days a Week",
      isOpenNow: true,
      rating: 4.6,
      reviewCount: 380,
      accessibility: {
        wheelchairRamp: true,
        elevator: false,
        accessibleRestroom: false,
        brailleSignage: false,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T06:00:00Z",
        verifiedBy: "Store Manager - Ramesh K.",
        sourceType: "STORE_AUDIT"
      },
      services: [
        {
          serviceId: "pharmacy_247",
          name: "24/7 Pharmacy Dispensing",
          status: "AVAILABLE",
          statusReason: "Registered pharmacist present round the clock. Emergency medicines stocked.",
          lastVerified: "2026-10-15T06:00:00Z",
          verifiedBy: "Store Manager",
          sourceType: "STORE_AUDIT"
        }
      ]
    },

    {
      id: "fac-apex",
      name: "Apex Super-Speciality Hospital",
      isDemoCoreFacility: false,
      type: "Multi-Speciality Hospital",
      category: "hospital",
      city: "Delhi",
      state: "Delhi NCR",
      pinCode: "110007",
      cityAliases: ["north", "north district", "delhi", "new delhi", "ncr"],
      locationId: "north",
      locationName: "North District",
      address: "102 University Highway, North District, 110007",
      distanceKm: 5.2,
      coordinates: { lat: 28.6880, lng: 77.2180 },
      phone: "+91 11 8899 0011",
      emergencyPhone: "+91 11 8899 0099",
      email: "contact@apexhealth-demo.com",
      website: "https://apexhealth-demo.com",
      operatingHours: "Open 24/7 (Emergency & Critical Care)",
      isOpenNow: true,
      rating: 4.8,
      reviewCount: 750,
      accessibility: {
        wheelchairRamp: true,
        elevator: true,
        accessibleRestroom: true,
        brailleSignage: true,
        disabledParking: true,
        groundFloorServices: true
      },
      verificationSummary: {
        lastVerifiedOverall: "2026-10-15T09:30:00Z",
        verifiedBy: "Hospital Information System API",
        sourceType: "AUTOMATED_API_SYNC"
      },
      services: [
        {
          serviceId: "xray",
          name: "X-ray (3D Digital & Fluoroscopy)",
          status: "AVAILABLE",
          statusReason: "3 suites active in 24/7 emergency radiology block.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "HIS Automation",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "ct_scan",
          name: "CT Scan (128 Slice)",
          status: "AVAILABLE",
          statusReason: "High-speed scanner operational 24/7.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "HIS Automation",
          sourceType: "AUTOMATED_API_SYNC"
        },
        {
          serviceId: "emergency_icu",
          name: "24/7 Emergency & ICU",
          status: "AVAILABLE",
          statusReason: "Certified Level 1 Emergency response centre.",
          lastVerified: "2026-10-15T09:30:00Z",
          verifiedBy: "HIS Automation",
          sourceType: "AUTOMATED_API_SYNC"
        }
      ]
    }
,
    {
      "id": "fac-up-sgpgi-lko",
      "name": "Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGI)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Lucknow",
      "locationId": "lucknow",
      "locationName": "Raebareli Road, Lucknow",
      "state": "Uttar Pradesh",
      "district": "Lucknow",
      "address": "Raebareli Road, Haibat Mau Mawaiya, Lucknow, Uttar Pradesh 226014",
      "pinCode": "226014",
      "coordinates": {
            "lat": 26.7456,
            "lng": 80.9392
      },
      "cityAliases": [
            "lucknow",
            "lko",
            "up",
            "raebareli road",
            "uttar pradesh",
            "sgpgi",
            "pgi lucknow",
            "hazratganj",
            "gomti nagar",
            "alambagh",
            "indira nagar"
      ],
      "phone": "+91-522-2668004",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Inpatient | OPD: 08:30 - 16:30",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency & Apex Trauma ICU",
                  "status": "AVAILABLE",
                  "statusReason": "Apex Trauma Centre fully operational with dedicated ventilators.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "Direct Hospital Admin Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "MRI Scan (3.0 Tesla Advanced)",
                  "status": "AVAILABLE",
                  "statusReason": "Siemens 3T Prisma active in Department of Radiodiagnosis.",
                  "lastVerified": "2026-10-15T10:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "CT Scan (256-Slice Dual Energy)",
                  "status": "AVAILABLE",
                  "statusReason": "256 slice ultra-fast scanner operational round the clock.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "xray",
                  "name": "Digital X-ray & Fluoroscopy",
                  "status": "AVAILABLE",
                  "statusReason": "All digital radiography suites operational.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "Direct Hospital Admin Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Nephrology & Hemodialysis Unit",
                  "status": "AVAILABLE",
                  "statusReason": "32 dialysis stations active under Department of Nephrology.",
                  "lastVerified": "2026-10-15T08:00:00Z",
                  "verifiedBy": "Direct Hospital Admin Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "cardiology",
                  "name": "Cardiology & Cath Lab",
                  "status": "AVAILABLE",
                  "statusReason": "Primary PCI & emergency cardiac interventions operational 24/7.",
                  "lastVerified": "2026-10-15T08:00:00Z",
                  "verifiedBy": "Direct Hospital Admin Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            }
      ]
},
    {
      "id": "fac-up-kgmu-lko",
      "name": "King George's Medical University (KGMU)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Lucknow",
      "locationId": "lucknow",
      "locationName": "Chowk, Old Lucknow",
      "state": "Uttar Pradesh",
      "district": "Lucknow",
      "address": "Shah Mina Road, Chowk, Lucknow, Uttar Pradesh 226003",
      "pinCode": "226003",
      "coordinates": {
            "lat": 26.8687,
            "lng": 80.9168
      },
      "cityAliases": [
            "lucknow",
            "chowk",
            "kgmu",
            "george medical",
            "old lucknow",
            "hazratganj",
            "charbagh"
      ],
      "phone": "+91-522-2257450",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": false,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Trauma Surgery & ICU",
                  "status": "AVAILABLE",
                  "statusReason": "Trauma Centre triage active 24/7.",
                  "lastVerified": "2026-10-15T09:15:00Z",
                  "verifiedBy": "KGMU Emergency Desk",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "xray",
                  "name": "Emergency Digital X-ray",
                  "status": "AVAILABLE",
                  "statusReason": "Trauma center X-ray suite operational.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "mri",
                  "name": "MRI Scan (1.5 Tesla)",
                  "status": "UNAVAILABLE",
                  "statusReason": "Undergoing annual helium cooling servicing. Emergency cases redirected to SGPGI.",
                  "lastVerified": "2026-10-15T08:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "blood_test",
                  "name": "Central Clinical Pathology Lab",
                  "status": "AVAILABLE",
                  "statusReason": "Automated biochemistry and hematology operational 24/7.",
                  "lastVerified": "2026-10-15T08:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-up-bhu-varanasi",
      "name": "Sir Sunderlal Hospital, IMS-BHU",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Varanasi",
      "locationId": "varanasi",
      "locationName": "BHU Campus, Varanasi",
      "state": "Uttar Pradesh",
      "district": "Varanasi",
      "address": "Banaras Hindu University, Lanka, Varanasi, Uttar Pradesh 221005",
      "pinCode": "221005",
      "coordinates": {
            "lat": 25.2758,
            "lng": 82.9998
      },
      "cityAliases": [
            "varanasi",
            "banaras",
            "kashi",
            "bhu",
            "lanka",
            "purvanchal",
            "godowlia",
            "cantt"
      ],
      "phone": "+91-542-2369291",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Trauma Emergency Centre",
                  "status": "AVAILABLE",
                  "statusReason": "Major referral center for Eastern UP and Bihar border.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "Hospital Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "MRI Scan (1.5T / 3T)",
                  "status": "AVAILABLE",
                  "statusReason": "Operational for inpatient and emergency requisitions.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "Multislice CT Scanner",
                  "status": "AVAILABLE",
                  "statusReason": "Trauma CT running 24 hours.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Hemodialysis Unit",
                  "status": "AVAILABLE",
                  "statusReason": "Renal care active across all shifts.",
                  "lastVerified": "2026-10-15T08:00:00Z",
                  "verifiedBy": "Hospital Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            }
      ]
},
    {
      "id": "fac-up-regency-kanpur",
      "name": "Regency Hospital (Super Speciality)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Kanpur",
      "locationId": "kanpur",
      "locationName": "Sarvodaya Nagar, Kanpur",
      "state": "Uttar Pradesh",
      "district": "Kanpur Nagar",
      "address": "A-2, Sarvodaya Nagar, Kanpur, Uttar Pradesh 208005",
      "pinCode": "208005",
      "coordinates": {
            "lat": 26.4795,
            "lng": 80.312
      },
      "cityAliases": [
            "kanpur",
            "knp",
            "sarvodaya nagar",
            "swaroop nagar",
            "kakadeo",
            "civil lines",
            "gumti"
      ],
      "phone": "+91-512-3501111",
      "emergencyPhone": "+91-512-3501112",
      "operatingHours": "24/7 Emergency & ICU",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency & Critical Care",
                  "status": "AVAILABLE",
                  "statusReason": "Advanced Level 1 Critical Care Unit active.",
                  "lastVerified": "2026-10-15T10:15:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "mri",
                  "name": "Silent Scan MRI (3.0 Tesla)",
                  "status": "AVAILABLE",
                  "statusReason": "Active with neuro & musculoskeletal protocols.",
                  "lastVerified": "2026-10-15T09:45:00Z",
                  "verifiedBy": "Direct Hospital Admin Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "xray",
                  "name": "Digital X-ray",
                  "status": "AVAILABLE",
                  "statusReason": "24/7 digital imaging desk active.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "Direct Hospital Admin Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            }
      ]
},
    {
      "id": "fac-up-fortis-noida",
      "name": "Fortis Hospital Noida (Sector 62)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Noida",
      "locationId": "delhi",
      "locationName": "Sector 62, Noida",
      "state": "Uttar Pradesh",
      "district": "Gautam Buddha Nagar",
      "address": "B-22, Sector 62, Gautam Buddha Nagar, Noida, Uttar Pradesh 201301",
      "pinCode": "201301",
      "coordinates": {
            "lat": 28.6186,
            "lng": 77.3725
      },
      "cityAliases": [
            "noida",
            "greater noida",
            "sector 62",
            "sector 18",
            "noida expressway",
            "ghaziabad",
            "up ncr",
            "indradiapuram",
            "vaishali"
      ],
      "phone": "+91-120-4300222",
      "emergencyPhone": "105010",
      "operatingHours": "24/7 Emergency",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency & Cardiac ICU",
                  "status": "AVAILABLE",
                  "statusReason": "Emergency resuscitation and ICU beds active.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "HIS Automation",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "mri",
                  "name": "3T Wide Bore MRI",
                  "status": "AVAILABLE",
                  "statusReason": "Active 24/7 for acute stroke and trauma imaging.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "HIS Automation",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "Dual Source Flash CT",
                  "status": "AVAILABLE",
                  "statusReason": "Sub-second cardiac and full-body scans operational.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "HIS Automation",
                  "sourceType": "AUTOMATED_API_SYNC"
            }
      ]
},
    {
      "id": "fac-up-aiims-gorakhpur",
      "name": "AIIMS Gorakhpur (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Gorakhpur",
      "locationId": "gorakhpur",
      "locationName": "Kunraghat, Gorakhpur",
      "state": "Uttar Pradesh",
      "district": "Gorakhpur",
      "address": "Kunraghat, Gorakhpur, Uttar Pradesh 273008",
      "pinCode": "273008",
      "coordinates": {
            "lat": 26.7588,
            "lng": 83.4283
      },
      "cityAliases": [
            "gorakhpur",
            "gkp",
            "kunraghat",
            "eastern up",
            "basti",
            "deoria",
            "maharajganj"
      ],
      "phone": "+91-551-2205501",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & OPD",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency Medicine Unit",
                  "status": "AVAILABLE",
                  "statusReason": "Apex trauma and emergency department fully operational.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "AIIMS Gorakhpur Admin",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "128-Slice CT Scanner",
                  "status": "AVAILABLE",
                  "statusReason": "24/7 emergency imaging operational.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "pediatrics",
                  "name": "Pediatrics & NICU",
                  "status": "AVAILABLE",
                  "statusReason": "Dedicated encephalitis & pediatric intensive care beds available.",
                  "lastVerified": "2026-10-15T08:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-up-srn-prayagraj",
      "name": "Swaroop Rani Nehru (SRN) Hospital & MLN Medical College",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Prayagraj",
      "locationId": "prayagraj",
      "locationName": "Civil Lines, Prayagraj",
      "state": "Uttar Pradesh",
      "district": "Prayagraj",
      "address": "Mahatma Gandhi Marg, George Town, Prayagraj, Uttar Pradesh 211001",
      "pinCode": "211001",
      "coordinates": {
            "lat": 25.4526,
            "lng": 81.854
      },
      "cityAliases": [
            "prayagraj",
            "allahabad",
            "civil lines",
            "george town",
            "sangam",
            "mln",
            "srn"
      ],
      "phone": "+91-532-2256426",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": false,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency & Trauma Centre",
                  "status": "AVAILABLE",
                  "statusReason": "Central government emergency trauma ward functional.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "xray",
                  "name": "Emergency X-ray Suite",
                  "status": "AVAILABLE",
                  "statusReason": "Operational 24/7 in casualty ward.",
                  "lastVerified": "2026-10-15T08:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "blood_test",
                  "name": "Blood Bank & Clinical Pathology",
                  "status": "AVAILABLE",
                  "statusReason": "24-hour component blood bank active.",
                  "lastVerified": "2026-10-15T08:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-raj-sms-jaipur",
      "name": "Sawai Man Singh (SMS) Hospital & Medical College",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Jaipur",
      "locationId": "jaipur",
      "locationName": "JLN Marg, Jaipur",
      "state": "Rajasthan",
      "district": "Jaipur",
      "address": "Jawahar Lal Nehru Marg, Gangawal Park, Adarsh Nagar, Jaipur, Rajasthan 302004",
      "pinCode": "302004",
      "coordinates": {
            "lat": 26.8978,
            "lng": 75.8185
      },
      "cityAliases": [
            "jaipur",
            "raj",
            "rajasthan",
            "pink city",
            "jln marg",
            "c-scheme",
            "malviya nagar",
            "mansarovar",
            "vaishali nagar",
            "sms jaipur"
      ],
      "phone": "+91-141-2518244",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Inpatient",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Trauma Centre & Super Speciality ICU",
                  "status": "AVAILABLE",
                  "statusReason": "Apex Trauma Centre active round the clock with dedicated trauma surgical teams.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "Hospital Medical Superintendent Desk",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "MRI Scan (3.0 Tesla Silent MRI)",
                  "status": "AVAILABLE",
                  "statusReason": "High-resolution neuro & musculoskeletal imaging operational.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "128-Slice Cardiac CT Scan",
                  "status": "AVAILABLE",
                  "statusReason": "Trauma and elective CT suites running continuously.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Dialysis Centre (35 Beds)",
                  "status": "AVAILABLE",
                  "statusReason": "Subsidized and free dialysis services under Mukhya Mantri Ayushman Arogya Yojana.",
                  "lastVerified": "2026-10-15T08:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-raj-aiims-jodhpur",
      "name": "AIIMS Jodhpur (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Jodhpur",
      "locationId": "jodhpur",
      "locationName": "Basni, Jodhpur",
      "state": "Rajasthan",
      "district": "Jodhpur",
      "address": "Basni Industrial Area, Phase II, Jodhpur, Rajasthan 342005",
      "pinCode": "342005",
      "coordinates": {
            "lat": 26.2389,
            "lng": 73.0107
      },
      "cityAliases": [
            "jodhpur",
            "basni",
            "marwar",
            "western rajasthan",
            "aiims jodhpur",
            "pali",
            "nagaur"
      ],
      "phone": "+91-291-2740741",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Critical Care",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency Medicine & Trauma",
                  "status": "AVAILABLE",
                  "statusReason": "Tertiary referral trauma care unit fully functional.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "AIIMS Central Dashboard",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "mri",
                  "name": "3T Multi-transmit MRI",
                  "status": "AVAILABLE",
                  "statusReason": "Operational in Department of Diagnostic and Interventional Radiology.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "AIIMS Central Dashboard",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "cardiology",
                  "name": "Cardiology & Cath Lab",
                  "status": "AVAILABLE",
                  "statusReason": "Emergency angiogram and angioplasty available 24/7.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "AIIMS Central Dashboard",
                  "sourceType": "AUTOMATED_API_SYNC"
            }
      ]
},
    {
      "id": "fac-raj-geetanjali-udaipur",
      "name": "Geetanjali Hospital & Medical College",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Udaipur",
      "locationId": "udaipur",
      "locationName": "Hiran Magri, Udaipur",
      "state": "Rajasthan",
      "district": "Udaipur",
      "address": "Geetanjali Medicity, Hiran Magri Extension, Manwakhera, Udaipur, Rajasthan 313002",
      "pinCode": "313002",
      "coordinates": {
            "lat": 24.5683,
            "lng": 73.7438
      },
      "cityAliases": [
            "udaipur",
            "mewar",
            "hiran magri",
            "lake city",
            "sukhadia circle",
            "fateh sagar"
      ],
      "phone": "+91-294-2500000",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Multi-Speciality ICU",
                  "status": "AVAILABLE",
                  "statusReason": "Level 1 trauma and critical care team on duty.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "128-Slice Cardiac CT",
                  "status": "AVAILABLE",
                  "statusReason": "Active 24/7 for acute emergencies.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-guj-civil-ahmedabad",
      "name": "Ahmedabad Civil Hospital & BJMC",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Ahmedabad",
      "locationId": "ahmedabad",
      "locationName": "Asarwa, Ahmedabad",
      "state": "Gujarat",
      "district": "Ahmedabad",
      "address": "Near Haripura, Asarwa, Ahmedabad, Gujarat 380016",
      "pinCode": "380016",
      "coordinates": {
            "lat": 23.0525,
            "lng": 72.6026
      },
      "cityAliases": [
            "ahmedabad",
            "amdavad",
            "gujarat",
            "asarwa",
            "navrangpura",
            "bodakdev",
            "satellite",
            "maninagar",
            "sg highway",
            "vastrapur"
      ],
      "phone": "+91-79-22683721",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & 1200-Bed New Civil Block",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Trauma Center & Acute Care",
                  "status": "AVAILABLE",
                  "statusReason": "Asia's largest civil healthcare campus; trauma triage active 24/7.",
                  "lastVerified": "2026-10-15T10:30:00Z",
                  "verifiedBy": "Civil Hospital Emergency Desk",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "3.0T MRI Scan Suite",
                  "status": "AVAILABLE",
                  "statusReason": "Operating 24 hours for emergency and scheduled scans.",
                  "lastVerified": "2026-10-15T09:45:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Institute of Kidney Diseases (IKDRC) Dialysis",
                  "status": "AVAILABLE",
                  "statusReason": "Dedicated nephro and kidney transplantation unit operational.",
                  "lastVerified": "2026-10-15T09:15:00Z",
                  "verifiedBy": "Hospital Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            }
      ]
},
    {
      "id": "fac-guj-ssg-vadodara",
      "name": "Sir Sayajirao General Hospital (SSG Hospital)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Vadodara",
      "locationId": "vadodara",
      "locationName": "Sayajiganj, Vadodara",
      "state": "Gujarat",
      "district": "Vadodara",
      "address": "Jail Road, Anandpura, Sayajiganj, Vadodara, Gujarat 390001",
      "pinCode": "390001",
      "coordinates": {
            "lat": 22.3116,
            "lng": 73.1895
      },
      "cityAliases": [
            "vadodara",
            "baroda",
            "sayajiganj",
            "alkapuri",
            "gotri",
            "manjalpur"
      ],
      "phone": "+91-265-2424848",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": false,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Casualty & Critical Care",
                  "status": "AVAILABLE",
                  "statusReason": "Central Gujarat major government trauma centre active.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "xray",
                  "name": "Digital Radiography (X-ray)",
                  "status": "AVAILABLE",
                  "statusReason": "Round the clock casualty X-ray operational.",
                  "lastVerified": "2026-10-15T08:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-guj-civil-surat",
      "name": "New Civil Hospital Surat (NCHS)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Surat",
      "locationId": "surat",
      "locationName": "Majura Gate, Surat",
      "state": "Gujarat",
      "district": "Surat",
      "address": "Ring Road, Majura Gate, Surat, Gujarat 395001",
      "pinCode": "395001",
      "coordinates": {
            "lat": 21.1764,
            "lng": 72.8228
      },
      "cityAliases": [
            "surat",
            "south gujarat",
            "majura gate",
            "athwa",
            "adajan",
            "varachha",
            "vesu"
      ],
      "phone": "+91-261-2244175",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": false,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Trauma Emergency",
                  "status": "AVAILABLE",
                  "statusReason": "Surat city apex civil emergency department active.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "128-Slice CT Scan",
                  "status": "AVAILABLE",
                  "statusReason": "Active 24/7 for acute head injury & polytrauma.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-wb-sskm-kolkata",
      "name": "IPGMER and SSKM Hospital",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Kolkata",
      "locationId": "kolkata",
      "locationName": "Bhowanipore, Kolkata",
      "state": "West Bengal",
      "district": "Kolkata",
      "address": "244, AJC Bose Road, Bhowanipore, Kolkata, West Bengal 700020",
      "pinCode": "700020",
      "coordinates": {
            "lat": 22.5393,
            "lng": 88.3426
      },
      "cityAliases": [
            "kolkata",
            "calcutta",
            "wb",
            "west bengal",
            "sskm",
            "ipgmer",
            "bhowanipore",
            "park street",
            "salt lake",
            "howrah",
            "tollygunge",
            "alipore",
            "esplanade",
            "dum dum"
      ],
      "phone": "+91-33-22231589",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma Center",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Super Speciality Emergency & Trauma",
                  "status": "AVAILABLE",
                  "statusReason": "Premier state referral hospital trauma triage operating at full capacity.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "West Bengal Health Portal",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "MRI Scan (3.0T High Definition)",
                  "status": "AVAILABLE",
                  "statusReason": "Emergency stroke and neuro requisitions running 24 hours.",
                  "lastVerified": "2026-10-15T10:15:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Hemodialysis Unit",
                  "status": "AVAILABLE",
                  "statusReason": "24 dialysis units operational under Swasthya Sathi.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "cardiology",
                  "name": "Cardiology & 24/7 Cath Lab",
                  "status": "AVAILABLE",
                  "statusReason": "Emergency angioplasty team on duty.",
                  "lastVerified": "2026-10-15T08:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-wb-amri-saltlake",
      "name": "Manipal / AMRI Hospital (Salt Lake)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Kolkata",
      "locationId": "kolkata",
      "locationName": "Salt Lake Sector III, Kolkata",
      "state": "West Bengal",
      "district": "North 24 Parganas",
      "address": "JC-16 & 17, Sector III, Bidhannagar, Kolkata, West Bengal 700098",
      "pinCode": "700098",
      "coordinates": {
            "lat": 22.5697,
            "lng": 88.4067
      },
      "cityAliases": [
            "salt lake",
            "bidhannagar",
            "sector 3",
            "sector 5",
            "new town",
            "rajarhat",
            "kolkata"
      ],
      "phone": "+91-33-66063800",
      "emergencyPhone": "+91-33-66063801",
      "operatingHours": "24/7 Emergency & ICU",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Critical Care & Trauma",
                  "status": "AVAILABLE",
                  "statusReason": "Comprehensive multi-bed emergency resuscitation suite.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "128-Slice Cardiac CT",
                  "status": "AVAILABLE",
                  "statusReason": "Operational 24/7.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-wb-nbmc-siliguri",
      "name": "North Bengal Medical College & Hospital (NBMCH)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Siliguri",
      "locationId": "siliguri",
      "locationName": "Sushrutanagar, Siliguri",
      "state": "West Bengal",
      "district": "Darjeeling",
      "address": "Sushrutanagar, Siliguri, Darjeeling District, West Bengal 734012",
      "pinCode": "734012",
      "coordinates": {
            "lat": 26.6974,
            "lng": 88.3755
      },
      "cityAliases": [
            "siliguri",
            "darjeeling",
            "north bengal",
            "jalpaiguri",
            "nbmch",
            "sushrutanagar",
            "cooch behar"
      ],
      "phone": "+91-353-2585478",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": false,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency Trauma Unit",
                  "status": "AVAILABLE",
                  "statusReason": "Major referral tertiary center for North Bengal and Sikkim border.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "64-Slice CT Scan",
                  "status": "AVAILABLE",
                  "statusReason": "Trauma CT running 24/7.",
                  "lastVerified": "2026-10-15T09:15:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-mah-tata-memorial",
      "name": "Tata Memorial Centre & Hospital",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Mumbai",
      "locationId": "mumbai",
      "locationName": "Parel, Mumbai",
      "state": "Maharashtra",
      "district": "Mumbai City",
      "address": "Dr. E Borges Road, Parel, Mumbai, Maharashtra 400012",
      "pinCode": "400012",
      "coordinates": {
            "lat": 19.0048,
            "lng": 72.8431
      },
      "cityAliases": [
            "mumbai",
            "parel",
            "dadar",
            "tata memorial",
            "tmc",
            "worli",
            "lower parel"
      ],
      "phone": "+91-22-24177000",
      "emergencyPhone": "+91-22-24177001",
      "operatingHours": "24/7 Emergency & Acute Oncology Care",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency & Acute ICU",
                  "status": "AVAILABLE",
                  "statusReason": "Specialized oncology emergency and critical care fully staffed.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "Tata Memorial Central Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "3.0 Tesla Advanced MRI",
                  "status": "AVAILABLE",
                  "statusReason": "Advanced imaging suite operational for diagnostics.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "PET-CT & 256-Slice CT",
                  "status": "AVAILABLE",
                  "statusReason": "Diagnostic scans operational round the clock.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-mah-aiims-nagpur",
      "name": "AIIMS Nagpur (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Nagpur",
      "locationId": "nagpur",
      "locationName": "MIHAN, Nagpur",
      "state": "Maharashtra",
      "district": "Nagpur",
      "address": "Plot No. 2, Sector 20, MIHAN, Nagpur, Maharashtra 441108",
      "pinCode": "441108",
      "coordinates": {
            "lat": 21.0422,
            "lng": 79.0274
      },
      "cityAliases": [
            "nagpur",
            "vidarbha",
            "mihan",
            "wardha road",
            "dharampeth",
            "sitabuldi",
            "aiims nagpur"
      ],
      "phone": "+91-712-2821000",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Trauma Centre & ICU",
                  "status": "AVAILABLE",
                  "statusReason": "Apex trauma centre for Vidarbha region operational.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "AIIMS Nagpur Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "3T Wide Bore MRI",
                  "status": "AVAILABLE",
                  "statusReason": "Operational in Radiodiagnosis Department.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "AIIMS Nagpur Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            }
      ]
},
    {
      "id": "fac-mp-aiims-bhopal",
      "name": "AIIMS Bhopal (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Bhopal",
      "locationId": "bhopal",
      "locationName": "Saket Nagar, Bhopal",
      "state": "Madhya Pradesh",
      "district": "Bhopal",
      "address": "Saket Nagar, AIIMS Campus, Habibganj, Bhopal, Madhya Pradesh 462020",
      "pinCode": "462020",
      "coordinates": {
            "lat": 23.2064,
            "lng": 77.4583
      },
      "cityAliases": [
            "bhopal",
            "mp",
            "madhya pradesh",
            "saket nagar",
            "habibganj",
            "rani kamlapati",
            "kolar",
            "mp nagar"
      ],
      "phone": "+91-755-2672317",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Apex Trauma",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency Medicine & Trauma",
                  "status": "AVAILABLE",
                  "statusReason": "Comprehensive Level 1 trauma and resuscitation units active.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "AIIMS Bhopal Portal",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "mri",
                  "name": "3.0 Tesla Silent MRI",
                  "status": "AVAILABLE",
                  "statusReason": "Active 24/7 for acute trauma and stroke imaging.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Hemodialysis Centre",
                  "status": "AVAILABLE",
                  "statusReason": "20 beds operational with strict infection control.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-mp-my-indore",
      "name": "Maharaja Yeshwantrao Hospital (MY Hospital)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Indore",
      "locationId": "indore",
      "locationName": "Sanyogitaganj, Indore",
      "state": "Madhya Pradesh",
      "district": "Indore",
      "address": "MY Hospital Road, Sanyogitaganj, Indore, Madhya Pradesh 452001",
      "pinCode": "452001",
      "coordinates": {
            "lat": 22.7161,
            "lng": 75.8776
      },
      "cityAliases": [
            "indore",
            "malwa",
            "sanyogitaganj",
            "palasia",
            "vijay nagar",
            "chappan",
            "bhawarkua"
      ],
      "phone": "+91-731-2527383",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": false,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency & Trauma Centre",
                  "status": "AVAILABLE",
                  "statusReason": "Largest government tertiary referral hospital in central India.",
                  "lastVerified": "2026-10-15T09:15:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "CT Scan Unit",
                  "status": "AVAILABLE",
                  "statusReason": "Emergency casualty CT unit operational.",
                  "lastVerified": "2026-10-15T08:45:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-bih-aiims-patna",
      "name": "AIIMS Patna (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Patna",
      "locationId": "patna",
      "locationName": "Phulwari Sharif, Patna",
      "state": "Bihar",
      "district": "Patna",
      "address": "Aurangabad Road, Phulwari Sharif, Patna, Bihar 801507",
      "pinCode": "801507",
      "coordinates": {
            "lat": 25.5606,
            "lng": 85.0444
      },
      "cityAliases": [
            "patna",
            "bihar",
            "phulwari sharif",
            "danapur",
            "kankarbagh",
            "bailey road",
            "boring road",
            "patliputra"
      ],
      "phone": "+91-612-2451070",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma Center",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Trauma Emergency & Critical Care",
                  "status": "AVAILABLE",
                  "statusReason": "Apex trauma centre operational with advanced disaster triage.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "AIIMS Patna Central Portal",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "mri",
                  "name": "3T High Precision MRI",
                  "status": "AVAILABLE",
                  "statusReason": "Active in Department of Radiodiagnosis.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Hemodialysis Centre",
                  "status": "AVAILABLE",
                  "statusReason": "Continuous renal replacement therapy & hemodialysis active.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-bih-pmch-patna",
      "name": "Patna Medical College and Hospital (PMCH)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Patna",
      "locationId": "patna",
      "locationName": "Ashok Rajpath, Patna",
      "state": "Bihar",
      "district": "Patna",
      "address": "Ashok Rajpath, Muradpur, Patna, Bihar 800004",
      "pinCode": "800004",
      "coordinates": {
            "lat": 25.6207,
            "lng": 85.1601
      },
      "cityAliases": [
            "pmch",
            "ashok rajpath",
            "muradpur",
            "gandhi maidan",
            "patna"
      ],
      "phone": "+91-612-2300080",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": false,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency & Casualty",
                  "status": "AVAILABLE",
                  "statusReason": "Historic high-volume trauma centre active round the clock.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "xray",
                  "name": "Emergency X-ray Unit",
                  "status": "AVAILABLE",
                  "statusReason": "Casualty radiology running 24 hours.",
                  "lastVerified": "2026-10-15T08:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-jhk-rims-ranchi",
      "name": "Rajendra Institute of Medical Sciences (RIMS)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Ranchi",
      "locationId": "ranchi",
      "locationName": "Bariatu, Ranchi",
      "state": "Jharkhand",
      "district": "Ranchi",
      "address": "Bariatu Road, Ranchi, Jharkhand 834009",
      "pinCode": "834009",
      "coordinates": {
            "lat": 23.3855,
            "lng": 85.3562
      },
      "cityAliases": [
            "ranchi",
            "jharkhand",
            "bariatu",
            "doranda",
            "harmu",
            "kanke",
            "rims"
      ],
      "phone": "+91-651-2541533",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma Centre",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency Trauma Unit",
                  "status": "AVAILABLE",
                  "statusReason": "Apex referral centre for Jharkhand state operational.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "RIMS Official Desk",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "1.5 Tesla MRI",
                  "status": "AVAILABLE",
                  "statusReason": "Operational for emergency and routine requisitions.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Dialysis Centre",
                  "status": "AVAILABLE",
                  "statusReason": "Operational under Mukhyamantri Gambhir Bimari Yojana.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-jhk-tmh-jamshedpur",
      "name": "Tata Main Hospital (TMH)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Jamshedpur",
      "locationId": "jamshedpur",
      "locationName": "Bistupur, Jamshedpur",
      "state": "Jharkhand",
      "district": "East Singhbhum",
      "address": "C Road, Northern Town, Bistupur, Jamshedpur, Jharkhand 831001",
      "pinCode": "831001",
      "coordinates": {
            "lat": 22.8028,
            "lng": 86.1854
      },
      "cityAliases": [
            "jamshedpur",
            "tatanagar",
            "bistupur",
            "sakchi",
            "kadma",
            "sonari",
            "telco"
      ],
      "phone": "+91-657-6641000",
      "emergencyPhone": "+91-657-6644444",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Critical Care & Emergency",
                  "status": "AVAILABLE",
                  "statusReason": "NABH-accredited modern emergency department operational.",
                  "lastVerified": "2026-10-15T10:30:00Z",
                  "verifiedBy": "Direct Hospital Admin Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "Dual Energy 128-Slice CT",
                  "status": "AVAILABLE",
                  "statusReason": "Trauma and cardiac protocols running 24/7.",
                  "lastVerified": "2026-10-15T09:45:00Z",
                  "verifiedBy": "Direct Hospital Admin Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            }
      ]
},
    {
      "id": "fac-odi-aiims-bhubaneswar",
      "name": "AIIMS Bhubaneswar (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Bhubaneswar",
      "locationId": "bhubaneswar",
      "locationName": "Sijua, Patrapada, Bhubaneswar",
      "state": "Odisha",
      "district": "Khordha",
      "address": "Sijua, Patrapada, Bhubaneswar, Odisha 751019",
      "pinCode": "751019",
      "coordinates": {
            "lat": 20.2289,
            "lng": 85.7766
      },
      "cityAliases": [
            "bhubaneswar",
            "bbsr",
            "odisha",
            "patrapada",
            "khandagiri",
            "nayapalli",
            "jaydev vihar",
            "saheed nagar"
      ],
      "phone": "+91-674-2476789",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Super Speciality",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency Trauma & Critical Care",
                  "status": "AVAILABLE",
                  "statusReason": "Premier regional trauma triage center active 24/7.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "AIIMS Bhubaneswar Portal",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "mri",
                  "name": "3T MRI Scan Suite",
                  "status": "AVAILABLE",
                  "statusReason": "Operating 24 hours in Radiodiagnosis.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "cardiology",
                  "name": "Cardiology & Cath Lab",
                  "status": "AVAILABLE",
                  "statusReason": "24/7 STEMI emergency angioplasty team ready.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-odi-scb-cuttack",
      "name": "SCB Medical College & Hospital",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Cuttack",
      "locationId": "cuttack",
      "locationName": "Manglabag, Cuttack",
      "state": "Odisha",
      "district": "Cuttack",
      "address": "Professor Para, Manglabag, Cuttack, Odisha 753007",
      "pinCode": "753007",
      "coordinates": {
            "lat": 20.4682,
            "lng": 85.8887
      },
      "cityAliases": [
            "cuttack",
            "manglabag",
            "badambadi",
            "scb",
            "silver city"
      ],
      "phone": "+91-671-2414080",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": false,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Casualty & Acute Trauma",
                  "status": "AVAILABLE",
                  "statusReason": "Odisha state apex emergency ward operating 24 hours.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Dialysis Unit (20 Machines)",
                  "status": "AVAILABLE",
                  "statusReason": "BSKY scheme dialysis services running across all shifts.",
                  "lastVerified": "2026-10-15T08:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-pun-dmch-ludhiana",
      "name": "Dayanand Medical College & Hospital (DMCH)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Ludhiana",
      "locationId": "ludhiana",
      "locationName": "Civil Lines, Ludhiana",
      "state": "Punjab",
      "district": "Ludhiana",
      "address": "Tagore Nagar, Civil Lines, Ludhiana, Punjab 141001",
      "pinCode": "141001",
      "coordinates": {
            "lat": 30.901,
            "lng": 75.8368
      },
      "cityAliases": [
            "ludhiana",
            "ldh",
            "punjab",
            "civil lines",
            "model town",
            "sarabha nagar",
            "ferozepur road"
      ],
      "phone": "+91-161-4687700",
      "emergencyPhone": "+91-161-4688888",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Hero DMC Heart Institute & Trauma ICU",
                  "status": "AVAILABLE",
                  "statusReason": "North India's premier cardiac and polytrauma facility.",
                  "lastVerified": "2026-10-15T10:30:00Z",
                  "verifiedBy": "DMCH Admin Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "3T Wide Bore MRI",
                  "status": "AVAILABLE",
                  "statusReason": "Operational round the clock for emergencies.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Renal Dialysis Unit",
                  "status": "AVAILABLE",
                  "statusReason": "28 dialysis stations active.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-pun-gmc-amritsar",
      "name": "Guru Nanak Dev Hospital / Govt Medical College",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Amritsar",
      "locationId": "amritsar",
      "locationName": "Majitha Road, Amritsar",
      "state": "Punjab",
      "district": "Amritsar",
      "address": "Majitha Road, Circular Road, Amritsar, Punjab 143001",
      "pinCode": "143001",
      "coordinates": {
            "lat": 31.6508,
            "lng": 74.8765
      },
      "cityAliases": [
            "amritsar",
            "asr",
            "golden temple",
            "majitha road",
            "ranjit avenue",
            "lawrence road"
      ],
      "phone": "+91-183-2571210",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": false,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency Casualty",
                  "status": "AVAILABLE",
                  "statusReason": "Major border area trauma and casualty unit operating 24 hours.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "CT Scan",
                  "status": "AVAILABLE",
                  "statusReason": "Emergency CT operational.",
                  "lastVerified": "2026-10-15T08:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-har-medanta-gurugram",
      "name": "Medanta - The Medicity",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Gurugram",
      "locationId": "delhi",
      "locationName": "Sector 38, Gurugram",
      "state": "Haryana",
      "district": "Gurugram",
      "address": "CH Bakhtawar Singh Road, Near Subhash Chowk, Sector 38, Gurugram, Haryana 122001",
      "pinCode": "122001",
      "coordinates": {
            "lat": 28.4394,
            "lng": 77.0427
      },
      "cityAliases": [
            "gurugram",
            "gurgaon",
            "ggn",
            "sector 38",
            "subhash chowk",
            "sohna road",
            "cyber city",
            "golf course road",
            "delhi ncr"
      ],
      "phone": "+91-124-4141414",
      "emergencyPhone": "1068",
      "operatingHours": "24/7 Emergency & Inpatient (1250 Beds)",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Flying Doctors & Emergency ICU",
                  "status": "AVAILABLE",
                  "statusReason": "Air ambulance & super-speciality critical care active 24/7.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "Medanta HIS Telemetry",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "mri",
                  "name": "BrainSuite 3T Intra-operative MRI",
                  "status": "AVAILABLE",
                  "statusReason": "Full neuro and vascular capabilities functional.",
                  "lastVerified": "2026-10-15T10:30:00Z",
                  "verifiedBy": "Medanta HIS Telemetry",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "Dual Source 256-Slice CT",
                  "status": "AVAILABLE",
                  "statusReason": "Instantaneous cardiac evaluation scanner operational.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "Medanta HIS Telemetry",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Renal Transplant & Hemodialysis Unit",
                  "status": "AVAILABLE",
                  "statusReason": "40 station advanced dialysis suite active.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "Medanta HIS Telemetry",
                  "sourceType": "AUTOMATED_API_SYNC"
            }
      ]
},
    {
      "id": "fac-hp-igmc-shimla",
      "name": "Indira Gandhi Medical College & Hospital (IGMC)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Shimla",
      "locationId": "shimla",
      "locationName": "Ridge / Lakkar Bazaar, Shimla",
      "state": "Himachal Pradesh",
      "district": "Shimla",
      "address": "Circular Road, Lakkar Bazaar, Shimla, Himachal Pradesh 171001",
      "pinCode": "171001",
      "coordinates": {
            "lat": 31.1077,
            "lng": 77.1812
      },
      "cityAliases": [
            "shimla",
            "hp",
            "himachal",
            "lakkar bazaar",
            "mall road",
            "sanjauli",
            "chotta shimla",
            "kullu",
            "manali",
            "solan"
      ],
      "phone": "+91-177-2804251",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Hill Region Apex Trauma ICU",
                  "status": "AVAILABLE",
                  "statusReason": "State apex emergency and trauma referral center operational 24/7.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "IGMC Emergency Admin",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "128-Slice Multi-detector CT",
                  "status": "AVAILABLE",
                  "statusReason": "Emergency head injury and trauma scans active.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Hemodialysis Unit",
                  "status": "AVAILABLE",
                  "statusReason": "15 dialysis stations operational under Himcare.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-utk-aiims-rishikesh",
      "name": "AIIMS Rishikesh (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Rishikesh",
      "locationId": "rishikesh",
      "locationName": "Veerbhadra Road, Rishikesh",
      "state": "Uttarakhand",
      "district": "Dehradun",
      "address": "Virbhadra Road, AIIMS Campus, Rishikesh, Uttarakhand 249203",
      "pinCode": "249203",
      "coordinates": {
            "lat": 30.0758,
            "lng": 78.2882
      },
      "cityAliases": [
            "rishikesh",
            "dehradun",
            "haridwar",
            "uttarakhand",
            "garhwal",
            "veerbhadra",
            "roorkee",
            "tehri",
            "char dham"
      ],
      "phone": "+91-135-2462929",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Helipad Heli-Ambulance",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Heli-Rescue Emergency & Trauma",
                  "status": "AVAILABLE",
                  "statusReason": "Aviation-linked disaster and high-altitude emergency trauma ready.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "AIIMS Rishikesh Portal",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "mri",
                  "name": "3T Advanced Digital MRI",
                  "status": "AVAILABLE",
                  "statusReason": "Operational for spine, neuro & emergency scans.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "AIIMS Rishikesh Portal",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "cardiology",
                  "name": "Cardiology & Cath Lab",
                  "status": "AVAILABLE",
                  "statusReason": "24/7 emergency interventional cardiology team ready.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "AIIMS Rishikesh Portal",
                  "sourceType": "AUTOMATED_API_SYNC"
            }
      ]
},
    {
      "id": "fac-jk-skims-srinagar",
      "name": "Sher-i-Kashmir Institute of Medical Sciences (SKIMS)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Srinagar",
      "locationId": "srinagar",
      "locationName": "Soura, Srinagar",
      "state": "Jammu & Kashmir",
      "district": "Srinagar",
      "address": "Soura, Srinagar, Jammu & Kashmir 190011",
      "pinCode": "190011",
      "coordinates": {
            "lat": 34.1378,
            "lng": 74.8052
      },
      "cityAliases": [
            "srinagar",
            "jk",
            "kashmir",
            "soura",
            "lal chowk",
            "anantnag",
            "baramulla",
            "dal lake",
            "budgam",
            "skims"
      ],
      "phone": "+91-194-2401013",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Tertiary Care",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency Medicine & Trauma Centre",
                  "status": "AVAILABLE",
                  "statusReason": "Kashmir valley's apex tertiary emergency referral institute.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "SKIMS Central Portal",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "3.0T High Field MRI",
                  "status": "AVAILABLE",
                  "statusReason": "24/7 active in Department of Radiodiagnosis.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Nephrology Dialysis Unit",
                  "status": "AVAILABLE",
                  "statusReason": "25 dialysis units operational round the clock.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-jk-gmc-jammu",
      "name": "Govt Medical College & Associated Hospital (GMC Jammu)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Jammu",
      "locationId": "jammu",
      "locationName": "Bakshi Nagar, Jammu",
      "state": "Jammu & Kashmir",
      "district": "Jammu",
      "address": "Bakshi Nagar, Jammu, Jammu & Kashmir 180001",
      "pinCode": "180001",
      "coordinates": {
            "lat": 32.741,
            "lng": 74.8488
      },
      "cityAliases": [
            "jammu",
            "bakshi nagar",
            "gandhi nagar",
            "katra",
            "udhampur",
            "samba",
            "vaishno devi"
      ],
      "phone": "+91-191-2584247",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": false,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency & Super Speciality Trauma",
                  "status": "AVAILABLE",
                  "statusReason": "Jammu province central casualty ward operational.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "128-Slice CT Scan",
                  "status": "AVAILABLE",
                  "statusReason": "Emergency trauma CT operational.",
                  "lastVerified": "2026-10-15T08:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-asm-gmch-guwahati",
      "name": "Gauhati Medical College and Hospital (GMCH)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Guwahati",
      "locationId": "guwahati",
      "locationName": "Bhangagarh, Guwahati",
      "state": "Assam",
      "district": "Kamrup Metropolitan",
      "address": "Narakasur Hilltop, Bhangagarh, Guwahati, Assam 781032",
      "pinCode": "781032",
      "coordinates": {
            "lat": 26.1584,
            "lng": 91.7709
      },
      "cityAliases": [
            "guwahati",
            "gauhati",
            "assam",
            "northeast",
            "bhangagarh",
            "dispur",
            "paltan bazaar",
            "jalukbari",
            "kamrup"
      ],
      "phone": "+91-361-2130234",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Super Speciality",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency & Trauma Center",
                  "status": "AVAILABLE",
                  "statusReason": "Northeast India's apex government emergency & referral hospital.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "Assam Health Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "3.0 Tesla Silent MRI",
                  "status": "AVAILABLE",
                  "statusReason": "24-hour imaging suite functional.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "128-Slice Dual Energy CT",
                  "status": "AVAILABLE",
                  "statusReason": "Emergency neuro & trauma CT operational.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Pradhan Mantri National Dialysis Unit",
                  "status": "AVAILABLE",
                  "statusReason": "25 dialysis beds operational.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-meg-neigrihms-shillong",
      "name": "NEIGRIHMS (North Eastern Indira Gandhi Regional Institute)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Shillong",
      "locationId": "shillong",
      "locationName": "Mawdiangdiang, Shillong",
      "state": "Meghalaya",
      "district": "East Khasi Hills",
      "address": "Mawdiangdiang, Shillong, Meghalaya 793018",
      "pinCode": "793018",
      "coordinates": {
            "lat": 25.5941,
            "lng": 91.9367
      },
      "cityAliases": [
            "shillong",
            "meghalaya",
            "mawdiangdiang",
            "police bazar",
            "cherrapunji",
            "khasi hills",
            "neigrihms"
      ],
      "phone": "+91-364-2538025",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Critical Care",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency Medicine & Trauma ICU",
                  "status": "AVAILABLE",
                  "statusReason": "Autonomous regional institute trauma center ready 24/7.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "NEIGRIHMS Admin Portal",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "cardiology",
                  "name": "Interventional Cardiology & Cath Lab",
                  "status": "AVAILABLE",
                  "statusReason": "Cardiac emergency interventions operational.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-mnp-rims-imphal",
      "name": "Regional Institute of Medical Sciences (RIMS Imphal)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Imphal",
      "locationId": "imphal",
      "locationName": "Lamphelpat, Imphal",
      "state": "Manipur",
      "district": "Imphal West",
      "address": "Lamphelpat, Imphal, Manipur 795004",
      "pinCode": "795004",
      "coordinates": {
            "lat": 24.8197,
            "lng": 93.9238
      },
      "cityAliases": [
            "imphal",
            "manipur",
            "lamphelpat",
            "thangal bazar",
            "rims imphal"
      ],
      "phone": "+91-385-2414629",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": false,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency & Casualty",
                  "status": "AVAILABLE",
                  "statusReason": "Major multi-state referral institute trauma services functional.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Dialysis Unit",
                  "status": "AVAILABLE",
                  "statusReason": "Operational across morning and evening shifts.",
                  "lastVerified": "2026-10-15T08:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-ker-gmc-tvm",
      "name": "Govt Medical College Hospital (Trivandrum Medical College)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Thiruvananthapuram",
      "locationId": "trivandrum",
      "locationName": "Medical College PO, Thiruvananthapuram",
      "state": "Kerala",
      "district": "Thiruvananthapuram",
      "address": "Medical College Junction, Thiruvananthapuram, Kerala 695011",
      "pinCode": "695011",
      "coordinates": {
            "lat": 8.5241,
            "lng": 76.9288
      },
      "cityAliases": [
            "thiruvananthapuram",
            "trivandrum",
            "tvm",
            "kerala",
            "pattom",
            "palayam",
            "kowdiar",
            "kollam"
      ],
      "phone": "+91-471-2528300",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Level 1 Trauma Care Centre",
                  "status": "AVAILABLE",
                  "statusReason": "Apex emergency department operating round the clock.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "Kerala Health Portal",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "3T Silent MRI",
                  "status": "AVAILABLE",
                  "statusReason": "Emergency neuro imaging operational.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Hemodialysis Unit",
                  "status": "AVAILABLE",
                  "statusReason": "30 dialysis machines active under KASP scheme.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-ker-aster-kochi",
      "name": "Aster Medcity Kochi",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Kochi",
      "locationId": "kochi",
      "locationName": "Cheranalloor, Kochi",
      "state": "Kerala",
      "district": "Ernakulam",
      "address": "Kuttisahib Road, South Chittoor, Cheranalloor, Kochi, Kerala 682027",
      "pinCode": "682027",
      "coordinates": {
            "lat": 10.0528,
            "lng": 76.2731
      },
      "cityAliases": [
            "kochi",
            "cochin",
            "ernakulam",
            "cheranalloor",
            "edappally",
            "kakkanad",
            "marine drive",
            "aluva"
      ],
      "phone": "+91-484-6699999",
      "emergencyPhone": "+91-484-6699000",
      "operatingHours": "24/7 Emergency & Inpatient (670 Beds)",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Quaternary Care Emergency ICU",
                  "status": "AVAILABLE",
                  "statusReason": "JCI & NABH accredited critical care unit functional 24/7.",
                  "lastVerified": "2026-10-15T10:30:00Z",
                  "verifiedBy": "Aster HIS Telemetry",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "256-Slice Dual Energy CT",
                  "status": "AVAILABLE",
                  "statusReason": "Operational 24/7 for stroke and trauma.",
                  "lastVerified": "2026-10-15T09:45:00Z",
                  "verifiedBy": "Aster HIS Telemetry",
                  "sourceType": "AUTOMATED_API_SYNC"
            }
      ]
},
    {
      "id": "fac-tn-rggh-chennai",
      "name": "Rajiv Gandhi Govt General Hospital (RGGGH & MMC)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Chennai",
      "locationId": "chennai",
      "locationName": "Park Town, Chennai",
      "state": "Tamil Nadu",
      "district": "Chennai",
      "address": "EVR Periyar Salai, Park Town, Chennai, Tamil Nadu 600003",
      "pinCode": "600003",
      "coordinates": {
            "lat": 13.0805,
            "lng": 80.2796
      },
      "cityAliases": [
            "chennai",
            "madras",
            "tn",
            "tamil nadu",
            "park town",
            "central",
            "egmore",
            "t nagar",
            "anna nagar",
            "adyar",
            "velachery"
      ],
      "phone": "+91-44-25305000",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Apex Emergency & Trauma Care Centre",
                  "status": "AVAILABLE",
                  "statusReason": "State of Tamil Nadu's apex multi-bed emergency & triage center.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "Tamil Nadu Health Portal",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "3T MRI Scan Suite",
                  "status": "AVAILABLE",
                  "statusReason": "Active 24 hours in Radiodiagnosis Department.",
                  "lastVerified": "2026-10-15T10:15:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Hemodialysis Centre (40 Units)",
                  "status": "AVAILABLE",
                  "statusReason": "Round the clock dialysis operational under CMCHIS.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "cardiology",
                  "name": "Cardiology & 24/7 Cath Lab",
                  "status": "AVAILABLE",
                  "statusReason": "Emergency PCI & angiogram team active on duty.",
                  "lastVerified": "2026-10-15T08:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-tn-cmc-vellore",
      "name": "Christian Medical College & Hospital (CMC Vellore)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Vellore",
      "locationId": "vellore",
      "locationName": "Ida Scudder Road, Vellore",
      "state": "Tamil Nadu",
      "district": "Vellore",
      "address": "Ida Scudder Road, Vellore, Tamil Nadu 632004",
      "pinCode": "632004",
      "coordinates": {
            "lat": 12.9246,
            "lng": 79.135
      },
      "cityAliases": [
            "vellore",
            "cmc",
            "cmc vellore",
            "ranipet",
            "katpadi"
      ],
      "phone": "+91-416-2281000",
      "emergencyPhone": "+91-416-2282000",
      "operatingHours": "24/7 Emergency & Super Speciality",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency Medical Services",
                  "status": "AVAILABLE",
                  "statusReason": "Renowned national tertiary emergency and trauma institute.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "CMC Hospital Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "High Definition 3T MRI",
                  "status": "AVAILABLE",
                  "statusReason": "Advanced clinical imaging functional round the clock.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "CMC Hospital Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            }
      ]
},
    {
      "id": "fac-tn-psg-coimbatore",
      "name": "PSG Hospitals (Super Speciality)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Coimbatore",
      "locationId": "coimbatore",
      "locationName": "Peelamedu, Coimbatore",
      "state": "Tamil Nadu",
      "district": "Coimbatore",
      "address": "Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004",
      "pinCode": "641004",
      "coordinates": {
            "lat": 11.0253,
            "lng": 77.0081
      },
      "cityAliases": [
            "coimbatore",
            "cbe",
            "peelamedu",
            "avinashi road",
            "rs puram",
            "gandhipuram",
            "tirupur",
            "salem"
      ],
      "phone": "+91-422-2570170",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Comprehensive Emergency Unit",
                  "status": "AVAILABLE",
                  "statusReason": "NABH-certified trauma and critical care response unit active.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "128-Slice Cardiac CT",
                  "status": "AVAILABLE",
                  "statusReason": "Trauma and cardiac imaging operational.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-ap-kgh-vizag",
      "name": "King George Hospital (KGH Vizag)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Visakhapatnam",
      "locationId": "visakhapatnam",
      "locationName": "Maharanipeta, Visakhapatnam",
      "state": "Andhra Pradesh",
      "district": "Visakhapatnam",
      "address": "Collector Office Road, Maharanipeta, Visakhapatnam, Andhra Pradesh 530002",
      "pinCode": "530002",
      "coordinates": {
            "lat": 17.7088,
            "lng": 83.3039
      },
      "cityAliases": [
            "visakhapatnam",
            "vizag",
            "ap",
            "andhra",
            "maharanipeta",
            "gajuwaka",
            "mvp colony",
            "rk beach"
      ],
      "phone": "+91-891-2564891",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Casualty",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": false,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Casualty & Acute Trauma",
                  "status": "AVAILABLE",
                  "statusReason": "Coastal Andhra's largest government teaching hospital emergency active.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "Multislice CT Scanner",
                  "status": "AVAILABLE",
                  "statusReason": "Operating 24 hours in emergency radiology.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-ap-aiims-mangalagiri",
      "name": "AIIMS Mangalagiri (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Vijayawada",
      "locationId": "vijayawada",
      "locationName": "Mangalagiri, Guntur / Vijayawada",
      "state": "Andhra Pradesh",
      "district": "Guntur",
      "address": "Mangalagiri, Guntur District, Andhra Pradesh 522503",
      "pinCode": "522503",
      "coordinates": {
            "lat": 16.4357,
            "lng": 80.5756
      },
      "cityAliases": [
            "vijayawada",
            "guntur",
            "mangalagiri",
            "amaravati",
            "bezawada",
            "aiims mangalagiri"
      ],
      "phone": "+91-8645-280000",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Super Speciality",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Emergency & Trauma Medicine",
                  "status": "AVAILABLE",
                  "statusReason": "Modern apex trauma and resuscitation suites active.",
                  "lastVerified": "2026-10-15T10:30:00Z",
                  "verifiedBy": "AIIMS Mangalagiri Central Portal",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "mri",
                  "name": "3T Digital MRI Scan",
                  "status": "AVAILABLE",
                  "statusReason": "Advanced diagnostic imaging active.",
                  "lastVerified": "2026-10-15T09:45:00Z",
                  "verifiedBy": "AIIMS Mangalagiri Central Portal",
                  "sourceType": "AUTOMATED_API_SYNC"
            }
      ]
},
    {
      "id": "fac-kar-victoria-blr",
      "name": "Victoria Hospital & BMCRI",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Bengaluru",
      "locationId": "bangalore",
      "locationName": "Fort / City Market, Bengaluru",
      "state": "Karnataka",
      "district": "Bengaluru Urban",
      "address": "Fort Road, Near City Market, Kalasipalya, Bengaluru, Karnataka 560002",
      "pinCode": "560002",
      "coordinates": {
            "lat": 12.9634,
            "lng": 77.5753
      },
      "cityAliases": [
            "bangalore",
            "bengaluru",
            "blr",
            "city market",
            "fort",
            "kalasipalya",
            "chickpet",
            "majestic"
      ],
      "phone": "+91-80-26701150",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Trauma Emergency Center",
                  "status": "AVAILABLE",
                  "statusReason": "Karnataka state premier government emergency institute active 24 hours.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "BMCRI Central Telemetry",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "128-Slice Trauma CT",
                  "status": "AVAILABLE",
                  "statusReason": "Emergency head injury & trauma imaging active.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Hemodialysis Centre",
                  "status": "AVAILABLE",
                  "statusReason": "Dialysis active under Suvarna Arogya Suraksha Trust.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-kar-kr-mysore",
      "name": "KR Hospital & Mysore Medical College (MMCRI)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Mysuru",
      "locationId": "mysore",
      "locationName": "Irwin Road, Mysuru",
      "state": "Karnataka",
      "district": "Mysuru",
      "address": "Irwin Road, Medar Block, Yadavagiri, Mysuru, Karnataka 570001",
      "pinCode": "570001",
      "coordinates": {
            "lat": 12.3146,
            "lng": 76.6508
      },
      "cityAliases": [
            "mysuru",
            "mysore",
            "kr hospital",
            "irwin road",
            "devaraja mohalla",
            "kuvempunagar"
      ],
      "phone": "+91-821-2520512",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": false,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Casualty & Emergency Ward",
                  "status": "AVAILABLE",
                  "statusReason": "Apex government hospital serving Mysuru, Chamarajanagar & Kodagu.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "xray",
                  "name": "Digital X-ray Unit",
                  "status": "AVAILABLE",
                  "statusReason": "Casualty radiology running round the clock.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-goa-gmc-bambolim",
      "name": "Goa Medical College and Hospital (GMC Bambolim)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Panaji",
      "locationId": "goa",
      "locationName": "Bambolim, North Goa",
      "state": "Goa",
      "district": "North Goa",
      "address": "NH 66, Bambolim, Tiswadi, Goa 403202",
      "pinCode": "403202",
      "coordinates": {
            "lat": 15.4602,
            "lng": 73.8569
      },
      "cityAliases": [
            "goa",
            "panaji",
            "panjim",
            "bambolim",
            "margao",
            "vasco",
            "mapusa",
            "porvorim",
            "calangute"
      ],
      "phone": "+91-832-2458727",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Super Speciality",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Apex Trauma & Emergency Centre",
                  "status": "AVAILABLE",
                  "statusReason": "State of Goa's primary tertiary care and trauma referral center.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "GMC Central Desk",
                  "sourceType": "HOSPITAL_OFFICIAL"
            },
            {
                  "serviceId": "mri",
                  "name": "1.5T / 3T MRI Scan",
                  "status": "AVAILABLE",
                  "statusReason": "Active 24/7 for acute neuro and polytrauma requisitions.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "ct_scan",
                  "name": "128-Slice Cardiac CT",
                  "status": "AVAILABLE",
                  "statusReason": "Trauma CT operational.",
                  "lastVerified": "2026-10-15T09:30:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
},
    {
      "id": "fac-chg-aiims-raipur",
      "name": "AIIMS Raipur (All India Institute of Medical Sciences)",
      "isDemoCoreFacility": false,
      "facilityType": "HOSPITAL",
      "city": "Raipur",
      "locationId": "raipur",
      "locationName": "Tatibandh, GE Road, Raipur",
      "state": "Chhattisgarh",
      "district": "Raipur",
      "address": "GE Road, Tatibandh, Raipur, Chhattisgarh 492099",
      "pinCode": "492099",
      "coordinates": {
            "lat": 21.257,
            "lng": 81.579
      },
      "cityAliases": [
            "raipur",
            "chhattisgarh",
            "tatibandh",
            "bhilai",
            "durg",
            "bilaspur",
            "ge road"
      ],
      "phone": "+91-771-2577257",
      "emergencyPhone": "108",
      "operatingHours": "24/7 Emergency & Trauma",
      "accessibility": {
            "wheelchairRamp": true,
            "elevator": true,
            "accessibleRestrooms": true,
            "brailleSignage": true,
            "stepFreeEntrance": true,
            "parkingAvailable": true
      },
      "verifiedServices": [
            {
                  "serviceId": "emergency_icu",
                  "name": "24/7 Level 1 Trauma & Emergency",
                  "status": "AVAILABLE",
                  "statusReason": "Central India's leading apex tertiary trauma centre functional.",
                  "lastVerified": "2026-10-15T11:00:00Z",
                  "verifiedBy": "AIIMS Raipur Portal",
                  "sourceType": "AUTOMATED_API_SYNC"
            },
            {
                  "serviceId": "mri",
                  "name": "3T Digital MRI Suite",
                  "status": "AVAILABLE",
                  "statusReason": "Operational in Department of Radiodiagnosis.",
                  "lastVerified": "2026-10-15T10:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            },
            {
                  "serviceId": "dialysis",
                  "name": "Hemodialysis Centre",
                  "status": "AVAILABLE",
                  "statusReason": "20 beds operational with dedicated emergency slots.",
                  "lastVerified": "2026-10-15T09:00:00Z",
                  "verifiedBy": "CareCompass Telephony Audit",
                  "sourceType": "PHONE_CALL"
            }
      ]
}
  ]
};

// Real-time dynamic facility retriever supporting Admin modifications & additions
HEALTHCARE_DATA.getAllFacilities = function() {
  function normalizeFacility(f) {
    if (!f) return f;
    const servs = f.services || f.verifiedServices || [];
    return {
      ...f,
      services: servs,
      verifiedServices: f.verifiedServices || servs,
      type: f.type || f.facilityType || 'Healthcare Facility',
      category: f.category || (f.facilityType ? f.facilityType.toLowerCase() : 'hospital'),
      city: f.city || 'Other',
      state: f.state || 'India'
    };
  }

  try {
    if (typeof localStorage === 'undefined') {
      return HEALTHCARE_DATA.facilities.map(normalizeFacility);
    }
    const custom = JSON.parse(localStorage.getItem('carecompass_custom_facilities') || '[]');
    const deleted = JSON.parse(localStorage.getItem('carecompass_deleted_facilities') || '[]');
    let all = HEALTHCARE_DATA.facilities.filter(f => !deleted.includes(f.id));
    
    // Custom facilities override or prepend
    const customMap = new Map();
    custom.forEach(item => customMap.set(item.id, item));
    
    all = all.map(f => customMap.has(f.id) ? customMap.get(f.id) : f);
    const existingIds = new Set(all.map(f => f.id));
    const brandNew = custom.filter(c => !existingIds.has(c.id));
    
    return [...brandNew, ...all].map(normalizeFacility);
  } catch (e) {
    console.error("Error reading custom facilities:", e);
    return HEALTHCARE_DATA.facilities.map(normalizeFacility);
  }
};

// Export for browser or node environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HEALTHCARE_DATA };
}
