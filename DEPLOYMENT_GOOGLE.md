# 🌐 Deploying CareCompass on Google

CareCompass is fully configured and ready for 1-click deployment to **Google's cloud infrastructure**. Below are the two best options depending on your preference:

---

## 🚀 Option 1: Google Firebase Hosting (Recommended - Free & Easiest)

Google Firebase Hosting provides **global CDN distribution, free automatic SSL certificates, SSD storage, custom domain support, and clean URL routing** with zero server maintenance.

### Prerequisites
- Node.js installed on your machine (`node -v`)
- A Google account

### Step 1: Install Firebase CLI
Open your terminal and run:
```bash
npm install -g firebase-tools
```

### Step 2: Login to your Google Account
```bash
firebase login
```
*(This opens a browser window where you select your Google account and grant permissions).*

### Step 3: Initialize & Link Your Project
```bash
firebase init hosting
```
When prompted:
1. Select: **"Use an existing project"** (or **"Create a new project"** if you haven't created one in the Firebase console yet).
2. What do you want to use as your public directory? Enter: `.` (the current directory).
3. Configure as a single-page app (rewrite all urls to /index.html)? Enter: `No` (or `N`, since CareCompass has multi-page routes in `pages/`).
4. Set up automatic builds and deploys with GitHub? Enter: `No` (or `Yes` if you want GitHub Actions).
5. File ./index.html already exists. Overwrite? Enter: `No` (**IMPORTANT**).

*(Note: Pre-configured `firebase.json` and `.firebaserc` files are already included in this repository).*

### Step 4: Deploy to Google!
```bash
firebase deploy --only hosting
```

Your site is instantly live at:
- `https://<your-project-id>.web.app`
- `https://<your-project-id>.firebaseapp.com`

You can also connect any custom domain (e.g. `carecompass.org`) for free in the Firebase Console under **Hosting > Custom Domains**.

---

## ☁️ Option 2: Google Cloud App Engine (GCP)

If you prefer deploying on standard Google Cloud Platform (GCP):

### Prerequisites
- Install the Google Cloud SDK (`gcloud` CLI): [cloud.google.com/sdk](https://cloud.google.com/sdk/docs/install)
- A Google Cloud project with billing enabled

### Step 1: Authenticate with Google Cloud
```bash
gcloud auth login
```

### Step 2: Set your active Google Cloud Project
```bash
gcloud config set project YOUR_PROJECT_ID
```

### Step 3: Deploy using the pre-configured `app.yaml`
```bash
gcloud app deploy
```
*(When prompted, choose your desired region such as `us-central`, `asia-south1`, etc.)*

### Step 4: Open your live website
```bash
gcloud app browse
```

---

## 🐳 Option 3: Google Cloud Run (Containerized)

If you want to run CareCompass as a containerized microservice:

```bash
gcloud run deploy carecompass \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```
*(The included `Dockerfile` and `nginx.conf` will build an ultra-lightweight Alpine Nginx image automatically via Google Cloud Build).*

---

## 🔍 Google Search Console & SEO Verification

CareCompass comes equipped with:
1. `robots.txt` - Allows Googlebot full access to pages and assets.
2. `sitemap.xml` - Lists all page URLs with priorities and refresh schedules.
3. `manifest.json` - Progressive Web App metadata for Google Chrome installation.
4. Schema.org JSON-LD - Rich structured snippets for medical web search.
5. OpenGraph & Twitter Cards - Dynamic previews featuring the official CareCompass logo.

### Adding to Google Search:
1. Open [Google Search Console](https://search.google.com/search-console).
2. Enter your live domain URL (e.g. `https://<your-project-id>.web.app`).
3. If using Firebase Hosting or Google domains, ownership is verified automatically with your Google account!
4. Submit `https://<your-domain>/sitemap.xml` under the **Sitemaps** tab.
