/**
 * CareCompass - Healthcare Navigation for Everyone
 * 
 * accessibility.js
 * Accessibility features compliant with WCAG 2.1 AA standards:
 * - Adjustable font sizes (Normal, Large, Extra Large)
 * - High-Contrast Mode toggle
 * - Screen Reader live region announcer
 * - Simple language mode
 * - Voice Search integration (Web Speech API) with graceful fallback
 * - Keyboard navigation and focus trap helpers
 */

const CareCompassA11y = (function() {
  const PREFS = {
    fontSize: localStorage.getItem("carecompass_font_size") || "normal",
    highContrast: localStorage.getItem("carecompass_contrast") === "true",
    simpleMode: localStorage.getItem("carecompass_simple_mode") === "true",
    reducedMotion: localStorage.getItem("carecompass_reduced_motion") === "true"
  };

  /**
   * Initializes accessibility settings on page load
   */
  function init() {
    applyFontSize(PREFS.fontSize);
    applyHighContrast(PREFS.highContrast);
    applySimpleMode(PREFS.simpleMode);
    applyReducedMotion(PREFS.reducedMotion);
    setupAnnouncer();
    setupKeyboardListeners();
  }

  /**
   * Sets text scale
   * @param {'normal'|'large'|'xlarge'} size 
   */
  function applyFontSize(size) {
    document.body.classList.remove("text-size-normal", "text-size-large", "text-size-xlarge");
    document.body.classList.add(`text-size-${size}`);
    PREFS.fontSize = size;
    localStorage.setItem("carecompass_font_size", size);

    // Update active radio/button states if in DOM
    document.querySelectorAll("[data-font-size]").forEach(btn => {
      const btnSize = btn.getAttribute("data-font-size");
      if (btnSize === size) {
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      }
    });

    announce(`Text size adjusted to ${size}`);
  }

  /**
   * Toggles high contrast mode
   * @param {boolean} enable 
   */
  function applyHighContrast(enable) {
    if (enable) {
      document.body.classList.add("theme-high-contrast");
    } else {
      document.body.classList.remove("theme-high-contrast");
    }
    PREFS.highContrast = enable;
    localStorage.setItem("carecompass_contrast", enable ? "true" : "false");

    const toggleBtn = document.getElementById("toggle-high-contrast");
    if (toggleBtn) {
      toggleBtn.checked = enable;
      toggleBtn.setAttribute("aria-checked", enable ? "true" : "false");
    }

    announce(enable ? "High contrast mode enabled" : "Standard color theme enabled");
  }

  /**
   * Toggles simple language / simplified readability mode
   * @param {boolean} enable 
   */
  function applySimpleMode(enable) {
    if (enable) {
      document.body.classList.add("mode-simple");
    } else {
      document.body.classList.remove("mode-simple");
    }
    PREFS.simpleMode = enable;
    localStorage.setItem("carecompass_simple_mode", enable ? "true" : "false");

    const toggleBtn = document.getElementById("toggle-simple-mode");
    if (toggleBtn) {
      toggleBtn.checked = enable;
      toggleBtn.setAttribute("aria-checked", enable ? "true" : "false");
    }

    announce(enable ? "Simple reading mode enabled" : "Standard mode enabled");
  }

  /**
   * Toggles reduced motion
   */
  function applyReducedMotion(enable) {
    if (enable) {
      document.body.classList.add("reduced-motion");
    } else {
      document.body.classList.remove("reduced-motion");
    }
    PREFS.reducedMotion = enable;
    localStorage.setItem("carecompass_reduced_motion", enable ? "true" : "false");
  }

  /**
   * Sets up hidden ARIA live region for screen readers
   */
  function setupAnnouncer() {
    if (!document.getElementById("sr-announcer")) {
      const announcer = document.createElement("div");
      announcer.id = "sr-announcer";
      announcer.className = "sr-only";
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      document.body.appendChild(announcer);
    }
  }

  /**
   * Broadcasts a message to assistive technology
   * @param {string} message 
   */
  function announce(message) {
    const el = document.getElementById("sr-announcer");
    if (el) {
      el.textContent = "";
      setTimeout(() => {
        el.textContent = message;
      }, 50);
    }
  }

  /**
   * Sets up keyboard accessibility (Escape to close modals, skip links)
   */
  function setupKeyboardListeners() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAllModals();
      }
    });
  }

  function closeAllModals() {
    document.querySelectorAll(".modal.active, .drawer.active").forEach(m => {
      m.classList.remove("active");
      m.setAttribute("aria-hidden", "true");
      // Return focus to trigger button if available
      const triggerId = m.getAttribute("data-trigger-id");
      if (triggerId) {
        const trigger = document.getElementById(triggerId);
        if (trigger) trigger.focus();
      }
    });
  }

  /**
   * Voice Search implementation with Web Speech API and fallback
   * @param {string} targetInputId 
   * @param {string} micButtonId 
   * @param {Function} [onComplete] 
   */
  function setupVoiceSearch(targetInputId, micButtonId, onComplete) {
    const micBtn = document.getElementById(micButtonId);
    const targetInput = document.getElementById(targetInputId);
    if (!micBtn || !targetInput) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      micBtn.title = "Voice search is not supported by your current browser. Please type your search.";
      micBtn.setAttribute("aria-label", "Voice search unsupported in this browser");
      micBtn.addEventListener("click", () => {
        alert("Voice recognition is not supported in this browser. Please use the keyboard search field.");
      });
      return;
    }

    let recognition = null;
    let isListening = false;

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = I18n.getLang() === "hi" ? "hi-IN" : "en-US";

      recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add("listening");
        micBtn.setAttribute("aria-pressed", "true");
        micBtn.setAttribute("title", "Listening... Speak your healthcare service or facility name");
        announce("Listening for your search query. Please speak now.");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        targetInput.value = transcript;
        announce(`Voice recognized: ${transcript}`);
        if (typeof onComplete === "function") {
          onComplete(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        micBtn.classList.remove("listening");
        micBtn.setAttribute("aria-pressed", "false");
        isListening = false;
        if (event.error === "not-allowed") {
          alert("Microphone permission was denied. Please allow microphone access in your browser or type your search.");
        }
      };

      recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove("listening");
        micBtn.setAttribute("aria-pressed", "false");
        micBtn.setAttribute("title", "Search by voice");
      };

      micBtn.addEventListener("click", () => {
        if (isListening) {
          recognition.stop();
        } else {
          // Update recognition language dynamically based on current language
          recognition.lang = I18n.getLang() === "hi" ? "hi-IN" : "en-US";
          recognition.start();
        }
      });
    } catch (err) {
      console.warn("Speech init failed:", err);
    }
  }

  return {
    init,
    applyFontSize,
    applyHighContrast,
    applySimpleMode,
    applyReducedMotion,
    announce,
    setupVoiceSearch,
    closeAllModals,
    getPreferences: () => ({ ...PREFS })
  };
})();

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  CareCompassA11y.init();
});
