import { ApiClient } from './api/ApiClient';
import { Configuration, defaultConfiguration } from './types/Configuration';
import { Verification, VerificationStatus } from './types/Verification';
import { KoraError, KoraErrorCode } from './types/KoraError';
import { DocumentType } from './types/DocumentType';
import { LivenessSession, LivenessChallenge, DocumentQualityResponse, SupportedCountry } from './types/ApiModels';

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
  /**
   * Optional name-match inputs. When set, the backend compares the
   * OCR'd names on the document against these values and surfaces a
   * real `scores.nameMatch` percentage on the verification result.
   * Mirrors iOS's startVerification(expectedFirstName:expectedLastName:).
   */
  expectedFirstName?: string;
  expectedLastName?: string;
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

  static readonly VERSION = '1.9.7';

  constructor(config: Partial<Configuration> & { apiKey: string; tenantId: string }) {
    this.configuration = {
      ...defaultConfiguration,
      ...config,
      environment: config.environment ?? this.detectEnvironment(config.apiKey),
    };

    this.apiClient = new ApiClient(this.configuration);
  }

  private detectEnvironment(apiKey: string): 'production' | 'sandbox' {
    // Canonical: sk_sandbox_<slug>_<hex> | sk_live_<slug>_<hex>.
    return apiKey.startsWith('sk_sandbox_') ? 'sandbox' : 'production';
  }

  /**
   * Get supported countries and their document types from the API
   */
  async getSupportedCountries(): Promise<SupportedCountry[]> {
    return this.apiClient.getSupportedCountries();
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
        expectedFirstName: options.expectedFirstName,
        expectedLastName: options.expectedLastName,
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
    documentType: DocumentType,
    country?: string,
  ): Promise<{ success: boolean; qualityIssues?: string[] }> {
    if (!this.currentVerification) {
      throw new KoraError(KoraErrorCode.INVALID_VERIFICATION_STATE, 'No active verification');
    }

    // Country is the ISO-3166 alpha-2 code the SDK user picked at the
    // country-selection screen. Native iOS/Android SDKs pass it on every
    // upload so the backend can backfill verification.selected_country
    // and the selected-vs-detected mismatch gate can specialise generic
    // classifier outputs (drivers_license_generic → us_drivers_license
    // etc.) against the user's pick. Web shipped without threading this
    // through any layer, so a US DL whose OCR text was ambiguous enough
    // to be classified as drivers_license_generic would auto-reject
    // against a us_drivers_license selection — exact failure mode
    // verification 0cb3bb3e-… hit on 2026-05-30.
    const response = await this.apiClient.uploadDocument(
      this.currentVerification.id,
      imageData,
      side,
      documentType,
      undefined, // decodedBarcodePayload — wired separately for back-side fast path
      country,
    );

    // Backend's ProcessDocumentResult doesn't carry a `success` field —
    // heavy analysis (OCR, ML, face embedding, quality) runs async, so
    // the synchronous response only confirms `imagePersisted: true`.
    // Treat absent `success` as success, mirroring iOS's `isSuccess`
    // helper (Verification.swift:DocumentUploadResponse, added
    // 2026-05-26 after BanffPay surfaced the same trap on the iOS path).
    // Web SDK had been silently failing every upload because
    // `if (result.success)` treated `undefined` as falsy.
    return {
      success: response.success ?? true,
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

    // Same absent-`success` trap as uploadDocument above.
    return {
      success: response.success ?? true,
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

    // Defensive defaults at the projection layer: even though
    // ApiClient.submitLivenessChallenge already applies ?? defaults to
    // these fields, double-guarding here means a future refactor that
    // strips ApiClient's defensiveness can't silently turn passed into
    // undefined → falsy → user stuck on the same challenge forever.
    // Same pattern v1.7.6 applied for upload success: belt + suspenders.
    return {
      passed: response.challengePassed ?? false,
      remainingChallenges: response.remainingChallenges ?? 0,
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
