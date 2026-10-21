# CareCompass — Supabase PostgreSQL Data Migration Report

**Migration Run Date:** 2026-10-21T09:15:21.105Z  
**Execution Mode:** DRY RUN (Validation & Schema Check)  
**Execution Duration:** 0.8 seconds  
**Source Dataset:** `data/hospitals_master.csv`  

---

## 1. Executive Summary

| Metric | Count | Ratio / Notes |
| :--- | :--- | :--- |
| **Total Source Rows Processed** | **42,940** | 100.0% of input dataset |
| **Successfully Staged / Imported** | **42,940** | **100.0%** valid records |
| **Flagged for Review (Cleaned)** | **0** | Coordinates normalized or bad PIN code set to NULL |
| **Rejected / Incomplete Records** | **0** | Missing mandatory hospital name or state/district |

---

## 2. Facility Ownership Breakdown

| Ownership Type | Facility Count | Percentage |
| :--- | :--- | :--- |
| **Government** | 32,856 | 76.5% |
| **Private** | 9,249 | 21.5% |
| **Public-Sector** | 835 | 1.9% |

---

## 3. Geographic Distribution (Top 10 States)

| State / Union Territory | Facilities Imported | Share |
| :--- | :--- | :--- |
| **Uttar Pradesh** | 6,415 | 14.9% |
| **Karnataka** | 5,271 | 12.3% |
| **Rajasthan** | 4,018 | 9.4% |
| **Gujarat** | 3,138 | 7.3% |
| **Telangana** | 3,041 | 7.1% |
| **Andhra Pradesh** | 2,777 | 6.5% |
| **Tamil Nadu** | 2,236 | 5.2% |
| **Madhya Pradesh** | 2,074 | 4.8% |
| **Maharashtra** | 1,882 | 4.4% |
| **Haryana** | 1,419 | 3.3% |

---

## 4. Facility Classifications (Top Types)

| Facility Classification | Count | Share |
| :--- | :--- | :--- |
| **General Hospital** | 23,067 | 53.7% |
| **Primary Health Centre (PHC)** | 9,768 | 22.7% |
| **Community Health Centre (CHC)** | 5,777 | 13.5% |
| **Multispecialty Hospital** | 950 | 2.2% |
| **District Hospital** | 917 | 2.1% |
| **Eye Hospital** | 781 | 1.8% |
| **Maternity & Child Hospital** | 478 | 1.1% |
| **Medical College Hospital** | 459 | 1.1% |

---

## 5. Rejection & Review Diagnostics

- No records were completely rejected. All records contained mandatory naming and jurisdictional fields.

> **Data Integrity Verification:**
> 1. All records imported into Supabase retain original National Health Facility Registry (NIN/PM-JAY) and state directory IDs.
> 2. Coordinates outside the Indian geographic bounding box [6.0-38.0 N, 68.0-98.0 E] were safely set to `NULL` to prevent map distortion.
> 3. No synthetic contact numbers or verification flags were created during ingestion.
> 4. `ON CONFLICT (hospital_id)` ensures existing manually audited facility records are never overwritten during subsequent scheduled syncs.
