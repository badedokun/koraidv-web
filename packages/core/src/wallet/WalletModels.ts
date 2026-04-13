/**
 * WalletModels.ts
 * KoraIDV Wallet — W3C Verifiable Credential types for Web
 *
 * Types are prefixed with "Wallet" to avoid conflicts with existing KoraIDV types.
 */

// MARK: - Verifiable Credential

export interface WalletCredential {
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

// MARK: - Credential Subject

export interface WalletCredentialSubject {
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

// MARK: - Credential Status (StatusList2021)

export interface WalletCredentialStatus {
  readonly id: string;
  readonly type: string;
  readonly statusPurpose: string;
  readonly statusListIndex: string;
  readonly statusListCredential: string;
}

// MARK: - Data Integrity Proof

export interface WalletDataIntegrityProof {
  readonly type: string;
  readonly cryptosuite: string;
  readonly created: string;
  readonly verificationMethod: string;
  readonly proofPurpose: string;
  readonly proofValue: string;
}

// MARK: - Stored Credential (wrapper with metadata)

export interface StoredWalletCredential {
  readonly id: string;
  readonly credential: WalletCredential;
  readonly storedAt: string;
  readonly issuerDID: string;
  readonly subjectName: string;
  readonly expiresAt: string;
}

// MARK: - Verifiable Presentation

export interface WalletPresentation {
  readonly '@context': string[];
  readonly type: string[];
  readonly holder: string | null;
  readonly verifiableCredential: WalletCredential[];
  readonly created: string;
  readonly audience: string | null;
  readonly challenge: string | null;
}

// MARK: - Errors

export class WalletError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'WalletError';
  }

  static storageFailed(): WalletError {
    return new WalletError('STORAGE_FAILED', 'Failed to store credential.');
  }

  static credentialNotFound(): WalletError {
    return new WalletError('CREDENTIAL_NOT_FOUND', 'Credential not found.');
  }

  static credentialExpired(): WalletError {
    return new WalletError('CREDENTIAL_EXPIRED', 'Credential has expired.');
  }

  static encodingFailed(): WalletError {
    return new WalletError(
      'ENCODING_FAILED',
      'Failed to encode credential data.'
    );
  }

  static cryptoUnavailable(): WalletError {
    return new WalletError(
      'CRYPTO_UNAVAILABLE',
      'Web Crypto API is not available in this environment.'
    );
  }
}

// MARK: - Helper to create default credential

export function createWalletCredential(
  params: Omit<WalletCredential, '@context' | 'type'> & {
    '@context'?: string[];
    type?: string[];
  }
): WalletCredential {
  return {
    '@context': params['@context'] ?? ['https://www.w3.org/ns/credentials/v2'],
    type: params.type ?? [
      'VerifiableCredential',
      'KoraIdentityCredential',
    ],
    ...params,
  };
}
