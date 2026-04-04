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
  DocumentType: () => DocumentType,
  KoraError: () => KoraError,
  KoraErrorCode: () => KoraErrorCode,
  KoraIDV: () => KoraIDV,
  MrzParser: () => MrzParser,
  QualityValidator: () => QualityValidator,
  getDocumentTypeInfo: () => getDocumentTypeInfo
});
module.exports = __toCommonJS(index_exports);

// src/types/DocumentType.ts
var DocumentType = /* @__PURE__ */ ((DocumentType2) => {
  DocumentType2["US_PASSPORT"] = "us_passport";
  DocumentType2["US_DRIVERS_LICENSE"] = "us_drivers_license";
  DocumentType2["US_STATE_ID"] = "us_state_id";
  DocumentType2["INTERNATIONAL_PASSPORT"] = "international_passport";
  DocumentType2["UK_PASSPORT"] = "uk_passport";
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
  DocumentType2["CANADA_DRIVERS_LICENSE"] = "ca_drivers_license";
  DocumentType2["INDIA_DRIVERS_LICENSE"] = "in_drivers_license";
  return DocumentType2;
})(DocumentType || {});
function getDocumentTypeInfo(type) {
  const info = {
    ["us_passport" /* US_PASSPORT */]: {
      code: "us_passport" /* US_PASSPORT */,
      displayName: "US Passport",
      hasMRZ: true,
      requiresBack: false
    },
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
    ["international_passport" /* INTERNATIONAL_PASSPORT */]: {
      code: "international_passport" /* INTERNATIONAL_PASSPORT */,
      displayName: "International Passport",
      hasMRZ: true,
      requiresBack: false
    },
    ["uk_passport" /* UK_PASSPORT */]: {
      code: "uk_passport" /* UK_PASSPORT */,
      displayName: "UK Passport",
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
    ["in_drivers_license" /* INDIA_DRIVERS_LICENSE */]: {
      code: "in_drivers_license" /* INDIA_DRIVERS_LICENSE */,
      displayName: "Driver's License",
      hasMRZ: false,
      requiresBack: true
    }
  };
  return info[type];
}

// src/types/Configuration.ts
var environmentUrls = {
  production: "https://api.koraidv.com/api/v1",
  sandbox: "https://sandbox-api.koraidv.com/api/v1"
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
  KoraErrorCode2["CAMERA_ACCESS_DENIED"] = "CAMERA_ACCESS_DENIED";
  KoraErrorCode2["CAMERA_NOT_AVAILABLE"] = "CAMERA_NOT_AVAILABLE";
  KoraErrorCode2["CAPTURE_FAILED"] = "CAPTURE_FAILED";
  KoraErrorCode2["QUALITY_VALIDATION_FAILED"] = "QUALITY_VALIDATION_FAILED";
  KoraErrorCode2["DOCUMENT_NOT_DETECTED"] = "DOCUMENT_NOT_DETECTED";
  KoraErrorCode2["DOCUMENT_TYPE_NOT_SUPPORTED"] = "DOCUMENT_TYPE_NOT_SUPPORTED";
  KoraErrorCode2["MRZ_READ_FAILED"] = "MRZ_READ_FAILED";
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
  ["CAMERA_ACCESS_DENIED" /* CAMERA_ACCESS_DENIED */]: "Camera access denied. Please enable camera access.",
  ["CAMERA_NOT_AVAILABLE" /* CAMERA_NOT_AVAILABLE */]: "Camera not available on this device.",
  ["CAPTURE_FAILED" /* CAPTURE_FAILED */]: "Capture failed.",
  ["QUALITY_VALIDATION_FAILED" /* QUALITY_VALIDATION_FAILED */]: "Quality check failed.",
  ["DOCUMENT_NOT_DETECTED" /* DOCUMENT_NOT_DETECTED */]: "Document not detected. Position document in frame.",
  ["DOCUMENT_TYPE_NOT_SUPPORTED" /* DOCUMENT_TYPE_NOT_SUPPORTED */]: "Document type not supported.",
  ["MRZ_READ_FAILED" /* MRZ_READ_FAILED */]: "Could not read document MRZ.",
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

// src/api/ApiClient.ts
var ApiClient = class {
  constructor(configuration) {
    this.maxRetries = 3;
    this.baseDelay = 1e3;
    this.configuration = configuration;
    this.baseUrl = environmentUrls[configuration.environment];
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
   * Upload document image
   */
  async uploadDocument(verificationId, imageData, side, documentType) {
    const formData = new FormData();
    formData.append("image", imageData, "document.jpg");
    formData.append("document_type", documentType);
    formData.append("side", side);
    const endpoint = side === "front" ? `/verifications/${verificationId}/document` : `/verifications/${verificationId}/document/back`;
    return this.request(endpoint, {
      method: "POST",
      body: formData,
      headers: {}
      // Let browser set Content-Type for FormData
    });
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
KoraIDV.VERSION = "1.0.0";

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiClient,
  DocumentType,
  KoraError,
  KoraErrorCode,
  KoraIDV,
  MrzParser,
  QualityValidator,
  getDocumentTypeInfo
});
