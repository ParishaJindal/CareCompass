/**
 * CareCompass — Frontend API Configuration (Staging Environment)
 * Manages communication between the Vercel Staging Frontend and Render Staging Backend API.
 * 
 * ISOLATION GUARANTEES:
 * 1. Exclusively points to the CareCompass Staging Render backend.
 * 2. Never falls back to production endpoints under any circumstances.
 * 3. Supports Vercel preview environments, custom runtime overrides, and local development.
 */

window.CARECOMPASS_CONFIG = (function () {
  // Official live staging Render backend for CareCompass (feature/hospital-partner-portal)
  const STAGING_API_URL = 'https://carecompass-api-staging.onrender.com';

  // 1. Detect environment variables, window overrides, or explicit custom configuration
  const envApiUrl = (typeof process !== 'undefined' && process.env && (process.env.VITE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || process.env.CARECOMPASS_API_URL))
    || window.__CARECOMPASS_API_BASE_URL__
    || (typeof localStorage !== 'undefined' ? localStorage.getItem('carecompass_staging_api_url') : null);

  // 2. Resolve default backend URL based on host environment
  const isLocalhost = Boolean(
    typeof window !== 'undefined' && window.location && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0'
    )
  );

  let defaultBaseUrl;
  if (envApiUrl && envApiUrl.trim() !== '') {
    defaultBaseUrl = envApiUrl.trim();
  } else if (isLocalhost) {
    // In local development: use local port 10000 by default
    defaultBaseUrl = 'http://localhost:10000';
  } else {
    // Staging Vercel deployment points exclusively to staging Render backend
    defaultBaseUrl = STAGING_API_URL;
  }

  return {
    apiBaseUrl: defaultBaseUrl,
    stagingApiUrl: STAGING_API_URL,
    environment: 'staging',

    /**
     * Resolves complete URL for any backend API endpoint
     * @param {string} endpoint - e.g. '/api/hospitals'
     * @returns {string} Fully qualified URL
     */
    getApiUrl: function (endpoint) {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
      if (!this.apiBaseUrl) {
        return cleanEndpoint;
      }
      return `${this.apiBaseUrl.replace(/\/+$/, '')}${cleanEndpoint}`;
    },

    /**
     * Diagnostic health check for the connected Render staging backend
     * STRICT SAFETY: Never falls back to production.
     */
    checkBackendHealth: async function () {
      try {
        const url = this.getApiUrl('/api/health');
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined
        });
        if (!res.ok) {
          return { online: false, status: res.status, environment: 'staging' };
        }
        const data = await res.json();
        return { online: true, environment: 'staging', ...data };
      } catch (err) {
        // Strict isolation: Log staging failure but NEVER query production
        console.warn('[CareCompass Staging] Staging backend health check error:', err.message);
        return { online: false, environment: 'staging', error: err.message };
      }
    },

    /**
     * Allows setting custom API URL at runtime (e.g. from developer console or staging test harness)
     */
    setApiBaseUrl: function (newUrl) {
      this.apiBaseUrl = newUrl ? newUrl.trim() : '';
      if (typeof localStorage !== 'undefined') {
        if (newUrl) {
          localStorage.setItem('carecompass_staging_api_url', newUrl);
        } else {
          localStorage.removeItem('carecompass_staging_api_url');
        }
      }
      console.log('[CareCompass Staging] API Base URL set to:', this.apiBaseUrl);
    }
  };
})();
