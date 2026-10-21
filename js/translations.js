/**
 * CareCompass - Healthcare Navigation for Everyone
 * 
 * translations.js
 * Working English and Hindi (हिंदी) dictionary for UI elements,
 * navigation, search controls, status badges, and messages.
 */

const CareCompassTranslations = {
  en: {
    // Brand
    brandName: "CareCompass",
    brandTagline: "Healthcare Navigation for Everyone",
    teamAttribution: "",
    demoDataBadge: "Simulated Demonstration Data",
    emergencyAlert: "In an acute emergency, dial 108 / 102 (Ambulance) or 112 immediately.",

    // Nav
    navHome: "Home",
    navFindCare: "Find Healthcare",
    navHowItWorks: "How It Works",
    navAbout: "About Us",
    navContact: "Contact",
    navFindCareBtn: "Find Care",
    navAccessibilityBtn: "Accessibility",
    navSignIn: "Sign In / Register",
    navAccount: "My Account",

    // Hero
    heroHeadline: "Find the Right Care, Without the Extra Travel.",
    heroSubhead: "Discover healthcare facilities, check verified service information, and find suitable alternatives before you leave home.",
    heroServicePlaceholder: "Enter service (e.g. X-ray, Ultrasound, Blood Test)...",
    heroLocationPlaceholder: "Enter city, locality, or PIN code...",
    heroBtnSearch: "Find Healthcare",
    heroBtnLocation: "Use My Location",
    heroBtnDemo: "Run X-ray Scenario Demo",
    heroNotice: "Note: Service availability may change dynamically. Look for verification timestamps and call ahead for critical needs.",

    // Quick categories
    catHospitals: "Hospitals",
    catHospitalsDesc: "Multi-speciality & emergency care",
    catClinics: "Clinics",
    catClinicsDesc: "Outpatient & family doctors",
    catDiagnostic: "Diagnostic Tests",
    catDiagnosticDesc: "X-ray, MRI, blood tests & pathology",
    catPharmacies: "Pharmacies",
    catPharmaciesDesc: "24/7 medicines & prescriptions",
    catEmergency: "Emergency Care",
    catEmergencyDesc: "Trauma, ICU & casualty services",
    catSpecialists: "Specialist Doctors",
    catSpecialistsDesc: "Cardiology, pediatrics & more",

    // How it works
    howItWorksTitle: "How CareCompass Works",
    step1Title: "1. Search for a Medical Service",
    step1Desc: "Type the specific procedure you need, like an X-ray or pediatric consult, along with your location.",
    step2Title: "2. Check Service Verification",
    step2Desc: "See verified availability indicators, recent timestamps, and avoid facilities with broken equipment.",
    step3Title: "3. Choose or Find Alternatives",
    step3Desc: "If your closest facility lacks the service, our engine instantly recommends confirmed nearby alternatives.",

    // Trust & Innovation
    trustTitle: "Why Service Verification Matters",
    trustHospitalOpenTitle: "A hospital being open ≠ service is available",
    trustHospitalOpenDesc: "General operating hours don't guarantee that the radiologist is on duty or that the X-ray machine isn't undergoing calibration.",
    trustFreshnessTitle: "Information Freshness Auditing",
    trustFreshnessDesc: "We track the exact timestamp and source of every service report. Records older than 14 days are clearly flagged as unverified.",
    trustAlternativesTitle: "Transparent Smart Routing",
    trustAlternativesDesc: "We never invent ratings or pretend to use black-box AI. We rank alternatives strictly by confirmed availability, accessibility, and proximity.",

    // Search Page
    searchPageTitle: "Healthcare Services & Facilities Directory",
    searchFilterTitle: "Refine Results",
    filterAvailability: "Availability Status",
    filterAll: "All Statuses",
    filterConfirmedAvailable: "Confirmed Available Only",
    filterUnverified: "Include Unverified",
    filterDistance: "Maximum Distance",
    filterDistanceAny: "Any Distance",
    filterFacilityType: "Facility Type",
    filterAllTypes: "All Facility Types",
    filterAccessibility: "Accessibility Needs",
    filterWheelchair: "Wheelchair Ramp Access",
    filterElevator: "Elevator / Lift Available",
    filterGroundFloor: "Ground Floor Services",
    filterRestroom: "Accessible Restroom",
    filterOpenNow: "Open Now Only",
    sortBy: "Sort By",
    sortSuitable: "Most Suitable (Availability & Access)",
    sortNearest: "Nearest Distance",
    sortAvailableFirst: "Confirmed Available First",

    // Status Badges
    statusAvailable: "CONFIRMED AVAILABLE",
    statusUnavailable: "CONFIRMED UNAVAILABLE",
    statusUnverified: "NOT VERIFIED",

    // Facility Cards
    cardViewDetails: "View Details",
    cardGetDirections: "Get Directions",
    cardCallFacility: "Call to Confirm",
    cardReportOutdated: "Report Outdated Info",
    cardLastVerified: "Last verified",
    cardOpenNow: "Open Now",
    cardClosed: "Currently Closed",

    // Demo Scenario Banner
    demoBannerTitle: "Demonstration Scenario Active: X-ray Search in Central District",
    demoBannerDesc: "Notice that CityCare Hospital (closest) is confirmed UNAVAILABLE due to maintenance. CareCompass automatically recommends Sunrise Diagnostic Centre as the best confirmed alternative, while flagging Green Valley Clinic as unverified.",

    // Alternative Box
    altBoxTitle: "Smart Alternative Recommendation",
    altRecommendedBecause: "Recommended because",

    // Accessibility Modal
    accessTitle: "Accessibility Settings",
    accessTextSize: "Text Size",
    accessNormal: "Normal (100%)",
    accessLarge: "Large (115%)",
    accessXLarge: "Extra Large (130%)",
    accessContrast: "High Contrast Mode",
    accessContrastOn: "Enabled (Navy & High Contrast Yellow)",
    accessContrastOff: "Standard Theme",
    accessSimpleMode: "Simple Reading Mode",
    accessClose: "Close Settings",

    // Footer
    footerAboutUs: "About Us",
    footerContact: "Contact Support",
    footerFeedback: "Report Outdated Info",
    footerPrivacy: "Privacy Policy",
    footerAccessibility: "Accessibility Statement",
    footerDisclaimer: "Medical Disclaimer: CareCompass is an informational directory and verification service. In medical emergencies, immediately contact local emergency services (108 / 112)."
  },

  hi: {
    // Brand
    brandName: "केयरकम्पास (CareCompass)",
    brandTagline: "सभी के लिए सुलभ स्वास्थ्य सेवा नेविगेशन",
    teamAttribution: "",
    demoDataBadge: "प्रदर्शनात्मक काल्पनिक डेटा",
    emergencyAlert: "आपातकालीन स्थिति में तुरंत 108 / 102 (एम्बुलेंस) या 112 पर कॉल करें।",

    // Nav
    navHome: "मुख्य पृष्ठ",
    navFindCare: "स्वास्थ्य सेवा खोजें",
    navHowItWorks: "यह कैसे काम करता है",
    navAbout: "हमारे बारे में",
    navContact: "संपर्क करें",
    navFindCareBtn: "सेवा खोजें",
    navAccessibilityBtn: "सुलभता (Accessibility)",
    navSignIn: "साइन इन / रजिस्टर",
    navAccount: "मेरा खाता",

    // Hero
    heroHeadline: "सही स्वास्थ्य सेवा पाएं, बिना अतिरिक्त भटके।",
    heroSubhead: "घर से निकलने से पहले अस्पतालों की जांच करें, सेवाओं की पुष्टि देखें और उपयुक्त विकल्प खोजें।",
    heroServicePlaceholder: "सेवा दर्ज करें (जैसे: एक्स-रे, अल्ट्रासाउंड, ब्लड टेस्ट)...",
    heroLocationPlaceholder: "शहर, इलाका या पिन कोड दर्ज करें...",
    heroBtnSearch: "स्वास्थ्य सेवा खोजें",
    heroBtnLocation: "मेरी लोकेशन उपयोग करें",
    heroBtnDemo: "एक्स-रे डेमो परिदृश्य चलाएं",
    heroNotice: "सूचना: सेवाओं की उपलब्धता बदल सकती है। हमेशा सत्यापन समय देखें और यात्रा से पहले पुष्टि करें।",

    // Quick categories
    catHospitals: "अस्पताल",
    catHospitalsDesc: "मल्टी-स्पेशियलिटी और आपातकालीन सेवा",
    catClinics: "क्लिनिक",
    catClinicsDesc: "ओपीडी और पारिवारिक चिकित्सक",
    catDiagnostic: "जांच एवं टेस्ट",
    catDiagnosticDesc: "एक्स-रे, एमआरआई, रक्त परीक्षण व पैथोलॉजी",
    catPharmacies: "दवा की दुकानें (फार्मेसी)",
    catPharmaciesDesc: "24/7 आवश्यक दवाएं और नुस्खे",
    catEmergency: "आपातकालीन देखभाल",
    catEmergencyDesc: "ट्रॉमा, आईसीयू और आकस्मिक सेवाएं",
    catSpecialists: "विशेषज्ञ डॉक्टर",
    catSpecialistsDesc: "हृदय रोग, बाल रोग एवं अन्य विशेषज्ञ",

    // How it works
    howItWorksTitle: "केयरकम्पास कैसे काम करता है",
    step1Title: "1. चिकित्सा सेवा खोजें",
    step1Desc: "अपनी आवश्यक जांच या सेवा (जैसे एक्स-रे) और अपने क्षेत्र का नाम दर्ज करें।",
    step2Title: "2. सेवा सत्यापन की पुष्टि करें",
    step2Desc: "जांचें कि सेवा वास्तव में उपलब्ध है या मशीन खराब होने के कारण बंद है।",
    step3Title: "3. सही केंद्र चुनें या विकल्प पाएं",
    step3Desc: "यदि निकटतम केंद्र पर सेवा अनुपलब्ध है, तो हमारा सिस्टम प्रमाणित विकल्प तुरंत सुझाता है।",

    // Trust & Innovation
    trustTitle: "सेवा सत्यापन क्यों आवश्यक है?",
    trustHospitalOpenTitle: "अस्पताल खुला होने का अर्थ हर सेवा उपलब्ध होना नहीं है",
    trustHospitalOpenDesc: "सामान्य समय खुला होने पर भी हो सकता है कि एक्स-रे मशीन मरम्मत में हो या रेडियोलॉजिस्ट अनुपस्थित हो।",
    trustFreshnessTitle: "जानकारी की ताजगी का ऑडिट",
    trustFreshnessDesc: "हम प्रत्येक सेवा रिपोर्ट के समय और स्रोत को ट्रैक करते हैं। 14 दिन से पुरानी जानकारी को असत्यापित दर्शाया जाता है।",
    trustAlternativesTitle: "पारदर्शी और सुरक्षित अनुशंसाएं",
    trustAlternativesDesc: "हम किसी गुप्त या फर्जी एआई का दावा नहीं करते। हम वास्तविक पुष्टि, सुलभता और दूरी के आधार पर विकल्प सुझाते हैं।",

    // Search Page
    searchPageTitle: "स्वास्थ्य सेवाएं एवं केंद्र निर्देशिका",
    searchFilterTitle: "परिणाम फ़िल्टर करें",
    filterAvailability: "उपलब्धता स्थिति",
    filterAll: "सभी स्थितियां",
    filterConfirmedAvailable: "केवल प्रमाणित उपलब्ध",
    filterUnverified: "असत्यापित भी शामिल करें",
    filterDistance: "अधिकतम दूरी",
    filterDistanceAny: "कोई भी दूरी",
    filterFacilityType: "केंद्र का प्रकार",
    filterAllTypes: "सभी प्रकार के केंद्र",
    filterAccessibility: "सुलभता आवश्यकताएं",
    filterWheelchair: "व्हीलचेयर रैंप सुविधा",
    filterElevator: "लिफ्ट उपलब्ध",
    filterGroundFloor: "भूतल पर सेवाएं",
    filterRestroom: "सुलभ शौचालय",
    filterOpenNow: "केवल अभी खुले केंद्र",
    sortBy: "क्रमबद्ध करें",
    sortSuitable: "सर्वाधिक उपयुक्त (उपलब्धता और सुलभता)",
    sortNearest: "निकटतम दूरी",
    sortAvailableFirst: "प्रमाणित उपलब्ध पहले",

    // Status Badges
    statusAvailable: "प्रमाणित उपलब्ध",
    statusUnavailable: "पुष्टित अनुपलब्ध",
    statusUnverified: "सत्यापन बाकी",

    // Facility Cards
    cardViewDetails: "पूर्ण विवरण देखें",
    cardGetDirections: "दिशा-निर्देश (रास्ता)",
    cardCallFacility: "पुष्टि हेतु कॉल करें",
    cardReportOutdated: "गलत जानकारी रिपोर्ट करें",
    cardLastVerified: "अंतिम सत्यापन",
    cardOpenNow: "अभी खुला है",
    cardClosed: "वर्तमान में बंद है",

    // Demo Scenario Banner
    demoBannerTitle: "डेमो परिदृश्य सक्रिय: सेंट्रल डिस्ट्रिक्ट में एक्स-रे खोज",
    demoBannerDesc: "ध्यान दें: सिटीकेयर अस्पताल सबसे निकट है, किंतु रखरखाव के कारण एक्स-रे अनुपलब्ध है। केयरकम्पास सनराइज डायग्नोस्टिक को प्रमाणित विकल्प के रूप में सुझाता है।",

    // Alternative Box
    altBoxTitle: "सुझाया गया प्रमाणित विकल्प",
    altRecommendedBecause: "सुझाव का कारण",

    // Accessibility Modal
    accessTitle: "सुलभता सेटिंग्स (Accessibility)",
    accessTextSize: "फ़ॉन्ट का आकार",
    accessNormal: "सामान्य (100%)",
    accessLarge: "बड़ा (115%)",
    accessXLarge: "अति बड़ा (130%)",
    accessContrast: "हाई कॉन्ट्रास्ट मोड",
    accessContrastOn: "सक्रिय (नेवी और चमकीला पीला)",
    accessContrastOff: "सामान्य थीम",
    accessSimpleMode: "सरल वाचन मोड",
    accessClose: "सेटिंग्स बंद करें",

    // Footer
    footerAboutUs: "हमारे बारे में",
    footerContact: "सहायता संपर्क",
    footerFeedback: "जानकारी रिपोर्ट करें",
    footerPrivacy: "गोपनीयता नीति",
    footerAccessibility: "सुलभता विवरण",
    footerDisclaimer: "चिकित्सा अस्वीकरण: केयरकम्पास एक सूचनात्मक निर्देशिका है। आपातकाल में तुरंत 108 या 112 पर कॉल करें।"
  }
};

const I18n = (function() {
  let currentLang = localStorage.getItem("carecompass_lang") || "en";

  function getLang() {
    return currentLang;
  }

  function setLang(lang) {
    if (CareCompassTranslations[lang]) {
      currentLang = lang;
      localStorage.setItem("carecompass_lang", lang);
      document.documentElement.lang = lang;
      applyTranslations();
      window.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang } }));
    }
  }

  function t(key) {
    const dict = CareCompassTranslations[currentLang] || CareCompassTranslations.en;
    return dict[key] || CareCompassTranslations.en[key] || key;
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (val) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          if (el.hasAttribute("placeholder")) {
            el.setAttribute("placeholder", val);
          }
        } else {
          el.textContent = val;
        }
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      const val = t(key);
      if (val) {
        el.setAttribute("placeholder", val);
      }
    });

    document.querySelectorAll("[data-i18n-title]").forEach(el => {
      const key = el.getAttribute("data-i18n-title");
      const val = t(key);
      if (val) {
        el.setAttribute("title", val);
      }
    });

    // Update active lang button states
    document.querySelectorAll(".lang-switch-btn").forEach(btn => {
      if (btn.getAttribute("data-lang") === currentLang) {
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      }
    });
  }

  return {
    getLang,
    setLang,
    t,
    applyTranslations
  };
})();

// Auto-initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  I18n.applyTranslations();
});
