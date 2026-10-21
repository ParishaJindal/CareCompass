# CareCompass India Healthcare Data Quality & Coverage Report

**Report Generated:** 2026-10-17T04:57:39.044410+00:00
**Total Records Ingested & Accepted:** 42,940
**Raw Source Rows Processed:** 43,648
**Exact Duplicates Resolved/Merged:** 658
**Rejected/Invalid Records:** 50

## 1. Field Completeness & Quality Metrics

| Attribute | Present Count | Completeness Ratio | Notes |
| :--- | :--- | :--- | :--- |
| **Hospital Name** | 42,940 | 100.0% | Standardized title case |
| **State & State Code** | 42,940 | 100.0% | Normalized to ISO 3166-2:IN |
| **District** | 42,940 | 100.0% | Covers 650+ Indian districts |
| **Geographic Coordinates (GPS)** | 41,619 | 96.9% | Validated in bounding box [6.0-38.0 N, 68.0-98.0 E] |
| **Indian PIN Code** | 40,954 | 95.4% | Verified 6-digit postal codes |
| **Contact Phone Number** | 9,155 | 21.3% | E.164 +91 normalized without synthetic digits |
| **Official Source ID (NIN/PMJAY)** | 8,061 | 19.3% | MoHFW National Health Facility Registry |

## 2. Facility Breakdown by Ownership

| Ownership Classification | Count | Percentage |
| :--- | :--- | :--- |
| **Government** | 32,856 | 76.5% |
| **Private** | 9,249 | 21.5% |
| **Public-Sector** | 835 | 1.9% |

## 3. Facility Type Distribution

| Facility Type | Count | Percentage |
| :--- | :--- | :--- |
| **General Hospital** | 23,067 | 53.7% |
| **Primary Health Centre (PHC)** | 9,768 | 22.7% |
| **Community Health Centre (CHC)** | 5,777 | 13.5% |
| **Multispecialty Hospital** | 950 | 2.2% |
| **District Hospital** | 917 | 2.1% |
| **Eye Hospital** | 781 | 1.8% |
| **Maternity & Child Hospital** | 478 | 1.1% |
| **Medical College Hospital** | 459 | 1.1% |
| **Sub-District Hospital** | 442 | 1.0% |
| **Clinic & OPD** | 301 | 0.7% |

## 4. Verification Status Classification

| Status Tier | Criteria | Count | Percentage |
| :--- | :--- | :--- | :--- |
| **Partially Verified** | Rigorous multi-attribute validation | 36,864 | 85.9% |
| **Verified** | Rigorous multi-attribute validation | 5,933 | 13.8% |
| **Not Verified** | Rigorous multi-attribute validation | 143 | 0.3% |

## 5. State-Wise Geographic Coverage (Top 25 States/UTs)

| State / Union Territory | Facilities Recorded | Share of Directory |
| :--- | :--- | :--- |
| Uttar Pradesh | 6,415 | 14.9% |
| Karnataka | 5,271 | 12.3% |
| Rajasthan | 4,018 | 9.4% |
| Gujarat | 3,138 | 7.3% |
| Telangana | 3,041 | 7.1% |
| Andhra Pradesh | 2,777 | 6.5% |
| Tamil Nadu | 2,236 | 5.2% |
| Madhya Pradesh | 2,074 | 4.8% |
| Maharashtra | 1,882 | 4.4% |
| Haryana | 1,419 | 3.3% |
| Bihar | 1,212 | 2.8% |
| Chhattisgarh | 1,128 | 2.6% |
| West Bengal | 1,092 | 2.5% |
| Kerala | 981 | 2.3% |
| Punjab | 968 | 2.3% |
| Jharkhand | 891 | 2.1% |
| Assam | 781 | 1.8% |
| Odisha | 708 | 1.6% |
| Himachal Pradesh | 572 | 1.3% |
| Jammu And Kashmir | 541 | 1.3% |
| Uttarakhand | 308 | 0.7% |
| Delhi | 292 | 0.7% |
| Meghalaya | 204 | 0.5% |
| Tripura | 198 | 0.5% |
| Manipur | 136 | 0.3% |

