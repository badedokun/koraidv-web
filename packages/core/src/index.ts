// Kora IDV Core SDK
export { KoraIDV } from './KoraIDV';
export type { VerificationStep, VerificationCallbacks, VerificationOptions } from './KoraIDV';
export { ApiClient } from './api/ApiClient';

// Types
export type { Configuration, Environment, LivenessMode, Theme, Locale } from './types/Configuration';
export { DocumentType, getDocumentTypeInfo } from './types/DocumentType';
export type { DocumentTypeInfo } from './types/DocumentType';
export type {
  Verification,
  VerificationStatus,
  DocumentVerification,
  FaceVerification,
  LivenessVerification,
  ChallengeResult,
  RiskSignal,
} from './types/Verification';
export type {
  CreateVerificationRequest,
  DocumentUploadResponse,
  SelfieUploadResponse,
  LivenessSession,
  LivenessChallenge,
  ChallengeType,
  LivenessChallengeResponse,
  QualityIssue,
  DocumentQualityResponse,
  SupportedCountry,
  HandoffSession,
  HandoffContext,
} from './types/ApiModels';
export { KoraError, KoraErrorCode } from './types/KoraError';

// Utilities
export { QualityValidator } from './utils/QualityValidator';
export { MrzParser } from './utils/MrzParser';
export { blobToBase64 } from './utils/blob';

// Capture
export { WebBarcodeScanner } from './capture/BarcodeScanner';

// Wallet — W3C Verifiable Credentials
export {
  KoraWallet,
  WalletError,
  DisclosureClaim,
  DisclosureProfiles,
  WalletPresentationBuilder,
  WalletCredentialStore,
  applyDisclosure,
  computeAgeOver18,
  createWalletCredential,
} from './wallet';
export type {
  WalletCredential,
  WalletCredentialSubject,
  WalletCredentialStatus,
  WalletDataIntegrityProof,
  StoredWalletCredential,
  WalletPresentation,
  DisclosureProfile,
} from './wallet';
