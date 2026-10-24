/**
 * CareCompass Frontend Static Build & Distribution Generator
 * Assembles a clean, optimized 'public/' directory for Vercel deployment.
 * Strictly copies frontend assets while completely excluding backend code,
 * databases, training datasets, secrets, and internal scripts.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

console.log('[CareCompass Build] Initializing static frontend build for Vercel...');

// 1. Clean existing public/ directory
if (fs.existsSync(PUBLIC_DIR)) {
  fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
}
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

// Helper to copy file if it exists
function copyFileIfExists(srcRel, destRel = srcRel) {
  const src = path.join(ROOT_DIR, srcRel);
  const dest = path.join(PUBLIC_DIR, destRel);
  if (fs.existsSync(src)) {
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    return true;
  }
  return false;
}

// Helper to copy directory recursively if it exists
function copyDirIfExists(srcRel, destRel = srcRel) {
  const src = path.join(ROOT_DIR, srcRel);
  const dest = path.join(PUBLIC_DIR, destRel);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    return true;
  }
  return false;
}

// 2. Copy core directories
console.log('  -> Copying frontend directories (pages, css, js, assets)...');
copyDirIfExists('pages');
copyDirIfExists('css');
copyDirIfExists('js');
copyDirIfExists('assets');

// 3. Copy root HTML pages
const ROOT_PAGES = [
  'index.html',
  'about.html',
  'contact.html',
  'find-healthcare.html',
  'facility-details.html',
  'my-appointments.html',
  'partner-with-us.html',
  'hospital-portal.html',
  'admin.html',
  'login.html'
];
console.log('  -> Copying root HTML documents...');
for (const page of ROOT_PAGES) {
  if (!copyFileIfExists(page)) {
    console.error(`  ✖ Critical error: Required root document ${page} not found!`);
    process.exit(1);
  }
}

// 4. Copy icons, logos, metadata & web manifest
const WEB_ASSETS = [
  'favicon.ico',
  'favicon.png',
  'favicon.svg',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'manifest.json',
  'robots.txt',
  'sitemap.xml',
  'logo.png',
  'logo.svg'
];
console.log('  -> Copying web metadata and icons...');
for (const asset of WEB_ASSETS) {
  copyFileIfExists(asset);
}

// 5. Copy root CSS/JS fallback files (for pages referencing them without subfolder prefix)
const ROOT_CODE_FALLBACKS = [
  'style.css',
  'responsive.css',
  'accessibility.css',
  'booking.js',
  'config.js',
  'app.js',
  'search.js',
  'auth.js',
  'admin.js',
  'healthcare-data.js',
  'recommendations.js',
  'translations.js',
  'verification.js',
  'accessibility.js'
];
console.log('  -> Copying root stylesheet and script fallbacks...');
for (const fallback of ROOT_CODE_FALLBACKS) {
  copyFileIfExists(fallback);
}

// 6. Security & Leak Verification — Guarantee no sensitive files exist in public/
const FORBIDDEN_NAMES = [
  'backend',
  'database',
  'data',
  'ml',
  'scripts',
  'node_modules',
  '.env',
  '.env.local',
  '.git',
  'hospitals.db'
];

for (const forbidden of FORBIDDEN_NAMES) {
  const checkPath = path.join(PUBLIC_DIR, forbidden);
  if (fs.existsSync(checkPath)) {
    console.error(`  ✖ Security failure: Forbidden path copied into public/: ${forbidden}`);
    fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
    process.exit(1);
  }
}

// 7. Verification of generated public/ output
const CRITICAL_OUTPUTS = [
  'public/index.html',
  'public/find-healthcare.html',
  'public/facility-details.html',
  'public/my-appointments.html',
  'public/pages/find-healthcare.html',
  'public/css/style.css',
  'public/css/responsive.css',
  'public/js/config.js',
  'public/js/app.js',
  'public/js/booking.js'
];

let failedVerification = false;
for (const relOut of CRITICAL_OUTPUTS) {
  const fullOut = path.join(ROOT_DIR, relOut);
  if (!fs.existsSync(fullOut) || fs.statSync(fullOut).size === 0) {
    console.error(`  ✖ Verification failed: Missing or empty output ${relOut}`);
    failedVerification = true;
  }
}

if (failedVerification) {
  process.exit(1);
}

// 8. Count files generated
let totalFiles = 0;
function countFiles(dir) {
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    if (fs.statSync(p).isDirectory()) {
      countFiles(p);
    } else {
      totalFiles++;
    }
  }
}
countFiles(PUBLIC_DIR);

console.log(`  ✔ Successfully compiled ${totalFiles} clean frontend assets into public/`);
console.log('  ✔ All core HTML entry points, subpages, CSS, and JS verified.');
console.log('  ✔ Zero sensitive files or backend directories leaked into output.');
console.log('[CareCompass Build] Public distribution directory ready for Vercel deployment.');
process.exit(0);
