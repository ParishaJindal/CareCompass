/**
 * CareCompass - Healthcare Navigation for Everyone
 * 
 * recommendations.js
 * Core Innovation: Smart Alternative Recommendation Engine.
 * 
 * Transparent, deterministic ranking algorithm (No fake AI claims).
 * Follows the 9-point recommendation logic:
 * 1. Identify relevant facilities offering the requested service.
 * 2. Exclude facilities whose service is confirmed UNAVAILABLE.
 * 3. Prioritize facilities with CONFIRMED AVAILABLE service.
 * 4. Flag unverified options clearly instead of presenting them as confirmed.
 * 5. Factor in distance when reliable location data exists.
 * 6. Match user accessibility preferences (wheelchair, elevator, ground floor).
 * 7. Provide plain-English explanation for why each facility is recommended.
 * 8. Attach validated contact and navigation directions actions.
 * 9. Explicitly advise users to confirm uncertain details before travelling.
 */

const RecommendationEngine = (function() {
  /**
   * Generates prioritized alternative recommendations when a facility lacks a service
   * or when searching for the most suitable provider.
   * 
   * @param {Array} allFacilities - List of facilities from dataset
   * @param {string} serviceQuery - The requested medical service (e.g. 'xray')
   * @param {Object} [options] - Configuration and user preferences
   * @param {string} [options.excludeFacilityId] - ID of facility where service is unavailable
   * @param {Object} [options.accessibilityPreferences] - e.g. { wheelchairRamp: true, elevator: true }
   * @param {number} [options.maxDistanceKm] - Max radius filter
   * @param {string} [options.preferredLocationId] - Preferred locality (e.g. 'central')
   * @returns {Object} Structured recommendation result with top alternative and alternatives list
   */
  function findAlternatives(allFacilities, serviceQuery, options = {}) {
    if (!Array.isArray(allFacilities) || !serviceQuery) {
      return {
        hasAlternatives: false,
        topAlternative: null,
        alternatives: [],
        excludedCount: 0,
        explanation: "No medical service specified for alternative recommendation."
      };
    }

    const {
      excludeFacilityId = null,
      accessibilityPreferences = {},
      maxDistanceKm = null,
      preferredLocationId = null,
      preferredCity = null
    } = options;

    const candidates = [];
    let excludedUnavailableCount = 0;

    // Step 1: Scan all candidates
    for (const facility of allFacilities) {
      // If user is currently looking at a facility where it's unavailable, skip that facility
      if (excludeFacilityId && facility.id === excludeFacilityId) {
        continue;
      }

      // Verify the service status using the standalone Verification Engine
      const verification = VerificationEngine.verifyService(facility, serviceQuery);

      // Step 2: Exclude facilities where service is CONFIRMED UNAVAILABLE or NOT OFFERED
      if (verification.status === VerificationEngine.STATUS.UNAVAILABLE || !verification.hasService) {
        excludedUnavailableCount++;
        continue;
      }

      // Filter by max distance if requested
      if (maxDistanceKm && facility.distanceKm && facility.distanceKm > maxDistanceKm) {
        continue;
      }

      // Step 3 & 4 & 5 & 6: Compute transparent suitability score
      let score = 0;
      const reasons = [];
      const warnings = [];

      // Availability Weighting (Critical Rule: Confirmed Available MUST always outrank Unverified)
      if (verification.status === VerificationEngine.STATUS.AVAILABLE) {
        score += 1000;
        reasons.push(`${verification.serviceName} is confirmed available (${verification.lastVerifiedFormatted})`);
      } else {
        // NOT_VERIFIED: strictly subordinate to confirmed available
        score += 100;
        warnings.push(`Service status is not recently verified (${verification.lastVerifiedFormatted}). Call facility to confirm before travelling.`);
      }

      // Accessibility Preference Matching
      let accessibilityMatches = 0;
      let requestedAccessibilityCount = 0;

      if (accessibilityPreferences) {
        if (accessibilityPreferences.wheelchairRamp) {
          requestedAccessibilityCount++;
          if (facility.accessibility && facility.accessibility.wheelchairRamp) {
            score += 60;
            accessibilityMatches++;
            reasons.push("Has wheelchair ramp access");
          } else {
            score -= 40;
            warnings.push("Wheelchair ramp may not be available");
          }
        }

        if (accessibilityPreferences.elevator) {
          requestedAccessibilityCount++;
          if (facility.accessibility && facility.accessibility.elevator) {
            score += 40;
            accessibilityMatches++;
            reasons.push("Has elevator access");
          }
        }

        if (accessibilityPreferences.groundFloorServices) {
          requestedAccessibilityCount++;
          if (facility.accessibility && facility.accessibility.groundFloorServices) {
            score += 50;
            accessibilityMatches++;
            reasons.push("Ground-floor service access (no stairs needed)");
          }
        }

        if (accessibilityPreferences.accessibleRestroom) {
          requestedAccessibilityCount++;
          if (facility.accessibility && facility.accessibility.accessibleRestroom) {
            score += 30;
            accessibilityMatches++;
            reasons.push("Has accessible restrooms");
          }
        }
      }

      // Operating Hours factor
      if (facility.isOpenNow) {
        score += 50;
        reasons.push("Open now for walk-ins/inquiries");
      } else {
        score -= 80;
        warnings.push("Facility may currently be closed. Check operating hours.");
      }

      // Location & City match bonus (Strongly prioritizes options within the user's searched city)
      if (preferredCity) {
        const normCity = preferredCity.toLowerCase();
        const facCity = (facility.city || "").toLowerCase();
        const facLocId = (facility.locationId || "").toLowerCase();
        const facName = (facility.locationName || "").toLowerCase();
        const facAddress = (facility.address || "").toLowerCase();
        const facAliases = Array.isArray(facility.cityAliases) ? facility.cityAliases.map(a => a.toLowerCase()) : [];

        const isSameCity = facCity.includes(normCity) || 
                           normCity.includes(facCity) || 
                           facLocId === normCity || 
                           facName.includes(normCity) ||
                           facAliases.some(a => a === normCity || normCity.includes(a));

        if (isSameCity) {
          score += 3000;
          reasons.push(`Located in ${facility.city || facility.locationName}`);
        } else {
          score -= 2000; // Deprioritize distant cross-city facilities
        }
      } else if (preferredLocationId && facility.locationId === preferredLocationId) {
        score += 2000;
        reasons.push(`Located in your preferred area (${facility.locationName})`);
      }

      // Distance penalty (5 points per km, gentle slope so close confirmed wins, but never surpasses confirmed status)
      if (facility.distanceKm !== undefined && facility.distanceKm !== null) {
        score -= Math.round(facility.distanceKm * 4);
        reasons.push(`${facility.distanceKm} km away`);
      }

      // Build user-facing transparent reason statement
      let primaryExplanation = "";
      if (verification.status === VerificationEngine.STATUS.AVAILABLE) {
        primaryExplanation = `Recommended because ${verification.serviceName} is confirmed available, the facility is ${facility.isOpenNow ? 'open now' : 'open today'}, and it is ${facility.distanceKm ? facility.distanceKm + ' km away' : 'nearby'}.`;
        if (accessibilityMatches > 0) {
          primaryExplanation += ` Matches ${accessibilityMatches} of your accessibility preferences.`;
        }
      } else {
        primaryExplanation = `Secondary option: ${verification.serviceName} was previously listed but current availability is unconfirmed (${verification.lastVerifiedFormatted}). Call ahead before travelling.`;
      }

      candidates.push({
        facility,
        verification,
        score,
        suitabilityScore: score,
        reasons,
        warnings,
        primaryExplanation,
        isConfirmedAvailable: verification.status === VerificationEngine.STATUS.AVAILABLE,
        isUnverified: verification.status === VerificationEngine.STATUS.NOT_VERIFIED,
        phoneToCall: facility.phone || facility.emergencyPhone,
        directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.name + " " + facility.address)}`
      });
    }

    // Step 7: Sort by calculated suitability score descending
    candidates.sort((a, b) => b.score - a.score);

    const topAlternative = candidates.length > 0 ? candidates[0] : null;

    return {
      hasAlternatives: candidates.length > 0,
      serviceQuery,
      topAlternative,
      alternatives: candidates,
      candidateCount: candidates.length,
      excludedUnavailableCount,
      summaryMessage: topAlternative
        ? (topAlternative.isConfirmedAvailable
            ? `Top recommended alternative: ${topAlternative.facility.name} with confirmed ${topAlternative.verification.serviceName} availability.`
            : `Alternative found with unconfirmed availability: ${topAlternative.facility.name}. Phone confirmation advised.`)
        : "No alternative facilities found currently providing this service in the selected radius."
    };
  }

  return {
    findAlternatives
  };
})();

// Export for Node and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RecommendationEngine };
}
