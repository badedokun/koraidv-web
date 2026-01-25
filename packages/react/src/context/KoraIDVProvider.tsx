import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { KoraIDV, Configuration } from '@koraidv/core';

/**
 * KoraIDV context value
 */
export interface KoraIDVContextValue {
  sdk: KoraIDV;
  isConfigured: boolean;
}

const KoraIDVContext = createContext<KoraIDVContextValue | null>(null);

/**
 * KoraIDV Provider props
 */
export interface KoraIDVProviderProps {
  /**
   * API key for authentication
   */
  apiKey: string;

  /**
   * Tenant ID
   */
  tenantId: string;

  /**
   * Additional configuration options
   */
  config?: Partial<Omit<Configuration, 'apiKey' | 'tenantId'>>;

  /**
   * Children components
   */
  children: ReactNode;
}

/**
 * KoraIDV Provider component
 *
 * Wraps your application and provides access to KoraIDV SDK
 *
 * @example
 * ```tsx
 * <KoraIDVProvider apiKey="ck_live_xxx" tenantId="tenant-uuid">
 *   <App />
 * </KoraIDVProvider>
 * ```
 */
export function KoraIDVProvider({
  apiKey,
  tenantId,
  config = {},
  children,
}: KoraIDVProviderProps) {
  const sdk = useMemo(() => {
    return new KoraIDV({
      apiKey,
      tenantId,
      ...config,
    });
  }, [apiKey, tenantId, config]);

  const value = useMemo<KoraIDVContextValue>(
    () => ({
      sdk,
      isConfigured: true,
    }),
    [sdk]
  );

  return (
    <KoraIDVContext.Provider value={value}>
      {children}
    </KoraIDVContext.Provider>
  );
}

/**
 * Hook to access KoraIDV context
 *
 * @internal
 */
export function useKoraIDVContext(): KoraIDVContextValue {
  const context = useContext(KoraIDVContext);

  if (!context) {
    throw new Error('useKoraIDV must be used within a KoraIDVProvider');
  }

  return context;
}
