/**
 * Supported document types.
 *
 * Note: This enum is maintained for backward compatibility. The SDK now fetches
 * the full list of supported countries and document types dynamically from the API.
 */
declare enum DocumentType {
    US_DRIVERS_LICENSE = "us_drivers_license",
    US_STATE_ID = "us_state_id",
    US_GREEN_CARD = "us_green_card",
    INTERNATIONAL_PASSPORT = "international_passport",
    EU_ID_GERMANY = "eu_id_de",
    EU_ID_FRANCE = "eu_id_fr",
    EU_ID_SPAIN = "eu_id_es",
    EU_ID_ITALY = "eu_id_it",
    GHANA_CARD = "ghana_card",
    NIGERIA_NIN = "ng_nin",
    NIGERIA_DRIVERS_LICENSE = "ng_drivers_license",
    GHANA_DRIVERS_LICENSE = "gh_drivers_license",
    KENYA_ID = "ke_id",
    KENYA_DRIVERS_LICENSE = "ke_drivers_license",
    SOUTH_AFRICA_ID = "za_id",
    SOUTH_AFRICA_DRIVERS_LICENSE = "za_drivers_license",
    UK_DRIVERS_LICENSE = "uk_drivers_license",
    NIGERIA_VOTERS_CARD = "ng_voters_card",
    LIBERIA_ID = "lr_id",
    LIBERIA_DRIVERS_LICENSE = "lr_drivers_license",
    LIBERIA_VOTERS_CARD = "lr_voters_card",
    SIERRA_LEONE_ID = "sl_id",
    SIERRA_LEONE_DRIVERS_LICENSE = "sl_drivers_license",
    SIERRA_LEONE_VOTERS_CARD = "sl_voters_card",
    GAMBIA_ID = "gm_id",
    GAMBIA_DRIVERS_LICENSE = "gm_drivers_license",
    UK_BRP = "uk_brp",
    CANADA_DRIVERS_LICENSE = "ca_drivers_license",
    CANADA_PR_CARD = "ca_pr_card",
    CANADA_NATIONAL_ID = "ca_national_id",
    INDIA_DRIVERS_LICENSE = "in_drivers_license",
    GERMANY_RP = "de_rp",
    FRANCE_RP = "fr_rp",
    ITALY_RP = "it_rp",
    SPAIN_RP = "es_rp",
    IRELAND_RP = "ie_rp",
    PORTUGAL_RP = "pt_rp",
    SWEDEN_RP = "se_rp",
    DENMARK_RP = "dk_rp",
    NORWAY_RP = "no_rp",
    FINLAND_RP = "fi_rp",
    POLAND_RP = "pl_rp"
}
/**
 * Document type metadata
 */
interface DocumentTypeInfo {
    code: DocumentType;
    displayName: string;
    hasMRZ: boolean;
    requiresBack: boolean;
}
/**
 * Get document type info
 */
declare function getDocumentTypeInfo(type: DocumentType): DocumentTypeInfo;

/**
 * SDK Configuration
 */
interface Configuration {
    /** API key (starts with ck_live_ or ck_sandbox_) */
    apiKey: string;
    /** Tenant ID (UUID) */
    tenantId: string;
    /** API environment */
    environment: Environment;
    /** Allowed document types */
    documentTypes: DocumentType[];
    /** Liveness detection mode */
    livenessMode: LivenessMode;
    /** Custom theme for UI */
    theme: Theme;
    /** Localization settings */
    locale: Locale;
    /** Session timeout in seconds */
    timeout: number;
    /** Enable debug logging */
    debugLogging: boolean;
}
/**
 * API Environment
 */
type Environment = 'production' | 'sandbox';
/**
 * Liveness detection mode
 */
type LivenessMode = 'active' | 'passive';
/**
 * Theme configuration
 */
interface Theme {
    primaryColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    secondaryTextColor: string;
    errorColor: string;
    successColor: string;
    borderRadius: number;
    fontFamily?: string;
}
/**
 * Localization settings
 */
interface Locale {
    language: string;
    region?: string;
}

/**
 * Verification model
 */
interface Verification {
    /** Unique verification ID */
    id: string;
    /** External ID provided by the client */
    externalId: string;
    /** Tenant ID */
    tenantId: string;
    /** Verification tier */
    tier: string;
    /** Current status */
    status: VerificationStatus;
    /** Document verification result */
    documentVerification?: DocumentVerification;
    /** Face verification result */
    faceVerification?: FaceVerification;
    /** Liveness verification result */
    livenessVerification?: LivenessVerification;
    /** Per-feature score breakdown (0-100 scale) */
    scores?: VerificationScores;
    /** Risk signals */
    riskSignals?: RiskSignal[];
    /** Overall risk score (0-100) */
    riskScore?: number;
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
    /** Completion timestamp */
    completedAt?: Date;
}
/**
 * Verification status
 */
type VerificationStatus = 'pending' | 'document_required' | 'selfie_required' | 'liveness_required' | 'processing' | 'approved' | 'rejected' | 'review_required' | 'expired';
/**
 * Document verification result
 */
interface DocumentVerification {
    documentType: string;
    documentNumber?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    expirationDate?: string;
    issuingCountry?: string;
    mrzValid?: boolean;
    authenticityScore?: number;
    extractedFields?: Record<string, string>;
}
/**
 * Face verification result
 */
interface FaceVerification {
    matchScore: number;
    matchResult: string;
    confidence: number;
}
/**
 * Liveness verification result
 */
interface LivenessVerification {
    livenessScore: number;
    isLive: boolean;
    challengeResults?: ChallengeResult[];
}
/**
 * Individual challenge result
 */
interface ChallengeResult {
    type: string;
    passed: boolean;
    confidence: number;
}
/**
 * Per-feature verification scores (0-100 scale).
 *
 * Mirrors the iOS / Android / Flutter SDKs so partners writing
 * cross-platform code see the same shape on every platform. The single
 * `overall` is the fused risk score (also exposed as `Verification.riskScore`
 * at the top level for convenience). Individual feature scores let you
 * drill into which check drove the result.
 */
interface VerificationScores {
    documentQuality: number;
    documentAuth: number;
    faceMatch: number;
    liveness: number;
    nameMatch: number;
    dataConsistency: number;
    screening: number;
    overall: number;
}
/**
 * Risk signal
 */
interface RiskSignal {
    code: string;
    severity: string;
    message: string;
}

/**
 * Kora error codes
 */
declare enum KoraErrorCode {
    NOT_CONFIGURED = "NOT_CONFIGURED",
    INVALID_API_KEY = "INVALID_API_KEY",
    INVALID_TENANT_ID = "INVALID_TENANT_ID",
    NETWORK_ERROR = "NETWORK_ERROR",
    TIMEOUT = "TIMEOUT",
    NO_INTERNET = "NO_INTERNET",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    RATE_LIMITED = "RATE_LIMITED",
    SERVER_ERROR = "SERVER_ERROR",
    HTTP_ERROR = "HTTP_ERROR",
    INVALID_RESPONSE = "INVALID_RESPONSE",
    NO_DATA = "NO_DATA",
    DECODING_ERROR = "DECODING_ERROR",
    ENCODING_ERROR = "ENCODING_ERROR",
    CAMERA_ACCESS_DENIED = "CAMERA_ACCESS_DENIED",
    CAMERA_NOT_AVAILABLE = "CAMERA_NOT_AVAILABLE",
    CAPTURE_FAILED = "CAPTURE_FAILED",
    QUALITY_VALIDATION_FAILED = "QUALITY_VALIDATION_FAILED",
    DOCUMENT_NOT_DETECTED = "DOCUMENT_NOT_DETECTED",
    DOCUMENT_TYPE_NOT_SUPPORTED = "DOCUMENT_TYPE_NOT_SUPPORTED",
    MRZ_READ_FAILED = "MRZ_READ_FAILED",
    NFC_NOT_AVAILABLE = "NFC_NOT_AVAILABLE",
    NFC_READ_FAILED = "NFC_READ_FAILED",
    FACE_NOT_DETECTED = "FACE_NOT_DETECTED",
    MULTIPLE_FACES_DETECTED = "MULTIPLE_FACES_DETECTED",
    FACE_MATCH_FAILED = "FACE_MATCH_FAILED",
    LIVENESS_CHECK_FAILED = "LIVENESS_CHECK_FAILED",
    CHALLENGE_NOT_COMPLETED = "CHALLENGE_NOT_COMPLETED",
    SESSION_EXPIRED = "SESSION_EXPIRED",
    VERIFICATION_EXPIRED = "VERIFICATION_EXPIRED",
    VERIFICATION_ALREADY_COMPLETED = "VERIFICATION_ALREADY_COMPLETED",
    INVALID_VERIFICATION_STATE = "INVALID_VERIFICATION_STATE",
    UNKNOWN = "UNKNOWN",
    USER_CANCELLED = "USER_CANCELLED"
}
/**
 * Kora SDK Error
 */
declare class KoraError extends Error {
    readonly code: KoraErrorCode;
    readonly recoverySuggestion?: string;
    readonly details?: unknown;
    constructor(code: KoraErrorCode, details?: unknown);
    /**
     * Create error from HTTP status code
     */
    static fromHttpStatus(status: number, details?: unknown): KoraError;
    /**
     * Check if error is retryable
     */
    get isRetryable(): boolean;
    toJSON(): {
        name: string;
        code: KoraErrorCode;
        message: string;
        recoverySuggestion: string | undefined;
        details: unknown;
    };
}

/**
 * Create verification request
 */
interface CreateVerificationRequest {
    externalId: string;
    tier: string;
}
/**
 * Document upload response
 */
interface DocumentUploadResponse {
    success: boolean;
    documentId?: string;
    qualityScore?: number;
    qualityIssues?: QualityIssue$1[];
    extractedData?: DocumentExtractedData;
}
/**
 * Quality issue
 */
interface QualityIssue$1 {
    type: string;
    message: string;
    severity: 'error' | 'warning';
}
/**
 * Extracted document data
 */
interface DocumentExtractedData {
    documentType: string;
    documentNumber?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    expirationDate?: string;
    issuingCountry?: string;
    mrzValid?: boolean;
}
/**
 * Selfie upload response
 */
interface SelfieUploadResponse {
    success: boolean;
    selfieId?: string;
    faceDetected: boolean;
    qualityScore?: number;
    qualityIssues?: QualityIssue$1[];
}
/**
 * Liveness session
 */
interface LivenessSession {
    sessionId: string;
    challenges: LivenessChallenge[];
    expiresAt: Date;
}
/**
 * Liveness challenge
 */
interface LivenessChallenge {
    id: string;
    type: ChallengeType;
    instruction: string;
    order: number;
}
/**
 * Challenge type
 */
type ChallengeType = 'blink' | 'smile' | 'turn_left' | 'turn_right' | 'nod_up' | 'nod_down';
/**
 * Liveness challenge response
 */
interface LivenessChallengeResponse {
    success: boolean;
    challengePassed: boolean;
    confidence: number;
    remainingChallenges: number;
}
/**
 * Document quality check response
 */
interface DocumentQualityResponse {
    success: boolean;
    qualityScore: number;
    qualityIssues: string[];
    details: {
        textReadability: number;
        faceQuality: number;
        imageClarity: number;
    };
}
/**
 * Supported country with its available document types
 */
interface SupportedCountry {
    id: string;
    name: string;
    flagEmoji: string;
    documentTypes: string[];
}
/**
 * Handoff session created by the web SDK for cross-device mobile capture.
 */
interface HandoffSession {
    token: string;
    captureUrl: string;
    expiresAt: string;
    expiresIn: number;
}
/**
 * Context returned when a mobile browser validates a handoff token.
 */
interface HandoffContext {
    verificationId: string;
    tenantId: string;
    apiKey: string;
    expiresAt: string;
}

/**
 * Verification flow callbacks
 */
interface VerificationCallbacks {
    onComplete?: (verification: Verification) => void;
    onError?: (error: KoraError) => void;
    onCancel?: () => void;
    onStepChange?: (step: VerificationStep) => void;
}
/**
 * Verification flow options
 */
interface VerificationOptions {
    externalId: string;
    tier?: 'basic' | 'standard' | 'enhanced';
    documentTypes?: DocumentType[];
}
/**
 * Verification step
 */
type VerificationStep = 'consent' | 'document_selection' | 'document_front' | 'document_back' | 'selfie' | 'liveness' | 'processing' | 'complete';
/**
 * Main Kora IDV SDK class
 */
declare class KoraIDV {
    private configuration;
    private apiClient;
    private currentVerification;
    private livenessSession;
    private sessionStartTime;
    static readonly VERSION = "1.5.2";
    constructor(config: Partial<Configuration> & {
        apiKey: string;
        tenantId: string;
    });
    private detectEnvironment;
    /**
     * Get supported countries and their document types from the API
     */
    getSupportedCountries(): Promise<SupportedCountry[]>;
    /**
     * Start a new verification flow
     */
    startVerification(options: VerificationOptions, callbacks: VerificationCallbacks): Promise<void>;
    /**
     * Resume an existing verification
     */
    resumeVerification(verificationId: string, callbacks: VerificationCallbacks): Promise<void>;
    /**
     * Check document quality before uploading (no active verification required)
     */
    checkDocumentQuality(imageData: Blob, documentType: string): Promise<DocumentQualityResponse>;
    /**
     * Upload document image
     */
    uploadDocument(imageData: Blob, side: 'front' | 'back', documentType: DocumentType): Promise<{
        success: boolean;
        qualityIssues?: string[];
    }>;
    /**
     * Upload selfie image
     */
    uploadSelfie(imageData: Blob): Promise<{
        success: boolean;
        qualityIssues?: string[];
    }>;
    /**
     * Start liveness session
     */
    startLivenessSession(): Promise<LivenessSession>;
    /**
     * Submit liveness challenge
     */
    submitLivenessChallenge(challenge: LivenessChallenge, imageData: Blob): Promise<{
        passed: boolean;
        remainingChallenges: number;
    }>;
    /**
     * Complete the verification
     */
    completeVerification(): Promise<Verification>;
    /**
     * Get current verification
     */
    getCurrentVerification(): Verification | null;
    /**
     * Get current liveness session
     */
    getLivenessSession(): LivenessSession | null;
    /**
     * Check if session has timed out
     */
    isSessionTimedOut(): boolean;
    /**
     * Reset the session
     */
    reset(): void;
    private determineStepFromStatus;
}

/**
 * API Client for Kora IDV
 */
declare class ApiClient {
    private readonly baseUrl;
    private readonly configuration;
    private readonly maxRetries;
    private readonly baseDelay;
    constructor(configuration: Configuration);
    /**
     * Get supported countries and their document types
     */
    getSupportedCountries(): Promise<SupportedCountry[]>;
    /**
     * Create a new verification
     */
    createVerification(request: CreateVerificationRequest): Promise<Verification>;
    /**
     * Get an existing verification
     */
    getVerification(id: string): Promise<Verification>;
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
    uploadDocument(verificationId: string, imageData: Blob, side: 'front' | 'back', documentType: DocumentType, decodedBarcodePayload?: string): Promise<DocumentUploadResponse>;
    /**
     * Upload selfie image
     */
    uploadSelfie(verificationId: string, imageData: Blob): Promise<SelfieUploadResponse>;
    /**
     * Create liveness session
     */
    createLivenessSession(verificationId: string): Promise<LivenessSession>;
    /**
     * Submit liveness challenge
     */
    submitLivenessChallenge(verificationId: string, challenge: LivenessChallenge, imageData: Blob): Promise<LivenessChallengeResponse>;
    /**
     * Check document quality before uploading
     */
    checkDocumentQuality(imageData: Blob, documentType: string): Promise<DocumentQualityResponse>;
    /**
     * Complete the verification
     */
    completeVerification(verificationId: string): Promise<Verification>;
    /**
     * Create a handoff session for cross-device mobile capture.
     * Returns a token and capture URL to encode in a QR code.
     */
    createHandoffSession(verificationId: string): Promise<HandoffSession>;
    /**
     * Validate a handoff token (called by the mobile capture page).
     * Returns the verification context needed to continue capture.
     */
    validateHandoffToken(token: string): Promise<HandoffContext>;
    /**
     * Subscribe to verification status events via Server-Sent Events.
     * Returns an EventSource that emits 'status' and 'complete' events.
     */
    subscribeToVerificationEvents(verificationId: string): EventSource;
    /**
     * Make an API request with retry logic
     */
    private request;
    private executeWithRetry;
    private shouldRetry;
    private shouldRetryNetworkError;
    private calculateDelay;
    private sleep;
    private blobToBase64;
    /**
     * Transform snake_case response to camelCase
     */
    private transformResponse;
}

/**
 * Quality validation thresholds
 */
interface QualityThresholds {
    /** Minimum blur score (Laplacian variance) */
    minBlurScore: number;
    /** Minimum brightness (0-1) */
    minBrightness: number;
    /** Maximum brightness (0-1) */
    maxBrightness: number;
    /** Maximum glare percentage */
    maxGlarePercentage: number;
    /** Minimum face size as percentage of frame */
    minFaceSizePercentage: number;
    /** Face detection confidence threshold */
    minFaceConfidence: number;
}
/**
 * Quality validation result
 */
interface QualityResult {
    isValid: boolean;
    issues: QualityIssue[];
    metrics: QualityMetrics;
}
/**
 * Quality issue
 */
interface QualityIssue {
    type: QualityIssueType;
    message: string;
    severity: 'error' | 'warning';
}
/**
 * Quality issue types
 */
type QualityIssueType = 'blur' | 'too_dark' | 'too_bright' | 'glare' | 'face_not_detected' | 'face_too_small' | 'face_off_center' | 'multiple_faces' | 'document_not_detected' | 'document_partially_visible';
/**
 * Quality metrics
 */
interface QualityMetrics {
    blurScore?: number;
    brightness?: number;
    glarePercentage?: number;
    faceSize?: number;
    faceConfidence?: number;
    faceCenterOffset?: {
        x: number;
        y: number;
    };
}
/**
 * Quality validator for captured images
 */
declare class QualityValidator {
    private thresholds;
    constructor(thresholds?: Partial<QualityThresholds>);
    /**
     * Validate document image quality
     */
    validateDocumentImage(imageData: ImageData): Promise<QualityResult>;
    /**
     * Validate selfie image quality
     */
    validateSelfieImage(imageData: ImageData, faceDetection?: {
        confidence: number;
        boundingBox: DOMRect;
    }): Promise<QualityResult>;
    /**
     * Calculate blur score using Laplacian variance
     */
    private calculateBlurScore;
    /**
     * Calculate average brightness (0-1)
     */
    private calculateBrightness;
    /**
     * Calculate percentage of overexposed pixels (glare)
     */
    private calculateGlarePercentage;
}

/**
 * MRZ (Machine Readable Zone) Parser
 * Supports TD1, TD2, and TD3 formats
 */
/**
 * Parsed MRZ data
 */
interface MrzData {
    /** Document format (TD1, TD2, TD3) */
    format: MrzFormat;
    /** Document type (P=Passport, I=ID, etc.) */
    documentType: string;
    /** Issuing country code (3-letter) */
    issuingCountry: string;
    /** Last name (surname) */
    lastName: string;
    /** First name(s) */
    firstName: string;
    /** Document number */
    documentNumber: string;
    /** Nationality (3-letter country code) */
    nationality: string;
    /** Date of birth (YYMMDD) */
    dateOfBirth: string;
    /** Sex (M/F/<) */
    sex: string;
    /** Expiration date (YYMMDD) */
    expirationDate: string;
    /** Optional data field 1 */
    optionalData1?: string;
    /** Optional data field 2 */
    optionalData2?: string;
    /** Whether all check digits are valid */
    isValid: boolean;
    /** Validation errors */
    validationErrors: string[];
}
/**
 * MRZ format type
 */
type MrzFormat = 'TD1' | 'TD2' | 'TD3';
/**
 * MRZ Parser class
 */
declare class MrzParser {
    /**
     * Parse MRZ text
     */
    parse(mrzText: string): MrzData | null;
    /**
     * Clean and normalize MRZ text
     */
    private cleanMrzText;
    /**
     * Detect MRZ line length
     */
    private detectLineLength;
    /**
     * Detect MRZ format
     */
    private detectFormat;
    /**
     * Parse TD1 format (ID cards - 3 lines × 30 chars)
     */
    private parseTD1;
    /**
     * Parse TD2 format (Some ID cards - 2 lines × 36 chars)
     */
    private parseTD2;
    /**
     * Parse TD3 format (Passports - 2 lines × 44 chars)
     */
    private parseTD3;
    /**
     * Parse name field
     */
    private parseName;
    /**
     * Validate MRZ check digit
     */
    private validateCheckDigit;
    /**
     * Format date from YYMMDD to human readable
     */
    static formatDate(yymmdd: string): string;
}

/**
 * Convert a Blob to a base64-encoded string (no data URL prefix).
 *
 * Used by the back-side document upload path to build the JSON request
 * body that matches the server's `imageBase64` contract (and the
 * Android/iOS SDK wire formats).
 */
declare function blobToBase64(blob: Blob): Promise<string>;

/**
 * On-device barcode decoder for the back side of identity documents.
 *
 * The KoraIDV pipeline cascades through three decoders in priority order:
 *   1. **This class (browser BarcodeDetector)** — runs on the captured
 *      back-side image before upload. When it succeeds, the decoded
 *      AAMVA payload travels to the server in
 *      `uploadDocument(..., decodedBarcodePayload)` and the server skips
 *      image decoding entirely.
 *   2. **zxing-cpp** (server-side) — primary decoder when the client failed
 *      or the browser lacks BarcodeDetector.
 *   3. **pdf417decoder** (server-side) — fallback for captures zxing-cpp
 *      can't read.
 *
 * Why decode in the browser when the server can do it? Three reasons:
 *   - **Latency**: in-browser decode finishes in ~100-300 ms vs. ~1-3 s
 *     server round-trip + cascade.
 *   - **Cost**: zero ml-service compute on the happy path.
 *   - **Offline-friendly**: in some embedded flows (kiosk, on-prem),
 *     server-side decode is unavailable but the browser can still read
 *     the barcode.
 *
 * Browser support (as of 2026):
 *   - **Native**: Chrome 88+, Edge 88+, Samsung Internet 15+, Opera 74+
 *     on Android. Safari 16.4+ macOS/iOS supports a subset (no PDF417 on
 *     iOS Safari yet — the symbology list is a moving target). When
 *     unsupported, `isSupported()` returns false and the SDK silently
 *     falls back to the server cascade.
 *   - **Polyfill**: applications that need cross-browser support can
 *     install a JS polyfill (e.g. `barcode-detector` from npm) before
 *     the SDK loads; it registers `globalThis.BarcodeDetector` and this
 *     class will pick it up automatically.
 *
 * See `docs/architecture/idv-decode-roadmap.md` Phase 4.
 */
type BarcodeFormat = 'pdf417' | 'qr_code' | 'data_matrix' | 'aztec' | 'code_128' | 'code_39' | 'code_93' | 'codabar' | 'ean_13' | 'ean_8' | 'itf' | 'upc_a' | 'upc_e';
declare class WebBarcodeScanner {
    private detector;
    /**
     * Whether the current environment has a usable BarcodeDetector.
     * Either native (modern Chromium / Samsung) or a polyfill.
     */
    static isSupported(): boolean;
    /**
     * Construct a scanner. Restricts to PDF417 by default to avoid false
     * positives on the small Code128 strip US DLs also carry. Callers
     * onboarding QR-based docs (Nigeria voter's card) should pass
     * `['pdf417', 'qr_code']`.
     */
    constructor(formats?: BarcodeFormat[]);
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
    decodePdf417(source: ImageBitmapSource): Promise<string | null>;
}

/**
 * WalletModels.ts
 * KoraIDV Wallet — W3C Verifiable Credential types for Web
 *
 * Types are prefixed with "Wallet" to avoid conflicts with existing KoraIDV types.
 */
interface WalletCredential {
    readonly '@context': string[];
    readonly id: string;
    readonly type: string[];
    readonly issuer: string;
    readonly issuanceDate: string;
    readonly expirationDate: string;
    readonly credentialSubject: WalletCredentialSubject;
    readonly credentialStatus?: WalletCredentialStatus;
    readonly proof?: WalletDataIntegrityProof;
}
interface WalletCredentialSubject {
    readonly id: string;
    readonly fullName: string;
    readonly dateOfBirth?: string;
    readonly nationality?: string;
    readonly verificationLevel: string;
    readonly documentType: string;
    readonly documentCountry: string;
    readonly biometricMatch: boolean;
    readonly livenessCheck: boolean;
    readonly governmentDbVerified: boolean;
    readonly verifiedAt: string;
    readonly confidenceScore: number;
}
interface WalletCredentialStatus {
    readonly id: string;
    readonly type: string;
    readonly statusPurpose: string;
    readonly statusListIndex: string;
    readonly statusListCredential: string;
}
interface WalletDataIntegrityProof {
    readonly type: string;
    readonly cryptosuite: string;
    readonly created: string;
    readonly verificationMethod: string;
    readonly proofPurpose: string;
    readonly proofValue: string;
}
interface StoredWalletCredential {
    readonly id: string;
    readonly credential: WalletCredential;
    readonly storedAt: string;
    readonly issuerDID: string;
    readonly subjectName: string;
    readonly expiresAt: string;
}
interface WalletPresentation {
    readonly '@context': string[];
    readonly type: string[];
    readonly holder: string | null;
    readonly verifiableCredential: WalletCredential[];
    readonly created: string;
    readonly audience: string | null;
    readonly challenge: string | null;
}
declare class WalletError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
    static storageFailed(): WalletError;
    static credentialNotFound(): WalletError;
    static credentialExpired(): WalletError;
    static encodingFailed(): WalletError;
    static cryptoUnavailable(): WalletError;
}
declare function createWalletCredential(params: Omit<WalletCredential, '@context' | 'type'> & {
    '@context'?: string[];
    type?: string[];
}): WalletCredential;

/**
 * SelectiveDisclosure.ts
 * KoraIDV Wallet — Selective disclosure profiles for Verifiable Presentations (Web)
 */

declare enum DisclosureClaim {
    FullName = "fullName",
    DateOfBirth = "dateOfBirth",
    Nationality = "nationality",
    VerificationLevel = "verificationLevel",
    DocumentType = "documentType",
    DocumentCountry = "documentCountry",
    BiometricMatch = "biometricMatch",
    LivenessCheck = "livenessCheck",
    GovernmentDbVerified = "governmentDbVerified",
    VerifiedAt = "verifiedAt",
    ConfidenceScore = "confidenceScore"
}
type DisclosureProfile = {
    type: 'full';
} | {
    type: 'onboarding';
} | {
    type: 'ageOnly';
} | {
    type: 'nationalityOnly';
} | {
    type: 'verificationOnly';
} | {
    type: 'custom';
    claims: Set<DisclosureClaim>;
};
declare const DisclosureProfiles: {
    full: DisclosureProfile;
    onboarding: DisclosureProfile;
    ageOnly: DisclosureProfile;
    nationalityOnly: DisclosureProfile;
    verificationOnly: DisclosureProfile;
    custom: (claims: Set<DisclosureClaim>) => DisclosureProfile;
};
/**
 * Apply a disclosure profile to a credential, returning a new credential
 * containing only the disclosed claims in its subject.
 */
declare function applyDisclosure(profile: DisclosureProfile, credential: WalletCredential): WalletCredential;
/**
 * For ageOnly profile, compute whether the subject is over 18.
 */
declare function computeAgeOver18(dateOfBirth?: string): boolean;

/**
 * KoraWallet.ts
 * KoraIDV Wallet — Main wallet class for Web
 */

/**
 * Main entry point for the Kora Wallet SDK module on Web.
 *
 * Provides credential storage (IndexedDB + Web Crypto), selective disclosure,
 * Verifiable Presentation creation, and deep-link sharing.
 */
declare class KoraWallet {
    private readonly credentialStore;
    constructor();
    /**
     * Store a Verifiable Credential in the wallet.
     * Returns the storage ID (same as the credential's `id`).
     */
    store(credential: WalletCredential): Promise<string>;
    /**
     * Retrieve all stored credentials.
     */
    getCredentials(): Promise<StoredWalletCredential[]>;
    /**
     * Retrieve a single credential by ID.
     */
    getCredential(id: string): Promise<StoredWalletCredential | null>;
    /**
     * Delete a credential from the wallet.
     */
    deleteCredential(id: string): Promise<void>;
    /**
     * Number of credentials currently stored.
     */
    getCredentialCount(): Promise<number>;
    /**
     * Create a Verifiable Presentation with selective disclosure.
     */
    createPresentation(params: {
        credentialId: string;
        profile: DisclosureProfile;
        audience?: string;
        nonce?: string;
    }): Promise<WalletPresentation>;
    /**
     * Generate a deep link URL for sharing a presentation.
     */
    generateDeepLink(presentation: WalletPresentation, profile?: DisclosureProfile): string | null;
    /**
     * Check whether a stored credential has expired.
     */
    isExpired(credentialId: string): Promise<boolean>;
    /**
     * Close the store and free resources.
     */
    close(): void;
}

/**
 * CredentialStore.ts
 * KoraIDV Wallet — IndexedDB + Web Crypto API encrypted credential storage for Web
 *
 * Uses the native SubtleCrypto API for AES-GCM encryption and IndexedDB
 * for persistent storage. No external crypto libraries required.
 */

/**
 * Encrypted credential storage backed by IndexedDB and Web Crypto API.
 */
declare class WalletCredentialStore {
    private db;
    private cryptoKey;
    private getDb;
    private getCryptoKey;
    private encrypt;
    private decrypt;
    save(id: string, credential: StoredWalletCredential): Promise<void>;
    load(id: string): Promise<StoredWalletCredential | null>;
    delete(id: string): Promise<void>;
    listIds(): Promise<string[]>;
    /**
     * Close the database connection and clear cached crypto key.
     */
    close(): void;
}

/**
 * VerifiablePresentation.ts
 * KoraIDV Wallet — VP creation with selective disclosure for Web
 */

/**
 * Factory for building W3C Verifiable Presentations.
 */
declare const WalletPresentationBuilder: {
    /**
     * Create a Verifiable Presentation from a credential with selective disclosure.
     */
    create(params: {
        credential: WalletCredential;
        profile: DisclosureProfile;
        holder?: string;
        audience?: string;
        nonce?: string;
    }): WalletPresentation;
    /**
     * Serialize a presentation to a JSON string.
     */
    encode(presentation: WalletPresentation): string;
    /**
     * Deserialize a presentation from a JSON string.
     */
    decode(json: string): WalletPresentation;
};

export { ApiClient, type ChallengeResult, type ChallengeType, type Configuration, type CreateVerificationRequest, DisclosureClaim, type DisclosureProfile, DisclosureProfiles, type DocumentQualityResponse, DocumentType, type DocumentTypeInfo, type DocumentUploadResponse, type DocumentVerification, type Environment, type FaceVerification, type HandoffContext, type HandoffSession, KoraError, KoraErrorCode, KoraIDV, KoraWallet, type LivenessChallenge, type LivenessChallengeResponse, type LivenessMode, type LivenessSession, type LivenessVerification, type Locale, MrzParser, type QualityIssue$1 as QualityIssue, QualityValidator, type RiskSignal, type SelfieUploadResponse, type StoredWalletCredential, type SupportedCountry, type Theme, type Verification, type VerificationCallbacks, type VerificationOptions, type VerificationScores, type VerificationStatus, type VerificationStep, type WalletCredential, type WalletCredentialStatus, WalletCredentialStore, type WalletCredentialSubject, type WalletDataIntegrityProof, WalletError, type WalletPresentation, WalletPresentationBuilder, WebBarcodeScanner, applyDisclosure, blobToBase64, computeAgeOver18, createWalletCredential, getDocumentTypeInfo };
