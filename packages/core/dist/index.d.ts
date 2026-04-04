/**
 * Supported document types
 */
declare enum DocumentType {
    US_PASSPORT = "us_passport",
    US_DRIVERS_LICENSE = "us_drivers_license",
    US_STATE_ID = "us_state_id",
    INTERNATIONAL_PASSPORT = "international_passport",
    UK_PASSPORT = "uk_passport",
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
    CANADA_DRIVERS_LICENSE = "ca_drivers_license",
    INDIA_DRIVERS_LICENSE = "in_drivers_license"
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
    CAMERA_ACCESS_DENIED = "CAMERA_ACCESS_DENIED",
    CAMERA_NOT_AVAILABLE = "CAMERA_NOT_AVAILABLE",
    CAPTURE_FAILED = "CAPTURE_FAILED",
    QUALITY_VALIDATION_FAILED = "QUALITY_VALIDATION_FAILED",
    DOCUMENT_NOT_DETECTED = "DOCUMENT_NOT_DETECTED",
    DOCUMENT_TYPE_NOT_SUPPORTED = "DOCUMENT_TYPE_NOT_SUPPORTED",
    MRZ_READ_FAILED = "MRZ_READ_FAILED",
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
    static readonly VERSION = "1.0.0";
    constructor(config: Partial<Configuration> & {
        apiKey: string;
        tenantId: string;
    });
    private detectEnvironment;
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
     * Create a new verification
     */
    createVerification(request: CreateVerificationRequest): Promise<Verification>;
    /**
     * Get an existing verification
     */
    getVerification(id: string): Promise<Verification>;
    /**
     * Upload document image
     */
    uploadDocument(verificationId: string, imageData: Blob, side: 'front' | 'back', documentType: DocumentType): Promise<DocumentUploadResponse>;
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

export { ApiClient, type ChallengeResult, type ChallengeType, type Configuration, type CreateVerificationRequest, type DocumentQualityResponse, DocumentType, type DocumentTypeInfo, type DocumentUploadResponse, type DocumentVerification, type Environment, type FaceVerification, KoraError, KoraErrorCode, KoraIDV, type LivenessChallenge, type LivenessChallengeResponse, type LivenessMode, type LivenessSession, type LivenessVerification, type Locale, MrzParser, type QualityIssue$1 as QualityIssue, QualityValidator, type RiskSignal, type SelfieUploadResponse, type Theme, type Verification, type VerificationCallbacks, type VerificationOptions, type VerificationStatus, type VerificationStep, getDocumentTypeInfo };
