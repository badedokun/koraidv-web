/**
 * Verification model
 */
export interface Verification {
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
export type VerificationStatus =
  | 'pending'
  | 'document_required'
  | 'selfie_required'
  | 'liveness_required'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'review_required'
  | 'expired';

/**
 * Document verification result
 */
export interface DocumentVerification {
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
export interface FaceVerification {
  matchScore: number;
  matchResult: string;
  confidence: number;
}

/**
 * Liveness verification result
 */
export interface LivenessVerification {
  livenessScore: number;
  isLive: boolean;
  challengeResults?: ChallengeResult[];
}

/**
 * Individual challenge result
 */
export interface ChallengeResult {
  type: string;
  passed: boolean;
  confidence: number;
}

/**
 * Risk signal
 */
export interface RiskSignal {
  code: string;
  severity: string;
  message: string;
}
