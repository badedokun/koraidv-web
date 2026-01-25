/**
 * Create verification request
 */
export interface CreateVerificationRequest {
  externalId: string;
  tier: string;
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
