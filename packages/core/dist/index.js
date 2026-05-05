"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ApiClient: () => ApiClient,
  DisclosureClaim: () => DisclosureClaim,
  DisclosureProfiles: () => DisclosureProfiles,
  DocumentType: () => DocumentType,
  KoraError: () => KoraError,
  KoraErrorCode: () => KoraErrorCode,
  KoraIDV: () => KoraIDV,
  KoraWallet: () => KoraWallet,
  MrzParser: () => MrzParser,
  QualityValidator: () => QualityValidator,
  WalletCredentialStore: () => WalletCredentialStore,
  WalletError: () => WalletError,
  WalletPresentationBuilder: () => WalletPresentationBuilder,
  WebBarcodeScanner: () => WebBarcodeScanner,
  applyDisclosure: () => applyDisclosure,
  blobToBase64: () => blobToBase64,
  computeAgeOver18: () => computeAgeOver18,
  createWalletCredential: () => createWalletCredential,
  getDocumentTypeInfo: () => getDocumentTypeInfo
});
module.exports = __toCommonJS(index_exports);

// src/types/DocumentType.ts
var DocumentType = /* @__PURE__ */ ((DocumentType2) => {
  DocumentType2["US_DRIVERS_LICENSE"] = "us_drivers_license";
  DocumentType2["US_STATE_ID"] = "us_state_id";
  DocumentType2["US_GREEN_CARD"] = "us_green_card";
  DocumentType2["INTERNATIONAL_PASSPORT"] = "international_passport";
  DocumentType2["EU_ID_GERMANY"] = "eu_id_de";
  DocumentType2["EU_ID_FRANCE"] = "eu_id_fr";
  DocumentType2["EU_ID_SPAIN"] = "eu_id_es";
  DocumentType2["EU_ID_ITALY"] = "eu_id_it";
  DocumentType2["GHANA_CARD"] = "ghana_card";
  DocumentType2["NIGERIA_NIN"] = "ng_nin";
  DocumentType2["NIGERIA_DRIVERS_LICENSE"] = "ng_drivers_license";
  DocumentType2["GHANA_DRIVERS_LICENSE"] = "gh_drivers_license";
  DocumentType2["KENYA_ID"] = "ke_id";
  DocumentType2["KENYA_DRIVERS_LICENSE"] = "ke_drivers_license";
  DocumentType2["SOUTH_AFRICA_ID"] = "za_id";
  DocumentType2["SOUTH_AFRICA_DRIVERS_LICENSE"] = "za_drivers_license";
  DocumentType2["UK_DRIVERS_LICENSE"] = "uk_drivers_license";
  DocumentType2["NIGERIA_VOTERS_CARD"] = "ng_voters_card";
  DocumentType2["LIBERIA_ID"] = "lr_id";
  DocumentType2["LIBERIA_DRIVERS_LICENSE"] = "lr_drivers_license";
  DocumentType2["LIBERIA_VOTERS_CARD"] = "lr_voters_card";
  DocumentType2["SIERRA_LEONE_ID"] = "sl_id";
  DocumentType2["SIERRA_LEONE_DRIVERS_LICENSE"] = "sl_drivers_license";
  DocumentType2["SIERRA_LEONE_VOTERS_CARD"] = "sl_voters_card";
  DocumentType2["GAMBIA_ID"] = "gm_id";
  DocumentType2["GAMBIA_DRIVERS_LICENSE"] = "gm_drivers_license";
  DocumentType2["UK_BRP"] = "uk_brp";
  DocumentType2["CANADA_DRIVERS_LICENSE"] = "ca_drivers_license";
  DocumentType2["CANADA_PR_CARD"] = "ca_pr_card";
  DocumentType2["CANADA_NATIONAL_ID"] = "ca_national_id";
  DocumentType2["INDIA_DRIVERS_LICENSE"] = "in_drivers_license";
  DocumentType2["GERMANY_RP"] = "de_rp";
  DocumentType2["FRANCE_RP"] = "fr_rp";
  DocumentType2["ITALY_RP"] = "it_rp";
  DocumentType2["SPAIN_RP"] = "es_rp";
  DocumentType2["IRELAND_RP"] = "ie_rp";
  DocumentType2["PORTUGAL_RP"] = "pt_rp";
  DocumentType2["SWEDEN_RP"] = "se_rp";
  DocumentType2["DENMARK_RP"] = "dk_rp";
  DocumentType2["NORWAY_RP"] = "no_rp";
  DocumentType2["FINLAND_RP"] = "fi_rp";
  DocumentType2["POLAND_RP"] = "pl_rp";
  return DocumentType2;
})(DocumentType || {});
function getDocumentTypeInfo(type) {
  const info = {
    ["us_drivers_license" /* US_DRIVERS_LICENSE */]: {
      code: "us_drivers_license" /* US_DRIVERS_LICENSE */,
      displayName: "US Driver's License",
      hasMRZ: false,
      requiresBack: true
    },
    ["us_state_id" /* US_STATE_ID */]: {
      code: "us_state_id" /* US_STATE_ID */,
      displayName: "US State ID",
      hasMRZ: false,
      requiresBack: true
    },
    ["us_green_card" /* US_GREEN_CARD */]: {
      code: "us_green_card" /* US_GREEN_CARD */,
      displayName: "US Permanent Resident Card",
      hasMRZ: true,
      requiresBack: true
    },
    ["international_passport" /* INTERNATIONAL_PASSPORT */]: {
      code: "international_passport" /* INTERNATIONAL_PASSPORT */,
      displayName: "International Passport",
      hasMRZ: true,
      requiresBack: false
    },
    ["eu_id_de" /* EU_ID_GERMANY */]: {
      code: "eu_id_de" /* EU_ID_GERMANY */,
      displayName: "German ID Card",
      hasMRZ: true,
      requiresBack: true
    },
    ["eu_id_fr" /* EU_ID_FRANCE */]: {
      code: "eu_id_fr" /* EU_ID_FRANCE */,
      displayName: "French ID Card",
      hasMRZ: true,
      requiresBack: true
    },
    ["eu_id_es" /* EU_ID_SPAIN */]: {
      code: "eu_id_es" /* EU_ID_SPAIN */,
      displayName: "Spanish ID Card",
      hasMRZ: true,
      requiresBack: true
    },
    ["eu_id_it" /* EU_ID_ITALY */]: {
      code: "eu_id_it" /* EU_ID_ITALY */,
      displayName: "Italian ID Card",
      hasMRZ: true,
      requiresBack: true
    },
    ["ghana_card" /* GHANA_CARD */]: {
      code: "ghana_card" /* GHANA_CARD */,
      displayName: "Ghana Card",
      hasMRZ: false,
      requiresBack: false
    },
    ["ng_nin" /* NIGERIA_NIN */]: {
      code: "ng_nin" /* NIGERIA_NIN */,
      displayName: "Nigeria NIN",
      hasMRZ: false,
      requiresBack: false
    },
    ["ke_id" /* KENYA_ID */]: {
      code: "ke_id" /* KENYA_ID */,
      displayName: "Kenya ID",
      hasMRZ: false,
      requiresBack: true
    },
    ["za_id" /* SOUTH_AFRICA_ID */]: {
      code: "za_id" /* SOUTH_AFRICA_ID */,
      displayName: "South Africa ID",
      hasMRZ: false,
      requiresBack: false
    },
    ["ng_drivers_license" /* NIGERIA_DRIVERS_LICENSE */]: {
      code: "ng_drivers_license" /* NIGERIA_DRIVERS_LICENSE */,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true
    },
    ["gh_drivers_license" /* GHANA_DRIVERS_LICENSE */]: {
      code: "gh_drivers_license" /* GHANA_DRIVERS_LICENSE */,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true
    },
    ["ke_drivers_license" /* KENYA_DRIVERS_LICENSE */]: {
      code: "ke_drivers_license" /* KENYA_DRIVERS_LICENSE */,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true
    },
    ["za_drivers_license" /* SOUTH_AFRICA_DRIVERS_LICENSE */]: {
      code: "za_drivers_license" /* SOUTH_AFRICA_DRIVERS_LICENSE */,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true
    },
    ["uk_drivers_license" /* UK_DRIVERS_LICENSE */]: {
      code: "uk_drivers_license" /* UK_DRIVERS_LICENSE */,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true
    },
    ["ca_drivers_license" /* CANADA_DRIVERS_LICENSE */]: {
      code: "ca_drivers_license" /* CANADA_DRIVERS_LICENSE */,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true
    },
    ["ca_pr_card" /* CANADA_PR_CARD */]: {
      code: "ca_pr_card" /* CANADA_PR_CARD */,
      displayName: "Canadian Permanent Resident Card",
      hasMRZ: true,
      requiresBack: true
    },
    ["ca_national_id" /* CANADA_NATIONAL_ID */]: {
      code: "ca_national_id" /* CANADA_NATIONAL_ID */,
      displayName: "Canadian National Identity Card",
      hasMRZ: true,
      requiresBack: false
    },
    ["in_drivers_license" /* INDIA_DRIVERS_LICENSE */]: {
      code: "in_drivers_license" /* INDIA_DRIVERS_LICENSE */,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true
    },
    ["ng_voters_card" /* NIGERIA_VOTERS_CARD */]: {
      code: "ng_voters_card" /* NIGERIA_VOTERS_CARD */,
      displayName: "Voter's Card",
      hasMRZ: false,
      requiresBack: true
    },
    ["lr_id" /* LIBERIA_ID */]: {
      code: "lr_id" /* LIBERIA_ID */,
      displayName: "Liberia ID",
      hasMRZ: false,
      requiresBack: true
    },
    ["lr_drivers_license" /* LIBERIA_DRIVERS_LICENSE */]: {
      code: "lr_drivers_license" /* LIBERIA_DRIVERS_LICENSE */,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true
    },
    ["lr_voters_card" /* LIBERIA_VOTERS_CARD */]: {
      code: "lr_voters_card" /* LIBERIA_VOTERS_CARD */,
      displayName: "Voter's Card",
      hasMRZ: false,
      requiresBack: true
    },
    ["sl_id" /* SIERRA_LEONE_ID */]: {
      code: "sl_id" /* SIERRA_LEONE_ID */,
      displayName: "Sierra Leone ID",
      hasMRZ: false,
      requiresBack: true
    },
    ["sl_drivers_license" /* SIERRA_LEONE_DRIVERS_LICENSE */]: {
      code: "sl_drivers_license" /* SIERRA_LEONE_DRIVERS_LICENSE */,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true
    },
    ["sl_voters_card" /* SIERRA_LEONE_VOTERS_CARD */]: {
      code: "sl_voters_card" /* SIERRA_LEONE_VOTERS_CARD */,
      displayName: "Voter's Card",
      hasMRZ: false,
      requiresBack: true
    },
    ["gm_id" /* GAMBIA_ID */]: {
      code: "gm_id" /* GAMBIA_ID */,
      displayName: "Gambia ID",
      hasMRZ: false,
      requiresBack: true
    },
    ["gm_drivers_license" /* GAMBIA_DRIVERS_LICENSE */]: {
      code: "gm_drivers_license" /* GAMBIA_DRIVERS_LICENSE */,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true
    },
    ["uk_brp" /* UK_BRP */]: {
      code: "uk_brp" /* UK_BRP */,
      displayName: "UK Biometric Residence Permit",
      hasMRZ: true,
      requiresBack: true
    },
    ["de_rp" /* GERMANY_RP */]: {
      code: "de_rp" /* GERMANY_RP */,
      displayName: "Germany Residence Permit",
      hasMRZ: true,
      requiresBack: true
    },
    ["fr_rp" /* FRANCE_RP */]: {
      code: "fr_rp" /* FRANCE_RP */,
      displayName: "France Residence Permit",
      hasMRZ: true,
      requiresBack: true
    },
    ["it_rp" /* ITALY_RP */]: {
      code: "it_rp" /* ITALY_RP */,
      displayName: "Italy Residence Permit",
      hasMRZ: true,
      requiresBack: true
    },
    ["es_rp" /* SPAIN_RP */]: {
      code: "es_rp" /* SPAIN_RP */,
      displayName: "Spain Residence Permit",
      hasMRZ: true,
      requiresBack: true
    },
    ["ie_rp" /* IRELAND_RP */]: {
      code: "ie_rp" /* IRELAND_RP */,
      displayName: "Ireland Residence Permit",
      hasMRZ: true,
      requiresBack: true
    },
    ["pt_rp" /* PORTUGAL_RP */]: {
      code: "pt_rp" /* PORTUGAL_RP */,
      displayName: "Portugal Residence Permit",
      hasMRZ: true,
      requiresBack: true
    },
    ["se_rp" /* SWEDEN_RP */]: {
      code: "se_rp" /* SWEDEN_RP */,
      displayName: "Sweden Residence Permit",
      hasMRZ: true,
      requiresBack: true
    },
    ["dk_rp" /* DENMARK_RP */]: {
      code: "dk_rp" /* DENMARK_RP */,
      displayName: "Denmark Residence Permit",
      hasMRZ: true,
      requiresBack: true
    },
    ["no_rp" /* NORWAY_RP */]: {
      code: "no_rp" /* NORWAY_RP */,
      displayName: "Norway Residence Permit",
      hasMRZ: true,
      requiresBack: true
    },
    ["fi_rp" /* FINLAND_RP */]: {
      code: "fi_rp" /* FINLAND_RP */,
      displayName: "Finland Residence Permit",
      hasMRZ: true,
      requiresBack: true
    },
    ["pl_rp" /* POLAND_RP */]: {
      code: "pl_rp" /* POLAND_RP */,
      displayName: "Poland Residence Permit",
      hasMRZ: true,
      requiresBack: true
    }
  };
  return info[type];
}

// src/types/Configuration.ts
var environmentUrls = {
  production: "https://api.korastratum.com/api/v1/idv",
  sandbox: "https://koraidv-identity-sandbox-626704085312.us-central1.run.app/api/v1"
};
var defaultTheme = {
  primaryColor: "#2563EB",
  backgroundColor: "#FFFFFF",
  surfaceColor: "#F8FAFC",
  textColor: "#1E293B",
  secondaryTextColor: "#64748B",
  errorColor: "#DC2626",
  successColor: "#16A34A",
  borderRadius: 12
};
var defaultConfiguration = {
  environment: "production",
  documentTypes: Object.values(DocumentType),
  livenessMode: "active",
  theme: defaultTheme,
  locale: { language: "en" },
  timeout: 600,
  debugLogging: false
};

// src/types/KoraError.ts
var KoraErrorCode = /* @__PURE__ */ ((KoraErrorCode2) => {
  KoraErrorCode2["NOT_CONFIGURED"] = "NOT_CONFIGURED";
  KoraErrorCode2["INVALID_API_KEY"] = "INVALID_API_KEY";
  KoraErrorCode2["INVALID_TENANT_ID"] = "INVALID_TENANT_ID";
  KoraErrorCode2["NETWORK_ERROR"] = "NETWORK_ERROR";
  KoraErrorCode2["TIMEOUT"] = "TIMEOUT";
  KoraErrorCode2["NO_INTERNET"] = "NO_INTERNET";
  KoraErrorCode2["UNAUTHORIZED"] = "UNAUTHORIZED";
  KoraErrorCode2["FORBIDDEN"] = "FORBIDDEN";
  KoraErrorCode2["NOT_FOUND"] = "NOT_FOUND";
  KoraErrorCode2["VALIDATION_ERROR"] = "VALIDATION_ERROR";
  KoraErrorCode2["RATE_LIMITED"] = "RATE_LIMITED";
  KoraErrorCode2["SERVER_ERROR"] = "SERVER_ERROR";
  KoraErrorCode2["HTTP_ERROR"] = "HTTP_ERROR";
  KoraErrorCode2["INVALID_RESPONSE"] = "INVALID_RESPONSE";
  KoraErrorCode2["NO_DATA"] = "NO_DATA";
  KoraErrorCode2["DECODING_ERROR"] = "DECODING_ERROR";
  KoraErrorCode2["ENCODING_ERROR"] = "ENCODING_ERROR";
  KoraErrorCode2["CAMERA_ACCESS_DENIED"] = "CAMERA_ACCESS_DENIED";
  KoraErrorCode2["CAMERA_NOT_AVAILABLE"] = "CAMERA_NOT_AVAILABLE";
  KoraErrorCode2["CAPTURE_FAILED"] = "CAPTURE_FAILED";
  KoraErrorCode2["QUALITY_VALIDATION_FAILED"] = "QUALITY_VALIDATION_FAILED";
  KoraErrorCode2["DOCUMENT_NOT_DETECTED"] = "DOCUMENT_NOT_DETECTED";
  KoraErrorCode2["DOCUMENT_TYPE_NOT_SUPPORTED"] = "DOCUMENT_TYPE_NOT_SUPPORTED";
  KoraErrorCode2["MRZ_READ_FAILED"] = "MRZ_READ_FAILED";
  KoraErrorCode2["NFC_NOT_AVAILABLE"] = "NFC_NOT_AVAILABLE";
  KoraErrorCode2["NFC_READ_FAILED"] = "NFC_READ_FAILED";
  KoraErrorCode2["FACE_NOT_DETECTED"] = "FACE_NOT_DETECTED";
  KoraErrorCode2["MULTIPLE_FACES_DETECTED"] = "MULTIPLE_FACES_DETECTED";
  KoraErrorCode2["FACE_MATCH_FAILED"] = "FACE_MATCH_FAILED";
  KoraErrorCode2["LIVENESS_CHECK_FAILED"] = "LIVENESS_CHECK_FAILED";
  KoraErrorCode2["CHALLENGE_NOT_COMPLETED"] = "CHALLENGE_NOT_COMPLETED";
  KoraErrorCode2["SESSION_EXPIRED"] = "SESSION_EXPIRED";
  KoraErrorCode2["VERIFICATION_EXPIRED"] = "VERIFICATION_EXPIRED";
  KoraErrorCode2["VERIFICATION_ALREADY_COMPLETED"] = "VERIFICATION_ALREADY_COMPLETED";
  KoraErrorCode2["INVALID_VERIFICATION_STATE"] = "INVALID_VERIFICATION_STATE";
  KoraErrorCode2["UNKNOWN"] = "UNKNOWN";
  KoraErrorCode2["USER_CANCELLED"] = "USER_CANCELLED";
  return KoraErrorCode2;
})(KoraErrorCode || {});
var errorMessages = {
  ["NOT_CONFIGURED" /* NOT_CONFIGURED */]: "SDK not configured. Initialize KoraIDV first.",
  ["INVALID_API_KEY" /* INVALID_API_KEY */]: "Invalid API key provided.",
  ["INVALID_TENANT_ID" /* INVALID_TENANT_ID */]: "Invalid tenant ID provided.",
  ["NETWORK_ERROR" /* NETWORK_ERROR */]: "Network error. Please check your connection.",
  ["TIMEOUT" /* TIMEOUT */]: "Request timed out. Please try again.",
  ["NO_INTERNET" /* NO_INTERNET */]: "No internet connection.",
  ["UNAUTHORIZED" /* UNAUTHORIZED */]: "Authentication failed. Check your API key.",
  ["FORBIDDEN" /* FORBIDDEN */]: "Access denied.",
  ["NOT_FOUND" /* NOT_FOUND */]: "Resource not found.",
  ["VALIDATION_ERROR" /* VALIDATION_ERROR */]: "Validation error.",
  ["RATE_LIMITED" /* RATE_LIMITED */]: "Rate limit exceeded. Please try again later.",
  ["SERVER_ERROR" /* SERVER_ERROR */]: "Server error. Please try again later.",
  ["HTTP_ERROR" /* HTTP_ERROR */]: "HTTP error occurred.",
  ["INVALID_RESPONSE" /* INVALID_RESPONSE */]: "The server returned an invalid response.",
  ["NO_DATA" /* NO_DATA */]: "No response data received.",
  ["DECODING_ERROR" /* DECODING_ERROR */]: "Failed to decode the server response.",
  ["ENCODING_ERROR" /* ENCODING_ERROR */]: "Failed to encode the request.",
  ["CAMERA_ACCESS_DENIED" /* CAMERA_ACCESS_DENIED */]: "Camera access denied. Please enable camera access.",
  ["CAMERA_NOT_AVAILABLE" /* CAMERA_NOT_AVAILABLE */]: "Camera not available on this device.",
  ["CAPTURE_FAILED" /* CAPTURE_FAILED */]: "Capture failed.",
  ["QUALITY_VALIDATION_FAILED" /* QUALITY_VALIDATION_FAILED */]: "Quality check failed.",
  ["DOCUMENT_NOT_DETECTED" /* DOCUMENT_NOT_DETECTED */]: "Document not detected. Position document in frame.",
  ["DOCUMENT_TYPE_NOT_SUPPORTED" /* DOCUMENT_TYPE_NOT_SUPPORTED */]: "Document type not supported.",
  ["MRZ_READ_FAILED" /* MRZ_READ_FAILED */]: "Could not read document MRZ.",
  ["NFC_NOT_AVAILABLE" /* NFC_NOT_AVAILABLE */]: "NFC is not available on this device.",
  ["NFC_READ_FAILED" /* NFC_READ_FAILED */]: "NFC read failed. Hold device steady against the chip.",
  ["FACE_NOT_DETECTED" /* FACE_NOT_DETECTED */]: "Face not detected. Position face in frame.",
  ["MULTIPLE_FACES_DETECTED" /* MULTIPLE_FACES_DETECTED */]: "Multiple faces detected. Show only one face.",
  ["FACE_MATCH_FAILED" /* FACE_MATCH_FAILED */]: "Face match failed.",
  ["LIVENESS_CHECK_FAILED" /* LIVENESS_CHECK_FAILED */]: "Liveness check failed.",
  ["CHALLENGE_NOT_COMPLETED" /* CHALLENGE_NOT_COMPLETED */]: "Challenge not completed.",
  ["SESSION_EXPIRED" /* SESSION_EXPIRED */]: "Session expired. Please start over.",
  ["VERIFICATION_EXPIRED" /* VERIFICATION_EXPIRED */]: "Verification expired. Please start a new one.",
  ["VERIFICATION_ALREADY_COMPLETED" /* VERIFICATION_ALREADY_COMPLETED */]: "Verification already completed.",
  ["INVALID_VERIFICATION_STATE" /* INVALID_VERIFICATION_STATE */]: "Invalid verification state.",
  ["UNKNOWN" /* UNKNOWN */]: "An unknown error occurred.",
  ["USER_CANCELLED" /* USER_CANCELLED */]: "Verification cancelled."
};
var recoverySuggestions = {
  ["CAMERA_ACCESS_DENIED" /* CAMERA_ACCESS_DENIED */]: "Go to browser settings and enable camera access.",
  ["NO_INTERNET" /* NO_INTERNET */]: "Check your Wi-Fi or cellular connection.",
  ["TIMEOUT" /* TIMEOUT */]: "Please wait a moment and try again.",
  ["RATE_LIMITED" /* RATE_LIMITED */]: "Please wait a moment and try again.",
  ["SERVER_ERROR" /* SERVER_ERROR */]: "Please wait a moment and try again.",
  ["DOCUMENT_NOT_DETECTED" /* DOCUMENT_NOT_DETECTED */]: "Place document on flat surface with good lighting.",
  ["FACE_NOT_DETECTED" /* FACE_NOT_DETECTED */]: "Ensure good lighting and center your face.",
  ["QUALITY_VALIDATION_FAILED" /* QUALITY_VALIDATION_FAILED */]: "Hold device steady and ensure good lighting."
};
var KoraError = class _KoraError extends Error {
  constructor(code, details) {
    const message = errorMessages[code] || "An error occurred";
    super(message);
    this.name = "KoraError";
    this.code = code;
    this.recoverySuggestion = recoverySuggestions[code];
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _KoraError);
    }
  }
  /**
   * Create error from HTTP status code
   */
  static fromHttpStatus(status, details) {
    const codeMap = {
      401: "UNAUTHORIZED" /* UNAUTHORIZED */,
      403: "FORBIDDEN" /* FORBIDDEN */,
      404: "NOT_FOUND" /* NOT_FOUND */,
      422: "VALIDATION_ERROR" /* VALIDATION_ERROR */,
      429: "RATE_LIMITED" /* RATE_LIMITED */
    };
    if (status >= 500) {
      return new _KoraError("SERVER_ERROR" /* SERVER_ERROR */, details);
    }
    return new _KoraError(codeMap[status] || "HTTP_ERROR" /* HTTP_ERROR */, details);
  }
  /**
   * Check if error is retryable
   */
  get isRetryable() {
    return [
      "NETWORK_ERROR" /* NETWORK_ERROR */,
      "TIMEOUT" /* TIMEOUT */,
      "RATE_LIMITED" /* RATE_LIMITED */,
      "SERVER_ERROR" /* SERVER_ERROR */
    ].includes(this.code);
  }
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      recoverySuggestion: this.recoverySuggestion,
      details: this.details
    };
  }
};

// src/utils/blob.ts
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("FileReader returned non-string result"));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("FileReader error"));
    reader.readAsDataURL(blob);
  });
}

// src/api/ApiClient.ts
var ApiClient = class {
  constructor(configuration) {
    this.maxRetries = 3;
    this.baseDelay = 1e3;
    this.configuration = configuration;
    this.baseUrl = environmentUrls[configuration.environment];
  }
  /**
   * Get supported countries and their document types
   */
  async getSupportedCountries() {
    return this.request("/supported-countries");
  }
  /**
   * Create a new verification
   */
  async createVerification(request) {
    return this.request("/verifications", {
      method: "POST",
      body: JSON.stringify({
        external_id: request.externalId,
        tier: request.tier
      })
    });
  }
  /**
   * Get an existing verification
   */
  async getVerification(id) {
    return this.request(`/verifications/${id}`);
  }
  /**
   * Upload document image.
   *
   * `decodedBarcodePayload` is the optional Phase 4 fast-path: when the
   * client decoded the PDF417 / QR / DataMatrix on-device using the
   * browser's BarcodeDetector API (or a polyfill), the AAMVA payload
   * travels here so the server can skip image-based barcode decoding
   * (~1-3 s round-trip savings). Empty/`undefined` = server falls
   * back to its zxing-cpp + pdf417decoder cascade. Only meaningful for
   * back captures on documents that carry a barcode.
   * See `docs/architecture/idv-decode-roadmap.md` Phase 4.
   */
  async uploadDocument(verificationId, imageData, side, documentType, decodedBarcodePayload) {
    if (side === "back") {
      const imageBase64 = await blobToBase64(imageData);
      return this.request(
        `/verifications/${verificationId}/document/back`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64,
            decodedBarcodePayload: decodedBarcodePayload ?? null
          })
        }
      );
    }
    const formData = new FormData();
    formData.append("image", imageData, "document.jpg");
    formData.append("document_type", documentType);
    formData.append("side", side);
    return this.request(
      `/verifications/${verificationId}/document`,
      {
        method: "POST",
        body: formData,
        headers: {}
        // Let browser set Content-Type for FormData
      }
    );
  }
  /**
   * Upload selfie image
   */
  async uploadSelfie(verificationId, imageData) {
    const formData = new FormData();
    formData.append("image", imageData, "selfie.jpg");
    return this.request(`/verifications/${verificationId}/selfie`, {
      method: "POST",
      body: formData,
      headers: {}
    });
  }
  /**
   * Create liveness session
   */
  async createLivenessSession(verificationId) {
    const response = await this.request(`/verifications/${verificationId}/liveness/session`, {
      method: "POST"
    });
    return {
      sessionId: response.session_id,
      challenges: response.challenges.map((c) => ({
        id: c.id,
        type: c.type,
        instruction: c.instruction,
        order: c.order
      })),
      expiresAt: new Date(response.expires_at)
    };
  }
  /**
   * Submit liveness challenge
   */
  async submitLivenessChallenge(verificationId, challenge, imageData) {
    const formData = new FormData();
    formData.append("image", imageData, "challenge.jpg");
    formData.append("challenge_type", challenge.type);
    formData.append("challenge_id", challenge.id);
    const response = await this.request(`/verifications/${verificationId}/liveness/challenge`, {
      method: "POST",
      body: formData,
      headers: {}
    });
    return {
      success: response.success,
      challengePassed: response.challenge_passed,
      confidence: response.confidence,
      remainingChallenges: response.remaining_challenges
    };
  }
  /**
   * Check document quality before uploading
   */
  async checkDocumentQuality(imageData, documentType) {
    const base64 = await this.blobToBase64(imageData);
    return this.request("/kyc/document-quality", {
      method: "POST",
      body: JSON.stringify({
        document_front_base64: base64,
        document_type: documentType
      })
    });
  }
  /**
   * Complete the verification
   */
  async completeVerification(verificationId) {
    return this.request(`/verifications/${verificationId}/complete`, {
      method: "POST"
    });
  }
  // ─── QR Handoff (REQ-006) ────────────────────────────────────────────────
  /**
   * Create a handoff session for cross-device mobile capture.
   * Returns a token and capture URL to encode in a QR code.
   */
  async createHandoffSession(verificationId) {
    return this.request(`/verifications/${verificationId}/handoff-session`, {
      method: "POST"
    });
  }
  /**
   * Validate a handoff token (called by the mobile capture page).
   * Returns the verification context needed to continue capture.
   */
  async validateHandoffToken(token) {
    return this.request(`/handoff/${token}`);
  }
  /**
   * Subscribe to verification status events via Server-Sent Events.
   * Returns an EventSource that emits 'status' and 'complete' events.
   */
  subscribeToVerificationEvents(verificationId) {
    const url = `${this.baseUrl}/verifications/${verificationId}/events`;
    const eventSource = new EventSource(url, { withCredentials: false });
    return eventSource;
  }
  /**
   * Make an API request with retry logic
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);
    if (!headers.has("Authorization")) {
      headers.set("Authorization", this.configuration.apiKey);
    }
    headers.set("X-Tenant-ID", this.configuration.tenantId);
    headers.set("Accept", "application/json");
    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    const requestOptions = {
      ...options,
      headers
    };
    return this.executeWithRetry(url, requestOptions, 0);
  }
  async executeWithRetry(url, options, attempt) {
    try {
      if (this.configuration.debugLogging) {
        console.log(`[KoraIDV] Request: ${options.method || "GET"} ${url}`);
      }
      const response = await fetch(url, options);
      if (this.configuration.debugLogging) {
        console.log(`[KoraIDV] Response: ${response.status}`);
      }
      if (response.ok) {
        const data = await response.json();
        return this.transformResponse(data);
      }
      if (this.shouldRetry(response.status, attempt)) {
        const delay = this.calculateDelay(attempt, response);
        if (this.configuration.debugLogging) {
          console.log(`[KoraIDV] Retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`);
        }
        await this.sleep(delay);
        return this.executeWithRetry(url, options, attempt + 1);
      }
      const errorData = await response.json().catch(() => ({}));
      throw KoraError.fromHttpStatus(response.status, errorData);
    } catch (error) {
      if (error instanceof KoraError) {
        throw error;
      }
      if (error instanceof TypeError && error.message.includes("fetch")) {
        if (this.shouldRetryNetworkError(attempt)) {
          const delay = this.calculateDelay(attempt);
          await this.sleep(delay);
          return this.executeWithRetry(url, options, attempt + 1);
        }
        throw new KoraError("NETWORK_ERROR" /* NETWORK_ERROR */, error.message);
      }
      throw new KoraError("UNKNOWN" /* UNKNOWN */, String(error));
    }
  }
  shouldRetry(status, attempt) {
    if (attempt >= this.maxRetries) return false;
    return status === 429 || status >= 500 && status < 600;
  }
  shouldRetryNetworkError(attempt) {
    return attempt < this.maxRetries;
  }
  calculateDelay(attempt, response) {
    if (response) {
      const retryAfter = response.headers.get("Retry-After");
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) {
          return seconds * 1e3;
        }
      }
    }
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 500;
    return exponentialDelay + jitter;
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        const base64 = result.split(",")[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  /**
   * Transform snake_case response to camelCase
   */
  transformResponse(data) {
    if (Array.isArray(data)) {
      return data.map((item) => this.transformResponse(item));
    }
    if (data !== null && typeof data === "object") {
      const transformed = {};
      for (const [key, value] of Object.entries(data)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        transformed[camelKey] = this.transformResponse(value);
      }
      return transformed;
    }
    return data;
  }
};

// src/KoraIDV.ts
var KoraIDV = class {
  constructor(config) {
    this.currentVerification = null;
    this.livenessSession = null;
    this.sessionStartTime = null;
    this.configuration = {
      ...defaultConfiguration,
      ...config,
      environment: config.environment ?? this.detectEnvironment(config.apiKey)
    };
    this.apiClient = new ApiClient(this.configuration);
  }
  detectEnvironment(apiKey) {
    return apiKey.startsWith("ck_sandbox_") ? "sandbox" : "production";
  }
  /**
   * Get supported countries and their document types from the API
   */
  async getSupportedCountries() {
    return this.apiClient.getSupportedCountries();
  }
  /**
   * Start a new verification flow
   */
  async startVerification(options, callbacks) {
    try {
      this.sessionStartTime = /* @__PURE__ */ new Date();
      const verification = await this.apiClient.createVerification({
        externalId: options.externalId,
        tier: options.tier ?? "standard"
      });
      this.currentVerification = verification;
      callbacks.onStepChange?.("consent");
    } catch (error) {
      callbacks.onError?.(error instanceof KoraError ? error : new KoraError("UNKNOWN" /* UNKNOWN */, String(error)));
    }
  }
  /**
   * Resume an existing verification
   */
  async resumeVerification(verificationId, callbacks) {
    try {
      this.sessionStartTime = /* @__PURE__ */ new Date();
      const verification = await this.apiClient.getVerification(verificationId);
      this.currentVerification = verification;
      const step = this.determineStepFromStatus(verification.status);
      callbacks.onStepChange?.(step);
    } catch (error) {
      callbacks.onError?.(error instanceof KoraError ? error : new KoraError("UNKNOWN" /* UNKNOWN */, String(error)));
    }
  }
  /**
   * Check document quality before uploading (no active verification required)
   */
  async checkDocumentQuality(imageData, documentType) {
    return this.apiClient.checkDocumentQuality(imageData, documentType);
  }
  /**
   * Upload document image
   */
  async uploadDocument(imageData, side, documentType) {
    if (!this.currentVerification) {
      throw new KoraError("INVALID_VERIFICATION_STATE" /* INVALID_VERIFICATION_STATE */, "No active verification");
    }
    const response = await this.apiClient.uploadDocument(
      this.currentVerification.id,
      imageData,
      side,
      documentType
    );
    return {
      success: response.success,
      qualityIssues: response.qualityIssues?.map((q) => q.message)
    };
  }
  /**
   * Upload selfie image
   */
  async uploadSelfie(imageData) {
    if (!this.currentVerification) {
      throw new KoraError("INVALID_VERIFICATION_STATE" /* INVALID_VERIFICATION_STATE */, "No active verification");
    }
    const response = await this.apiClient.uploadSelfie(this.currentVerification.id, imageData);
    return {
      success: response.success,
      qualityIssues: response.qualityIssues?.map((q) => q.message)
    };
  }
  /**
   * Start liveness session
   */
  async startLivenessSession() {
    if (!this.currentVerification) {
      throw new KoraError("INVALID_VERIFICATION_STATE" /* INVALID_VERIFICATION_STATE */, "No active verification");
    }
    this.livenessSession = await this.apiClient.createLivenessSession(this.currentVerification.id);
    return this.livenessSession;
  }
  /**
   * Submit liveness challenge
   */
  async submitLivenessChallenge(challenge, imageData) {
    if (!this.currentVerification) {
      throw new KoraError("INVALID_VERIFICATION_STATE" /* INVALID_VERIFICATION_STATE */, "No active verification");
    }
    const response = await this.apiClient.submitLivenessChallenge(
      this.currentVerification.id,
      challenge,
      imageData
    );
    return {
      passed: response.challengePassed,
      remainingChallenges: response.remainingChallenges
    };
  }
  /**
   * Complete the verification
   */
  async completeVerification() {
    if (!this.currentVerification) {
      throw new KoraError("INVALID_VERIFICATION_STATE" /* INVALID_VERIFICATION_STATE */, "No active verification");
    }
    this.currentVerification = await this.apiClient.completeVerification(this.currentVerification.id);
    return this.currentVerification;
  }
  /**
   * Get current verification
   */
  getCurrentVerification() {
    return this.currentVerification;
  }
  /**
   * Get current liveness session
   */
  getLivenessSession() {
    return this.livenessSession;
  }
  /**
   * Check if session has timed out
   */
  isSessionTimedOut() {
    if (!this.sessionStartTime) return false;
    const elapsed = Date.now() - this.sessionStartTime.getTime();
    return elapsed > this.configuration.timeout * 1e3;
  }
  /**
   * Reset the session
   */
  reset() {
    this.currentVerification = null;
    this.livenessSession = null;
    this.sessionStartTime = null;
  }
  determineStepFromStatus(status) {
    switch (status) {
      case "pending":
        return "consent";
      case "document_required":
        return "document_selection";
      case "selfie_required":
        return "selfie";
      case "liveness_required":
        return "liveness";
      case "processing":
        return "processing";
      case "approved":
      case "rejected":
      case "review_required":
      case "expired":
        return "complete";
      default:
        return "consent";
    }
  }
};
KoraIDV.VERSION = "1.5.2";

// src/utils/QualityValidator.ts
var defaultThresholds = {
  minBlurScore: 100,
  minBrightness: 0.3,
  maxBrightness: 0.85,
  maxGlarePercentage: 0.05,
  minFaceSizePercentage: 0.2,
  minFaceConfidence: 0.7
};
var QualityValidator = class {
  constructor(thresholds = {}) {
    this.thresholds = { ...defaultThresholds, ...thresholds };
  }
  /**
   * Validate document image quality
   */
  async validateDocumentImage(imageData) {
    const issues = [];
    const metrics = {};
    const blurScore = this.calculateBlurScore(imageData);
    metrics.blurScore = blurScore;
    if (blurScore < this.thresholds.minBlurScore) {
      issues.push({
        type: "blur",
        message: "Image is too blurry. Hold the device steady.",
        severity: "error"
      });
    }
    const brightness = this.calculateBrightness(imageData);
    metrics.brightness = brightness;
    if (brightness < this.thresholds.minBrightness) {
      issues.push({
        type: "too_dark",
        message: "Image is too dark. Move to a brighter area.",
        severity: "error"
      });
    } else if (brightness > this.thresholds.maxBrightness) {
      issues.push({
        type: "too_bright",
        message: "Image is too bright. Reduce lighting.",
        severity: "warning"
      });
    }
    const glarePercentage = this.calculateGlarePercentage(imageData);
    metrics.glarePercentage = glarePercentage;
    if (glarePercentage > this.thresholds.maxGlarePercentage) {
      issues.push({
        type: "glare",
        message: "Glare detected. Adjust angle to reduce reflections.",
        severity: "warning"
      });
    }
    return {
      isValid: !issues.some((issue) => issue.severity === "error"),
      issues,
      metrics
    };
  }
  /**
   * Validate selfie image quality
   */
  async validateSelfieImage(imageData, faceDetection) {
    const issues = [];
    const metrics = {};
    const blurScore = this.calculateBlurScore(imageData);
    metrics.blurScore = blurScore;
    if (blurScore < this.thresholds.minBlurScore) {
      issues.push({
        type: "blur",
        message: "Image is too blurry. Hold the device steady.",
        severity: "error"
      });
    }
    const brightness = this.calculateBrightness(imageData);
    metrics.brightness = brightness;
    if (brightness < this.thresholds.minBrightness) {
      issues.push({
        type: "too_dark",
        message: "Image is too dark. Move to a brighter area.",
        severity: "error"
      });
    }
    if (!faceDetection) {
      issues.push({
        type: "face_not_detected",
        message: "Face not detected. Position your face in the frame.",
        severity: "error"
      });
    } else {
      metrics.faceConfidence = faceDetection.confidence;
      if (faceDetection.confidence < this.thresholds.minFaceConfidence) {
        issues.push({
          type: "face_not_detected",
          message: "Face not clearly visible. Ensure good lighting.",
          severity: "warning"
        });
      }
      const frameArea = imageData.width * imageData.height;
      const faceArea = faceDetection.boundingBox.width * faceDetection.boundingBox.height;
      const faceSizePercentage = faceArea / frameArea;
      metrics.faceSize = faceSizePercentage;
      if (faceSizePercentage < this.thresholds.minFaceSizePercentage) {
        issues.push({
          type: "face_too_small",
          message: "Face is too small. Move closer to the camera.",
          severity: "error"
        });
      }
      const faceCenterX = faceDetection.boundingBox.x + faceDetection.boundingBox.width / 2;
      const faceCenterY = faceDetection.boundingBox.y + faceDetection.boundingBox.height / 2;
      const frameCenterX = imageData.width / 2;
      const frameCenterY = imageData.height / 2;
      const offsetX = (faceCenterX - frameCenterX) / imageData.width;
      const offsetY = (faceCenterY - frameCenterY) / imageData.height;
      metrics.faceCenterOffset = { x: offsetX, y: offsetY };
      if (Math.abs(offsetX) > 0.2 || Math.abs(offsetY) > 0.2) {
        issues.push({
          type: "face_off_center",
          message: "Center your face in the frame.",
          severity: "warning"
        });
      }
    }
    return {
      isValid: !issues.some((issue) => issue.severity === "error"),
      issues,
      metrics
    };
  }
  /**
   * Calculate blur score using Laplacian variance
   */
  calculateBlurScore(imageData) {
    const { data, width, height } = imageData;
    const grayscale = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      grayscale[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
    const laplacian = new Float32Array(width * height);
    const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx);
            const kidx = (ky + 1) * 3 + (kx + 1);
            sum += grayscale[idx] * kernel[kidx];
          }
        }
        laplacian[y * width + x] = sum;
      }
    }
    let mean = 0;
    for (let i = 0; i < laplacian.length; i++) {
      mean += laplacian[i];
    }
    mean /= laplacian.length;
    let variance = 0;
    for (let i = 0; i < laplacian.length; i++) {
      variance += Math.pow(laplacian[i] - mean, 2);
    }
    variance /= laplacian.length;
    return variance;
  }
  /**
   * Calculate average brightness (0-1)
   */
  calculateBrightness(imageData) {
    const { data } = imageData;
    let totalBrightness = 0;
    const pixelCount = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      totalBrightness += brightness;
    }
    return totalBrightness / pixelCount;
  }
  /**
   * Calculate percentage of overexposed pixels (glare)
   */
  calculateGlarePercentage(imageData) {
    const { data } = imageData;
    let glarePixels = 0;
    const pixelCount = data.length / 4;
    const glareThreshold = 250;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > glareThreshold && data[i + 1] > glareThreshold && data[i + 2] > glareThreshold) {
        glarePixels++;
      }
    }
    return glarePixels / pixelCount;
  }
};

// src/utils/MrzParser.ts
var MrzParser = class {
  /**
   * Parse MRZ text
   */
  parse(mrzText) {
    const lines = this.cleanMrzText(mrzText);
    if (!lines) {
      return null;
    }
    const format = this.detectFormat(lines);
    if (!format) {
      return null;
    }
    switch (format) {
      case "TD1":
        return this.parseTD1(lines);
      case "TD2":
        return this.parseTD2(lines);
      case "TD3":
        return this.parseTD3(lines);
      default:
        return null;
    }
  }
  /**
   * Clean and normalize MRZ text
   */
  cleanMrzText(text) {
    let cleaned = text.toUpperCase().replace(/O/g, "0").replace(/\s+/g, "").replace(/[^A-Z0-9<]/g, "");
    const lines = [];
    const lineLength = this.detectLineLength(cleaned);
    if (!lineLength) {
      return null;
    }
    for (let i = 0; i < cleaned.length; i += lineLength) {
      lines.push(cleaned.substring(i, i + lineLength));
    }
    return lines;
  }
  /**
   * Detect MRZ line length
   */
  detectLineLength(text) {
    const length = text.length;
    if (length >= 88 && length <= 92) return 30;
    if (length >= 70 && length <= 74) return 36;
    if (length >= 86 && length <= 90) return 44;
    return null;
  }
  /**
   * Detect MRZ format
   */
  detectFormat(lines) {
    if (lines.length === 3 && lines[0].length === 30) return "TD1";
    if (lines.length === 2 && lines[0].length === 36) return "TD2";
    if (lines.length === 2 && lines[0].length === 44) return "TD3";
    return null;
  }
  /**
   * Parse TD1 format (ID cards - 3 lines × 30 chars)
   */
  parseTD1(lines) {
    const validationErrors = [];
    const documentType = lines[0].substring(0, 2).replace(/</g, "");
    const issuingCountry = lines[0].substring(2, 5);
    const documentNumber = lines[0].substring(5, 14).replace(/</g, "");
    const documentNumberCheck = lines[0].charAt(14);
    const optionalData1 = lines[0].substring(15, 30).replace(/</g, "") || void 0;
    const dateOfBirth = lines[1].substring(0, 6);
    const dobCheck = lines[1].charAt(6);
    const sex = lines[1].charAt(7);
    const expirationDate = lines[1].substring(8, 14);
    const expirationCheck = lines[1].charAt(14);
    const nationality = lines[1].substring(15, 18);
    const optionalData2 = lines[1].substring(18, 29).replace(/</g, "") || void 0;
    const nameParts = this.parseName(lines[2]);
    if (!this.validateCheckDigit(documentNumber, documentNumberCheck)) {
      validationErrors.push("Invalid document number check digit");
    }
    if (!this.validateCheckDigit(dateOfBirth, dobCheck)) {
      validationErrors.push("Invalid date of birth check digit");
    }
    if (!this.validateCheckDigit(expirationDate, expirationCheck)) {
      validationErrors.push("Invalid expiration date check digit");
    }
    return {
      format: "TD1",
      documentType,
      issuingCountry,
      lastName: nameParts.lastName,
      firstName: nameParts.firstName,
      documentNumber,
      nationality,
      dateOfBirth,
      sex,
      expirationDate,
      optionalData1,
      optionalData2,
      isValid: validationErrors.length === 0,
      validationErrors
    };
  }
  /**
   * Parse TD2 format (Some ID cards - 2 lines × 36 chars)
   */
  parseTD2(lines) {
    const validationErrors = [];
    const documentType = lines[0].substring(0, 2).replace(/</g, "");
    const issuingCountry = lines[0].substring(2, 5);
    const nameParts = this.parseName(lines[0].substring(5, 36));
    const documentNumber = lines[1].substring(0, 9).replace(/</g, "");
    const documentNumberCheck = lines[1].charAt(9);
    const nationality = lines[1].substring(10, 13);
    const dateOfBirth = lines[1].substring(13, 19);
    const dobCheck = lines[1].charAt(19);
    const sex = lines[1].charAt(20);
    const expirationDate = lines[1].substring(21, 27);
    const expirationCheck = lines[1].charAt(27);
    const optionalData1 = lines[1].substring(28, 35).replace(/</g, "") || void 0;
    if (!this.validateCheckDigit(documentNumber, documentNumberCheck)) {
      validationErrors.push("Invalid document number check digit");
    }
    if (!this.validateCheckDigit(dateOfBirth, dobCheck)) {
      validationErrors.push("Invalid date of birth check digit");
    }
    if (!this.validateCheckDigit(expirationDate, expirationCheck)) {
      validationErrors.push("Invalid expiration date check digit");
    }
    return {
      format: "TD2",
      documentType,
      issuingCountry,
      lastName: nameParts.lastName,
      firstName: nameParts.firstName,
      documentNumber,
      nationality,
      dateOfBirth,
      sex,
      expirationDate,
      optionalData1,
      isValid: validationErrors.length === 0,
      validationErrors
    };
  }
  /**
   * Parse TD3 format (Passports - 2 lines × 44 chars)
   */
  parseTD3(lines) {
    const validationErrors = [];
    const documentType = lines[0].substring(0, 2).replace(/</g, "");
    const issuingCountry = lines[0].substring(2, 5);
    const nameParts = this.parseName(lines[0].substring(5, 44));
    const documentNumber = lines[1].substring(0, 9).replace(/</g, "");
    const documentNumberCheck = lines[1].charAt(9);
    const nationality = lines[1].substring(10, 13);
    const dateOfBirth = lines[1].substring(13, 19);
    const dobCheck = lines[1].charAt(19);
    const sex = lines[1].charAt(20);
    const expirationDate = lines[1].substring(21, 27);
    const expirationCheck = lines[1].charAt(27);
    const optionalData1 = lines[1].substring(28, 42).replace(/</g, "") || void 0;
    if (!this.validateCheckDigit(documentNumber, documentNumberCheck)) {
      validationErrors.push("Invalid document number check digit");
    }
    if (!this.validateCheckDigit(dateOfBirth, dobCheck)) {
      validationErrors.push("Invalid date of birth check digit");
    }
    if (!this.validateCheckDigit(expirationDate, expirationCheck)) {
      validationErrors.push("Invalid expiration date check digit");
    }
    return {
      format: "TD3",
      documentType,
      issuingCountry,
      lastName: nameParts.lastName,
      firstName: nameParts.firstName,
      documentNumber,
      nationality,
      dateOfBirth,
      sex,
      expirationDate,
      optionalData1,
      isValid: validationErrors.length === 0,
      validationErrors
    };
  }
  /**
   * Parse name field
   */
  parseName(nameField) {
    const parts = nameField.split("<<");
    const lastName = parts[0]?.replace(/</g, " ").trim() || "";
    const firstName = parts[1]?.replace(/</g, " ").trim() || "";
    return { lastName, firstName };
  }
  /**
   * Validate MRZ check digit
   */
  validateCheckDigit(data, checkDigit) {
    const weights = [7, 3, 1];
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charAt(i);
      let value;
      if (char >= "0" && char <= "9") {
        value = parseInt(char, 10);
      } else if (char >= "A" && char <= "Z") {
        value = char.charCodeAt(0) - 55;
      } else if (char === "<") {
        value = 0;
      } else {
        return false;
      }
      sum += value * weights[i % 3];
    }
    const expected = sum % 10;
    const actual = checkDigit === "<" ? 0 : parseInt(checkDigit, 10);
    return expected === actual;
  }
  /**
   * Format date from YYMMDD to human readable
   */
  static formatDate(yymmdd) {
    if (yymmdd.length !== 6) return yymmdd;
    const yy = parseInt(yymmdd.substring(0, 2), 10);
    const mm = yymmdd.substring(2, 4);
    const dd = yymmdd.substring(4, 6);
    const year = yy <= 30 ? 2e3 + yy : 1900 + yy;
    return `${year}-${mm}-${dd}`;
  }
};

// src/capture/BarcodeScanner.ts
var WebBarcodeScanner = class _WebBarcodeScanner {
  /**
   * Construct a scanner. Restricts to PDF417 by default to avoid false
   * positives on the small Code128 strip US DLs also carry. Callers
   * onboarding QR-based docs (Nigeria voter's card) should pass
   * `['pdf417', 'qr_code']`.
   */
  constructor(formats = ["pdf417"]) {
    this.detector = null;
    if (_WebBarcodeScanner.isSupported()) {
      const Ctor = globalThis.BarcodeDetector;
      try {
        this.detector = new Ctor({ formats });
      } catch {
        this.detector = new Ctor();
      }
    }
  }
  /**
   * Whether the current environment has a usable BarcodeDetector.
   * Either native (modern Chromium / Samsung) or a polyfill.
   */
  static isSupported() {
    return typeof globalThis !== "undefined" && typeof globalThis.BarcodeDetector === "function";
  }
  /**
   * Attempt to decode a PDF417 barcode from the supplied image source.
   * Accepts any `ImageBitmapSource`: Blob, HTMLImageElement,
   * HTMLCanvasElement, ImageBitmap, OffscreenCanvas.
   *
   * Returns the raw AAMVA payload as a single string (newline-separated
   * records, exactly the form the server's AAMVA parser expects) or
   * `null` when no barcode was found, decoding failed, or the API is
   * unavailable.
   */
  async decodePdf417(source) {
    if (!this.detector) return null;
    try {
      const results = await this.detector.detect(source);
      for (const r of results) {
        if (r.rawValue && r.rawValue.length > 0) {
          return r.rawValue;
        }
      }
      return null;
    } catch {
      return null;
    }
  }
};

// src/wallet/WalletModels.ts
var WalletError = class _WalletError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "WalletError";
  }
  static storageFailed() {
    return new _WalletError("STORAGE_FAILED", "Failed to store credential.");
  }
  static credentialNotFound() {
    return new _WalletError("CREDENTIAL_NOT_FOUND", "Credential not found.");
  }
  static credentialExpired() {
    return new _WalletError("CREDENTIAL_EXPIRED", "Credential has expired.");
  }
  static encodingFailed() {
    return new _WalletError(
      "ENCODING_FAILED",
      "Failed to encode credential data."
    );
  }
  static cryptoUnavailable() {
    return new _WalletError(
      "CRYPTO_UNAVAILABLE",
      "Web Crypto API is not available in this environment."
    );
  }
};
function createWalletCredential(params) {
  return {
    "@context": params["@context"] ?? ["https://www.w3.org/ns/credentials/v2"],
    type: params.type ?? [
      "VerifiableCredential",
      "KoraIdentityCredential"
    ],
    ...params
  };
}

// src/wallet/CredentialStore.ts
var DB_NAME = "kora_wallet";
var DB_VERSION = 1;
var STORE_NAME = "credentials";
var KEY_STORE_NAME = "crypto_keys";
var ENCRYPTION_KEY_ID = "wallet_master_key";
var WalletCredentialStore = class {
  constructor() {
    this.db = null;
    this.cryptoKey = null;
  }
  // MARK: - Database Initialization
  async getDb() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(KEY_STORE_NAME)) {
          db.createObjectStore(KEY_STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onerror = () => {
        reject(WalletError.storageFailed());
      };
    });
  }
  // MARK: - Crypto Key Management
  async getCryptoKey() {
    if (this.cryptoKey) return this.cryptoKey;
    if (typeof crypto === "undefined" || !crypto.subtle) {
      throw WalletError.cryptoUnavailable();
    }
    const db = await this.getDb();
    const existingKey = await new Promise(
      (resolve, reject) => {
        const tx = db.transaction(KEY_STORE_NAME, "readonly");
        const store = tx.objectStore(KEY_STORE_NAME);
        const request = store.get(ENCRYPTION_KEY_ID);
        request.onsuccess = () => {
          const record = request.result;
          if (record?.key) {
            crypto.subtle.importKey("raw", record.key, { name: "AES-GCM" }, false, [
              "encrypt",
              "decrypt"
            ]).then(resolve).catch(() => resolve(null));
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(WalletError.storageFailed());
      }
    );
    if (existingKey) {
      this.cryptoKey = existingKey;
      return existingKey;
    }
    const newKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const rawKey = await crypto.subtle.exportKey("raw", newKey);
    await new Promise((resolve, reject) => {
      const tx = db.transaction(KEY_STORE_NAME, "readwrite");
      const store = tx.objectStore(KEY_STORE_NAME);
      store.put({ id: ENCRYPTION_KEY_ID, key: rawKey });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(WalletError.storageFailed());
    });
    this.cryptoKey = await crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
    return this.cryptoKey;
  }
  // MARK: - Encrypt / Decrypt
  async encrypt(data) {
    const key = await this.getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );
    const result = new Uint8Array(iv.length + ciphertext.byteLength);
    result.set(iv);
    result.set(new Uint8Array(ciphertext), iv.length);
    return result.buffer;
  }
  async decrypt(data) {
    const key = await this.getCryptoKey();
    const bytes = new Uint8Array(data);
    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(plaintext);
  }
  // MARK: - CRUD Operations
  async save(id, credential) {
    const db = await this.getDb();
    const json = JSON.stringify(credential);
    const encrypted = await this.encrypt(json);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put({ id, data: encrypted });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(WalletError.storageFailed());
    });
  }
  async load(id) {
    const db = await this.getDb();
    const record = await new Promise(
      (resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => reject(WalletError.storageFailed());
      }
    );
    if (!record) return null;
    try {
      const json = await this.decrypt(record.data);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
  async delete(id) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(WalletError.storageFailed());
    });
  }
  async listIds() {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(WalletError.storageFailed());
    });
  }
  /**
   * Close the database connection and clear cached crypto key.
   */
  close() {
    this.db?.close();
    this.db = null;
    this.cryptoKey = null;
  }
};

// src/wallet/SelectiveDisclosure.ts
var DisclosureClaim = /* @__PURE__ */ ((DisclosureClaim2) => {
  DisclosureClaim2["FullName"] = "fullName";
  DisclosureClaim2["DateOfBirth"] = "dateOfBirth";
  DisclosureClaim2["Nationality"] = "nationality";
  DisclosureClaim2["VerificationLevel"] = "verificationLevel";
  DisclosureClaim2["DocumentType"] = "documentType";
  DisclosureClaim2["DocumentCountry"] = "documentCountry";
  DisclosureClaim2["BiometricMatch"] = "biometricMatch";
  DisclosureClaim2["LivenessCheck"] = "livenessCheck";
  DisclosureClaim2["GovernmentDbVerified"] = "governmentDbVerified";
  DisclosureClaim2["VerifiedAt"] = "verifiedAt";
  DisclosureClaim2["ConfidenceScore"] = "confidenceScore";
  return DisclosureClaim2;
})(DisclosureClaim || {});
var DisclosureProfiles = {
  full: { type: "full" },
  onboarding: { type: "onboarding" },
  ageOnly: { type: "ageOnly" },
  nationalityOnly: { type: "nationalityOnly" },
  verificationOnly: { type: "verificationOnly" },
  custom: (claims) => ({
    type: "custom",
    claims
  })
};
function getProfileName(profile) {
  return profile.type;
}
var ALL_CLAIMS = new Set(Object.values(DisclosureClaim));
var ONBOARDING_CLAIMS = /* @__PURE__ */ new Set([
  "fullName" /* FullName */,
  "dateOfBirth" /* DateOfBirth */,
  "nationality" /* Nationality */,
  "verificationLevel" /* VerificationLevel */,
  "documentType" /* DocumentType */,
  "documentCountry" /* DocumentCountry */
]);
var VERIFICATION_CLAIMS = /* @__PURE__ */ new Set([
  "verificationLevel" /* VerificationLevel */,
  "verifiedAt" /* VerifiedAt */,
  "confidenceScore" /* ConfidenceScore */
]);
function getClaimsForProfile(profile) {
  switch (profile.type) {
    case "full":
      return ALL_CLAIMS;
    case "onboarding":
      return ONBOARDING_CLAIMS;
    case "ageOnly":
      return /* @__PURE__ */ new Set(["dateOfBirth" /* DateOfBirth */]);
    case "nationalityOnly":
      return /* @__PURE__ */ new Set(["nationality" /* Nationality */]);
    case "verificationOnly":
      return VERIFICATION_CLAIMS;
    case "custom":
      return profile.claims;
  }
}
function applyDisclosure(profile, credential) {
  const claims = getClaimsForProfile(profile);
  const subject = credential.credentialSubject;
  const disclosed = {
    id: subject.id,
    fullName: claims.has("fullName" /* FullName */) ? subject.fullName : "",
    dateOfBirth: claims.has("dateOfBirth" /* DateOfBirth */) ? subject.dateOfBirth : void 0,
    nationality: claims.has("nationality" /* Nationality */) ? subject.nationality : void 0,
    verificationLevel: claims.has("verificationLevel" /* VerificationLevel */) ? subject.verificationLevel : "",
    documentType: claims.has("documentType" /* DocumentType */) ? subject.documentType : "",
    documentCountry: claims.has("documentCountry" /* DocumentCountry */) ? subject.documentCountry : "",
    biometricMatch: claims.has("biometricMatch" /* BiometricMatch */) && subject.biometricMatch,
    livenessCheck: claims.has("livenessCheck" /* LivenessCheck */) && subject.livenessCheck,
    governmentDbVerified: claims.has("governmentDbVerified" /* GovernmentDbVerified */) && subject.governmentDbVerified,
    verifiedAt: claims.has("verifiedAt" /* VerifiedAt */) ? subject.verifiedAt : "",
    confidenceScore: claims.has("confidenceScore" /* ConfidenceScore */) ? subject.confidenceScore : 0
  };
  return {
    ...credential,
    credentialSubject: disclosed
  };
}
function computeAgeOver18(dateOfBirth) {
  if (!dateOfBirth) return false;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return false;
  const now = /* @__PURE__ */ new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || monthDiff === 0 && now.getDate() < dob.getDate()) {
    age--;
  }
  return age >= 18;
}

// src/wallet/VerifiablePresentation.ts
var WalletPresentationBuilder = {
  /**
   * Create a Verifiable Presentation from a credential with selective disclosure.
   */
  create(params) {
    const disclosed = applyDisclosure(params.profile, params.credential);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return {
      "@context": ["https://www.w3.org/ns/credentials/v2"],
      type: ["VerifiablePresentation"],
      holder: params.holder ?? null,
      verifiableCredential: [disclosed],
      created: now,
      audience: params.audience ?? null,
      challenge: params.nonce ?? null
    };
  },
  /**
   * Serialize a presentation to a JSON string.
   */
  encode(presentation) {
    return JSON.stringify(presentation, null, 2);
  },
  /**
   * Deserialize a presentation from a JSON string.
   */
  decode(json) {
    return JSON.parse(json);
  }
};

// src/wallet/KoraWallet.ts
var MAX_INLINE_SIZE = 2048;
var KoraWallet = class {
  constructor() {
    this.credentialStore = new WalletCredentialStore();
  }
  // MARK: - Credential Management
  /**
   * Store a Verifiable Credential in the wallet.
   * Returns the storage ID (same as the credential's `id`).
   */
  async store(credential) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stored = {
      id: credential.id,
      credential,
      storedAt: now,
      issuerDID: credential.issuer,
      subjectName: credential.credentialSubject.fullName,
      expiresAt: credential.expirationDate
    };
    await this.credentialStore.save(credential.id, stored);
    return credential.id;
  }
  /**
   * Retrieve all stored credentials.
   */
  async getCredentials() {
    const ids = await this.credentialStore.listIds();
    const results = [];
    for (const id of ids) {
      const stored = await this.credentialStore.load(id);
      if (stored) results.push(stored);
    }
    return results;
  }
  /**
   * Retrieve a single credential by ID.
   */
  async getCredential(id) {
    return this.credentialStore.load(id);
  }
  /**
   * Delete a credential from the wallet.
   */
  async deleteCredential(id) {
    await this.credentialStore.delete(id);
  }
  /**
   * Number of credentials currently stored.
   */
  async getCredentialCount() {
    const ids = await this.credentialStore.listIds();
    return ids.length;
  }
  // MARK: - Presentation
  /**
   * Create a Verifiable Presentation with selective disclosure.
   */
  async createPresentation(params) {
    const stored = await this.credentialStore.load(params.credentialId);
    if (!stored) {
      throw WalletError.credentialNotFound();
    }
    if (await this.isExpired(params.credentialId)) {
      throw WalletError.credentialExpired();
    }
    return WalletPresentationBuilder.create({
      credential: stored.credential,
      profile: params.profile,
      audience: params.audience,
      nonce: params.nonce
    });
  }
  /**
   * Generate a deep link URL for sharing a presentation.
   */
  generateDeepLink(presentation, profile = DisclosureProfiles.full) {
    const json = JSON.stringify(presentation);
    const data = new TextEncoder().encode(json);
    if (data.length <= MAX_INLINE_SIZE) {
      const encoded = base64UrlEncode(data);
      return `korastratum://present?data=${encoded}`;
    }
    const credId = presentation.verifiableCredential[0]?.id ?? "unknown";
    const profileName = getProfileName(profile);
    return `korastratum://present?ref=${credId}&profile=${profileName}`;
  }
  // MARK: - Expiry
  /**
   * Check whether a stored credential has expired.
   */
  async isExpired(credentialId) {
    const stored = await this.credentialStore.load(credentialId);
    if (!stored) return true;
    const expires = new Date(stored.expiresAt);
    if (isNaN(expires.getTime())) return false;
    return /* @__PURE__ */ new Date() > expires;
  }
  /**
   * Close the store and free resources.
   */
  close() {
    this.credentialStore.close();
  }
};
function base64UrlEncode(data) {
  const binString = Array.from(
    data,
    (byte) => String.fromCodePoint(byte)
  ).join("");
  const base64 = btoa(binString);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiClient,
  DisclosureClaim,
  DisclosureProfiles,
  DocumentType,
  KoraError,
  KoraErrorCode,
  KoraIDV,
  KoraWallet,
  MrzParser,
  QualityValidator,
  WalletCredentialStore,
  WalletError,
  WalletPresentationBuilder,
  WebBarcodeScanner,
  applyDisclosure,
  blobToBase64,
  computeAgeOver18,
  createWalletCredential,
  getDocumentTypeInfo
});
