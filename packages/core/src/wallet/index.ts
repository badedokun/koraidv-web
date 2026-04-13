/**
 * KoraIDV Wallet — Web barrel export
 */

// Main wallet class
export { KoraWallet } from './KoraWallet';

// Models
export type {
  WalletCredential,
  WalletCredentialSubject,
  WalletCredentialStatus,
  WalletDataIntegrityProof,
  StoredWalletCredential,
  WalletPresentation,
} from './WalletModels';
export { WalletError, createWalletCredential } from './WalletModels';

// Selective disclosure
export {
  DisclosureClaim,
  DisclosureProfiles,
  applyDisclosure,
  computeAgeOver18,
  getProfileName,
} from './SelectiveDisclosure';
export type { DisclosureProfile } from './SelectiveDisclosure';

// Storage
export { WalletCredentialStore } from './CredentialStore';

// Presentation builder
export { WalletPresentationBuilder } from './VerifiablePresentation';
