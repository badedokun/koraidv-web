import { DocumentType } from './DocumentType';

/**
 * SDK Configuration
 */
export interface Configuration {
  /** API key (starts with ck_live_ or ck_sandbox_) */
  apiKey: string;

  /** Tenant ID (UUID) */
  tenantId: string;

  /** API environment */
  environment: Environment;

  /** Allowed document types */
  documentTypes: DocumentType[];

  /** Liveness detection mode */
  livenessMode: LivenessMode;

  /** Custom theme for UI */
  theme: Theme;

  /** Localization settings */
  locale: Locale;

  /** Session timeout in seconds */
  timeout: number;

  /** Enable debug logging */
  debugLogging: boolean;
}

/**
 * API Environment
 */
export type Environment = 'production' | 'sandbox';

/**
 * Liveness detection mode
 */
export type LivenessMode = 'active' | 'passive';

/**
 * Theme configuration
 */
export interface Theme {
  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  secondaryTextColor: string;
  errorColor: string;
  successColor: string;
  borderRadius: number;
  fontFamily?: string;
}

/**
 * Localization settings
 */
export interface Locale {
  language: string;
  region?: string;
}

/**
 * Environment URLs.
 *
 * Pre-1.4.1 the sandbox URL was the production URL — every sandbox call
 * got HTTP 400 because sandbox API keys aren't valid against the
 * production endpoint. Same bug as the iOS SDK (caught when running the
 * iOS demo, audit confirmed the Web SDK had it too). Both now match the
 * Android `Environment.SANDBOX` URL exactly so cross-platform partner
 * testing is consistent.
 */
export const environmentUrls: Record<Environment, string> = {
  production: 'https://api.korastratum.com/api/v1/idv',
  sandbox:
    'https://koraidv-identity-sandbox-626704085312.us-central1.run.app/api/v1',
};

/**
 * Default theme
 */
export const defaultTheme: Theme = {
  primaryColor: '#2563EB',
  backgroundColor: '#FFFFFF',
  surfaceColor: '#F8FAFC',
  textColor: '#1E293B',
  secondaryTextColor: '#64748B',
  errorColor: '#DC2626',
  successColor: '#16A34A',
  borderRadius: 12,
};

/**
 * Default configuration
 */
export const defaultConfiguration: Omit<Configuration, 'apiKey' | 'tenantId'> = {
  environment: 'production',
  documentTypes: Object.values(DocumentType) as DocumentType[],
  livenessMode: 'active',
  theme: defaultTheme,
  locale: { language: 'en' },
  timeout: 600,
  debugLogging: false,
};
