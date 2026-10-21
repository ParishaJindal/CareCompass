/**
 * CareCompass — Frontend API Configuration
 * Manages communication between the Vercel Frontend and Render Backend API.
 */

window.CARECOMPASS_CONFIG = (function () {
  // 1. Detect environment variables, window overrides, or localStorage
  const envApiUrl = (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL)
    || window.__CARECOMPASS_API_BASE_URL__
    || (typeof localStorage !== 'undefined' ? localStorage.getItem('carecompass_api_url') : null);

  // 2. Resolve default backend URL based on host environment
  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );

  let defaultBaseUrl;
  if (envApiUrl && envApiUrl.trim() !== '') {
    defaultBaseUrl = envApiUrl.trim();
  } else if (isLocalhost) {
    // Local development defaults to the local Render backend port
    defaultBaseUrl = 'http://localhost:10000';
  } else {
    // Production Vercel deployment points to Render backend service
    // Replace with your actual Render service URL if customized
    defaultBaseUrl = 'https://carecompass-api.onrender.com';
  }

  return {
    apiBaseUrl: defaultBaseUrl,

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
     * Diagnostic health check for the connected Render backend
     */
    checkBackendHealth: async function () {
      try {
        const url = this.getApiUrl('/api/health');
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined
        });
        if (!res.ok) {
          return { online: false, status: res.status };
        }
        const data = await res.json();
        return { online: true, ...data };
      } catch (err) {
        return { online: false, error: err.message };
      }
    },

    /**
     * Allows setting custom API URL at runtime (e.g. from developer console or admin portal)
     */
    setApiBaseUrl: function (newUrl) {
      this.apiBaseUrl = newUrl ? newUrl.trim() : '';
      if (typeof localStorage !== 'undefined') {
        if (newUrl) {
          localStorage.setItem('carecompass_api_url', newUrl);
        } else {
          localStorage.removeItem('carecompass_api_url');
        }
      }
      console.log('[CareCompass] API Base URL set to:', this.apiBaseUrl);
    }
  };
})();
