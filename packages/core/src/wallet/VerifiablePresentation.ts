/**
 * VerifiablePresentation.ts
 * KoraIDV Wallet — VP creation with selective disclosure for Web
 */

import type { WalletCredential, WalletPresentation } from './WalletModels';
import type { DisclosureProfile } from './SelectiveDisclosure';
import { applyDisclosure } from './SelectiveDisclosure';

/**
 * Factory for building W3C Verifiable Presentations.
 */
export const WalletPresentationBuilder = {
  /**
   * Create a Verifiable Presentation from a credential with selective disclosure.
   */
  create(params: {
    credential: WalletCredential;
    profile: DisclosureProfile;
    holder?: string;
    audience?: string;
    nonce?: string;
  }): WalletPresentation {
    const disclosed = applyDisclosure(params.profile, params.credential);
    const now = new Date().toISOString();

    return {
      '@context': ['https://www.w3.org/ns/credentials/v2'],
      type: ['VerifiablePresentation'],
      holder: params.holder ?? null,
      verifiableCredential: [disclosed],
      created: now,
      audience: params.audience ?? null,
      challenge: params.nonce ?? null,
    };
  },

  /**
   * Serialize a presentation to a JSON string.
   */
  encode(presentation: WalletPresentation): string {
    return JSON.stringify(presentation, null, 2);
  },

  /**
   * Deserialize a presentation from a JSON string.
   */
  decode(json: string): WalletPresentation {
    return JSON.parse(json) as WalletPresentation;
  },
};
