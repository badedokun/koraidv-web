/**
 * CredentialStore.ts
 * KoraIDV Wallet — IndexedDB + Web Crypto API encrypted credential storage for Web
 *
 * Uses the native SubtleCrypto API for AES-GCM encryption and IndexedDB
 * for persistent storage. No external crypto libraries required.
 */

import type { StoredWalletCredential } from './WalletModels';
import { WalletError } from './WalletModels';

const DB_NAME = 'kora_wallet';
const DB_VERSION = 1;
const STORE_NAME = 'credentials';
const KEY_STORE_NAME = 'crypto_keys';
const ENCRYPTION_KEY_ID = 'wallet_master_key';

/**
 * Encrypted credential storage backed by IndexedDB and Web Crypto API.
 */
export class WalletCredentialStore {
  private db: IDBDatabase | null = null;
  private cryptoKey: CryptoKey | null = null;

  // MARK: - Database Initialization

  private async getDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(KEY_STORE_NAME)) {
          db.createObjectStore(KEY_STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(WalletError.storageFailed());
      };
    });
  }

  // MARK: - Crypto Key Management

  private async getCryptoKey(): Promise<CryptoKey> {
    if (this.cryptoKey) return this.cryptoKey;

    if (typeof crypto === 'undefined' || !crypto.subtle) {
      throw WalletError.cryptoUnavailable();
    }

    const db = await this.getDb();

    // Try to load existing key
    const existingKey = await new Promise<CryptoKey | null>(
      (resolve, reject) => {
        const tx = db.transaction(KEY_STORE_NAME, 'readonly');
        const store = tx.objectStore(KEY_STORE_NAME);
        const request = store.get(ENCRYPTION_KEY_ID);
        request.onsuccess = () => {
          const record = request.result;
          if (record?.key) {
            crypto.subtle
              .importKey('raw', record.key, { name: 'AES-GCM' }, false, [
                'encrypt',
                'decrypt',
              ])
              .then(resolve)
              .catch(() => resolve(null));
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(WalletError.storageFailed());
      }
    );

    if (existingKey) {
      this.cryptoKey = existingKey;
      return existingKey;
    }

    // Generate new key
    const newKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Export and store the raw key bytes
    const rawKey = await crypto.subtle.exportKey('raw', newKey);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(KEY_STORE_NAME, 'readwrite');
      const store = tx.objectStore(KEY_STORE_NAME);
      store.put({ id: ENCRYPTION_KEY_ID, key: rawKey });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(WalletError.storageFailed());
    });

    // Re-import as non-extractable for runtime use
    this.cryptoKey = await crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
    return this.cryptoKey;
  }

  // MARK: - Encrypt / Decrypt

  private async encrypt(data: string): Promise<ArrayBuffer> {
    const key = await this.getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    // Prepend IV to ciphertext
    const result = new Uint8Array(iv.length + ciphertext.byteLength);
    result.set(iv);
    result.set(new Uint8Array(ciphertext), iv.length);
    return result.buffer;
  }

  private async decrypt(data: ArrayBuffer): Promise<string> {
    const key = await this.getCryptoKey();
    const bytes = new Uint8Array(data);
    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(plaintext);
  }

  // MARK: - CRUD Operations

  async save(id: string, credential: StoredWalletCredential): Promise<void> {
    const db = await this.getDb();
    const json = JSON.stringify(credential);
    const encrypted = await this.encrypt(json);

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id, data: encrypted });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(WalletError.storageFailed());
    });
  }

  async load(id: string): Promise<StoredWalletCredential | null> {
    const db = await this.getDb();

    const record = await new Promise<{ id: string; data: ArrayBuffer } | null>(
      (resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => reject(WalletError.storageFailed());
      }
    );

    if (!record) return null;

    try {
      const json = await this.decrypt(record.data);
      return JSON.parse(json) as StoredWalletCredential;
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(WalletError.storageFailed());
    });
  }

  async listIds(): Promise<string[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(WalletError.storageFailed());
    });
  }

  /**
   * Close the database connection and clear cached crypto key.
   */
  close(): void {
    this.db?.close();
    this.db = null;
    this.cryptoKey = null;
  }
}
