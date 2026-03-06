import { useState, useCallback } from 'react';
import {
  KoraIDV,
  Verification,
  KoraError,
  DocumentType,
  DocumentQualityResponse,
  LivenessSession,
  LivenessChallenge,
  VerificationStep,
} from '@koraidv/core';
import { useKoraIDVContext } from '../context/KoraIDVProvider';

/**
 * Verification state
 */
export interface VerificationState {
  step: VerificationStep;
  verification: Verification | null;
  livenessSession: LivenessSession | null;
  currentChallenge: LivenessChallenge | null;
  completedChallenges: number;
  isLoading: boolean;
  error: KoraError | null;
}

/**
 * useKoraIDV hook return value
 */
export interface UseKoraIDVReturn {
  /**
   * Current verification state
   */
  state: VerificationState;

  /**
   * Start a new verification
   */
  startVerification: (externalId: string, tier?: string) => Promise<void>;

  /**
   * Resume an existing verification
   */
  resumeVerification: (verificationId: string) => Promise<void>;

  /**
   * Accept consent and proceed
   */
  acceptConsent: () => void;

  /**
   * Select document type
   */
  selectDocumentType: (type: DocumentType) => void;

  /**
   * Check document quality before uploading
   */
  checkDocumentQuality: (imageData: Blob) => Promise<DocumentQualityResponse>;

  /**
   * Upload document image
   */
  uploadDocument: (imageData: Blob, side: 'front' | 'back') => Promise<boolean>;

  /**
   * Upload selfie image
   */
  uploadSelfie: (imageData: Blob) => Promise<boolean>;

  /**
   * Start liveness session
   */
  startLiveness: () => Promise<void>;

  /**
   * Submit liveness challenge
   */
  submitChallenge: (imageData: Blob) => Promise<boolean>;

  /**
   * Complete verification
   */
  complete: () => Promise<Verification | null>;

  /**
   * Cancel verification
   */
  cancel: () => void;

  /**
   * Reset state for retry
   */
  retry: () => void;

  /**
   * SDK instance
   */
  sdk: KoraIDV;
}

/**
 * Hook for managing KoraIDV verification flow
 *
 * @example
 * ```tsx
 * function VerificationPage() {
 *   const { state, startVerification, uploadDocument } = useKoraIDV();
 *
 *   useEffect(() => {
 *     startVerification('user-123');
 *   }, []);
 *
 *   // Render based on state.step
 * }
 * ```
 */
export function useKoraIDV(): UseKoraIDVReturn {
  const { sdk } = useKoraIDVContext();

  const [state, setState] = useState<VerificationState>({
    step: 'consent',
    verification: null,
    livenessSession: null,
    currentChallenge: null,
    completedChallenges: 0,
    isLoading: false,
    error: null,
  });

  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [documentFrontCaptured, setDocumentFrontCaptured] = useState(false);

  const startVerification = useCallback(
    async (externalId: string, tier = 'standard') => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await sdk.startVerification(
          { externalId, tier: tier as 'basic' | 'standard' | 'enhanced' },
          {
            onStepChange: (step) => {
              setState((prev) => ({ ...prev, step }));
            },
            onComplete: (verification) => {
              setState((prev) => ({
                ...prev,
                verification,
                step: 'complete',
                isLoading: false,
              }));
            },
            onError: (error) => {
              setState((prev) => ({ ...prev, error, isLoading: false }));
            },
          }
        );

        setState((prev) => ({
          ...prev,
          verification: sdk.getCurrentVerification(),
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as KoraError,
          isLoading: false,
        }));
      }
    },
    [sdk]
  );

  const resumeVerification = useCallback(
    async (verificationId: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await sdk.resumeVerification(verificationId, {
          onStepChange: (step) => {
            setState((prev) => ({ ...prev, step }));
          },
          onComplete: (verification) => {
            setState((prev) => ({
              ...prev,
              verification,
              step: 'complete',
              isLoading: false,
            }));
          },
          onError: (error) => {
            setState((prev) => ({ ...prev, error, isLoading: false }));
          },
        });

        setState((prev) => ({
          ...prev,
          verification: sdk.getCurrentVerification(),
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as KoraError,
          isLoading: false,
        }));
      }
    },
    [sdk]
  );

  const acceptConsent = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'document_selection' }));
  }, []);

  const selectDocumentType = useCallback((type: DocumentType) => {
    setSelectedDocumentType(type);
    setDocumentFrontCaptured(false);
    setState((prev) => ({ ...prev, step: 'document_front' }));
  }, []);

  const checkDocumentQuality = useCallback(
    async (imageData: Blob): Promise<DocumentQualityResponse> => {
      if (!selectedDocumentType) {
        return { success: false, qualityScore: 0, qualityIssues: ['No document type selected'], details: { textReadability: 0, faceQuality: 0, imageClarity: 0 } };
      }
      return sdk.checkDocumentQuality(imageData, selectedDocumentType);
    },
    [sdk, selectedDocumentType]
  );

  const uploadDocument = useCallback(
    async (imageData: Blob, side: 'front' | 'back'): Promise<boolean> => {
      if (!selectedDocumentType) return false;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await sdk.uploadDocument(imageData, side, selectedDocumentType);

        if (result.success) {
          if (side === 'front') {
            setDocumentFrontCaptured(true);
            // Check if document requires back
            const typeInfo = await import('@koraidv/core').then((m) =>
              m.getDocumentTypeInfo(selectedDocumentType)
            );

            if (typeInfo.requiresBack) {
              setState((prev) => ({ ...prev, step: 'document_back', isLoading: false }));
            } else {
              setState((prev) => ({ ...prev, step: 'selfie', isLoading: false }));
            }
          } else {
            setState((prev) => ({ ...prev, step: 'selfie', isLoading: false }));
          }
          return true;
        } else {
          setState((prev) => ({
            ...prev,
            error: new (KoraError as any)('QUALITY_VALIDATION_FAILED', result.qualityIssues),
            isLoading: false,
          }));
          return false;
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as KoraError,
          isLoading: false,
        }));
        return false;
      }
    },
    [sdk, selectedDocumentType]
  );

  const uploadSelfie = useCallback(
    async (imageData: Blob): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await sdk.uploadSelfie(imageData);

        if (result.success) {
          setState((prev) => ({ ...prev, step: 'liveness', isLoading: false }));
          return true;
        } else {
          setState((prev) => ({
            ...prev,
            error: new (KoraError as any)('QUALITY_VALIDATION_FAILED', result.qualityIssues),
            isLoading: false,
          }));
          return false;
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as KoraError,
          isLoading: false,
        }));
        return false;
      }
    },
    [sdk]
  );

  const startLiveness = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const session = await sdk.startLivenessSession();
      setState((prev) => ({
        ...prev,
        livenessSession: session,
        currentChallenge: session.challenges[0] || null,
        completedChallenges: 0,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as KoraError,
        isLoading: false,
      }));
    }
  }, [sdk]);

  const submitChallenge = useCallback(
    async (imageData: Blob): Promise<boolean> => {
      const { currentChallenge, livenessSession } = state;
      if (!currentChallenge || !livenessSession) return false;

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const result = await sdk.submitLivenessChallenge(currentChallenge, imageData);

        if (result.passed) {
          const nextIndex = state.completedChallenges + 1;
          const nextChallenge = livenessSession.challenges[nextIndex] || null;

          setState((prev) => ({
            ...prev,
            completedChallenges: nextIndex,
            currentChallenge: nextChallenge,
            isLoading: false,
          }));

          // If no more challenges, move to processing
          if (!nextChallenge) {
            setState((prev) => ({ ...prev, step: 'processing' }));
          }

          return true;
        }

        setState((prev) => ({ ...prev, isLoading: false }));
        return false;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as KoraError,
          isLoading: false,
        }));
        return false;
      }
    },
    [sdk, state]
  );

  const complete = useCallback(async (): Promise<Verification | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const verification = await sdk.completeVerification();
      setState((prev) => ({
        ...prev,
        verification,
        step: 'complete',
        isLoading: false,
      }));
      return verification;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as KoraError,
        isLoading: false,
      }));
      return null;
    }
  }, [sdk]);

  const cancel = useCallback(() => {
    sdk.reset();
    setState({
      step: 'consent',
      verification: null,
      livenessSession: null,
      currentChallenge: null,
      completedChallenges: 0,
      isLoading: false,
      error: null,
    });
  }, [sdk]);

  const retry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      isLoading: false,
    }));
  }, []);

  return {
    state,
    startVerification,
    resumeVerification,
    acceptConsent,
    selectDocumentType,
    checkDocumentQuality,
    uploadDocument,
    uploadSelfie,
    startLiveness,
    submitChallenge,
    complete,
    cancel,
    retry,
    sdk,
  };
}
