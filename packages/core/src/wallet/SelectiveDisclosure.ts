/**
 * SelectiveDisclosure.ts
 * KoraIDV Wallet — Selective disclosure profiles for Verifiable Presentations (Web)
 */

import type { WalletCredential, WalletCredentialSubject } from './WalletModels';

// MARK: - Disclosure Claims

export enum DisclosureClaim {
  FullName = 'fullName',
  DateOfBirth = 'dateOfBirth',
  Nationality = 'nationality',
  VerificationLevel = 'verificationLevel',
  DocumentType = 'documentType',
  DocumentCountry = 'documentCountry',
  BiometricMatch = 'biometricMatch',
  LivenessCheck = 'livenessCheck',
  GovernmentDbVerified = 'governmentDbVerified',
  VerifiedAt = 'verifiedAt',
  ConfidenceScore = 'confidenceScore',
}

// MARK: - Disclosure Profile

export type DisclosureProfile =
  | { type: 'full' }
  | { type: 'onboarding' }
  | { type: 'ageOnly' }
  | { type: 'nationalityOnly' }
  | { type: 'verificationOnly' }
  | { type: 'custom'; claims: Set<DisclosureClaim> };

export const DisclosureProfiles = {
  full: { type: 'full' } as DisclosureProfile,
  onboarding: { type: 'onboarding' } as DisclosureProfile,
  ageOnly: { type: 'ageOnly' } as DisclosureProfile,
  nationalityOnly: { type: 'nationalityOnly' } as DisclosureProfile,
  verificationOnly: { type: 'verificationOnly' } as DisclosureProfile,
  custom: (claims: Set<DisclosureClaim>): DisclosureProfile => ({
    type: 'custom',
    claims,
  }),
};

export function getProfileName(profile: DisclosureProfile): string {
  return profile.type;
}

// MARK: - Selective Disclosure Engine

const ALL_CLAIMS = new Set(Object.values(DisclosureClaim));

const ONBOARDING_CLAIMS = new Set([
  DisclosureClaim.FullName,
  DisclosureClaim.DateOfBirth,
  DisclosureClaim.Nationality,
  DisclosureClaim.VerificationLevel,
  DisclosureClaim.DocumentType,
  DisclosureClaim.DocumentCountry,
]);

const VERIFICATION_CLAIMS = new Set([
  DisclosureClaim.VerificationLevel,
  DisclosureClaim.VerifiedAt,
  DisclosureClaim.ConfidenceScore,
]);

function getClaimsForProfile(profile: DisclosureProfile): Set<DisclosureClaim> {
  switch (profile.type) {
    case 'full':
      return ALL_CLAIMS;
    case 'onboarding':
      return ONBOARDING_CLAIMS;
    case 'ageOnly':
      return new Set([DisclosureClaim.DateOfBirth]);
    case 'nationalityOnly':
      return new Set([DisclosureClaim.Nationality]);
    case 'verificationOnly':
      return VERIFICATION_CLAIMS;
    case 'custom':
      return profile.claims;
  }
}

/**
 * Apply a disclosure profile to a credential, returning a new credential
 * containing only the disclosed claims in its subject.
 */
export function applyDisclosure(
  profile: DisclosureProfile,
  credential: WalletCredential
): WalletCredential {
  const claims = getClaimsForProfile(profile);
  const subject = credential.credentialSubject;

  const disclosed: WalletCredentialSubject = {
    id: subject.id,
    fullName: claims.has(DisclosureClaim.FullName) ? subject.fullName : '',
    dateOfBirth: claims.has(DisclosureClaim.DateOfBirth)
      ? subject.dateOfBirth
      : undefined,
    nationality: claims.has(DisclosureClaim.Nationality)
      ? subject.nationality
      : undefined,
    verificationLevel: claims.has(DisclosureClaim.VerificationLevel)
      ? subject.verificationLevel
      : '',
    documentType: claims.has(DisclosureClaim.DocumentType)
      ? subject.documentType
      : '',
    documentCountry: claims.has(DisclosureClaim.DocumentCountry)
      ? subject.documentCountry
      : '',
    biometricMatch:
      claims.has(DisclosureClaim.BiometricMatch) && subject.biometricMatch,
    livenessCheck:
      claims.has(DisclosureClaim.LivenessCheck) && subject.livenessCheck,
    governmentDbVerified:
      claims.has(DisclosureClaim.GovernmentDbVerified) &&
      subject.governmentDbVerified,
    verifiedAt: claims.has(DisclosureClaim.VerifiedAt)
      ? subject.verifiedAt
      : '',
    confidenceScore: claims.has(DisclosureClaim.ConfidenceScore)
      ? subject.confidenceScore
      : 0,
  };

  return {
    ...credential,
    credentialSubject: disclosed,
  };
}

/**
 * For ageOnly profile, compute whether the subject is over 18.
 */
export function computeAgeOver18(dateOfBirth?: string): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return false;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 18;
}
