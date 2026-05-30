import { useState, useCallback, useEffect, useRef } from 'react';
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
  /**
   * Transient feedback message for the last liveness challenge that
   * the backend rejected. Set by submitChallenge when the server
   * returns passed:false; LivenessScreen renders it inline so the
   * user knows WHY their attempt failed (the v1.7.x behavior was to
   * silently re-arm the same challenge — confusing). Cleared the
   * moment the user moves to the next challenge or the same one
   * passes on retry.
   */
  lastChallengeError: string | null;
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
  startVerification: (
    externalId: string,
    tier?: string,
    expectedFirstName?: string,
    expectedLastName?: string,
  ) => Promise<void>;

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
  uploadDocument: (
    imageData: Blob,
    side: 'front' | 'back',
    country?: string,
  ) => Promise<boolean>;

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
    lastChallengeError: null,
  });

  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [documentFrontCaptured, setDocumentFrontCaptured] = useState(false);

  const startVerification = useCallback(
    async (
      externalId: string,
      tier = 'standard',
      expectedFirstName?: string,
      expectedLastName?: string,
    ) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await sdk.startVerification(
          {
            externalId,
            tier: tier as 'basic' | 'standard' | 'enhanced',
            expectedFirstName,
            expectedLastName,
          },
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
    async (
      imageData: Blob,
      side: 'front' | 'back',
      country?: string,
    ): Promise<boolean> => {
      if (!selectedDocumentType) return false;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await sdk.uploadDocument(imageData, side, selectedDocumentType, country);

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
            // Clear any prior retake message — the user just succeeded.
            lastChallengeError: null,
          }));

          // If no more challenges, move to processing
          if (!nextChallenge) {
            setState((prev) => ({ ...prev, step: 'processing' }));
          }

          return true;
        }

        // Backend rejected the challenge — surface a useful retake
        // message so the user knows why the previous attempt failed.
        // Phrased per challenge type because the corrective action
        // differs ("smile more naturally" vs "turn further left" etc.).
        // Pre-v1.8.0 the SDK silently re-armed the same challenge
        // countdown and the user had no idea what went wrong.
        setState((prev) => ({
          ...prev,
          isLoading: false,
          lastChallengeError: retakeMessageForChallenge(currentChallenge.type),
        }));
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

  // Auto-trigger backend completion the moment the flow reaches the
  // 'processing' step. Before v1.7.7 this transition relied on
  // LivenessScreen's own useEffect firing onComplete(), which raced
  // with submitChallenge flipping step:'processing' and unmounting
  // LivenessScreen — depending on which won, complete() either fired
  // once, twice, or (most commonly) never, and the user got stuck on
  // the static "Document analyzed / Checking face match / Finalizing
  // results" screen forever. Owning this at the hook level removes
  // the race: every entry into 'processing' fires complete() exactly
  // once, regardless of which screen was mounted at the transition.
  const completionFiredRef = useRef(false);
  useEffect(() => {
    if (state.step === 'processing' && !completionFiredRef.current) {
      completionFiredRef.current = true;
      complete();
    } else if (state.step !== 'processing' && state.step !== 'complete') {
      // Reset on retry/cancel so a re-entry into 'processing' can fire
      // again. We don't reset on 'complete' itself because that's the
      // terminal state — re-firing would just re-POST /complete.
      completionFiredRef.current = false;
    }
  }, [state.step, complete]);

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
      lastChallengeError: null,
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

/**
 * Per-challenge retake message shown when the backend rejects a
 * liveness attempt. Per-type because the corrective action differs
 * (a missed smile is different from a missed head turn). Kept short
 * and actionable — the user sees it during the next 'preparing'
 * phase of the same challenge so it needs to read in one glance.
 */
function retakeMessageForChallenge(type: string): string {
  switch (type) {
    case 'blink':
      return "We didn't catch the blink — close both eyes briefly and try again.";
    case 'smile':
      return "We didn't catch the smile — show your teeth and try again.";
    case 'turn_left':
      return "Turn your head a bit further to the left and try again.";
    case 'turn_right':
      return "Turn your head a bit further to the right and try again.";
    case 'nod_up':
      return "Tilt your head a bit higher and try again.";
    case 'nod_down':
      return "Tilt your head a bit lower and try again.";
    default:
      return 'That attempt didn\'t pass — follow the prompt and try again.';
  }
}
