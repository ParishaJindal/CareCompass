# CareCompass Master Hospital Data Dictionary

This dictionary defines the 37 canonical fields in `hospitals_master.csv`, `hospitals_master.json`, and `hospitals.db`.

| Field Name | Data Type | Nullable | Description & Format | Example |
| :--- | :--- | :--- | :--- | :--- |
| `hospital_id` | String | No | Unique CareCompass primary key formatted as `IN-HOSP-XXXXX` | `IN-HOSP-00001` |
| `source_record_id` | String | Yes | Identifier from original government or state registry | `HOSP24P04978` |
| `hospital_name` | String | No | Standardized facility title in Title Case | `Satasia Surgical Hospital` |
| `alternate_name` | String | Yes | Acronym, localized name, or regional language transliteration | `PGI Chandigarh` |
| `facility_type` | String | No | Standardized healthcare facility classification | `Primary Health Centre (PHC)` |
| `ownership_type` | String | No | Sector governance: `Government`, `Private`, `Public-Sector` | `Government` |
| `healthcare_category` | String | No | Healthcare tier: `Primary`, `Secondary`, `Tertiary`, `Quaternary` | `Secondary Healthcare` |
| `address` | String | No | Complete street or postal address | `Zanzada Chokdi, Junagadh, Gujarat 362001` |
| `locality` | String | Yes | Sub-city area, neighborhood, or sector | `Sector 22` |
| `village` | String | Yes | Rural village name if applicable | `Bhirani` |
| `subdistrict_or_taluka`| String | Yes | Tehsil, Taluka, Mandal, or Community Development Block | `Govindgarh` |
| `district` | String | No | Administrative District name | `Ludhiana` |
| `state` | String | No | Indian State or Union Territory | `Punjab` |
| `state_code` | String | No | ISO 3166-2:IN standard two-letter state code | `IN-PB` |
| `country` | String | No | Nation name | `India` |
| `pin_code` | String | Yes | Normalized 6-digit Indian Postal PIN Code | `141001` |
| `latitude` | Float | Yes | WGS84 decimal latitude (range: 6.0 to 38.0 N) | `30.901025` |
| `longitude` | Float | Yes | WGS84 decimal longitude (range: 68.0 to 98.0 E) | `75.857312` |
| `phone` | String | Yes | Verified E.164 phone number (`+91 XXXXX XXXXX`) | `+91 98765 43210` |
| `alternate_phone` | String | Yes | Secondary contact or landline with STD code | `+91 161 240 1234` |
| `email` | String | Yes | Official email address | `contact@hospital.org` |
| `official_website` | String | Yes | Verified HTTPS web address | `https://aiims.edu` |
| `available_specializations` | JSON String | Yes | Array of medical departments offered | `["Cardiology", "Pediatrics"]` |
| `available_services` | JSON String | Yes | Array of clinical services available | `["24/7 Emergency", "X-ray"]` |
| `emergency_service_status` | String | No | `Available 24/7`, `Daytime Only`, `Unknown` | `Available 24/7` |
| `operating_hours` | String | No | Operating schedule | `Open 24/7 (Emergency & ICU)` |
| `accessibility_features` | JSON String | No | Object with wheelchair ramp, lift, accessible restroom | `{"wheelchairRamp": true}` |
| `source_name` | String | No | Sponsoring agency or dataset title | `MoHFW / PM-JAY Registry` |
| `source_url` | String | Yes | Originating web repository link | `https://nin.mohfw.gov.in` |
| `source_license` | String | No | Intellectual property and open data license | `GODL - India` |
| `source_last_updated` | ISO Date | Yes | Last refresh timestamp in source repository | `2024-03-01T00:00:00Z` |
| `record_imported_at` | ISO Date | No | Pipeline execution timestamp | `2026-10-17T09:00:00Z` |
| `last_verified_at` | ISO Date | Yes | Most recent telemetry or direct telephone audit | `2026-10-15T10:00:00Z` |
| `verification_status` | String | No | `Verified`, `Partially Verified`, `Not Verified`, `Potentially Outdated`, `Source Conflict` | `Verified` |
| `data_confidence` | Float | No | Deterministic completeness index [0.0 - 1.0] | `0.85` |
| `missing_fields` | JSON String | No | Array of unpopulated attributes | `["email", "website"]` |
| `duplicate_group_id` | String | Yes | Cluster identifier for linked duplicate records | `DUP-0012` |
