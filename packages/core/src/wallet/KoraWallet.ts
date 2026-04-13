/**
 * KoraWallet.ts
 * KoraIDV Wallet — Main wallet class for Web
 */

import type {
  WalletCredential,
  StoredWalletCredential,
  WalletPresentation,
} from './WalletModels';
import { WalletError } from './WalletModels';
import { WalletCredentialStore } from './CredentialStore';
import type { DisclosureProfile } from './SelectiveDisclosure';
import { DisclosureProfiles, getProfileName } from './SelectiveDisclosure';
import { WalletPresentationBuilder } from './VerifiablePresentation';

const MAX_INLINE_SIZE = 2048;

/**
 * Main entry point for the Kora Wallet SDK module on Web.
 *
 * Provides credential storage (IndexedDB + Web Crypto), selective disclosure,
 * Verifiable Presentation creation, and deep-link sharing.
 */
export class KoraWallet {
  private readonly store: WalletCredentialStore;

  constructor() {
    this.store = new WalletCredentialStore();
  }

  // MARK: - Credential Management

  /**
   * Store a Verifiable Credential in the wallet.
   * Returns the storage ID (same as the credential's `id`).
   */
  async store(credential: WalletCredential): Promise<string> {
    const now = new Date().toISOString();
    const stored: StoredWalletCredential = {
      id: credential.id,
      credential,
      storedAt: now,
      issuerDID: credential.issuer,
      subjectName: credential.credentialSubject.fullName,
      expiresAt: credential.expirationDate,
    };
    await this.store.save(credential.id, stored);
    return credential.id;
  }

  /**
   * Retrieve all stored credentials.
   */
  async getCredentials(): Promise<StoredWalletCredential[]> {
    const ids = await this.store.listIds();
    const results: StoredWalletCredential[] = [];
    for (const id of ids) {
      const stored = await this.store.load(id);
      if (stored) results.push(stored);
    }
    return results;
  }

  /**
   * Retrieve a single credential by ID.
   */
  async getCredential(id: string): Promise<StoredWalletCredential | null> {
    return this.store.load(id);
  }

  /**
   * Delete a credential from the wallet.
   */
  async deleteCredential(id: string): Promise<void> {
    await this.store.delete(id);
  }

  /**
   * Number of credentials currently stored.
   */
  async getCredentialCount(): Promise<number> {
    const ids = await this.store.listIds();
    return ids.length;
  }

  // MARK: - Presentation

  /**
   * Create a Verifiable Presentation with selective disclosure.
   */
  async createPresentation(params: {
    credentialId: string;
    profile: DisclosureProfile;
    audience?: string;
    nonce?: string;
  }): Promise<WalletPresentation> {
    const stored = await this.store.load(params.credentialId);
    if (!stored) {
      throw WalletError.credentialNotFound();
    }
    if (await this.isExpired(params.credentialId)) {
      throw WalletError.credentialExpired();
    }
    return WalletPresentationBuilder.create({
      credential: stored.credential,
      profile: params.profile,
      audience: params.audience,
      nonce: params.nonce,
    });
  }

  /**
   * Generate a deep link URL for sharing a presentation.
   */
  generateDeepLink(
    presentation: WalletPresentation,
    profile: DisclosureProfile = DisclosureProfiles.full
  ): string | null {
    const json = JSON.stringify(presentation);
    const data = new TextEncoder().encode(json);

    if (data.length <= MAX_INLINE_SIZE) {
      const encoded = base64UrlEncode(data);
      return `korastratum://present?data=${encoded}`;
    }

    // Fallback: reference link
    const credId =
      presentation.verifiableCredential[0]?.id ?? 'unknown';
    const profileName = getProfileName(profile);
    return `korastratum://present?ref=${credId}&profile=${profileName}`;
  }

  // MARK: - Expiry

  /**
   * Check whether a stored credential has expired.
   */
  async isExpired(credentialId: string): Promise<boolean> {
    const stored = await this.store.load(credentialId);
    if (!stored) return true;
    const expires = new Date(stored.expiresAt);
    if (isNaN(expires.getTime())) return false;
    return new Date() > expires;
  }

  /**
   * Close the store and free resources.
   */
  close(): void {
    this.store.close();
  }
}

// MARK: - Base64URL Encoding

function base64UrlEncode(data: Uint8Array): string {
  const binString = Array.from(data, (byte) =>
    String.fromCodePoint(byte)
  ).join('');
  const base64 = btoa(binString);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
