/**
 * CareCompass - Healthcare Navigation for Everyone
 * 
 * auth.js
 * User Authentication, Roles (Patient/Caregiver & Facility Admin),
 * Session Management, and Role-Based Verification Permissions.
 */

const CareCompassAuth = (function() {
  const STORAGE_KEY = "carecompass_active_user";
  const USERS_KEY = "carecompass_registered_users";

  // Pre-configured demonstration accounts
  const DEMO_ACCOUNTS = [
    {
      id: "usr-patient-1",
      name: "Priya Sharma",
      email: "patient@demo.com",
      password: "password123",
      role: "patient",
      roleLabel: "Patient / Caregiver",
      savedFacilities: ["fac-sunrise"],
      accessibilityPreferences: { wheelchairRamp: true, groundFloorServices: true }
    },
    {
      id: "usr-admin-1",
      name: "Dr. S. Rao",
      email: "admin@citycare.org",
      password: "adminpassword",
      role: "facility_admin",
      roleLabel: "CityCare Radiology Incharge",
      facilityId: "fac-citycare",
      facilityName: "CityCare Hospital"
    }
  ];

  /**
   * Initializes user database in localStorage if absent
   */
  function initUserStore() {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_ACCOUNTS));
    }
  }

  /**
   * Returns current active user or null
   */
  function getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Logs in a user with email and password
   */
  function login(email, password) {
    initUserStore();
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);

    if (!user) {
      return { success: false, message: "Invalid email or password. Please try again or use a demo account." };
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleLabel: user.roleLabel,
      facilityId: user.facilityId || null,
      facilityName: user.facilityName || null
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    updateUIForAuth();
    CareCompassA11y.announce(`Logged in successfully as ${user.name}`);
    window.dispatchEvent(new CustomEvent("authStateChanged", { detail: { user: sessionUser } }));
    return { success: true, user: sessionUser };
  }

  /**
   * Registers a new user
   */
  function register(userData) {
    initUserStore();
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    
    // Check if email already registered
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase().trim())) {
      return { success: false, message: "This email is already registered. Please sign in instead." };
    }

    const newUser = {
      id: "usr-" + Date.now(),
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role || "patient",
      roleLabel: userData.role === "facility_admin" ? `Staff (${userData.facilityName || 'Healthcare Facility'})` : "Patient / Caregiver",
      facilityId: userData.facilityId || null,
      facilityName: userData.facilityName || null,
      savedFacilities: []
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Automatically log in newly registered user
    return login(newUser.email, newUser.password);
  }

  /**
   * Logs out current user
   */
  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    updateUIForAuth();
    CareCompassA11y.announce("You have been signed out.");
    window.dispatchEvent(new CustomEvent("authStateChanged", { detail: { user: null } }));
  }

  /**
   * Quick 1-click Demo Login Helper
   */
  function loginAsDemo(roleType) {
    if (roleType === "admin") {
      return login("admin@citycare.org", "adminpassword");
    } else {
      return login("patient@demo.com", "password123");
    }
  }

  /**
   * Updates Header navigation and UI based on current auth state
   */
  function updateUIForAuth() {
    const user = getCurrentUser();
    const authContainers = document.querySelectorAll(".nav-auth-container");

    authContainers.forEach(container => {
      if (user) {
        // User logged in
        container.innerHTML = `
          <div class="user-profile-menu">
            <button type="button" class="user-badge-btn" id="user-menu-btn" aria-haspopup="true" aria-expanded="false" title="Account Menu">
              <span class="user-avatar">${user.name.charAt(0).toUpperCase()}</span>
              <span class="user-name-label">${user.name.split(" ")[0]}</span>
              <span class="user-role-pill">${user.role === 'facility_admin' ? 'Staff' : 'User'}</span>
            </button>
            <div class="user-dropdown-dropdown" id="user-dropdown-menu" style="display: none;">
              <div class="udd-header">
                <strong>${user.name}</strong>
                <span class="udd-email">${user.email}</span>
                <span class="udd-role">${user.roleLabel}</span>
              </div>
              <ul class="udd-list">
                ${user.role === 'facility_admin' ? `
                  <li><a href="${getRelativePrefix()}pages/facility-details.html?id=${user.facilityId || 'fac-citycare'}" class="udd-item">🏥 Manage Facility Services</a></li>
                ` : `
                  <li><a href="${getRelativePrefix()}pages/find-healthcare.html" class="udd-item">⭐ My Saved Facilities</a></li>
                `}
                <li><a href="${getRelativePrefix()}pages/contact.html#report-form" class="udd-item">📋 My Verification Reports</a></li>
                <li class="udd-divider"></li>
                <li><button type="button" class="udd-item udd-logout-btn" id="btn-logout-action">Sign Out</button></li>
              </ul>
            </div>
          </div>
        `;

        // Bind dropdown toggle
        const menuBtn = container.querySelector("#user-menu-btn");
        const menuDropdown = container.querySelector("#user-dropdown-menu");
        if (menuBtn && menuDropdown) {
          menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = menuDropdown.style.display === "block";
            menuDropdown.style.display = isOpen ? "none" : "block";
            menuBtn.setAttribute("aria-expanded", !isOpen);
          });
        }

        container.querySelector("#btn-logout-action")?.addEventListener("click", () => {
          logout();
        });
      } else {
        // Logged out: Clean, compact Sign In link to dedicated login page
        const isPagesDir = window.location.pathname.includes("/pages/");
        const loginUrl = isPagesDir ? "login.html" : "pages/login.html";
        container.innerHTML = `
          <a href="${loginUrl}" class="btn btn-outline btn-sm nav-login-btn" id="nav-login-btn">
            Sign In
          </a>
        `;
      }
    });

    // Close user dropdown on outside click
    document.addEventListener("click", () => {
      document.querySelectorAll(".user-dropdown-dropdown").forEach(d => d.style.display = "none");
    });
  }

  function getRelativePrefix() {
    return window.location.pathname.includes("/pages/") ? "../" : "";
  }

  /**
   * Opens the Auth Modal
   */
  function openAuthModal(defaultTab = "login") {
    let modal = document.getElementById("auth-modal");
    if (!modal) {
      createAuthModalHtml();
      modal = document.getElementById("auth-modal");
    }

    // Switch to requested tab
    switchAuthTab(defaultTab);
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");

    const emailInput = document.getElementById("auth-login-email");
    if (emailInput && defaultTab === "login") {
      setTimeout(() => emailInput.focus(), 150);
    }
  }

  function switchAuthTab(tabName) {
    const loginTabBtn = document.getElementById("tab-auth-login");
    const registerTabBtn = document.getElementById("tab-auth-register");
    const loginForm = document.getElementById("form-auth-login");
    const registerForm = document.getElementById("form-auth-register");
    const errorBox = document.getElementById("auth-error-box");
    if (errorBox) errorBox.style.display = "none";

    if (tabName === "login") {
      loginTabBtn?.classList.add("active");
      registerTabBtn?.classList.remove("active");
      loginForm?.style.setProperty("display", "block");
      registerForm?.style.setProperty("display", "none");
    } else {
      registerTabBtn?.classList.add("active");
      loginTabBtn?.classList.remove("active");
      loginForm?.style.setProperty("display", "none");
      registerForm?.style.setProperty("display", "block");
    }
  }

  /**
   * Injects the Auth Modal HTML into the DOM if not present
   */
  function createAuthModalHtml() {
    const modalHtml = `
      <div id="auth-modal" class="modal" role="dialog" aria-labelledby="auth-modal-title" aria-modal="true" aria-hidden="true">
        <div class="modal-backdrop"></div>
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 id="auth-modal-title">CareCompass Account Access</h3>
            <button type="button" class="modal-close-btn" aria-label="Close authentication modal">&times;</button>
          </div>
          <div class="modal-body">
            
            <!-- Tab Switcher -->
            <div class="auth-tabs-row" role="tablist">
              <button type="button" class="auth-tab-btn active" id="tab-auth-login" role="tab" aria-selected="true">
                Sign In
              </button>
              <button type="button" class="auth-tab-btn" id="tab-auth-register" role="tab" aria-selected="false">
                Create Account
              </button>
            </div>

            <!-- Error Notification Banner -->
            <div id="auth-error-box" class="alert-notice" style="display:none; background:#fef2f2; border-color:#fca5a5; color:#991b1b; margin-bottom:16px;">
            </div>

            <!-- 1-Click Demo Login Shortcuts -->
            <div class="demo-login-shortcuts-box">
              <span class="dls-title">⚡ Instant Demo Logins (No typing required):</span>
              <div class="dls-buttons-row">
                <button type="button" class="btn btn-sm btn-outline" id="btn-quick-demo-patient" title="Log in as Priya Sharma (Family Caregiver)">
                  👤 Patient / Caregiver
                </button>
                <button type="button" class="btn btn-sm btn-outline" id="btn-quick-demo-admin" title="Log in as Dr. S. Rao (CityCare Radiology Admin)">
                  🏥 Hospital Staff Admin
                </button>
              </div>
            </div>

            <!-- Sign In Form -->
            <form id="form-auth-login" style="display: block;">
              <div class="search-field-group" style="margin-bottom: 14px;">
                <label for="auth-login-email">Email Address</label>
                <input type="email" id="auth-login-email" class="form-input" placeholder="name@example.com" required value="patient@demo.com">
              </div>

              <div class="search-field-group" style="margin-bottom: 18px;">
                <label for="auth-login-password">Password</label>
                <input type="password" id="auth-login-password" class="form-input" placeholder="••••••••" required value="password123">
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%;">
                Sign In to CareCompass
              </button>
            </form>

            <!-- Register Form -->
            <form id="form-auth-register" style="display: none;">
              <div class="search-field-group" style="margin-bottom: 12px;">
                <label for="auth-reg-name">Full Name *</label>
                <input type="text" id="auth-reg-name" class="form-input" placeholder="Your Full Name" required>
              </div>

              <div class="search-field-group" style="margin-bottom: 12px;">
                <label for="auth-reg-email">Email Address *</label>
                <input type="email" id="auth-reg-email" class="form-input" placeholder="name@example.com" required>
              </div>

              <div class="search-field-group" style="margin-bottom: 12px;">
                <label for="auth-reg-password">Create Password *</label>
                <input type="password" id="auth-reg-password" class="form-input" placeholder="At least 6 characters" minlength="6" required>
              </div>

              <div class="search-field-group" style="margin-bottom: 16px;">
                <label for="auth-reg-role">I am registering as *</label>
                <select id="auth-reg-role" class="filter-select">
                  <option value="patient">Patient / Family Caregiver</option>
                  <option value="facility_admin">Healthcare Facility Staff / Administrator</option>
                </select>
              </div>

              <div class="search-field-group" id="reg-facility-name-group" style="display:none; margin-bottom: 16px;">
                <label for="auth-reg-facility">Facility Name</label>
                <input type="text" id="auth-reg-facility" class="form-input" placeholder="e.g. CityCare Hospital">
              </div>

              <button type="submit" class="btn btn-secondary" style="width: 100%;">
                Create CareCompass Account
              </button>
            </form>

          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Setup listeners on the modal
    const modal = document.getElementById("auth-modal");
    modal.querySelector(".modal-close-btn")?.addEventListener("click", () => {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    });
    modal.querySelector(".modal-backdrop")?.addEventListener("click", () => {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    });

    document.getElementById("tab-auth-login")?.addEventListener("click", () => switchAuthTab("login"));
    document.getElementById("tab-auth-register")?.addEventListener("click", () => switchAuthTab("register"));

    // Role toggle in registration
    document.getElementById("auth-reg-role")?.addEventListener("change", (e) => {
      const facGroup = document.getElementById("reg-facility-name-group");
      if (facGroup) {
        facGroup.style.display = e.target.value === "facility_admin" ? "block" : "none";
      }
    });

    // 1-Click Quick Demo Login triggers
    document.getElementById("btn-quick-demo-patient")?.addEventListener("click", () => {
      const res = loginAsDemo("patient");
      if (res.success) {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        alert("Logged in as Priya Sharma (Patient / Caregiver Demo Account)!");
      }
    });

    document.getElementById("btn-quick-demo-admin")?.addEventListener("click", () => {
      const res = loginAsDemo("admin");
      if (res.success) {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        alert("Logged in as Dr. S. Rao (CityCare Hospital Radiology Staff Demo Account)!");
      }
    });

    // Login Form Submit
    document.getElementById("form-auth-login")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("auth-login-email").value;
      const pass = document.getElementById("auth-login-password").value;
      const res = login(email, pass);
      const errorBox = document.getElementById("auth-error-box");

      if (!res.success) {
        if (errorBox) {
          errorBox.textContent = res.message;
          errorBox.style.display = "block";
        }
      } else {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        alert(`Welcome back, ${res.user.name}!`);
      }
    });

    // Register Form Submit
    document.getElementById("form-auth-register")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("auth-reg-name").value;
      const email = document.getElementById("auth-reg-email").value;
      const password = document.getElementById("auth-reg-password").value;
      const role = document.getElementById("auth-reg-role").value;
      const facilityName = document.getElementById("auth-reg-facility")?.value || "";

      const res = register({ name, email, password, role, facilityName });
      const errorBox = document.getElementById("auth-error-box");

      if (!res.success) {
        if (errorBox) {
          errorBox.textContent = res.message;
          errorBox.style.display = "block";
        }
      } else {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        alert(`Account created successfully! Welcome to CareCompass, ${res.user.name}.`);
      }
    });
  }

  return {
    init: function() {
      initUserStore();
      updateUIForAuth();
    },
    getCurrentUser,
    login,
    register,
    logout,
    loginAsDemo,
    openAuthModal,
    updateUIForAuth
  };
})();

// Auto-init on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  CareCompassAuth.init();
});
