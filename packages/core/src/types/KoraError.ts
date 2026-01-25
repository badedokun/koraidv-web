/**
 * Kora error codes
 */
export enum KoraErrorCode {
  // Configuration errors
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  INVALID_API_KEY = 'INVALID_API_KEY',
  INVALID_TENANT_ID = 'INVALID_TENANT_ID',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  NO_INTERNET = 'NO_INTERNET',

  // HTTP errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
  HTTP_ERROR = 'HTTP_ERROR',

  // Capture errors
  CAMERA_ACCESS_DENIED = 'CAMERA_ACCESS_DENIED',
  CAMERA_NOT_AVAILABLE = 'CAMERA_NOT_AVAILABLE',
  CAPTURE_FAILED = 'CAPTURE_FAILED',
  QUALITY_VALIDATION_FAILED = 'QUALITY_VALIDATION_FAILED',

  // Document errors
  DOCUMENT_NOT_DETECTED = 'DOCUMENT_NOT_DETECTED',
  DOCUMENT_TYPE_NOT_SUPPORTED = 'DOCUMENT_TYPE_NOT_SUPPORTED',
  MRZ_READ_FAILED = 'MRZ_READ_FAILED',

  // Face errors
  FACE_NOT_DETECTED = 'FACE_NOT_DETECTED',
  MULTIPLE_FACES_DETECTED = 'MULTIPLE_FACES_DETECTED',
  FACE_MATCH_FAILED = 'FACE_MATCH_FAILED',

  // Liveness errors
  LIVENESS_CHECK_FAILED = 'LIVENESS_CHECK_FAILED',
  CHALLENGE_NOT_COMPLETED = 'CHALLENGE_NOT_COMPLETED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Verification errors
  VERIFICATION_EXPIRED = 'VERIFICATION_EXPIRED',
  VERIFICATION_ALREADY_COMPLETED = 'VERIFICATION_ALREADY_COMPLETED',
  INVALID_VERIFICATION_STATE = 'INVALID_VERIFICATION_STATE',

  // Generic errors
  UNKNOWN = 'UNKNOWN',
  USER_CANCELLED = 'USER_CANCELLED',
}

/**
 * Error messages for each code
 */
const errorMessages: Record<KoraErrorCode, string> = {
  [KoraErrorCode.NOT_CONFIGURED]: 'SDK not configured. Initialize KoraIDV first.',
  [KoraErrorCode.INVALID_API_KEY]: 'Invalid API key provided.',
  [KoraErrorCode.INVALID_TENANT_ID]: 'Invalid tenant ID provided.',
  [KoraErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [KoraErrorCode.TIMEOUT]: 'Request timed out. Please try again.',
  [KoraErrorCode.NO_INTERNET]: 'No internet connection.',
  [KoraErrorCode.UNAUTHORIZED]: 'Authentication failed. Check your API key.',
  [KoraErrorCode.FORBIDDEN]: 'Access denied.',
  [KoraErrorCode.NOT_FOUND]: 'Resource not found.',
  [KoraErrorCode.VALIDATION_ERROR]: 'Validation error.',
  [KoraErrorCode.RATE_LIMITED]: 'Rate limit exceeded. Please try again later.',
  [KoraErrorCode.SERVER_ERROR]: 'Server error. Please try again later.',
  [KoraErrorCode.HTTP_ERROR]: 'HTTP error occurred.',
  [KoraErrorCode.CAMERA_ACCESS_DENIED]: 'Camera access denied. Please enable camera access.',
  [KoraErrorCode.CAMERA_NOT_AVAILABLE]: 'Camera not available on this device.',
  [KoraErrorCode.CAPTURE_FAILED]: 'Capture failed.',
  [KoraErrorCode.QUALITY_VALIDATION_FAILED]: 'Quality check failed.',
  [KoraErrorCode.DOCUMENT_NOT_DETECTED]: 'Document not detected. Position document in frame.',
  [KoraErrorCode.DOCUMENT_TYPE_NOT_SUPPORTED]: 'Document type not supported.',
  [KoraErrorCode.MRZ_READ_FAILED]: 'Could not read document MRZ.',
  [KoraErrorCode.FACE_NOT_DETECTED]: 'Face not detected. Position face in frame.',
  [KoraErrorCode.MULTIPLE_FACES_DETECTED]: 'Multiple faces detected. Show only one face.',
  [KoraErrorCode.FACE_MATCH_FAILED]: 'Face match failed.',
  [KoraErrorCode.LIVENESS_CHECK_FAILED]: 'Liveness check failed.',
  [KoraErrorCode.CHALLENGE_NOT_COMPLETED]: 'Challenge not completed.',
  [KoraErrorCode.SESSION_EXPIRED]: 'Session expired. Please start over.',
  [KoraErrorCode.VERIFICATION_EXPIRED]: 'Verification expired. Please start a new one.',
  [KoraErrorCode.VERIFICATION_ALREADY_COMPLETED]: 'Verification already completed.',
  [KoraErrorCode.INVALID_VERIFICATION_STATE]: 'Invalid verification state.',
  [KoraErrorCode.UNKNOWN]: 'An unknown error occurred.',
  [KoraErrorCode.USER_CANCELLED]: 'Verification cancelled.',
};

/**
 * Recovery suggestions for errors
 */
const recoverySuggestions: Partial<Record<KoraErrorCode, string>> = {
  [KoraErrorCode.CAMERA_ACCESS_DENIED]: 'Go to browser settings and enable camera access.',
  [KoraErrorCode.NO_INTERNET]: 'Check your Wi-Fi or cellular connection.',
  [KoraErrorCode.TIMEOUT]: 'Please wait a moment and try again.',
  [KoraErrorCode.RATE_LIMITED]: 'Please wait a moment and try again.',
  [KoraErrorCode.SERVER_ERROR]: 'Please wait a moment and try again.',
  [KoraErrorCode.DOCUMENT_NOT_DETECTED]: 'Place document on flat surface with good lighting.',
  [KoraErrorCode.FACE_NOT_DETECTED]: 'Ensure good lighting and center your face.',
  [KoraErrorCode.QUALITY_VALIDATION_FAILED]: 'Hold device steady and ensure good lighting.',
};

/**
 * Kora SDK Error
 */
export class KoraError extends Error {
  readonly code: KoraErrorCode;
  readonly recoverySuggestion?: string;
  readonly details?: unknown;

  constructor(code: KoraErrorCode, details?: unknown) {
    const message = errorMessages[code] || 'An error occurred';
    super(message);

    this.name = 'KoraError';
    this.code = code;
    this.recoverySuggestion = recoverySuggestions[code];
    this.details = details;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, KoraError);
    }
  }

  /**
   * Create error from HTTP status code
   */
  static fromHttpStatus(status: number, details?: unknown): KoraError {
    const codeMap: Record<number, KoraErrorCode> = {
      401: KoraErrorCode.UNAUTHORIZED,
      403: KoraErrorCode.FORBIDDEN,
      404: KoraErrorCode.NOT_FOUND,
      422: KoraErrorCode.VALIDATION_ERROR,
      429: KoraErrorCode.RATE_LIMITED,
    };

    if (status >= 500) {
      return new KoraError(KoraErrorCode.SERVER_ERROR, details);
    }

    return new KoraError(codeMap[status] || KoraErrorCode.HTTP_ERROR, details);
  }

  /**
   * Check if error is retryable
   */
  get isRetryable(): boolean {
    return [
      KoraErrorCode.NETWORK_ERROR,
      KoraErrorCode.TIMEOUT,
      KoraErrorCode.RATE_LIMITED,
      KoraErrorCode.SERVER_ERROR,
    ].includes(this.code);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      recoverySuggestion: this.recoverySuggestion,
      details: this.details,
    };
  }
}
