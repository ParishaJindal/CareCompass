<<<<<<< HEAD
# CareCompass — Healthcare Navigation for Everyone

**Architecture:** Vercel (Frontend) + Render (Backend API) + Supabase (PostgreSQL Database)  
**Lead Developer & Architect:** Parisha Jindal (`parishajindal17@gmail.com`)  
**License:** MIT / Government Open Data License - India (GODL)

---

## 🌟 Overview & Architecture

**CareCompass** is an accessible, nationwide digital healthcare navigation platform for India. It enables patients and caregivers across metropolitan cities, tier-2/3 towns, rural villages, districts, states, and PIN codes to locate verified healthcare facilities, check clinical service availability, access interactive map directions, and receive smart alternative recommendations.

### 3-Tier Production Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser Client                      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Frontend Hosting: VERCEL                    │
│  - Static HTML5, CSS3, Vanilla JavaScript                   │
│  - Clean SPA routing & global Edge CDN (vercel.json)        │
│  - Dynamic API configuration via VITE_API_BASE_URL          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Secure CORS / JSON REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend Hosting: RENDER                     │
│  - Node.js & Express REST API (backend/)                    │
│  - Rate Limiting, Helmet Security, Parameterized SQL        │
│  - Health-check monitoring endpoint (/api/health)           │
└──────────────────────────────┬──────────────────────────────┘
                               │ SSL Encrypted Connection Pool
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Database: SUPABASE POSTGRESQL               │
│  - 42,940 Authentic Indian Healthcare Facilities            │
│  - Trigram Search (pg_trgm) & B-Tree Spatial Indexes        │
│  - Row-Level Security (RLS) & Automated updated_at Triggers │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** v18+ (Node v20+ recommended)
- **npm** v9+

### 2. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```

If connecting to Supabase, update `DATABASE_URL` with your connection string:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
PORT=10000
FRONTEND_URL=http://localhost:3000
```
> **Note:** If `DATABASE_URL` is omitted, the backend automatically operates in local SQLite fallback mode (`data/hospitals.db`) with all 42,940 authentic facilities loaded.

### 4. Start the Backend API Server
```bash
npm run dev:backend
# Or directly:
cd backend && npm start
```
The API is active at: `http://localhost:10000`  
Health check: `http://localhost:10000/api/health`

### 5. Open the Frontend
Serve the frontend using any static HTTP server or open directly:
```bash
# Using Python
python3 -m http.server 3000

# Or using npx serve
npx serve -l 3000 .
```
Visit in your browser: `http://localhost:3000/pages/find-healthcare.html`

---

## 📡 REST API Documentation

All endpoints return structured JSON with standard HTTP status codes.

### 1. Health Check
- **Endpoint:** `GET /api/health`
- **Description:** Verifies service uptime and database connectivity.
- **Sample Response:**
```json
{
  "status": "healthy",
  "service": "CareCompass Healthcare API",
  "timestamp": "2026-10-21T09:08:54.562Z",
  "uptimeSeconds": 120,
  "database": {
    "status": "connected",
    "type": "supabase_postgresql",
    "totalHospitals": 42940
  },
  "environment": "production",
  "version": "2.0.0"
}
```

### 2. Search & Filter Hospitals
- **Endpoint:** `GET /api/hospitals`
- **Dedicated Search Endpoint:** `GET /api/hospitals/search?location=:query`
- **Query Parameters:**
  | Parameter | Type | Description | Example |
  | :--- | :--- | :--- | :--- |
  | `location` | string | City, village, locality, district, or 6-digit PIN code | `Kharar` or `140301` |
  | `q` | string | Keyword (hospital name, specialization, medical service) | `Cardiology` or `X-ray` |
  | `state` | string | Filter by state / union territory | `Punjab` or `Uttar Pradesh` |
  | `district` | string | Filter by administrative district | `Mohali` or `Sas Nagar` |
  | `type` | string | Category filter | `General Hospital` or `PHC` |
  | `ownership` | string | Ownership classification | `Government` or `Private` |
  | `verification` | string | Trust verification tier | `Verified` or `Partially Verified` |
  | `lat`, `lng` | float | GPS coordinates for proximity sorting | `30.748`, `76.641` |
  | `distance` | float | Maximum distance radius in kilometers | `5`, `10`, `25` |
  | `sort` | string | Result sort order | `suitable`, `distance`, `name` |
  | `page` | integer | Page number (1-based, default: 1) | `1` |
  | `limit` | integer | Results per page (default: 24, max: 100) | `12` |

- **Sample Request:**
```bash
curl "https://YOUR-RENDER-SERVICE.onrender.com/api/hospitals?location=Kharar&ownership=Private"
```

- **Sample Response:**
```json
{
  "success": true,
  "totalCount": 5,
  "page": 1,
  "limit": 24,
  "totalPages": 1,
  "hasMore": false,
  "results": [
    {
      "id": "IN-HOSP-06415",
      "hospital_id": "IN-HOSP-06415",
      "hospital_name": "Kamboj Multi Speciality Hospital Kharar",
      "facility_type": "Multispecialty Hospital",
      "ownership_type": "Private",
      "address": "Plot No 4929 Sec 125 New Sunny Enclave Kharar",
      "locality": "Sas Nagar",
      "district": "Sas Nagar",
      "state": "Punjab",
      "pin_code": "140301",
      "latitude": 30.74888,
      "longitude": 76.64136,
      "phone": "+91 98146 01096",
      "specializations": ["Cardiology", "Orthopedics", "General Surgery"],
      "services": ["24/7 Emergency", "ICU", "Digital X-ray", "CT Scan"],
      "emergency_availability": "Available 24/7",
      "verification_status": "Verified",
      "data_confidence": 1.0,
      "last_verified_at": "2026-10-15T10:00:00Z"
    }
  ]
}
```

### 3. Single Facility Details
- **Endpoint:** `GET /api/hospitals/:id`
- **Description:** Returns full audit profile for a hospital using its unique `hospital_id` or database `id`.
- **Sample Request:**
```bash
curl "https://YOUR-RENDER-SERVICE.onrender.com/api/hospitals/IN-HOSP-06415"
```

### 4. Locations Autocomplete
- **Endpoint:** `GET /api/locations?q=:query`
- **Description:** Intelligent instant suggestions for Indian PIN codes, districts, and states.

### 5. Directory Statistics
- **Endpoint:** `GET /api/stats`
- **Description:** Aggregate facility counts broken down by state, facility type, ownership, and verification.

---

## 🗄️ Database Setup: Supabase PostgreSQL

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com) and click **New Project**.
2. Set your Project Name (e.g., `carecompass-db`), choose a strong Database Password, and select the region closest to India (e.g., `ap-south-1` Mumbai or `ap-southeast-1` Singapore).

### Step 2: Apply SQL Schema & Migration
1. In your Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Open [`database/migrations/001_create_hospitals_table.sql`](file:///Users/parishajindal/Desktop/CAREECOMPASS/database/migrations/001_create_hospitals_table.sql).
3. Paste the contents into the SQL Editor and click **Run**.
4. This creates:
   - Required extensions (`pg_trgm`, `uuid-ossp`, `postgis`)
   - `hospitals` table with comprehensive data constraints and types
   - High-performance B-tree and Trigram GIN indexes for fuzzy search
   - Automated `updated_at` trigger
   - Row-Level Security (RLS) policies allowing public read-only access while protecting modification endpoints

### Step 3: Import Hospital Data into Supabase
Run the repeatable migration pipeline from your terminal:
```bash
# 1. Set your Supabase connection string in backend/.env
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# 2. Test in dry-run mode (validates all 42,940 records without writing)
npm run db:import:dry

# 3. Execute live batch import into Supabase
npm run db:import
```
The migration script automatically validates state, district, PIN code, and GPS bounding coordinates, preserves source provenance, enforces deduplication, and generates a detailed report at [`database/import/migration_report.md`](file:///Users/parishajindal/Desktop/CAREECOMPASS/database/import/migration_report.md).

---

## ☁️ Deployment: Render (Backend API)

Deploy the Express REST API backend on Render as a Web Service.

### Option A: Using Render Blueprint (`render.yaml`) — Recommended
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
3. Select your GitHub repository.
4. Render detects [`render.yaml`](file:///Users/parishajindal/Desktop/CAREECOMPASS/render.yaml) automatically.
5. Provide your `DATABASE_URL` (from Supabase) and `FRONTEND_URL` (your Vercel app URL).
6. Click **Apply**. Render will automatically build and deploy the backend!

### Option B: Manual Web Service Setup on Render
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name:** `carecompass-api`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
4. Add the following **Environment Variables**:
   | Variable | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres` |
   | `DATABASE_SSL` | `true` |
   | `FRONTEND_URL` | `https://your-carecompass.vercel.app` |
   | `ALLOWED_ORIGINS` | `https://your-carecompass.vercel.app,http://localhost:3000` |
5. Click **Create Web Service**.
6. Note down your Render backend URL (e.g., `https://carecompass-api.onrender.com`).

---

## ⚡ Deployment: Vercel (Frontend)

Deploy the CareCompass frontend on Vercel with global Edge CDN caching.

### Step 1: Import Repository to Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New...** → **Project**.
2. Select your CareCompass GitHub repository.

### Step 2: Configure Project Settings
- **Framework Preset:** `Other`
- **Root Directory:** `./` (Default root directory)
- **Build Command:** Leave empty (static site, zero build step required)
- **Output Directory:** Leave empty (or `./`)

### Step 3: Add Environment Variables
Add the following environment variable in Vercel:
| Key | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://YOUR-RENDER-SERVICE.onrender.com` |

### Step 4: Deploy
Click **Deploy**. Vercel will deploy your site in seconds and provide a production domain (e.g., `https://carecompass.vercel.app`).

Once deployed:
1. Update `FRONTEND_URL` on your Render service with your new Vercel domain.
2. Test searching for **Kharar, Punjab** or any Indian location directly from the live Vercel site!

---

## 🔐 Security & Governance

1. **Zero Frontend Secrets:** Database connection strings, passwords, and service-role keys reside strictly on the Render backend environment. The Vercel frontend only communicates with public REST API endpoints.
2. **Strict CORS Policy:** Render API only responds to authorized Vercel production domains, Vercel preview URLs, and designated local development origins.
3. **Parameterized SQL:** All queries to PostgreSQL use parameterized placeholders (`$1, $2, ...`) preventing SQL injection.
4. **Rate Limiting:** Protects all public endpoints against DoS abuse (`express-rate-limit`).
5. **Least-Privilege RLS:** Supabase Row Level Security ensures public visitors cannot mutate hospital records.
6. **No Data Fabrication:** Missing phone numbers, emails, or verification statuses are honestly labeled as `NULL` or `Not Verified`.

---

## 📁 Repository Structure

```text
CAREECOMPASS/
├── backend/                        # Render Backend Service
│   ├── src/
│   │   ├── controllers/
│   │   │   └── hospitalController.js
│   │   ├── db/
│   │   │   └── supabase.js        # Supabase PostgreSQL connection pool with SSL
│   │   ├── middleware/
│   │   │   ├── errorHandler.js    # Secure error shielding
│   │   │   └── rateLimiter.js     # Rate limiting middleware
│   │   ├── routes/
│   │   │   ├── health.js          # /api/health monitoring
│   │   │   └── hospitals.js       # Hospital REST routes
│   │   ├── services/
│   │   │   └── hospitalService.js # Parameterized queries, search, filter
│   │   └── server.js              # Express application entrypoint
│   ├── .env.example
│   └── package.json
│
├── database/                       # Supabase Database Migrations & Ingestion
│   ├── migrations/
│   │   └── 001_create_hospitals_table.sql # Schema, PostGIS/trigram indexes, RLS
│   └── import/
│       ├── import_to_supabase.js  # High-throughput batch ingestion script
│       └── migration_report.md    # Automated data quality report
│
├── data/                           # Authentic Indian Healthcare Datasets
│   ├── hospitals_master.csv        # 42,940 normalized facilities (35.3 MB)
│   ├── hospitals.db               # SQLite local fallback database (48.1 MB)
│   ├── sample_hospitals_demo.csv  # Stratified sample for tests
│   ├── data_dictionary.md         # Field definitions
│   └── data_sources.md            # MoHFW / PM-JAY provenance
│
├── js/                             # Frontend Logic
│   ├── config.js                  # Frontend API configuration & URL resolver
│   ├── search.js                  # Search engine connecting to Render API
│   ├── app.js                     # UI state, map rendering, autocomplete
│   ├── healthcare-data.js         # Offline demo scenarios & fallbacks
│   ├── verification.js            # Verification badge calculation
│   └── accessibility.js           # WCAG AAA accessibility controller
│
├── css/                            # Frontend Styling
│   ├── style.css
│   ├── responsive.css
│   └── accessibility.css
│
├── pages/                          # Application Web Pages
│   ├── find-healthcare.html       # Pan-India search, filter, and interactive map
│   ├── facility-details.html      # Single facility audit & service verification
│   ├── about.html                 # Verification methodology & mission
│   ├── contact.html               # Contact & feedback form
│   ├── admin.html                 # Management portal
│   └── login.html                 # Authentication interface
│
├── index.html                      # Homepage & navigation portal
├── vercel.json                     # Vercel routing, clean URLs, and headers
├── render.yaml                     # Render Blueprint infrastructure-as-code
├── .vercelignore                   # Excludes backend/data from frontend bundle
├── .env.example                    # Frontend environment variable template
├── .gitignore                      # Protects environment secrets and node_modules
├── package.json                    # Root package scripts
└── README.md                       # Complete documentation
```

---

## 👥 Contact & Author

**Parisha Jindal**  
Healthcare Data Architect & Lead Developer  
Email: `parishajindal17@gmail.com`
=======
# CareCompass Machine Learning Workflow

This directory contains the end-to-end Machine Learning pipeline for healthcare facility tier classification, data completeness scoring, and duplicate entity detection.

## Structure

```
ml/
├── README.md               # Pipeline instructions and reproducibility guide
├── prepare_dataset.py      # Feature engineering and district-grouped split
├── train_example.py        # Model training, evaluation, and artifact export
├── feature_schema.md       # Feature dictionary and encoding specifications
├── evaluation_report.md    # Empirical metrics, classification report & confusion matrix
├── data/
│   ├── train.csv           # 28,309 records (65.9%)
│   ├── val.csv             # 6,708 records (15.6%)
│   └── test.csv            # 7,923 records (18.5%)
└── models/
    └── facility_tier_classifier.joblib  # Trained model pipeline artifact
```

## How to Run

### 1. Prepare Features & Partition Dataset
```bash
python3 ml/prepare_dataset.py
```
This reads `data/hospitals_master.csv`, engineers the 12 tabular and text features, and partitions the records into Train, Validation, and Test sets using `GroupShuffleSplit` on `State::District` to ensure zero spatial leakage.

### 2. Train & Evaluate Model
```bash
python3 ml/train_example.py
```
This fits a multi-modal pipeline (TF-IDF N-Gram Vectorizer + Scaled Tabular Features + Random Forest Classifier) and evaluates on the completely held-out test partition, producing:
- **Test Accuracy:** **99.03%**
- **Macro F1-Score:** **0.9722**
- **Inference Speed:** > 100,000 predictions / second
- **Saved Model:** `ml/models/facility_tier_classifier.joblib`
- **Detailed Report:** `ml/evaluation_report.md`
>>>>>>> origin/main
