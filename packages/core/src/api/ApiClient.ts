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
 * API Client for Kora IDV.
 *
 * Wire contract (matches the backend and the Android/iOS SDKs):
 *
 *   - Request bodies: JSON with camelCase keys. The earlier multipart-
 *     form-data + snake_case combo was rejected by the backend (which
 *     only parses JSON on /document, /selfie, /liveness/challenge) and
 *     diverged from the native SDKs. Surfaced 2026-05-29 by Luckycat's
 *     Web SDK integration — backend returned 400 on the very first
 *     POST because `external_id` didn't match the server's `externalId`
 *     JSON tag.
 *
 *   - Response bodies: snake_case auto-converted to camelCase by
 *     transformResponse() below. Domain models defined in
 *     types/ApiModels.ts are the source of truth for shape.
 *
 *   - Authentication: Bearer-style Authorization header (raw API key)
 *     + X-Tenant-ID header. No cookies.
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
   * Get supported countries and their document types.
   *
   * Backend has no dedicated /supported-countries endpoint — the
   * countries catalog is bundled into the /document-types response
   * alongside the per-type metadata. We fetch that bundled payload,
   * then project it onto the SDK's `SupportedCountry` shape:
   *   - `id` ← `code` (ISO-3166 alpha-2)
   *   - `flagEmoji` derived from the ISO code
   *   - `documentTypes` filtered from the bundled types list by country
   *
   * Mirrors the iOS / Android pattern (SessionManager.fetchSupported-
   * Countries on iOS, ApiService.getDocumentTypes on Android). The
   * previous standalone /supported-countries call had been silently
   * 404-ing since the Web SDK shipped — surfaced 2026-05-29 by
   * Luckycat's integration, hot on the heels of the v1.7.1
   * wire-format pass.
   */
  async getSupportedCountries(): Promise<SupportedCountry[]> {
    const response = await this.request<DocumentTypesResponseDTO>('/document-types');

    return response.countries
      .map((c) => ({
        id: c.code,
        name: c.name,
        flagEmoji: countryCodeToFlagEmoji(c.code),
        documentTypes: response.documentTypes
          .filter((dt) => dt.country === c.code)
          .map((dt) => dt.type),
      }))
      .filter((country) => country.documentTypes.length > 0);
  }

  /**
   * Create a new verification
   */
  async createVerification(request: CreateVerificationRequest): Promise<Verification> {
    return this.request<Verification>('/verifications', {
      method: 'POST',
      body: JSON.stringify({
        externalId: request.externalId,
        tier: request.tier,
        // Optional name-match inputs — only sent when the integrator
        // provided them, so older call sites don't accidentally start
        // emitting empty strings (backend's name-match logic treats
        // "" as "user has no claimed name" same as missing).
        expectedFirstName: request.expectedFirstName,
        expectedLastName: request.expectedLastName,
        // Source signal for backend's source-aware threshold tuning
        // (v1.8.0). Backend's EffectiveForSource(source) relaxes the
        // MinFaceMatchScore + MinLivenessScore floors by 10 each when
        // source="web" — webcam captures consistently score lower than
        // native mobile camera captures, and the strict mobile-
        // calibrated floor false-rejects perfectly real users. Carried
        // in `metadata` to avoid a schema migration on the backend;
        // any other integrator-supplied metadata is merged on top.
        metadata: {
          source: 'web',
          ...(request.metadata ?? {}),
        },
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
   * Both sides now use the same JSON wire format as the Android/iOS SDKs.
   * Front sends documentType + optional country; back sends optional
   * decodedBarcodePayload (Phase 4 fast-path — when the browser's
   * BarcodeDetector decoded the PDF417 on-device, the AAMVA payload
   * travels here so the server can skip image-based barcode decoding).
   *
   * The previous front-side multipart path returned HTTP 400 on every
   * request because the server's /document handler only parses
   * application/json — same trap iOS hit and fixed in v1.6.0.
   */
  async uploadDocument(
    verificationId: string,
    imageData: Blob,
    side: 'front' | 'back',
    documentType: DocumentType,
    decodedBarcodePayload?: string,
    country?: string,
  ): Promise<DocumentUploadResponse> {
    const imageBase64 = await blobToBase64(imageData);

    if (side === 'back') {
      return this.request<DocumentUploadResponse>(
        `/verifications/${verificationId}/document/back`,
        {
          method: 'POST',
          body: JSON.stringify({
            imageBase64,
            decodedBarcodePayload: decodedBarcodePayload ?? null,
          }),
        },
      );
    }

    return this.request<DocumentUploadResponse>(
      `/verifications/${verificationId}/document`,
      {
        method: 'POST',
        body: JSON.stringify({
          documentType,
          imageBase64,
          country: country ?? null,
        }),
      },
    );
  }

  /**
   * Upload selfie image.
   *
   * JSON with imageBase64 — matches the server's UploadSelfieRequest
   * { ImageBase64 string } and the Android/iOS wire format. Previous
   * multipart path returned HTTP 400 since the SDK shipped.
   */
  async uploadSelfie(verificationId: string, imageData: Blob): Promise<SelfieUploadResponse> {
    const imageBase64 = await blobToBase64(imageData);
    return this.request<SelfieUploadResponse>(`/verifications/${verificationId}/selfie`, {
      method: 'POST',
      body: JSON.stringify({ imageBase64 }),
    });
  }

  /**
   * Create liveness session.
   *
   * Decodes the wire DTO (matches backend's `models.LivenessSession`
   * JSON), then projects it onto the domain `LivenessSession` the UI
   * expects. Backend doesn't send `sessionId`/`expiresAt`, and per-
   * challenge `id`/`instruction`/`order` aren't on the wire — domain
   * values are synthesized client-side. Mirrors the iOS v1.7.0 pattern
   * at koraidv-ios/.../SessionManager.swift::createLivenessSession.
   *
   * Without this DTO/domain split, the SDK accessed undefined fields
   * on the response and produced a session with sessionId=undefined,
   * which then failed every downstream challenge submission.
   */
  async createLivenessSession(verificationId: string): Promise<LivenessSession> {
    const dto = await this.request<LivenessSessionDTO>(
      `/verifications/${verificationId}/liveness/session`,
      { method: 'POST' },
    );

    return {
      sessionId: dto.id,
      challenges: dto.challenges.map((c, index) => ({
        id: `${dto.id}_${index}`,
        type: c.type as LivenessChallenge['type'],
        instruction: instructionForChallengeType(c.type),
        order: index,
      })),
      // Backend doesn't return expiresAt; enforce a local 5-minute
      // timeout consistent with the Android + iOS peers.
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };
  }

  /**
   * Submit liveness challenge result.
   *
   * JSON with challengeType + imageBase64 — matches the server's
   * SubmitLivenessChallengeRequest and the Android/iOS wire format.
   * Previous multipart + snake_case path was double-broken.
   */
  async submitLivenessChallenge(
    verificationId: string,
    challenge: LivenessChallenge,
    imageData: Blob,
  ): Promise<LivenessChallengeResponse> {
    const imageBase64 = await blobToBase64(imageData);

    const response = await this.request<{
      success?: boolean;
      challengePassed?: boolean;
      confidence?: number;
      remainingChallenges?: number;
      completed?: boolean;
      score?: number;
      allCompleted?: boolean;
    }>(`/verifications/${verificationId}/liveness/challenge`, {
      method: 'POST',
      body: JSON.stringify({
        challengeType: challenge.type,
        imageBase64,
      }),
    });

    // Backend's SubmitLivenessChallengeResult names the fields completed
    // / score / allCompleted; the SDK surface keeps the established
    // challengePassed / confidence / remainingChallenges names for
    // backwards compat. Map both ways so either server vocabulary
    // produces a sane response.
    return {
      success: response.success ?? true,
      challengePassed: response.challengePassed ?? response.completed ?? false,
      confidence: response.confidence ?? response.score ?? 0,
      remainingChallenges: response.remainingChallenges ?? 0,
    };
  }

  /**
   * Check document quality before uploading.
   *
   * Outlier endpoint: backend's `CheckDocumentQualityRequest` is the
   * one struct in identity-service still using snake_case JSON tags
   * (`document_front_base64`, `document_type`). Every other request
   * body on this client is camelCase. The v1.7.1 wire-format pass
   * blanket-converted this one too and broke it with a 400 from
   * gin's `binding:"required"` validator — fixed in v1.7.3 by
   * sending snake_case for just this one endpoint. The response
   * decoder still goes through transformResponse() which converts
   * snake_case → camelCase, so DocumentQualityResponse on the SDK
   * surface is unchanged.
   *
   * If the backend is ever unified onto camelCase, this can revert
   * to the standard camelCase body — but Android currently sends
   * snake_case via @SerializedName, so any backend change there
   * needs an Android coordination first.
   */
  async checkDocumentQuality(
    imageData: Blob,
    documentType: string,
  ): Promise<DocumentQualityResponse> {
    const documentFrontBase64 = await blobToBase64(imageData);
    return this.request<DocumentQualityResponse>('/kyc/document-quality', {
      method: 'POST',
      body: JSON.stringify({
        document_front_base64: documentFrontBase64,
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
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);

    // Set default headers
    if (!headers.has('Authorization')) {
      headers.set('Authorization', this.configuration.apiKey);
    }
    headers.set('X-Tenant-ID', this.configuration.tenantId);
    headers.set('Accept', 'application/json');

    // All requests are JSON now (no more FormData / multipart anywhere).
    if (!headers.has('Content-Type')) {
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
    attempt: number,
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

  /**
   * Transform snake_case response to camelCase.
   *
   * Some backend endpoints still return snake_case keys; the
   * domain types in ApiModels.ts are camelCase. This walker turns
   * `external_id` → `externalId` etc. recursively. Safe no-op for
   * already-camelCase responses.
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

// ─── LivenessSession wire DTO (matches backend models.LivenessSession) ───────

/**
 * Wire-format DTO for the backend's
 * `/v1/verifications/{id}/liveness/session` response.
 *
 * Matches `models.LivenessSession` in the Go identity-service: backend
 * sends `id` (not `sessionId`), omits `expiresAt`, and per-challenge
 * entries carry only `type` (no `id`, `instruction`, or `order`). The
 * domain shape consumed by the SDK UI is constructed by mapping in
 * createLivenessSession above.
 */
interface LivenessSessionDTO {
  id: string;
  challenges: LivenessChallengeDTO[];
}

interface LivenessChallengeDTO {
  type: string;
}

/**
 * Client-side instruction text for a liveness challenge type. Mirrors
 * the Android + iOS peers (`getInstructionForType` in Android's
 * SessionManager.kt, `instructionForChallengeType` in iOS's
 * SessionManager.swift). Not localized yet — English defaults matching
 * the other platforms; pull into a proper i18n layer on the next pass.
 */
function instructionForChallengeType(type: string): string {
  switch (type) {
    case 'blink':
      return 'Blink your eyes slowly';
    case 'smile':
      return 'Smile naturally';
    case 'turn_left':
      return 'Slowly turn your head to the left';
    case 'turn_right':
      return 'Slowly turn your head to the right';
    case 'nod_up':
      return 'Slowly tilt your head up';
    case 'nod_down':
      return 'Slowly tilt your head down';
    default:
      return 'Follow the on-screen prompt';
  }
}

// ─── /document-types response (used to derive supported countries) ───────────

/**
 * Wire-format DTO for the backend's `/v1/document-types` response.
 *
 * One endpoint returns both per-type metadata and the supported-country
 * catalog; `getSupportedCountries` above joins the two arrays on
 * `country == code` to build the SDK's per-country shape.
 */
interface DocumentTypesResponseDTO {
  success: boolean;
  total: number;
  documentTypes: DocumentTypeInfoDTO[];
  countries: CountryInfoDTO[];
}

interface DocumentTypeInfoDTO {
  type: string;
  name: string;
  country: string;
  hasMrz: boolean;
  requiresBack: boolean;
  supportedOcr: boolean;
}

interface CountryInfoDTO {
  code: string;
  name: string;
  region?: string;
}

/**
 * Convert an ISO-3166 alpha-2 country code to a flag emoji by mapping
 * each ASCII letter to its regional indicator codepoint (U+1F1E6..1F1FF).
 * Returns an empty string for malformed input rather than throwing — the
 * UI just renders without a flag instead of crashing the country list.
 */
function countryCodeToFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return '';
  const upper = code.toUpperCase();
  const a = upper.charCodeAt(0);
  const b = upper.charCodeAt(1);
  if (a < 65 || a > 90 || b < 65 || b > 90) return '';
  const offset = 0x1f1e6 - 65;
  return String.fromCodePoint(a + offset, b + offset);
}
