import { ApiClient } from './api/ApiClient';
import { Configuration, defaultConfiguration } from './types/Configuration';
import { Verification, VerificationStatus } from './types/Verification';
import { KoraError, KoraErrorCode } from './types/KoraError';
import { DocumentType } from './types/DocumentType';
import { LivenessSession, LivenessChallenge, DocumentQualityResponse } from './types/ApiModels';

/**
 * Verification flow callbacks
 */
export interface VerificationCallbacks {
  onComplete?: (verification: Verification) => void;
  onError?: (error: KoraError) => void;
  onCancel?: () => void;
  onStepChange?: (step: VerificationStep) => void;
}

/**
 * Verification flow options
 */
export interface VerificationOptions {
  externalId: string;
  tier?: 'basic' | 'standard' | 'enhanced';
  documentTypes?: DocumentType[];
}

/**
 * Verification step
 */
export type VerificationStep =
  | 'consent'
  | 'document_selection'
  | 'document_front'
  | 'document_back'
  | 'selfie'
  | 'liveness'
  | 'processing'
  | 'complete';

/**
 * Main Kora IDV SDK class
 */
export class KoraIDV {
  private configuration: Configuration;
  private apiClient: ApiClient;
  private currentVerification: Verification | null = null;
  private livenessSession: LivenessSession | null = null;
  private sessionStartTime: Date | null = null;

  static readonly VERSION = '1.0.0';

  constructor(config: Partial<Configuration> & { apiKey: string; tenantId: string }) {
    this.configuration = {
      ...defaultConfiguration,
      ...config,
      environment: config.environment ?? this.detectEnvironment(config.apiKey),
    };

    this.apiClient = new ApiClient(this.configuration);
  }

  private detectEnvironment(apiKey: string): 'production' | 'sandbox' {
    return apiKey.startsWith('ck_sandbox_') ? 'sandbox' : 'production';
  }

  /**
   * Start a new verification flow
   */
  async startVerification(
    options: VerificationOptions,
    callbacks: VerificationCallbacks
  ): Promise<void> {
    try {
      this.sessionStartTime = new Date();

      // Create verification
      const verification = await this.apiClient.createVerification({
        externalId: options.externalId,
        tier: options.tier ?? 'standard',
      });

      this.currentVerification = verification;
      callbacks.onStepChange?.('consent');
    } catch (error) {
      callbacks.onError?.(error instanceof KoraError ? error : new KoraError(KoraErrorCode.UNKNOWN, String(error)));
    }
  }

  /**
   * Resume an existing verification
   */
  async resumeVerification(
    verificationId: string,
    callbacks: VerificationCallbacks
  ): Promise<void> {
    try {
      this.sessionStartTime = new Date();

      const verification = await this.apiClient.getVerification(verificationId);
      this.currentVerification = verification;

      const step = this.determineStepFromStatus(verification.status);
      callbacks.onStepChange?.(step);
    } catch (error) {
      callbacks.onError?.(error instanceof KoraError ? error : new KoraError(KoraErrorCode.UNKNOWN, String(error)));
    }
  }

  /**
   * Check document quality before uploading (no active verification required)
   */
  async checkDocumentQuality(
    imageData: Blob,
    documentType: string
  ): Promise<DocumentQualityResponse> {
    return this.apiClient.checkDocumentQuality(imageData, documentType);
  }

  /**
   * Upload document image
   */
  async uploadDocument(
    imageData: Blob,
    side: 'front' | 'back',
    documentType: DocumentType
  ): Promise<{ success: boolean; qualityIssues?: string[] }> {
    if (!this.currentVerification) {
      throw new KoraError(KoraErrorCode.INVALID_VERIFICATION_STATE, 'No active verification');
    }

    const response = await this.apiClient.uploadDocument(
      this.currentVerification.id,
      imageData,
      side,
      documentType
    );

    return {
      success: response.success,
      qualityIssues: response.qualityIssues?.map(q => q.message),
    };
  }

  /**
   * Upload selfie image
   */
  async uploadSelfie(imageData: Blob): Promise<{ success: boolean; qualityIssues?: string[] }> {
    if (!this.currentVerification) {
      throw new KoraError(KoraErrorCode.INVALID_VERIFICATION_STATE, 'No active verification');
    }

    const response = await this.apiClient.uploadSelfie(this.currentVerification.id, imageData);

    return {
      success: response.success,
      qualityIssues: response.qualityIssues?.map(q => q.message),
    };
  }

  /**
   * Start liveness session
   */
  async startLivenessSession(): Promise<LivenessSession> {
    if (!this.currentVerification) {
      throw new KoraError(KoraErrorCode.INVALID_VERIFICATION_STATE, 'No active verification');
    }

    this.livenessSession = await this.apiClient.createLivenessSession(this.currentVerification.id);
    return this.livenessSession;
  }

  /**
   * Submit liveness challenge
   */
  async submitLivenessChallenge(
    challenge: LivenessChallenge,
    imageData: Blob
  ): Promise<{ passed: boolean; remainingChallenges: number }> {
    if (!this.currentVerification) {
      throw new KoraError(KoraErrorCode.INVALID_VERIFICATION_STATE, 'No active verification');
    }

    const response = await this.apiClient.submitLivenessChallenge(
      this.currentVerification.id,
      challenge,
      imageData
    );

    return {
      passed: response.challengePassed,
      remainingChallenges: response.remainingChallenges,
    };
  }

  /**
   * Complete the verification
   */
  async completeVerification(): Promise<Verification> {
    if (!this.currentVerification) {
      throw new KoraError(KoraErrorCode.INVALID_VERIFICATION_STATE, 'No active verification');
    }

    this.currentVerification = await this.apiClient.completeVerification(this.currentVerification.id);
    return this.currentVerification;
  }

  /**
   * Get current verification
   */
  getCurrentVerification(): Verification | null {
    return this.currentVerification;
  }

  /**
   * Get current liveness session
   */
  getLivenessSession(): LivenessSession | null {
    return this.livenessSession;
  }

  /**
   * Check if session has timed out
   */
  isSessionTimedOut(): boolean {
    if (!this.sessionStartTime) return false;
    const elapsed = Date.now() - this.sessionStartTime.getTime();
    return elapsed > this.configuration.timeout * 1000;
  }

  /**
   * Reset the session
   */
  reset(): void {
    this.currentVerification = null;
    this.livenessSession = null;
    this.sessionStartTime = null;
  }

  private determineStepFromStatus(status: VerificationStatus): VerificationStep {
    switch (status) {
      case 'pending':
        return 'consent';
      case 'document_required':
        return 'document_selection';
      case 'selfie_required':
        return 'selfie';
      case 'liveness_required':
        return 'liveness';
      case 'processing':
        return 'processing';
      case 'approved':
      case 'rejected':
      case 'review_required':
      case 'expired':
        return 'complete';
      default:
        return 'consent';
    }
  }
}
