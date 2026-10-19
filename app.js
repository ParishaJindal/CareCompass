/**
 * CareCompass - Healthcare Navigation for Everyone
 * 
 * app.js
 * Main UI application logic, DOM interactions, event listeners,
 * simulated interactive map, directions modal, feedback reporting,
 * and demo scenario handlers.
 */

const CareCompassApp = (function() {
  // Current search state
  let currentSearchResults = [];
  let currentMapMode = "split"; // 'list', 'map', 'split'

  /**
   * Initializes application components on DOM ready
   */
  function init() {
    setupNavigation();
    setupModals();
    setupEmergencyRibbon();
    setupVoiceSearchControls();
    setupLocationDetection();
    setupReportOutdatedForm();

    // Check if on directory page or home page
    if (document.getElementById("facilities-results-container")) {
      initDirectoryPage();
    } else if (document.getElementById("hero-search-form")) {
      initHomePage();
    } else if (document.getElementById("facility-detail-container")) {
      initFacilityDetailPage();
    }
  }

  /**
   * Sets up responsive navbar, mobile menu toggle, and language switchers
   */
  function setupNavigation() {
    const mobileMenuBtn = document.getElementById("mobile-menu-toggle");
    const navLinksContainer = document.getElementById("main-nav-links");

    if (mobileMenuBtn && navLinksContainer) {
      mobileMenuBtn.addEventListener("click", () => {
        const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
        mobileMenuBtn.setAttribute("aria-expanded", !isExpanded);
        navLinksContainer.classList.toggle("mobile-open");
      });
    }

    // Language switcher buttons
    document.querySelectorAll(".lang-switch-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const selectedLang = e.currentTarget.getAttribute("data-lang");
        I18n.setLang(selectedLang);
      });
    });

    // Accessibility settings triggers
    document.querySelectorAll(".trigger-accessibility-modal").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openModal("accessibility-modal", btn.id);
      });
    });
  }

  /**
   * Sets up generic modal behavior, overlay clicks, and close buttons
   */
  function setupModals() {
    // Close buttons
    document.querySelectorAll(".modal-close-btn, .modal-backdrop").forEach(el => {
      el.addEventListener("click", () => {
        CareCompassA11y.closeAllModals();
      });
    });

    // Accessibility modal controls
    document.querySelectorAll("[data-font-size]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const size = e.currentTarget.getAttribute("data-font-size");
        CareCompassA11y.applyFontSize(size);
      });
    });

    const highContrastToggle = document.getElementById("toggle-high-contrast");
    if (highContrastToggle) {
      highContrastToggle.addEventListener("change", (e) => {
        CareCompassA11y.applyHighContrast(e.target.checked);
      });
    }

    const simpleModeToggle = document.getElementById("toggle-simple-mode");
    if (simpleModeToggle) {
      simpleModeToggle.addEventListener("change", (e) => {
        CareCompassA11y.applySimpleMode(e.target.checked);
      });
    }
  }

  /**
   * Opens a modal with focus management
   */
  function openModal(modalId, triggerId = null) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    if (triggerId) modal.setAttribute("data-trigger-id", triggerId);
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");

    // Focus first focusable element
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      setTimeout(() => focusable[0].focus(), 100);
    }
  }

  /**
   * Emergency alert dismiss or expand
   */
  function setupEmergencyRibbon() {
    const emergencyClose = document.getElementById("emergency-ribbon-close");
    if (emergencyClose) {
      emergencyClose.addEventListener("click", () => {
        const ribbon = document.getElementById("emergency-ribbon");
        if (ribbon) ribbon.style.display = "none";
      });
    }
  }

  /**
   * Browser Geolocation with permission handling & fallback
   */
  function setupLocationDetection() {
    document.querySelectorAll(".btn-use-location").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const locInput = document.getElementById("search-location") || document.getElementById("hero-location");
        if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser. Please select or type your locality.");
          return;
        }

        btn.classList.add("loading");
        btn.setAttribute("aria-busy", "true");
        CareCompassA11y.announce("Requesting location access from browser...");

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            btn.classList.remove("loading");
            btn.setAttribute("aria-busy", "false");
            
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;

            if (typeof applyAnchorLocation === 'function' && document.getElementById("simulated-map-canvas")) {
              applyAnchorLocation(userLat, userLng, "My Current GPS Location");
            } else {
              const cityDistances = (HEALTHCARE_DATA.locations || []).map(loc => {
                const dLat = loc.coordinates.lat - userLat;
                const dLng = loc.coordinates.lng - userLng;
                return { name: loc.name.split(" (")[0], dist: dLat * dLat + dLng * dLng };
              }).sort((a, b) => a.dist - b.dist);

              const nearestCity = cityDistances.length > 0 ? cityDistances[0].name : "Chandigarh";
              if (locInput) {
                locInput.value = nearestCity;
                updateActiveCityPill(nearestCity);
                CareCompassA11y.announce(`Location detected: Closest major city is ${nearestCity}`);
              }
              if (document.getElementById("facilities-results-container")) {
                executeDirectorySearch();
              }
            }
          },
          (err) => {
            btn.classList.remove("loading");
            btn.setAttribute("aria-busy", "false");
            console.warn("Location permission:", err.message);
            // Default to Chandigarh
            if (locInput) {
              locInput.value = "Chandigarh";
              updateActiveCityPill("Chandigarh");
            }
            CareCompassA11y.announce("Location permission was not granted. Set default area to Chandigarh.");
            if (document.getElementById("facilities-results-container")) {
              executeDirectorySearch();
            }
          },
          { timeout: 7000 }
        );
      });
    });
  }

  /**
   * Sets up Voice Search on homepage and search page
   */
  function setupVoiceSearchControls() {
    CareCompassA11y.setupVoiceSearch("hero-service", "hero-mic-btn", () => {
      const heroForm = document.getElementById("hero-search-form");
      if (heroForm) heroForm.submit();
    });

    CareCompassA11y.setupVoiceSearch("search-service", "directory-mic-btn", () => {
      executeDirectorySearch();
    });
  }

  /**
   * Home Page initialization
   */
  function initHomePage() {
    const heroForm = document.getElementById("hero-search-form");
    if (heroForm) {
      heroForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const service = document.getElementById("hero-service").value.trim();
        const location = document.getElementById("hero-location").value.trim();
        window.location.href = `pages/find-healthcare.html?service=${encodeURIComponent(service)}&location=${encodeURIComponent(location)}`;
      });
    }

    // Quick demo button
    const demoBtn = document.getElementById("btn-run-xray-demo");
    if (demoBtn) {
      demoBtn.addEventListener("click", () => {
        window.location.href = `pages/find-healthcare.html?service=X-ray&location=Central%20District&demo=true`;
      });
    }

    // Service and Location Autocomplete for hero input
    setupServiceAutocomplete("hero-service", "hero-service-autocomplete");
    setupLocationAutocomplete("hero-location", "hero-location-autocomplete");
    setupQuickCityPills();
  }

  /**
   * Search & Directory Page initialization
   */
  function initDirectoryPage() {
    // Parse URL params
    const urlParams = new URLSearchParams(window.location.search);
    const initialService = urlParams.get("service") || "";
    const initialLocation = urlParams.get("location") || "";
    const isDemo = urlParams.get("demo") === "true";
    const initialCategory = urlParams.get("category") || "all";

    const serviceInput = document.getElementById("search-service");
    const locationInput = document.getElementById("search-location");
    const categorySelect = document.getElementById("filter-facility-type");

    if (serviceInput && initialService) serviceInput.value = initialService;
    if (locationInput && initialLocation) locationInput.value = initialLocation;
    if (categorySelect && initialCategory) categorySelect.value = initialCategory;

    // Autocomplete on search page
    setupServiceAutocomplete("search-service", "search-service-autocomplete");
    setupLocationAutocomplete("search-location", "search-location-autocomplete");
    setupQuickCityPills();
    if (locationInput && locationInput.value) {
      updateActiveCityPill(locationInput.value);
    }

    // Event listeners for filters and search triggers
    const searchForm = document.getElementById("directory-search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        executeDirectorySearch();
      });
    }

    // Real-time filter changes
    const filterInputs = [
      "filter-ownership",
      "filter-state",
      "filter-facility-type",
      "filter-verification",
      "filter-availability",
      "filter-distance",
      "sort-by",
      "filter-open-now",
      "pref-wheelchair",
      "pref-elevator",
      "pref-ground-floor",
      "pref-restroom"
    ];

    filterInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", () => {
          executeDirectorySearch(1);
        });
      }
    });

    // Pagination controls event listeners
    const prevPageBtn = document.getElementById("btn-pagination-prev");
    const nextPageBtn = document.getElementById("btn-pagination-next");
    const perPageSelect = document.getElementById("pagination-per-page");

    if (prevPageBtn) {
      prevPageBtn.addEventListener("click", () => {
        if (currentDirectoryPage > 1) {
          executeDirectorySearch(currentDirectoryPage - 1);
        }
      });
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener("click", () => {
        executeDirectorySearch(currentDirectoryPage + 1);
      });
    }

    if (perPageSelect) {
      perPageSelect.addEventListener("change", () => {
        executeDirectorySearch(1);
      });
    }

    // Apply Filters & Submit buttons (top and bottom)
    document.querySelectorAll(".btn-apply-filters").forEach(btn => {
      btn.addEventListener("click", async () => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span>⏳ Applying Filters...</span>`;
        btn.disabled = true;

        await executeDirectorySearch(1);

        btn.innerHTML = `<span>✓ Filters Applied!</span>`;
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
        }, 1200);

        // Reset results column scroll so user sees top filtered hospitals without shifting window
        const resultsCol = document.getElementById("directory-results-column");
        if (resultsCol) {
          resultsCol.scrollTo({ top: 0, behavior: "smooth" });
        }
        CareCompassA11y.announce("Applied filters and updated healthcare directory according to your requirements.");
      });
    });

    // Reset filters buttons (top and bottom)
    const handleResetFilters = () => {
      filterInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          if (el.type === "checkbox") el.checked = false;
          else if (el.tagName === "SELECT") el.selectedIndex = 0;
        }
      });
      executeDirectorySearch(1);
      CareCompassA11y.announce("Reset all filters to defaults.");
    };

    const resetTopBtn = document.getElementById("btn-reset-filters");
    if (resetTopBtn) resetTopBtn.addEventListener("click", handleResetFilters);

    const resetBottomBtn = document.getElementById("btn-reset-filters-bottom");
    if (resetBottomBtn) resetBottomBtn.addEventListener("click", handleResetFilters);

    // Demo Scenario Trigger Button on Search page
    const runDemoBtn = document.getElementById("btn-trigger-demo-scenario");
    if (runDemoBtn) {
      runDemoBtn.addEventListener("click", () => {
        triggerXRayDemoScenario();
      });
    }

    // Map View toggles
    document.querySelectorAll(".view-toggle-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".view-toggle-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        const mode = e.currentTarget.getAttribute("data-view");
        switchViewMode(mode);
      });
    });

    // Check if initial view was requested via URL (e.g. ?view=list)
    const initialViewMode = urlParams.get("view");
    if (initialViewMode && ["split", "list", "map"].includes(initialViewMode)) {
      document.querySelectorAll(".view-toggle-btn").forEach(b => {
        b.classList.toggle("active", b.getAttribute("data-view") === initialViewMode);
      });
      switchViewMode(initialViewMode);
    }

    // Separate independent scrolling is managed natively via CSS overscroll-behavior: contain

    // Run initial search
    if (isDemo || (initialService.toLowerCase().includes("x-ray") || initialService.toLowerCase().includes("xray"))) {
      triggerXRayDemoScenario();
    } else {
      executeDirectorySearch();
    }
  }

  /**
   * Sets up lightweight autocomplete dropdown for medical service queries
   */
  function setupServiceAutocomplete(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;

    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      if (query.length < 1) {
        dropdown.innerHTML = "";
        dropdown.classList.remove("show");
        return;
      }

      const matches = HEALTHCARE_DATA.servicesList.filter(s => {
        return s.name.toLowerCase().includes(query) ||
               s.commonKeywords.some(kw => kw.toLowerCase().includes(query));
      }).slice(0, 5);

      if (matches.length === 0) {
        dropdown.innerHTML = "";
        dropdown.classList.remove("show");
        return;
      }

      dropdown.innerHTML = matches.map(m => `
        <li class="autocomplete-item" data-value="${m.name}" role="option" tabindex="0">
          <span class="ac-service-name">${m.name}</span>
          <span class="ac-service-cat">${m.category}</span>
        </li>
      `).join("");
      dropdown.classList.add("show");

      dropdown.querySelectorAll(".autocomplete-item").forEach(item => {
        item.addEventListener("click", () => {
          input.value = item.getAttribute("data-value");
          dropdown.innerHTML = "";
          dropdown.classList.remove("show");
          if (document.getElementById("facilities-results-container")) {
            executeDirectorySearch();
          }
        });
      });
    });

    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.innerHTML = "";
        dropdown.classList.remove("show");
      }
    });
  }

  /**
   * Sets up intelligent autocomplete dropdown for major cities and localities
   */
  function setupLocationAutocomplete(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;

    async function renderCityMatches(query) {
      const q = (query || "").trim().toLowerCase();
      let matches = [];

      const allLocations = HEALTHCARE_DATA.locations || [];

      if (!q) {
        // Show major cities by default when focused or empty
        matches = allLocations.slice(0, 7);
      } else {
        // Try live backend API locations autocomplete for PIN codes, districts & states
        try {
          const res = await fetch(`/api/locations?q=${encodeURIComponent(q)}`);
          if (res.ok) {
            const apiData = await res.json();
            if (apiData.success && Array.isArray(apiData.results) && apiData.results.length > 0) {
              matches = apiData.results.map(r => ({
                id: r.name,
                name: r.name,
                landmark: r.type === 'pincode' ? `PIN Code (${r.state})` : (r.type === 'district' ? `District, ${r.state}` : r.state),
                aliases: []
              }));
            }
          }
        } catch (e) {
          // Fallback to local
        }

        if (matches.length === 0) {
          matches = allLocations.filter(loc => {
            const nameMatch = loc.name.toLowerCase().includes(q);
            const aliasMatch = Array.isArray(loc.aliases) && loc.aliases.some(a => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()));
            const landmarkMatch = loc.landmark && loc.landmark.toLowerCase().includes(q);
            return nameMatch || aliasMatch || landmarkMatch;
          });

          // Also check facility localities if fewer than 5 matches
          if (matches.length < 5 && Array.isArray(HEALTHCARE_DATA.facilities)) {
            const matchedFacs = HEALTHCARE_DATA.facilities.filter(f => 
              (f.city && f.city.toLowerCase().includes(q)) ||
              (f.locationName && f.locationName.toLowerCase().includes(q)) ||
              (f.address && f.address.toLowerCase().includes(q))
            );
            matchedFacs.slice(0, 3).forEach(f => {
              const locObj = {
                id: f.id,
                name: f.locationName || f.city,
                landmark: f.city || f.address.split(",")[0],
                aliases: []
              };
              if (!matches.some(m => m.name === locObj.name)) {
                matches.push(locObj);
              }
            });
          }
        }
      }

      if (matches.length === 0) {
        dropdown.innerHTML = "";
        dropdown.classList.remove("show");
        return;
      }

      dropdown.innerHTML = matches.slice(0, 6).map(m => `
        <li class="autocomplete-item" data-value="${m.name.split(" (")[0]}" role="option" tabindex="0">
          <span class="ac-service-name">📍 ${m.name}</span>
          <span class="ac-service-cat">${m.landmark || 'Major City'}</span>
        </li>
      `).join("");
      dropdown.classList.add("show");

      dropdown.querySelectorAll(".autocomplete-item").forEach(item => {
        item.addEventListener("click", () => {
          input.value = item.getAttribute("data-value");
          dropdown.innerHTML = "";
          dropdown.classList.remove("show");
          updateActiveCityPill(input.value);
          if (document.getElementById("facilities-results-container")) {
            executeDirectorySearch();
          }
        });
      });
    }

    input.addEventListener("input", () => {
      renderCityMatches(input.value);
      updateActiveCityPill(input.value);
    });

    input.addEventListener("focus", () => {
      renderCityMatches(input.value);
    });

    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.innerHTML = "";
        dropdown.classList.remove("show");
      }
    });
  }

  /**
   * Synchronizes and attaches event listeners to quick city pill buttons
   */
  function setupQuickCityPills() {
    const pills = document.querySelectorAll(".city-pill");
    const locInput = document.getElementById("search-location") || document.getElementById("hero-location");

    pills.forEach(pill => {
      pill.addEventListener("click", () => {
        const targetCity = pill.getAttribute("data-city") || "";
        pills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");

        if (locInput) {
          locInput.value = targetCity;
        }

        if (document.getElementById("facilities-results-container")) {
          executeDirectorySearch();
        }
      });
    });
  }

  function updateActiveCityPill(cityName) {
    const pills = document.querySelectorAll(".city-pill");
    const norm = (cityName || "").trim().toLowerCase();
    pills.forEach(pill => {
      const pCity = (pill.getAttribute("data-city") || "").trim().toLowerCase();
      if ((!norm && !pCity) || (norm && pCity && (norm.includes(pCity) || pCity.includes(norm)))) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });
  }

  let currentDirectoryPage = 1;
  let currentDirectoryLimit = 24;

  /**
   * Executes the full search and updates the UI with nationwide database integration
   */
  async function executeDirectorySearch(page = 1) {
    currentDirectoryPage = page;
    const serviceInput = document.getElementById("search-service");
    const locationInput = document.getElementById("search-location");
    const ownershipSelect = document.getElementById("filter-ownership");
    const stateSelect = document.getElementById("filter-state");
    const facilityTypeSelect = document.getElementById("filter-facility-type");
    const verificationSelect = document.getElementById("filter-verification");
    const availabilitySelect = document.getElementById("filter-availability");
    const distanceSelect = document.getElementById("filter-distance");
    const sortBySelect = document.getElementById("sort-by");
    const openNowCheckbox = document.getElementById("filter-open-now");
    const perPageSelect = document.getElementById("pagination-per-page");

    if (perPageSelect) {
      currentDirectoryLimit = parseInt(perPageSelect.value, 10) || 24;
    }

    const accessibilityFilters = {
      wheelchairRamp: document.getElementById("pref-wheelchair")?.checked || false,
      elevator: document.getElementById("pref-elevator")?.checked || false,
      groundFloorServices: document.getElementById("pref-ground-floor")?.checked || false,
      accessibleRestroom: document.getElementById("pref-restroom")?.checked || false
    };

    const maxDistanceKm = distanceSelect && distanceSelect.value !== "any" ? parseFloat(distanceSelect.value) : null;

    // Dynamically resolve city center coordinates when user searches a city
    let anchorCoordinates = null;
    const rawLoc = (locationInput ? locationInput.value : "").trim().toLowerCase();
    if (rawLoc && rawLoc !== "all" && rawLoc !== "any" && rawLoc !== "all cities" && rawLoc !== "all india" && rawLoc !== "whole india (all)") {
      const allLocs = HEALTHCARE_DATA.locations || [];
      const matchedLoc = allLocs.find(l => {
        if (l.id === "all_india") return false;
        const lName = (l.name || "").toLowerCase();
        const baseName = lName.split(" (")[0].toLowerCase();
        if (rawLoc === baseName || rawLoc === l.id || lName.includes(rawLoc) || rawLoc.includes(baseName)) return true;
        if (Array.isArray(l.aliases) && l.aliases.some(a => a.toLowerCase() === rawLoc || rawLoc.includes(a.toLowerCase()))) return true;
        return false;
      });
      if (matchedLoc && matchedLoc.coordinates) {
        anchorCoordinates = matchedLoc.coordinates;
      }
    }

    const searchParams = {
      serviceQuery: serviceInput ? serviceInput.value : "",
      locationQuery: locationInput ? locationInput.value : "",
      ownershipFilter: ownershipSelect ? ownershipSelect.value : "all",
      stateFilter: stateSelect ? stateSelect.value : "all",
      facilityType: facilityTypeSelect ? facilityTypeSelect.value : "all",
      verificationFilter: verificationSelect ? verificationSelect.value : "all",
      availabilityFilter: availabilitySelect ? availabilitySelect.value : "all",
      maxDistanceKm,
      accessibilityFilters,
      openNowOnly: openNowCheckbox ? openNowCheckbox.checked : false,
      sortBy: sortBySelect ? sortBySelect.value : "suitable",
      anchorCoordinates,
      page: currentDirectoryPage,
      limit: currentDirectoryLimit
    };

    // Show searching state on count badge
    const countBadge = document.getElementById("results-count-badge");
    if (countBadge) countBadge.textContent = "Searching 42,940+ Indian facilities...";

    const searchOutput = await SearchEngine.searchAsync(searchParams);
    currentSearchResults = searchOutput.results;

    renderSearchResults(searchOutput);
    renderInteractiveMap(searchOutput.results, searchOutput.params.serviceQuery);
    renderPaginationControls(searchOutput);
  }

  /**
   * Updates pagination controls for large result sets
   */
  function renderPaginationControls(searchOutput) {
    const pagBar = document.getElementById("directory-pagination");
    const pagInfo = document.getElementById("pagination-info");
    const prevBtn = document.getElementById("btn-pagination-prev");
    const nextBtn = document.getElementById("btn-pagination-next");

    if (!pagBar) return;

    if (!searchOutput.totalCount || searchOutput.totalCount <= (searchOutput.limit || 24)) {
      if (searchOutput.totalCount > 0) {
        pagBar.style.display = "flex";
        if (pagInfo) pagInfo.textContent = `Showing all ${searchOutput.totalCount.toLocaleString()} facilities`;
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
      } else {
        pagBar.style.display = "none";
      }
      return;
    }

    pagBar.style.display = "flex";
    const currentPage = searchOutput.page || 1;
    const totalPages = searchOutput.totalPages || Math.ceil(searchOutput.totalCount / (searchOutput.limit || 24));

    if (pagInfo) {
      pagInfo.textContent = `Page ${currentPage.toLocaleString()} of ${totalPages.toLocaleString()} (${searchOutput.totalCount.toLocaleString()} facilities)`;
    }

    if (prevBtn) {
      prevBtn.disabled = (currentPage <= 1);
    }
    if (nextBtn) {
      nextBtn.disabled = (currentPage >= totalPages);
    }
  }

  /**
   * Activates the specific required demonstration scenario:
   * X-ray search in Central District showcasing:
   * 1. CityCare Hospital (Closest, UNAVAILABLE for X-rays)
   * 2. Sunrise Diagnostic Centre (CONFIRMED AVAILABLE alternative)
   * 3. Green Valley Clinic (NOT VERIFIED)
   */
  function triggerXRayDemoScenario() {
    const serviceInput = document.getElementById("search-service");
    const locationInput = document.getElementById("search-location");
    const availabilitySelect = document.getElementById("filter-availability");
    const sortBySelect = document.getElementById("sort-by");

    if (serviceInput) serviceInput.value = "X-ray";
    if (locationInput) locationInput.value = "Central District";
    if (availabilitySelect) availabilitySelect.value = "all";
    if (sortBySelect) sortBySelect.value = "distance"; // CityCare Hospital at 0.8 km appears first!

    // Show Demo Banner
    const demoBanner = document.getElementById("demo-scenario-active-banner");
    if (demoBanner) {
      demoBanner.style.display = "block";
    }

    executeDirectorySearch(1);

    CareCompassA11y.announce("Loaded demonstration scenario: X-ray search in Central District.");
  }

  /**
   * Renders the facility cards, alternative recommendation banner, and empty states
   */
  function renderSearchResults(searchOutput) {
    const container = document.getElementById("facilities-results-container");
    const countLabel = document.getElementById("results-count-badge");
    const altBannerContainer = document.getElementById("alternative-recommendation-spotlight");

    if (!container) return;

    if (countLabel) {
      const pageInfo = searchOutput.totalPages > 1 
        ? ` • Page ${searchOutput.page || 1} of ${searchOutput.totalPages}` 
        : '';
      countLabel.textContent = `${searchOutput.totalCount.toLocaleString()} ${searchOutput.totalCount === 1 ? 'facility found' : 'facilities found'}${pageInfo}`;
    }

    // 1. Render Smart Alternative Recommendation Spotlight Banner
    if (altBannerContainer) {
      if (searchOutput.alternativeRecommendation && searchOutput.alternativeRecommendation.topAlternative) {
        const topAlt = searchOutput.alternativeRecommendation.topAlternative;
        const fac = topAlt.facility;
        const ver = topAlt.verification;

        altBannerContainer.innerHTML = `
          <div class="alt-recommendation-box" role="region" aria-label="Smart Alternative Recommendation">
            <div class="alt-header">
              <span class="alt-badge"><i class="icon-star">★</i> CARECOMPASS SMART ALTERNATIVE</span>
              <span class="alt-reason-pill">Automatic Route Optimization</span>
            </div>
            <div class="alt-body">
              <div class="alt-main-info">
                <h3 class="alt-title">${fac.name}</h3>
                <p class="alt-address">${fac.address} • <strong>${fac.distanceKm} km away</strong></p>
                <div class="alt-status-row">
                  <span class="status-chip ${ver.badgeClass}">
                    <span class="status-indicator"></span> ${ver.label}
                  </span>
                  <span class="alt-verified-time"><i class="icon-clock"></i> Verified: ${ver.lastVerifiedFormatted}</span>
                </div>
                <div class="alt-explanation-box">
                  <strong>Why recommended:</strong> ${topAlt.primaryExplanation}
                </div>
              </div>
              <div class="alt-actions">
                <a href="tel:${fac.phone}" class="btn btn-secondary btn-sm" aria-label="Call ${fac.name}">
                  <i class="icon-phone"></i> Call to Confirm (${fac.phone})
                </a>
                <button type="button" class="btn btn-primary btn-sm btn-open-directions" data-fac-id="${fac.id}">
                  <i class="icon-navigation"></i> Get Directions
                </button>
                <a href="facility-details.html?id=${fac.id}" class="btn btn-outline btn-sm">
                  View Full Audit
                </a>
              </div>
            </div>
          </div>
        `;
        altBannerContainer.style.display = "block";

        // Bind directions button inside recommendation box
        altBannerContainer.querySelector(".btn-open-directions")?.addEventListener("click", () => {
          openDirectionsModal(fac);
        });
      } else {
        altBannerContainer.innerHTML = "";
        altBannerContainer.style.display = "none";
      }
    }

    // 2. Render Facilities List or Empty State
    if (!searchOutput.results || searchOutput.results.length === 0) {
      const locQ = (searchOutput.params.locationQuery || '').trim();
      let suggestionsHtml = '';

      if (searchOutput.suggestedLocations && searchOutput.suggestedLocations.length > 0) {
        suggestionsHtml = `
          <div class="locality-suggestion-box">
            <h4>ℹ️ No facilities directly listed in "${locQ}"</h4>
            <p style="font-size:0.86rem; color:#334155; margin:0 0 10px 0;">
              This small locality or village may not have a directly indexed hospital record yet. However, CareCompass covers official healthcare centres in the surrounding district and state. Explore nearby locations:
            </p>
            <div class="locality-suggestion-pills">
              ${searchOutput.suggestedLocations.map(s => `
                <button type="button" class="locality-suggestion-pill" data-location="${s.district}">
                  📍 Search ${s.district}, ${s.state}
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }

      container.innerHTML = `
        ${suggestionsHtml}
        <div class="empty-results-card" role="status">
          <div class="empty-icon"><i class="icon-search"></i></div>
          <h3>No matching healthcare facilities found</h3>
          <p>We couldn't find facilities matching your specific criteria. Try broadening your location, removing category filters, or searching by PIN code or District.</p>
          <div class="empty-actions">
            <button type="button" class="btn btn-primary" id="btn-empty-clear">Reset All Filters</button>
            <button type="button" class="btn btn-secondary" id="btn-empty-demo">Load X-ray Demonstration</button>
          </div>
        </div>
      `;

      // Bind suggestion pills
      container.querySelectorAll(".locality-suggestion-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          const locInput = document.getElementById("search-location");
          if (locInput) {
            locInput.value = pill.getAttribute("data-location");
          }
          executeDirectorySearch(1);
        });
      });

      document.getElementById("btn-empty-clear")?.addEventListener("click", () => {
        document.getElementById("btn-reset-filters")?.click();
      });
      document.getElementById("btn-empty-demo")?.addEventListener("click", () => {
        triggerXRayDemoScenario();
      });
      return;
    }

    const queryService = searchOutput.params.serviceQuery;

    container.innerHTML = searchOutput.results.map(facility => {
      const ver = facility.serviceVerification || {};
      const isUnavailable = ver.status === VerificationEngine.STATUS.UNAVAILABLE;
      const isUnverified = ver.status === VerificationEngine.STATUS.NOT_VERIFIED;
      const isAvailable = ver.status === VerificationEngine.STATUS.AVAILABLE;

      // Status indicator class
      let cardBorderClass = "";
      if (queryService) {
        if (isUnavailable) cardBorderClass = "border-status-unavailable";
        else if (isAvailable) cardBorderClass = "border-status-available";
        else if (isUnverified) cardBorderClass = "border-status-unverified";
      }

      // Ownership badge
      let ownershipHtml = "";
      if (facility.ownership === "Government") {
        ownershipHtml = `<span class="badge-ownership badge-gov" title="Government / Public Facility (Ayushman Bharat / PM-JAY)">🏛️ Government</span>`;
      } else if (facility.ownership === "Private") {
        ownershipHtml = `<span class="badge-ownership badge-pvt" title="Private Hospital or Clinic">🏢 Private</span>`;
      } else if (facility.ownership === "Public-Sector") {
        ownershipHtml = `<span class="badge-ownership badge-pub" title="Public-Sector / Autonomous Trust">🏥 Public-Sector</span>`;
      }

      // Verification chip
      let verChipHtml = "";
      if (facility.verificationStatus === "Verified") {
        verChipHtml = `<span class="ver-chip ver-chip-verified" title="Confirmed in MoHFW / National Health Facility Registry">✓ Verified</span>`;
      } else if (facility.verificationStatus === "Partially Verified") {
        verChipHtml = `<span class="ver-chip ver-chip-partially" title="Active facility record & valid administrative geocode">⚡ Partially Verified</span>`;
      } else {
        verChipHtml = `<span class="ver-chip ver-chip-unverified" title="Facility listing unverified">○ Not Verified</span>`;
      }

      // Accessibility feature badges
      const acc = facility.accessibility || {};
      const accBadges = [];
      if (acc.wheelchairRamp) accBadges.push(`<span class="acc-pill" title="Wheelchair ramp available">♿ Ramp</span>`);
      if (acc.elevator) accBadges.push(`<span class="acc-pill" title="Elevator/Lift available">🛗 Lift</span>`);
      if (acc.groundFloorServices) accBadges.push(`<span class="acc-pill" title="Ground floor service access">🚶 Ground Floor</span>`);
      if (acc.accessibleRestroom) accBadges.push(`<span class="acc-pill" title="Accessible Restroom">🚻 Restroom</span>`);

      const isAnchored = Boolean(searchOutput.isAnchored || searchOutput.params.anchorCoordinates || searchOutput.params.userCoordinates);
      const hasDistance = typeof facility.distanceKm === 'number' && isAnchored;
      const distanceHtml = hasDistance 
        ? `<span class="facility-distance">(${facility.distanceKm} km away)</span>` 
        : '';
      const cityBadgeHtml = `<span class="facility-city-badge">📍 ${facility.district || facility.city || 'India'}${facility.state ? `, ${facility.state}` : ''}</span>`;
      const pinHtml = facility.pinCode ? `<span style="font-size:0.78rem; color:#64748b; font-weight:600;">(PIN: ${facility.pinCode})</span>` : '';

      // Emergency Badge
      const isEmergency = Boolean(facility.emergencyStatus && facility.emergencyStatus.includes("24/7"));
      const emergencyBadgeHtml = isEmergency 
        ? `<span class="badge-emergency-live" title="24/7 Emergency & Trauma wing operational">🚨 24/7 Emergency</span>`
        : '';

      // Clean sample services (compact pills)
      const facilityServices = Array.isArray(facility.services) && facility.services.length > 0 
        ? facility.services 
        : [
            { name: "Emergency Care", status: isEmergency ? "AVAILABLE" : "UNAVAILABLE" },
            { name: "Inpatient Beds", status: "AVAILABLE" },
            { name: "OPD Consultation", status: "AVAILABLE" }
          ];

      const serviceChipsHtml = facilityServices.slice(0, 3).map(s => {
        const isAvail = (s.status || 'AVAILABLE') === 'AVAILABLE';
        return `<span class="service-pill-compact ${isAvail ? 'available' : 'unavailable'}">${isAvail ? '✓' : '✗'} ${(s.name || '').replace(' & Inpatient', '')}</span>`;
      }).join("");

      return `
        <article class="facility-card ${cardBorderClass}" id="card-${facility.id}" data-id="${facility.id}" data-lat="${facility.coordinates ? facility.coordinates.lat : ''}" data-lng="${facility.coordinates ? facility.coordinates.lng : ''}">
          
          <!-- Top Row: Type & Verification Badges -->
          <div class="card-top-row">
            <div class="card-tags-group">
              <span class="facility-type-tag">${facility.type || 'Healthcare Facility'}</span>
              ${ownershipHtml}
              ${verChipHtml}
              ${emergencyBadgeHtml}
            </div>
            <div class="card-status-badges">
              <span class="open-status-badge ${facility.isOpenNow ? 'status-open' : 'status-closed'}">
                ${facility.isOpenNow ? '● Open Now' : '○ Closed'}
              </span>
            </div>
          </div>

          <!-- Main Info: Hospital Name & Location -->
          <div class="card-main-info">
            <h3 class="facility-name">${facility.name}</h3>
            <p class="facility-address">
              <span>📍 ${facility.district || facility.city || 'India'}${facility.state ? `, ${facility.state}` : ''}</span>
              ${pinHtml}
              ${distanceHtml}
            </p>
          </div>

          <!-- Specific Query Verification Banner (if user searched for specific service like X-ray) -->
          ${queryService ? `
            <div class="service-verification-banner compact ${ver.badgeClass || 'status-available'}">
              <div class="sv-status-line">
                <span class="sv-badge">
                  <span class="sv-dot"></span> ${ver.label || 'Confirmed'}: ${ver.serviceName || queryService}
                </span>
                <span class="sv-timestamp"><i class="icon-time"></i> ${ver.lastVerifiedFormatted || 'MoHFW Registry'}</span>
              </div>
              ${ver.warningBanner ? `<div class="sv-warning-text" role="alert"><i class="icon-alert"></i> ${ver.warningBanner}</div>` : ''}
              ${ver.operationalNotes ? `<div class="sv-notes"><strong>Notes:</strong> ${ver.operationalNotes}</div>` : ''}
            </div>
          ` : `
            <!-- Compact Services Strip -->
            <div class="facility-services-strip">
              ${serviceChipsHtml}
              ${accBadges.length > 0 ? accBadges[0] : ''}
            </div>
          `}

          <!-- Bottom Action Bar -->
          <div class="card-actions-bar">
            <div class="contact-links">
              ${facility.phone ? `
                <a href="tel:${facility.phone}" class="facility-phone-link" title="Call facility directly">
                  📞 ${facility.phone}
                </a>
              ` : `
                <span class="facility-phone-unverified" title="Phone not listed in registry">
                  📞 Phone Unlisted
                </span>
              `}
            </div>
            <div class="nav-links">
              <button type="button" class="btn btn-outline btn-sm btn-open-directions" data-fac-id="${facility.id}">
                📍 Directions
              </button>
              <a href="facility-details.html?id=${facility.id}${queryService ? '&service=' + encodeURIComponent(queryService) : ''}" class="btn btn-primary btn-sm">
                View Details →
              </a>
            </div>
          </div>

          <!-- Subtle Provenance Footnote -->
          <div class="facility-card-footer-info">
            <span>MoHFW PM-JAY • ${facility.operatingHours ? facility.operatingHours.split('(')[0].trim() : '24/7 Care'}</span>
            <button type="button" class="btn-link btn-report-outdated" style="font-size:0.72rem; color:#94a3b8; text-decoration:none; padding:0; background:none; border:none; cursor:pointer;" data-fac-id="${facility.id}" data-fac-name="${facility.name}">
              Report Info
            </button>
          </div>

        </article>
      `;
    }).join("");

    // Attach card action event listeners
    container.querySelectorAll(".btn-open-directions").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const facId = btn.getAttribute("data-fac-id");
        const fac = (currentSearchResults || []).find(f => f.id === facId) || (HEALTHCARE_DATA.facilities || []).find(f => f.id === facId);
        if (fac) openDirectionsModal(fac);
      });
    });

    container.querySelectorAll(".btn-report-outdated").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const facId = btn.getAttribute("data-fac-id");
        const facName = btn.getAttribute("data-fac-name");
        openReportOutdatedModal(facId, facName, queryService);
      });
    });

    // Card click focuses on Leaflet map marker
    container.querySelectorAll(".facility-card").forEach(card => {
      card.addEventListener("click", (e) => {
        // Only trigger if click wasn't on an interactive link/button
        if (e.target.closest("a, button, select, input")) return;

        const lat = parseFloat(card.getAttribute("data-lat"));
        const lng = parseFloat(card.getAttribute("data-lng"));
        if (!isNaN(lat) && !isNaN(lng) && careCompassMapInstance) {
          careCompassMapInstance.setView([lat, lng], 14, { animate: true });
          // Open popup
          if (careCompassMarkersLayer) {
            careCompassMarkersLayer.eachLayer(layer => {
              if (layer.getLatLng && Math.abs(layer.getLatLng().lat - lat) < 0.0001 && Math.abs(layer.getLatLng().lng - lng) < 0.0001) {
                layer.openPopup();
              }
            });
          }
        }
      });
    });
  }

  /**
   * Switches view mode between list, map, and split
   */
  function switchViewMode(mode) {
    currentMapMode = mode;
    const splitView = document.querySelector(".directory-split-view");
    const listCol = document.getElementById("directory-results-column");
    const mapCol = document.getElementById("directory-map-column");

    if (!listCol || !mapCol) return;

    if (splitView) {
      splitView.classList.remove("view-mode-list", "view-mode-map", "view-mode-split");
      splitView.classList.add(`view-mode-${mode}`);
    }

    if (mode === "list") {
      listCol.style.display = "block";
      listCol.style.width = "100%";
      mapCol.style.display = "none";
    } else if (mode === "map") {
      listCol.style.display = "none";
      mapCol.style.display = "block";
      mapCol.style.width = "100%";
      if (careCompassMapInstance) {
        setTimeout(() => careCompassMapInstance.invalidateSize(), 100);
      }
    } else {
      // Split view
      listCol.style.display = "block";
      listCol.style.width = "";
      mapCol.style.display = "block";
      mapCol.style.width = "";
      if (careCompassMapInstance) {
        setTimeout(() => careCompassMapInstance.invalidateSize(), 100);
      }
    }
  }

  let careCompassMapInstance = null;
  let careCompassMarkersLayer = null;
  let userLocationMarker = null;
  let mapControlsInitialized = false;

  /**
   * Renders the interactive Leaflet map covering the whole of India
   * Centers dynamically, creates rich SVG bubble markers, and binds popups
   */
  function renderInteractiveMap(facilities, activeService) {
    const mapContainer = document.getElementById("simulated-map-canvas");
    if (!mapContainer) return;

    // Update map counter badge
    const counterBadge = document.getElementById("map-counter-badge");
    if (counterBadge) {
      counterBadge.textContent = `${facilities ? facilities.length : 0} Facilities`;
    }

    // Setup map control buttons and locality search (once)
    setupMapControlsAndLocalitySearch();

    // Check if Leaflet is available
    if (typeof L === 'undefined') {
      renderSvgMapFallback(facilities, activeService, mapContainer);
      return;
    }

    try {
      // 1. Initialize map if not already done
      if (!careCompassMapInstance) {
        careCompassMapInstance = L.map(mapContainer, {
          center: [22.5937, 78.9629], // Geographic center of India
          zoom: 5,
          minZoom: 4,
          maxZoom: 18,
          zoomControl: true,
          scrollWheelZoom: true
        });

        L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | CareCompass Pan-India Map',
          subdomains: 'abc',
          maxZoom: 19
        }).addTo(careCompassMapInstance);

        careCompassMarkersLayer = L.layerGroup().addTo(careCompassMapInstance);
      }

      // Invalidate size in case tab/split layout adjusted
      setTimeout(() => {
        if (careCompassMapInstance) careCompassMapInstance.invalidateSize();
      }, 100);

      // 2. Clear existing facility markers
      careCompassMarkersLayer.clearLayers();

      if (!facilities || facilities.length === 0) {
        return;
      }

      const validLatLngs = [];

      // 3. Add markers for all facilities
      facilities.forEach((fac, idx) => {
        if (!fac.coordinates || typeof fac.coordinates.lat !== 'number' || typeof fac.coordinates.lng !== 'number') {
          return;
        }

        const lat = fac.coordinates.lat;
        const lng = fac.coordinates.lng;
        validLatLngs.push([lat, lng]);

        const ver = fac.serviceVerification;
        let statusKey = "unverified";
        let statusLabel = "Not Verified (Call Ahead)";
        let statusBadgeColor = "#d97706";

        if (activeService && ver) {
          if (ver.status === VerificationEngine.STATUS.AVAILABLE) {
            statusKey = "available";
            statusLabel = "Confirmed Available";
            statusBadgeColor = "#16a34a";
          } else if (ver.status === VerificationEngine.STATUS.UNAVAILABLE) {
            statusKey = "unavailable";
            statusLabel = "Confirmed Unavailable";
            statusBadgeColor = "#dc2626";
          }
        } else if (fac.isOpenNow) {
          statusKey = "available";
          statusLabel = "Open Now";
          statusBadgeColor = "#16a34a";
        }

        // Custom Leaflet DivIcon
        const customIcon = L.divIcon({
          className: 'custom-leaflet-pin',
          html: `
            <div class="pin-pulse-wave ${statusKey}"></div>
            <div class="pin-marker-bubble ${statusKey}" title="${fac.name}">
              <span>${idx + 1}</span>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -32]
        });

        // Rich Popup Content
        const popupHtml = `
          <div style="font-family:'Inter', sans-serif; font-size:13px; line-height:1.45;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:6px;">
              <span style="font-size:10px; font-weight:700; text-transform:uppercase; background:#f1f5f9; color:#475569; padding:2px 6px; border-radius:4px;">
                ${fac.type || 'Healthcare Facility'}
              </span>
              <span style="font-size:10px; font-weight:700; color:#ffffff; background:${statusBadgeColor}; padding:2px 7px; border-radius:9999px;">
                ${statusLabel}
              </span>
            </div>
            
            <h4 style="margin:0 0 4px 0; font-size:14px; font-weight:800; color:#0f2b48;">
              ${fac.name}
            </h4>
            
            <p style="margin:0 0 8px 0; color:#64748b; font-size:11px;">
              📍 ${fac.address || fac.city} ${fac.distanceKm ? `• <strong>${fac.distanceKm} km</strong>` : ''}
            </p>

            ${activeService && ver ? `
              <div style="background:#f8fafc; border-left:3px solid ${statusBadgeColor}; padding:6px 8px; margin-bottom:8px; border-radius:4px; font-size:11px;">
                <strong>${ver.label}:</strong> ${ver.serviceName}
                ${ver.reason ? `<div style="color:#64748b; font-size:10px; margin-top:2px;">${ver.reason}</div>` : ''}
              </div>
            ` : ''}

            <!-- Availability Stats -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; background:#f1f5f9; padding:6px 8px; border-radius:6px; margin-bottom:10px; font-size:11px;">
              <div>🛏️ Beds: <strong>${fac.availableBeds || '50+'}</strong></div>
              <div>💨 Oxygen: <strong style="color:${fac.oxygenAvailable !== false ? '#16a34a' : '#dc2626'}">${fac.oxygenAvailable !== false ? 'Available' : 'Limited'}</strong></div>
              <div>🩺 ICU: <strong>${fac.icuAvailable !== false ? 'Active' : 'Full'}</strong></div>
              <div>🩸 Blood: <strong>${fac.bloodBankAvailable !== false ? 'Yes' : 'No'}</strong></div>
            </div>

            <!-- Action buttons -->
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <a href="tel:${fac.phone || '108'}" style="flex:1; text-align:center; background:#ffffff; border:1px solid #cbd5e1; color:#0f2b48; padding:6px; border-radius:6px; font-weight:700; text-decoration:none; font-size:11px;">
                📞 Call
              </a>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener" style="flex:1.4; text-align:center; background:#0d9488; color:#ffffff; padding:6px; border-radius:6px; font-weight:700; text-decoration:none; font-size:11px;">
                🗺️ Directions
              </a>
              <a href="facility-details.html?id=${fac.id}" style="width:100%; text-align:center; color:#0d9488; font-weight:600; text-decoration:none; font-size:11px; margin-top:2px;">
                View Full Department Details &rarr;
              </a>
            </div>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customIcon });
        marker.bindPopup(popupHtml, { maxWidth: 300 });

        marker.on("click", () => {
          // Highlight card on results column
          const cardEl = document.getElementById(`card-${fac.id}`);
          if (cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cardEl.classList.add("highlighted-card");
            setTimeout(() => cardEl.classList.remove("highlighted-card"), 2500);
          }
        });

        careCompassMarkersLayer.addLayer(marker);
      });

      // 4. Auto-fit bounds
      if (validLatLngs.length > 1) {
        const bounds = L.latLngBounds(validLatLngs);
        careCompassMapInstance.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
      } else if (validLatLngs.length === 1) {
        careCompassMapInstance.setView(validLatLngs[0], 13);
      }
    } catch (err) {
      console.warn("Leaflet rendering error, using fallback:", err);
      renderSvgMapFallback(facilities, activeService, mapContainer);
    }
  }

  /**
   * Sets up Pan-India Locality geocoding and Map Header controls
   */
  function setupMapControlsAndLocalitySearch() {
    if (mapControlsInitialized) return;
    mapControlsInitialized = true;

    // 1. "Whole India" Button
    const allIndiaBtn = document.getElementById("btn-map-fit-india");
    if (allIndiaBtn) {
      allIndiaBtn.addEventListener("click", () => {
        if (careCompassMapInstance) {
          careCompassMapInstance.setView([22.5937, 78.9629], 5);
        }
      });
    }

    // 2. "Fit Results" Button
    const fitResultsBtn = document.getElementById("btn-map-fit-results");
    if (fitResultsBtn) {
      fitResultsBtn.addEventListener("click", () => {
        if (careCompassMapInstance && careCompassMarkersLayer) {
          const layers = careCompassMarkersLayer.getLayers();
          if (layers.length > 0) {
            const group = L.featureGroup(layers);
            careCompassMapInstance.fitBounds(group.getBounds(), { padding: [30, 30] });
          }
        }
      });
    }

    // 3. Pan-India Locality Jump Input
    const jumpInput = document.getElementById("map-locality-jump-input");
    const jumpBtn = document.getElementById("btn-map-locality-jump");

    const handleLocalityJump = () => {
      const query = (jumpInput ? jumpInput.value : "").trim();
      if (!query) return;
      locateAnyIndianLocality(query);
    };

    if (jumpBtn) jumpBtn.addEventListener("click", handleLocalityJump);
    if (jumpInput) {
      jumpInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleLocalityJump();
        }
      });
    }
  }

  /**
   * Locates ANY locality, village, town, sector, or PIN code anywhere in India
   * Uses OpenStreetMap Nominatim geocoder with fallback to local coordinates dictionary
   */
  async function locateAnyIndianLocality(query) {
    if (!query) return;
    const cleanQuery = query.trim();

    // 1. Check local coordinates first
    const localMatch = HEALTHCARE_DATA.locations.find(loc => {
      const n = loc.name.toLowerCase();
      const q = cleanQuery.toLowerCase();
      return n.includes(q) || q.includes(n) || (loc.aliases && loc.aliases.some(a => a.toLowerCase().includes(q) || q.includes(a.toLowerCase())));
    });

    if (localMatch && localMatch.coordinates) {
      applyAnchorLocation(localMatch.coordinates.lat, localMatch.coordinates.lng, localMatch.name);
      return;
    }

    // 2. Fetch Nominatim for any Indian locality / village / pin code
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=1&q=${encodeURIComponent(cleanQuery + ", India")}`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        applyAnchorLocation(lat, lng, item.display_name.split(",")[0]);
      } else {
        // Fallback: search via normal directory search
        const locInput = document.getElementById("search-location");
        if (locInput) locInput.value = cleanQuery;
        executeDirectorySearch();
      }
    } catch (e) {
      // Offline fallback
      const locInput = document.getElementById("search-location");
      if (locInput) locInput.value = cleanQuery;
      executeDirectorySearch();
    }
  }

  /**
   * Sets anchor point at user/searched location, drops user pin, and sorts facilities by proximity
   */
  function applyAnchorLocation(lat, lng, locationLabel) {
    if (!careCompassMapInstance) return;

    // Pan map to location
    careCompassMapInstance.setView([lat, lng], 13);

    // Drop User Pin
    if (userLocationMarker) {
      careCompassMapInstance.removeLayer(userLocationMarker);
    }

    const userIcon = L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div class="user-location-pin" title="Your Search Location"></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    userLocationMarker = L.marker([lat, lng], { icon: userIcon })
      .bindPopup(`<strong>📍 Searched Location:</strong><br>${locationLabel || 'Selected Area'}`)
      .addTo(careCompassMapInstance);

    userLocationMarker.openPopup();

    // Re-run directory search with anchor coordinates so facilities recalculate distance and rank by proximity!
    const serviceInput = document.getElementById("search-service");
    const locInput = document.getElementById("search-location");
    if (locInput) locInput.value = locationLabel;

    const searchParams = {
      serviceQuery: serviceInput ? serviceInput.value : "",
      locationQuery: "", // Empty so it searches whole India proximity around anchor!
      facilityType: document.getElementById("filter-facility-type")?.value || "all",
      availabilityFilter: document.getElementById("filter-availability")?.value || "all",
      maxDistanceKm: null,
      accessibilityFilters: {
        wheelchairRamp: document.getElementById("pref-wheelchair")?.checked || false,
        elevator: document.getElementById("pref-elevator")?.checked || false,
        groundFloorServices: document.getElementById("pref-ground-floor")?.checked || false,
        accessibleRestroom: document.getElementById("pref-restroom")?.checked || false
      },
      openNowOnly: document.getElementById("filter-open-now")?.checked || false,
      sortBy: "distance",
      anchorCoordinates: { lat, lng }
    };

    const searchOutput = SearchEngine.search(searchParams);
    currentSearchResults = searchOutput.results;

    renderSearchResults(searchOutput);
    renderInteractiveMap(searchOutput.results, searchOutput.params.serviceQuery);

    CareCompassA11y.announce(`Showing nearest healthcare facilities to ${locationLabel}`);
  }

  /**
   * Fallback SVG map renderer in case Leaflet is unavailable
   */
  function renderSvgMapFallback(facilities, activeService, mapContainer) {
    if (!facilities || facilities.length === 0) {
      mapContainer.innerHTML = `<div class="map-empty">No facilities to display on map</div>`;
      return;
    }
    const width = 600;
    const height = 450;
    mapContainer.innerHTML = `
      <div style="padding:20px; text-align:center; color:#64748b;">
        <p>Interactive Map of India: ${facilities.length} Facilities Active.</p>
      </div>
    `;
  }

  /**
   * Displays info popup on the interactive map
   */
  function showMapPopup(facility, activeService) {
    const popup = document.getElementById("map-pin-popup");
    if (!popup) return;

    const ver = facility.serviceVerification;
    popup.innerHTML = `
      <div class="popup-content">
        <button type="button" class="popup-close-btn" aria-label="Close popup">&times;</button>
        <span class="popup-type">${facility.type}</span>
        <h4 class="popup-title">${facility.name}</h4>
        <p class="popup-address">${facility.address} (${facility.distanceKm} km)</p>
        ${activeService && ver ? `
          <div class="popup-status ${ver.badgeClass}">
            <strong>${ver.label}:</strong> ${ver.serviceName}
          </div>
        ` : ''}
        <div class="popup-actions">
          <button type="button" class="btn btn-sm btn-primary popup-directions-btn">Get Directions</button>
          <a href="facility-details.html?id=${facility.id}" class="btn btn-sm btn-outline">Full Details</a>
        </div>
      </div>
    `;
    popup.style.display = "block";

    popup.querySelector(".popup-close-btn")?.addEventListener("click", () => {
      popup.style.display = "none";
    });

    popup.querySelector(".popup-directions-btn")?.addEventListener("click", () => {
      openDirectionsModal(facility);
    });

    // Also highlight matching card on list
    const cardEl = document.getElementById(`card-${facility.id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cardEl.classList.add("highlighted-card");
      setTimeout(() => cardEl.classList.remove("highlighted-card"), 2500);
    }
  }

  /**
   * Directions modal with route simulation and external Google Maps deep-link
   */
  function openDirectionsModal(facility) {
    let modal = document.getElementById("directions-modal");
    if (!modal) {
      createDirectionsModalHtml();
      modal = document.getElementById("directions-modal");
    }

    const titleEl = document.getElementById("dir-dest-name");
    const addrEl = document.getElementById("dir-dest-address");
    const distEl = document.getElementById("dir-dest-distance");
    const linkEl = document.getElementById("dir-external-maps-link");

    if (titleEl) titleEl.textContent = facility.name;
    if (addrEl) addrEl.textContent = facility.address;
    if (distEl) distEl.textContent = `${facility.distanceKm} km (Est. 8 - 12 mins by car/taxi)`;

    if (linkEl) {
      linkEl.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(facility.name + " " + facility.address)}`;
    }

    openModal("directions-modal");
    CareCompassA11y.announce(`Opened directions route for ${facility.name}`);
  }

  function createDirectionsModalHtml() {
    const modalHtml = `
      <div id="directions-modal" class="modal" role="dialog" aria-labelledby="dir-modal-title" aria-modal="true" aria-hidden="true">
        <div class="modal-backdrop"></div>
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 id="dir-modal-title"><i class="icon-navigation"></i> Navigation & Route Guidance</h3>
            <button type="button" class="modal-close-btn" aria-label="Close directions">&times;</button>
          </div>
          <div class="modal-body">
            <div class="directions-route-summary">
              <div class="route-point start-point">
                <span class="point-marker">A</span>
                <div>
                  <strong>Starting Point:</strong>
                  <p>Your Location / Central Metro Station</p>
                </div>
              </div>
              <div class="route-connector"></div>
              <div class="route-point dest-point">
                <span class="point-marker">B</span>
                <div>
                  <strong id="dir-dest-name">Destination Facility</strong>
                  <p id="dir-dest-address">Address details</p>
                  <span class="badge-distance" id="dir-dest-distance">2.4 km</span>
                </div>
              </div>
            </div>

            <div class="directions-steps-preview">
              <h4>Turn-by-Turn Overview:</h4>
              <ol class="steps-list">
                <li>Head north on Central Health Avenue toward Metro Gate 3 (400 m).</li>
                <li>Turn right onto Ring Road Square / Expressway Connector (1.2 km).</li>
                <li>Arrive at destination on the left. Look for clear emergency & reception signage.</li>
              </ol>
            </div>

            <div class="alert-notice">
              <i class="icon-info"></i> Note: Directions are simulated for demonstration. Use the link below to open live navigation with real-time traffic updates.
            </div>
          </div>
          <div class="modal-footer">
            <a href="#" target="_blank" rel="noopener noreferrer" id="dir-external-maps-link" class="btn btn-primary">
              <i class="icon-external"></i> Open in Google Maps
            </a>
            <button type="button" class="btn btn-secondary modal-close-btn">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
    setupModals();
  }

  /**
   * Sets up "Report Outdated Information" feedback form
   */
  function setupReportOutdatedForm() {
    const reportForm = document.getElementById("report-outdated-form");
    if (!reportForm) return;

    reportForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const facilityName = document.getElementById("report-facility-name").value;
      const serviceName = document.getElementById("report-service-name").value;
      const reportedStatus = document.getElementById("report-observed-status").value;
      const comments = document.getElementById("report-comments").value;
      const reporterEmail = document.getElementById("report-email").value;

      const reportRecord = {
        id: "rep-" + Date.now(),
        facilityName,
        serviceName,
        reportedStatus,
        comments,
        reporterEmail,
        timestamp: new Date().toISOString()
      };

      // Store in localStorage
      const existingReports = JSON.parse(localStorage.getItem("carecompass_user_reports") || "[]");
      existingReports.push(reportRecord);
      localStorage.setItem("carecompass_user_reports", JSON.stringify(existingReports));

      // Show success message
      const successBox = document.getElementById("report-success-message");
      if (successBox) {
        successBox.style.display = "block";
        reportForm.style.display = "none";
      }

      CareCompassA11y.announce("Thank you. Your verification report has been recorded and submitted for audit.");
    });
  }

  function openReportOutdatedModal(facilityId, facilityName, serviceName) {
    const nameInput = document.getElementById("report-facility-name");
    const serviceInput = document.getElementById("report-service-name");
    const successBox = document.getElementById("report-success-message");
    const form = document.getElementById("report-outdated-form");

    if (nameInput) nameInput.value = facilityName || "";
    if (serviceInput) serviceInput.value = serviceName || "";
    if (successBox) successBox.style.display = "none";
    if (form) {
      form.style.display = "block";
      form.reset();
      if (nameInput) nameInput.value = facilityName || "";
      if (serviceInput) serviceInput.value = serviceName || "";
    }

    openModal("report-modal");
  }

  /**
   * Facility Detail Page initialization
   */
  function initFacilityDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const facilityId = urlParams.get("id") || "fac-citycare"; // Default to CityCare Hospital for demo audit
    const queryService = urlParams.get("service") || "";

    const facility = HEALTHCARE_DATA.facilities.find(f => f.id === facilityId) || HEALTHCARE_DATA.facilities[0];

    renderFacilityDetails(facility, queryService);
  }

  function renderFacilityDetails(facility, queryService) {
    const container = document.getElementById("facility-detail-container");
    if (!container) return;

    // Document title
    document.title = `${facility.name} — Service Verification & Details | CareCompass`;

    // Render breadcrumbs, overview, verified services table, accessibility checklist, and alternative recommendations
    const accList = [
      { name: "Wheelchair Ramp Access", supported: facility.accessibility.wheelchairRamp, desc: "Gentle grade ramp with handrails at main entrance" },
      { name: "Elevator / Lift", supported: facility.accessibility.elevator, desc: "Spacious elevator servicing all diagnostic and clinical floors" },
      { name: "Ground Floor Services", supported: facility.accessibility.groundFloorServices, desc: "Key consultation and triage rooms located on ground floor" },
      { name: "Accessible Restroom", supported: facility.accessibility.accessibleRestroom, desc: "Wide doors and grab-bars installed" },
      { name: "Braille Signage", supported: facility.accessibility.brailleSignage, desc: "Tactile floor indicators and Braille room labels" },
      { name: "Designated Disabled Parking", supported: facility.accessibility.disabledParking, desc: "Reserved parking bays near entrance" }
    ];

    // Check if any service at this facility is UNAVAILABLE, and generate alternatives
    const unavailableServices = facility.services.filter(s => s.status === VerificationEngine.STATUS.UNAVAILABLE);

    container.innerHTML = `
      <div class="facility-detail-header">
        <a href="find-healthcare.html" class="btn btn-link btn-back">
          <i class="icon-back"></i> &larr; Back to Healthcare Search
        </a>
        <div class="detail-header-card">
          <div class="dh-main">
            <span class="facility-type-tag">${facility.type}</span>
            <h1 class="dh-title">${facility.name}</h1>
            <p class="dh-address"><i class="icon-pin"></i> ${facility.address} • <strong>${facility.distanceKm} km from Central Metro</strong></p>
            <div class="dh-tags">
              <span class="open-status-badge ${facility.isOpenNow ? 'status-open' : 'status-closed'}">
                ${facility.isOpenNow ? '● Open Now' : '○ Closed'}
              </span>
              <span class="dh-sync-badge"><i class="icon-check"></i> Audit Sync: ${facility.verificationSummary.lastVerifiedOverall ? VerificationEngine.assessFreshness(facility.verificationSummary.lastVerifiedOverall).formatted : 'Recently'}</span>
            </div>
          </div>
          <div class="dh-actions">
            ${facility.phone ? `
              <a href="tel:${facility.phone}" class="btn btn-primary">
                <i class="icon-phone"></i> Call Facility: ${facility.phone}
              </a>
            ` : ''}
            <button type="button" class="btn btn-secondary btn-detail-directions" data-fac-id="${facility.id}">
              <i class="icon-navigation"></i> Get Directions
            </button>
            <button type="button" class="btn btn-outline btn-detail-report" data-fac-id="${facility.id}">
              <i class="icon-flag"></i> Report Discrepancy
            </button>
          </div>
        </div>
      </div>

      <!-- Core Verification Spotlight for Searched Service -->
      ${queryService ? `
        <div class="detail-service-spotlight">
          ${(() => {
            const ver = VerificationEngine.verifyService(facility, queryService);
            return `
              <div class="spotlight-card ${ver.badgeClass}">
                <div class="sc-header">
                  <span class="sc-badge"><span class="sc-dot"></span> ${ver.label}</span>
                  <span class="sc-service-name">Service: ${ver.serviceName}</span>
                </div>
                <div class="sc-body">
                  <p class="sc-reason"><strong>Current Status:</strong> ${ver.reason || "Operational status recorded"}</p>
                  <p class="sc-timestamp"><strong>Verified by:</strong> ${ver.verifiedBy} (${ver.lastVerifiedFormatted})</p>
                  ${ver.operationalNotes ? `<p class="sc-notes"><strong>Notes:</strong> ${ver.operationalNotes}</p>` : ''}
                  ${ver.warningBanner ? `
                    <div class="sc-warning-alert" role="alert">
                      <i class="icon-alert"></i> ${ver.warningBanner}
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          })()}
        </div>
      ` : ''}

      <!-- Services Catalog & Verification Table -->
      <section class="detail-section">
        <div class="section-title-row">
          <h2>Medical Services & Live Verification Status</h2>
          <p class="section-subtext">Each service is verified independently. A facility being open does not imply that every diagnostic service is operating.</p>
        </div>
        <div class="services-table-wrapper">
          <table class="services-audit-table" aria-label="Facility medical services verification audit">
            <thead>
              <tr>
                <th>Medical Service</th>
                <th>Availability Status</th>
                <th>Last Verified</th>
                <th>Verification Source</th>
                <th>Operational Notes</th>
              </tr>
            </thead>
            <tbody>
              ${facility.services.map(s => {
                const fresh = VerificationEngine.assessFreshness(s.lastVerified);
                let badgeClass = "badge-unverified";
                let badgeLabel = "NOT VERIFIED";
                if (s.status === "AVAILABLE") {
                  badgeClass = "badge-available";
                  badgeLabel = "CONFIRMED AVAILABLE";
                } else if (s.status === "UNAVAILABLE") {
                  badgeClass = "badge-unavailable";
                  badgeLabel = "CONFIRMED UNAVAILABLE";
                }

                return `
                  <tr class="${s.status === 'UNAVAILABLE' ? 'row-unavailable' : ''}">
                    <td class="col-service-name"><strong>${s.name}</strong></td>
                    <td class="col-status">
                      <span class="status-chip ${badgeClass}">
                        <span class="status-indicator"></span> ${badgeLabel}
                      </span>
                    </td>
                    <td class="col-verified-date">
                      <span class="date-text">${fresh.formatted}</span>
                      ${fresh.isStale ? '<span class="stale-warning" title="Records older than 14 days require reconfirmation">⚠️ Expired</span>' : ''}
                    </td>
                    <td class="col-source">
                      <span class="source-badge">${s.verifiedBy || 'Admin Desk'}</span>
                    </td>
                    <td class="col-notes">
                      ${s.statusReason || ''} 
                      ${s.operationalNotes ? `<span class="op-notes-text">${s.operationalNotes}</span>` : ''}
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Alternative Recommendations for Unavailable Services -->
      ${unavailableServices.length > 0 ? `
        <section class="detail-section alternative-section">
          <h2>Alternative Recommendations for Unavailable Services</h2>
          <p class="section-subtext">Because certain services are confirmed unavailable at ${facility.name}, we have automatically identified verified alternatives nearby:</p>
          <div class="alternatives-grid">
            ${unavailableServices.map(unService => {
              const altResult = RecommendationEngine.findAlternatives(
                HEALTHCARE_DATA.facilities,
                unService.serviceId,
                { excludeFacilityId: facility.id }
              );
              if (!altResult.topAlternative) return "";
              const top = altResult.topAlternative;
              return `
                <div class="alt-service-card">
                  <div class="asc-header">
                    <span class="asc-unavail">Service Needed: <strong>${unService.name}</strong> (Unavailable here)</span>
                  </div>
                  <div class="asc-body">
                    <h4>Recommended: <a href="facility-details.html?id=${top.facility.id}">${top.facility.name}</a></h4>
                    <p class="asc-meta">${top.facility.address} • <strong>${top.facility.distanceKm} km away</strong></p>
                    <div class="asc-status">
                      <span class="status-chip ${top.verification.badgeClass}">
                        <span class="status-indicator"></span> ${top.verification.label}
                      </span>
                      <span>Verified: ${top.verification.lastVerifiedFormatted}</span>
                    </div>
                    <p class="asc-explanation"><strong>Reason:</strong> ${top.primaryExplanation}</p>
                    <div class="asc-actions">
                      <a href="tel:${top.facility.phone}" class="btn btn-secondary btn-sm"><i class="icon-phone"></i> Call: ${top.facility.phone}</a>
                      <button type="button" class="btn btn-primary btn-sm btn-detail-directions" data-fac-id="${top.facility.id}">Directions</button>
                    </div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </section>
      ` : ''}

      <!-- Accessibility Checklist Section -->
      <section class="detail-section">
        <h2>Accessibility & Physical Infrastructure</h2>
        <div class="accessibility-checklist-grid">
          ${accList.map(acc => `
            <div class="acc-check-card ${acc.supported ? 'acc-supported' : 'acc-unsupported'}">
              <div class="acc-check-icon">
                ${acc.supported ? '✓' : '✕'}
              </div>
              <div class="acc-check-info">
                <h4>${acc.name}</h4>
                <p>${acc.desc}</p>
                <span class="acc-ver-tag">${acc.supported ? 'Verified Accessible' : 'Not Available / Unverified'}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </section>

      <!-- Facility Contact & Hours Section -->
      <section class="detail-section">
        <h2>Operating Hours & Verified Contact Details</h2>
        <div class="contact-details-grid">
          <div class="contact-card">
            <h4>Operating Schedule</h4>
            <p><strong>Emergency / Trauma:</strong> 24 Hours / 7 Days</p>
            <p><strong>General Outpatient (OPD):</strong> 8:00 AM - 6:00 PM</p>
            <p><strong>Radiology & Diagnostics:</strong> 8:00 AM - 8:00 PM</p>
            <p><strong>Pharmacy:</strong> 24/7 Ground Floor Counter</p>
          </div>
          <div class="contact-card">
            <h4>Direct Lines</h4>
            <p><strong>Primary Reception:</strong> ${facility.phone || 'Available on request'}</p>
            <p><strong>Emergency Ambulance:</strong> ${facility.emergencyPhone || 'Dial 108 / 102'}</p>
            <p><strong>Email:</strong> ${facility.email || 'info@facility.org'}</p>
          </div>
        </div>
      </section>
    `;

    // Bind directions and report discrepancy buttons
    container.querySelectorAll(".btn-detail-directions").forEach(btn => {
      btn.addEventListener("click", () => {
        const facId = btn.getAttribute("data-fac-id");
        const fac = HEALTHCARE_DATA.facilities.find(f => f.id === facId);
        if (fac) openDirectionsModal(fac);
      });
    });

    container.querySelectorAll(".btn-detail-report").forEach(btn => {
      btn.addEventListener("click", () => {
        openReportOutdatedModal(facility.id, facility.name, queryService);
      });
    });
  }

  return {
    init,
    openDirectionsModal,
    openReportOutdatedModal,
    executeDirectorySearch,
    triggerXRayDemoScenario
  };
})();

// Auto-run on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  CareCompassApp.init();
});
