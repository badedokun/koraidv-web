/**
 * Create verification request
 */
export interface CreateVerificationRequest {
  externalId: string;
  tier: string;
  /**
   * Expected first name for name-match scoring. When set, the backend
   * compares the OCR'd given name on the document against this value
   * and surfaces a real `scores.nameMatch` percentage; when unset,
   * nameMatch is 0 and the ResultScreen's "Name Match" row shows FAIL
   * on otherwise-approved verifications. Optional — integrators that
   * don't have the user's claimed legal name (or don't care) can
   * omit. Mirrors iOS's `CreateVerificationRequest.expectedFirstName`.
   */
  expectedFirstName?: string;
  /** Expected last name. See `expectedFirstName` for semantics. */
  expectedLastName?: string;
  /**
   * Optional integrator-supplied metadata. The Web SDK ALWAYS adds
   * `source: 'web'` so the backend's source-aware threshold tuning
   * (v1.8.0+) can apply the right floors for webcam-captured selfies.
   * Anything the integrator passes here is merged on top of the
   * SDK-set `source` key.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Document upload response
 */
export interface DocumentUploadResponse {
  success: boolean;
  documentId?: string;
  qualityScore?: number;
  qualityIssues?: QualityIssue[];
  extractedData?: DocumentExtractedData;
}

/**
 * Quality issue
 */
export interface QualityIssue {
  type: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Extracted document data
 */
export interface DocumentExtractedData {
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
export interface SelfieUploadResponse {
  success: boolean;
  selfieId?: string;
  faceDetected: boolean;
  qualityScore?: number;
  qualityIssues?: QualityIssue[];
}

/**
 * Liveness session
 */
export interface LivenessSession {
  sessionId: string;
  challenges: LivenessChallenge[];
  expiresAt: Date;
}

/**
 * Liveness challenge
 */
export interface LivenessChallenge {
  id: string;
  type: ChallengeType;
  instruction: string;
  order: number;
}

/**
 * Challenge type
 */
export type ChallengeType =
  | 'blink'
  | 'smile'
  | 'turn_left'
  | 'turn_right'
  | 'nod_up'
  | 'nod_down';

/**
 * Liveness challenge response
 */
export interface LivenessChallengeResponse {
  success: boolean;
  challengePassed: boolean;
  confidence: number;
  remainingChallenges: number;
}

/**
 * Document quality check response
 */
export interface DocumentQualityResponse {
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
export interface SupportedCountry {
  id: string;
  name: string;
  flagEmoji: string;
  documentTypes: string[];
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  message: string;
  errors?: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}
