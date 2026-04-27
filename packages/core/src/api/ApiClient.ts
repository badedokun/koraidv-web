import { Configuration, environmentUrls } from '../types/Configuration';
import { KoraError, KoraErrorCode } from '../types/KoraError';
import { Verification } from '../types/Verification';
import { DocumentType } from '../types/DocumentType';
import { blobToBase64 } from '../utils/blob';
import {
  CreateVerificationRequest,
  DocumentUploadResponse,
  DocumentQualityResponse,
  SelfieUploadResponse,
  LivenessSession,
  LivenessChallenge,
  LivenessChallengeResponse,
  SupportedCountry,
  HandoffSession,
  HandoffContext,
} from '../types/ApiModels';

/**
 * API Client for Kora IDV
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly configuration: Configuration;
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000;

  constructor(configuration: Configuration) {
    this.configuration = configuration;
    this.baseUrl = environmentUrls[configuration.environment];
  }

  /**
   * Get supported countries and their document types
   */
  async getSupportedCountries(): Promise<SupportedCountry[]> {
    return this.request<SupportedCountry[]>('/supported-countries');
  }

  /**
   * Create a new verification
   */
  async createVerification(request: CreateVerificationRequest): Promise<Verification> {
    return this.request<Verification>('/verifications', {
      method: 'POST',
      body: JSON.stringify({
        external_id: request.externalId,
        tier: request.tier,
      }),
    });
  }

  /**
   * Get an existing verification
   */
  async getVerification(id: string): Promise<Verification> {
    return this.request<Verification>(`/verifications/${id}`);
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
  async uploadDocument(
    verificationId: string,
    imageData: Blob,
    side: 'front' | 'back',
    documentType: DocumentType,
    decodedBarcodePayload?: string,
  ): Promise<DocumentUploadResponse> {
    // Back-side path uses JSON to match the server contract and the
    // Android/iOS SDK wire format (which carries the optional payload
    // field). Front-side path keeps multipart for compatibility.
    if (side === 'back') {
      const imageBase64 = await blobToBase64(imageData);
      return this.request<DocumentUploadResponse>(
        `/verifications/${verificationId}/document/back`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            decodedBarcodePayload: decodedBarcodePayload ?? null,
          }),
        },
      );
    }

    const formData = new FormData();
    formData.append('image', imageData, 'document.jpg');
    formData.append('document_type', documentType);
    formData.append('side', side);

    return this.request<DocumentUploadResponse>(
      `/verifications/${verificationId}/document`,
      {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      },
    );
  }

  /**
   * Upload selfie image
   */
  async uploadSelfie(verificationId: string, imageData: Blob): Promise<SelfieUploadResponse> {
    const formData = new FormData();
    formData.append('image', imageData, 'selfie.jpg');

    return this.request<SelfieUploadResponse>(`/verifications/${verificationId}/selfie`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  /**
   * Create liveness session
   */
  async createLivenessSession(verificationId: string): Promise<LivenessSession> {
    const response = await this.request<{
      session_id: string;
      challenges: Array<{
        id: string;
        type: string;
        instruction: string;
        order: number;
      }>;
      expires_at: string;
    }>(`/verifications/${verificationId}/liveness/session`, {
      method: 'POST',
    });

    return {
      sessionId: response.session_id,
      challenges: response.challenges.map((c) => ({
        id: c.id,
        type: c.type as LivenessChallenge['type'],
        instruction: c.instruction,
        order: c.order,
      })),
      expiresAt: new Date(response.expires_at),
    };
  }

  /**
   * Submit liveness challenge
   */
  async submitLivenessChallenge(
    verificationId: string,
    challenge: LivenessChallenge,
    imageData: Blob
  ): Promise<LivenessChallengeResponse> {
    const formData = new FormData();
    formData.append('image', imageData, 'challenge.jpg');
    formData.append('challenge_type', challenge.type);
    formData.append('challenge_id', challenge.id);

    const response = await this.request<{
      success: boolean;
      challenge_passed: boolean;
      confidence: number;
      remaining_challenges: number;
    }>(`/verifications/${verificationId}/liveness/challenge`, {
      method: 'POST',
      body: formData,
      headers: {},
    });

    return {
      success: response.success,
      challengePassed: response.challenge_passed,
      confidence: response.confidence,
      remainingChallenges: response.remaining_challenges,
    };
  }

  /**
   * Check document quality before uploading
   */
  async checkDocumentQuality(
    imageData: Blob,
    documentType: string
  ): Promise<DocumentQualityResponse> {
    const base64 = await this.blobToBase64(imageData);
    return this.request<DocumentQualityResponse>('/kyc/document-quality', {
      method: 'POST',
      body: JSON.stringify({
        document_front_base64: base64,
        document_type: documentType,
      }),
    });
  }

  /**
   * Complete the verification
   */
  async completeVerification(verificationId: string): Promise<Verification> {
    return this.request<Verification>(`/verifications/${verificationId}/complete`, {
      method: 'POST',
    });
  }

  // ─── QR Handoff (REQ-006) ────────────────────────────────────────────────

  /**
   * Create a handoff session for cross-device mobile capture.
   * Returns a token and capture URL to encode in a QR code.
   */
  async createHandoffSession(verificationId: string): Promise<HandoffSession> {
    return this.request<HandoffSession>(`/verifications/${verificationId}/handoff-session`, {
      method: 'POST',
    });
  }

  /**
   * Validate a handoff token (called by the mobile capture page).
   * Returns the verification context needed to continue capture.
   */
  async validateHandoffToken(token: string): Promise<HandoffContext> {
    return this.request<HandoffContext>(`/handoff/${token}`);
  }

  /**
   * Subscribe to verification status events via Server-Sent Events.
   * Returns an EventSource that emits 'status' and 'complete' events.
   */
  subscribeToVerificationEvents(verificationId: string): EventSource {
    const url = `${this.baseUrl}/verifications/${verificationId}/events`;
    const eventSource = new EventSource(url, { withCredentials: false });
    return eventSource;
  }

  /**
   * Make an API request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);

    // Set default headers
    if (!headers.has('Authorization')) {
      headers.set('Authorization', this.configuration.apiKey);
    }
    headers.set('X-Tenant-ID', this.configuration.tenantId);
    headers.set('Accept', 'application/json');

    // Set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
    };

    return this.executeWithRetry(url, requestOptions, 0);
  }

  private async executeWithRetry<T>(
    url: string,
    options: RequestInit,
    attempt: number
  ): Promise<T> {
    try {
      if (this.configuration.debugLogging) {
        console.log(`[KoraIDV] Request: ${options.method || 'GET'} ${url}`);
      }

      const response = await fetch(url, options);

      if (this.configuration.debugLogging) {
        console.log(`[KoraIDV] Response: ${response.status}`);
      }

      if (response.ok) {
        const data = await response.json();
        return this.transformResponse(data);
      }

      // Handle retryable errors
      if (this.shouldRetry(response.status, attempt)) {
        const delay = this.calculateDelay(attempt, response);
        if (this.configuration.debugLogging) {
          console.log(`[KoraIDV] Retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`);
        }
        await this.sleep(delay);
        return this.executeWithRetry(url, options, attempt + 1);
      }

      // Handle non-retryable errors
      const errorData = await response.json().catch(() => ({}));
      throw KoraError.fromHttpStatus(response.status, errorData);
    } catch (error) {
      if (error instanceof KoraError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (this.shouldRetryNetworkError(attempt)) {
          const delay = this.calculateDelay(attempt);
          await this.sleep(delay);
          return this.executeWithRetry(url, options, attempt + 1);
        }
        throw new KoraError(KoraErrorCode.NETWORK_ERROR, error.message);
      }

      throw new KoraError(KoraErrorCode.UNKNOWN, String(error));
    }
  }

  private shouldRetry(status: number, attempt: number): boolean {
    if (attempt >= this.maxRetries) return false;
    return status === 429 || (status >= 500 && status < 600);
  }

  private shouldRetryNetworkError(attempt: number): boolean {
    return attempt < this.maxRetries;
  }

  private calculateDelay(attempt: number, response?: Response): number {
    // Check for Retry-After header
    if (response) {
      const retryAfter = response.headers.get('Retry-After');
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) {
          return seconds * 1000;
        }
      }
    }

    // Exponential backoff with jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 500;
    return exponentialDelay + jitter;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Strip data URL prefix (e.g. "data:image/jpeg;base64,")
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Transform snake_case response to camelCase
   */
  private transformResponse<T>(data: unknown): T {
    if (Array.isArray(data)) {
      return data.map((item) => this.transformResponse(item)) as T;
    }

    if (data !== null && typeof data === 'object') {
      const transformed: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        transformed[camelKey] = this.transformResponse(value);
      }
      return transformed as T;
    }

    return data as T;
  }
}
