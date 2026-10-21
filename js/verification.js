/**
 * CareCompass - Healthcare Navigation for Everyone
 * 
 * verification.js
 * Core Innovation: Smart Healthcare Service Verification Engine.
 * 
 * Independent, reusable verification logic decoupled from the UI.
 * Enforces the 3-state verification contract:
 * - AVAILABLE: Confirmed available by recent, reliable source
 * - UNAVAILABLE: Confirmed unavailable (broken equipment, off-duty specialist, bed shortage)
 * - NOT_VERIFIED: Information absent, stale (> 14 days), or third-party unconfirmed
 */

const VerificationEngine = (function() {
  // Formal verification status definitions
  const STATUS = {
    AVAILABLE: "AVAILABLE",
    UNAVAILABLE: "UNAVAILABLE",
    NOT_VERIFIED: "NOT_VERIFIED"
  };

  // Freshness thresholds in days
  const THRESHOLDS = {
    FRESH_DAYS: 3,       // Under 3 days = Freshly verified
    ACCEPTABLE_DAYS: 14, // 3 - 14 days = Recently verified
    STALE_DAYS: 14       // > 14 days = Stale / downgrade to NOT_VERIFIED unless authoritative
  };

  /**
   * Calculates the difference in time and assesses freshness
   * @param {string} isoTimestamp - ISO date string
   * @param {Date} [referenceDate] - Current date or override for testing
   * @returns {Object} Freshness details
   */
  function assessFreshness(isoTimestamp, referenceDate = new Date("2026-10-15T12:00:00Z")) {
    if (!isoTimestamp) {
      return {
        daysAgo: null,
        hoursAgo: null,
        isStale: true,
        freshnessTier: "UNKNOWN",
        formatted: "Date unknown"
      };
    }

    const verifiedDate = new Date(isoTimestamp);
    const diffMs = referenceDate.getTime() - verifiedDate.getTime();
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const diffDays = Math.floor(diffHours / 24);

    let formatted = "";
    if (diffHours < 1) {
      formatted = "Just now (< 1 hour ago)";
    } else if (diffHours < 24) {
      formatted = `Today (${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago)`;
    } else if (diffDays === 1) {
      formatted = "Yesterday";
    } else if (diffDays <= 30) {
      formatted = `${diffDays} days ago`;
    } else {
      formatted = `${diffDays} days ago (${verifiedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`;
    }

    const isStale = diffDays > THRESHOLDS.STALE_DAYS;
    let freshnessTier = "FRESH";
    if (diffDays > THRESHOLDS.ACCEPTABLE_DAYS) {
      freshnessTier = "STALE";
    } else if (diffDays > THRESHOLDS.FRESH_DAYS) {
      freshnessTier = "RECENT";
    }

    return {
      daysAgo: diffDays,
      hoursAgo: diffHours,
      isStale,
      freshnessTier,
      formatted,
      verifiedDate
    };
  }

  /**
   * Evaluates the verification state of a specific service at a facility
   * @param {Object} facility - Facility object from dataset
   * @param {string} serviceQuery - Service id or keyword (e.g. 'xray', 'blood_test')
   * @returns {Object} Detailed verification report
   */
  function verifyService(facility, serviceQuery) {
    const facServices = (facility && (facility.services || facility.verifiedServices)) || [];
    if (!facility || !Array.isArray(facServices) || facServices.length === 0) {
      return {
        hasService: false,
        status: STATUS.NOT_VERIFIED,
        label: "NOT VERIFIED",
        badgeClass: "badge-unverified",
        summaryText: "Facility services directory not indexed.",
        isSafeToTravel: false,
        warningBanner: "No service information available. Contact facility before travelling."
      };
    }

    if (!serviceQuery) {
      // General facility inquiry without specific service
      return {
        hasService: true,
        status: facility.isOpenNow ? STATUS.AVAILABLE : STATUS.UNAVAILABLE,
        label: facility.isOpenNow ? "FACILITY OPEN" : "CLOSED NOW",
        badgeClass: facility.isOpenNow ? "badge-available" : "badge-unavailable",
        summaryText: facility.operatingHours || "Check operating hours",
        isSafeToTravel: facility.isOpenNow,
        warningBanner: null
      };
    }

    const normQuery = serviceQuery.toLowerCase().trim().replace(/[-\s]/g, "");

    // Search facility services matching id or name
    const matchedService = facServices.find(s => {
      const normId = (s.serviceId || "").toLowerCase().replace(/[-\s]/g, "");
      const normName = (s.name || "").toLowerCase().replace(/[-\s]/g, "");
      return normId.includes(normQuery) || normName.includes(normQuery) || normQuery.includes(normId);
    });

    if (!matchedService) {
      // Facility does not list this service at all
      return {
        hasService: false,
        serviceName: serviceQuery,
        status: STATUS.UNAVAILABLE,
        label: "SERVICE NOT OFFERED",
        badgeClass: "badge-unavailable",
        reason: `${facility.name} does not offer ${serviceQuery} services.`,
        isSafeToTravel: false,
        warningBanner: `Warning: ${serviceQuery} is not provided by this facility. Please choose an alternative.`
      };
    }

    // Service exists in listing. Now inspect reported status and freshness!
    const freshness = assessFreshness(matchedService.lastVerified);
    let finalStatus = matchedService.status || STATUS.NOT_VERIFIED;
    let autoDowngraded = false;

    // Rule: Hospital being open does NOT mean service is available!
    // Rule: An old listing (> 14 days) CANNOT be treated as proof of current availability!
    if (finalStatus === STATUS.AVAILABLE && freshness.isStale) {
      finalStatus = STATUS.NOT_VERIFIED;
      autoDowngraded = true;
    }

    let badgeClass = "badge-unverified";
    let label = "NOT VERIFIED";
    let isSafeToTravel = false;
    let warningBanner = null;

    if (finalStatus === STATUS.AVAILABLE) {
      badgeClass = "badge-available";
      label = "CONFIRMED AVAILABLE";
      isSafeToTravel = true;
    } else if (finalStatus === STATUS.UNAVAILABLE) {
      badgeClass = "badge-unavailable";
      label = "CONFIRMED UNAVAILABLE";
      isSafeToTravel = false;
      warningBanner = `SERVICE UNAVAILABLE: ${matchedService.statusReason || "Facility confirmed this service is not operating today."} Do NOT travel here for this service!`;
    } else {
      badgeClass = "badge-unverified";
      label = "NOT VERIFIED";
      isSafeToTravel = false;
      warningBanner = autoDowngraded
        ? `OUTDATED RECORD: Verification expired ${freshness.daysAgo} days ago. Current availability cannot be guaranteed. Call ahead.`
        : `UNVERIFIED AVAILABILITY: ${matchedService.statusReason || "Recent operational status is unconfirmed."} Call ahead to confirm before travelling.`;
    }

    return {
      hasService: true,
      serviceId: matchedService.serviceId,
      serviceName: matchedService.name,
      status: finalStatus,
      rawStatus: matchedService.status,
      autoDowngraded,
      label,
      badgeClass,
      reason: matchedService.statusReason,
      operationalNotes: matchedService.operationalNotes,
      lastVerified: matchedService.lastVerified,
      lastVerifiedFormatted: freshness.formatted,
      verifiedBy: matchedService.verifiedBy || "Desk Listing",
      sourceType: matchedService.sourceType || "UNKNOWN",
      freshness,
      isSafeToTravel,
      warningBanner,
      estimatedWait: matchedService.estimatedWaitHours || null
    };
  }

  /**
   * Generates a human-readable explanation of why a service is rated as it is
   */
  function explainVerification(verificationResult) {
    if (!verificationResult) return "";
    if (verificationResult.status === STATUS.AVAILABLE) {
      return `Confirmed available by ${verificationResult.verifiedBy} (${verificationResult.lastVerifiedFormatted}).`;
    }
    if (verificationResult.status === STATUS.UNAVAILABLE) {
      return `Confirmed unavailable: ${verificationResult.reason || "Equipment/staff downtime"}.`;
    }
    return `Unverified: Last checked ${verificationResult.lastVerifiedFormatted}. Reliable confirmation needed before travelling.`;
  }

  return {
    STATUS,
    THRESHOLDS,
    assessFreshness,
    verifyService,
    explainVerification
  };
})();

// Export for Node and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VerificationEngine };
}
