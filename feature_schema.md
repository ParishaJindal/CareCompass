# CareCompass ML Feature Schema & Data Dictionary

This document details the feature representation, encoding strategies, and target classification definitions used in the CareCompass machine learning workflow.

## 1. Target Definition

The model predicts the operational category and tier of a healthcare facility:

| Target Class | Description | Sourced Keywords & Indicators |
| :--- | :--- | :--- |
| **`PHC`** | Primary Health Centre | Rural / suburban first-contact care, outpatient services, routine immunization, maternal care |
| **`CHC`** | Community Health Centre | 30-bed secondary block level referral hospital, minor surgical theater, X-ray, obstetric delivery |
| **`Hospital`** | General, Sub-District, District, Multispecialty | Secondary/Tertiary acute care, casualty/emergency, multi-department inpatient units |
| **`Specialized_Or_Tertiary`** | Apex Tertiary Medical College, Specialty Center | AIIMS, PGIMER, Medical College Hospitals, Specialized Eye/Maternity/Cardiac Institutes |

---

## 2. Feature Extraction Pipeline

### Text Features
* **`hospital_name`**:
  * **Type:** String
  * **Transformation:** TF-IDF Vectorizer with unigrams and bigrams (`ngram_range=(1, 2)`), max 2,500 features.
  * **Captures:** Characteristic naming terms (e.g., `PHC`, `CHC`, `Civil`, `General`, `Apex`, `Trauma`, `Surgical`, `Medical College`).

### Tabular Engineered Features
| Feature Name | Data Type | Value Range | Description |
| :--- | :--- | :--- | :--- |
| `feat_name_length` | Integer | [3, 200] | Character length of the hospital title |
| `feat_has_phone` | Binary (0/1) | {0, 1} | 1 if a verified E.164 phone number is recorded, 0 otherwise |
| `feat_has_pincode` | Binary (0/1) | {0, 1} | 1 if a verified 6-digit Indian PIN code is present, 0 otherwise |
| `feat_has_coordinates` | Binary (0/1) | {0, 1} | 1 if GPS latitude and longitude are recorded, 0 otherwise |
| `feat_has_nin_id` | Binary (0/1) | {0, 1} | 1 if official National Identification Number / PMJAY ID exists |
| `feat_has_subdistrict` | Binary (0/1) | {0, 1} | 1 if Tehsil / Taluka / Block was identified, 0 otherwise |
| `feat_data_confidence` | Float | [0.0, 1.0] | Deterministic completeness index across canonical attributes |
| `feat_missing_fields_count` | Integer | [0, 8] | Count of unpopulated fields in the master schema |
| `feat_lat` | Float | [6.0, 38.0] | Decimal latitude coordinates (imputed with national center for missing) |
| `feat_lng` | Float | [68.0, 98.0] | Decimal longitude coordinates (imputed with national center for missing) |
| `feat_ownership` | Categorical | `Government`, `Private`, `Public-Sector` | Ownership sector encoded via One-Hot Encoding |

---

## 3. Data Leakage Prevention Strategy

* **Grouping Variable:** Composite key `State::District`.
* **Split Algorithm:** `GroupShuffleSplit` (Scikit-Learn).
* **Guarantees:** No geographic district in the training set appears in the validation or test sets. This ensures the model learns true facility patterns rather than memorizing local naming quirks.
