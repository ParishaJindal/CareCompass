# CareCompass India Healthcare Data Sources & Provenance

CareCompass adheres to strict data ethics, source licensing compliance, and transparent provenance.

## Primary Sourced Datasets

### 1. National Health Facility Identification / PM-JAY Registry
- **Publisher:** Ministry of Health and Family Welfare (MoHFW) / National Health Authority (NHA), Government of India
- **Portal:** [nin.mohfw.gov.in](https://nin.mohfw.gov.in/about_nin2hfi.php) & National Health Portal
- **License:** Open Government Data License - India (GODL) / National Data Sharing and Accessibility Policy (NDSAP)
- **Records Ingested:** 42,321 health facilities
- **Coverage:** All 36 States & UTs, 650+ Districts, 11,000+ PIN codes
- **Attributes Provided:** Hospital/PHC/CHC Name, National ID (`nin_pmjay`), GPS Coordinates (`latitude`, `longitude`), PIN code, District, State, Block, Contact number
- **Known Limitations:** Specialty procedures and real-time telemetry require ongoing telephone or automated sync verification.

### 2. Telangana State Hospital & Bed Availability Directory
- **Publisher:** Department of Health, Medical and Family Welfare, Government of Telangana
- **License:** Open Government Data Policy - Telangana
- **Records Ingested:** 1,327 public & private hospitals
- **Attributes Provided:** Hospital Name, District, Total/Oxygen/ICU Beds, Hospital Type (Private/Government), Contact phone numbers

### 3. Apex Tertiary Teaching Institutes & Medical Colleges
- **Source:** Official institutional portals & verified telemetry (AIIMS New Delhi, PGIMER Chandigarh, SGPGI Lucknow, KGMU, CMC Vellore, Ruby Hall Pune, Manipal Bengaluru, Aster CMI, etc.)
- **Verification Method:** Direct facility administration and verified telephony audit
- **Attributes Provided:** Specialized radiology status (X-ray, 3T MRI, 128-slice CT), operational notes, verified hours

