import React, { useEffect } from 'react';
import { Verification, KoraError, DocumentType } from '@koraidv/core';
import { useKoraIDV } from '../hooks/useKoraIDV';
import { ConsentScreen } from './ConsentScreen';
import { DocumentSelectionScreen } from './DocumentSelectionScreen';
import { DocumentCaptureScreen } from './DocumentCaptureScreen';
import { SelfieCaptureScreen } from './SelfieCaptureScreen';
import { LivenessScreen } from './LivenessScreen';
import { ResultScreen } from './ResultScreen';
import { ErrorScreen } from './ErrorScreen';
import { LoadingScreen } from './LoadingScreen';

/**
 * VerificationFlow component props
 */
export interface VerificationFlowProps {
  /**
   * External ID for the verification
   */
  externalId: string;

  /**
   * Verification tier
   */
  tier?: 'basic' | 'standard' | 'enhanced';

  /**
   * Allowed document types
   */
  documentTypes?: DocumentType[];

  /**
   * Called when verification completes successfully
   */
  onComplete?: (verification: Verification) => void;

  /**
   * Called when an error occurs
   */
  onError?: (error: KoraError) => void;

  /**
   * Called when user cancels verification
   */
  onCancel?: () => void;

  /**
   * Custom styles
   */
  className?: string;

  /**
   * Custom styles object
   */
  style?: React.CSSProperties;
}

/**
 * Complete verification flow component
 *
 * @example
 * ```tsx
 * <KoraIDVProvider apiKey="..." tenantId="...">
 *   <VerificationFlow
 *     externalId="user-123"
 *     onComplete={(verification) => console.log('Done!', verification)}
 *     onCancel={() => console.log('Cancelled')}
 *   />
 * </KoraIDVProvider>
 * ```
 */
export function VerificationFlow({
  externalId,
  tier = 'standard',
  documentTypes,
  onComplete,
  onError,
  onCancel,
  className,
  style,
}: VerificationFlowProps) {
  const {
    state,
    startVerification,
    acceptConsent,
    selectDocumentType,
    uploadDocument,
    uploadSelfie,
    startLiveness,
    submitChallenge,
    complete,
    cancel,
    retry,
  } = useKoraIDV();

  // Start verification on mount
  useEffect(() => {
    startVerification(externalId, tier);
  }, [externalId, tier, startVerification]);

  // Handle completion
  useEffect(() => {
    if (state.step === 'complete' && state.verification && onComplete) {
      onComplete(state.verification);
    }
  }, [state.step, state.verification, onComplete]);

  // Handle errors
  useEffect(() => {
    if (state.error && onError) {
      onError(state.error);
    }
  }, [state.error, onError]);

  const handleCancel = () => {
    cancel();
    onCancel?.();
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    ...style,
  };

  // Show error screen if there's an error
  if (state.error) {
    return (
      <div className={className} style={containerStyle}>
        <ErrorScreen error={state.error} onRetry={retry} onCancel={handleCancel} />
      </div>
    );
  }

  // Show loading overlay
  if (state.isLoading) {
    return (
      <div className={className} style={containerStyle}>
        <LoadingScreen />
      </div>
    );
  }

  // Render current step
  return (
    <div className={className} style={containerStyle}>
      {state.step === 'consent' && (
        <ConsentScreen onAccept={acceptConsent} onDecline={handleCancel} />
      )}

      {state.step === 'document_selection' && (
        <DocumentSelectionScreen
          documentTypes={documentTypes}
          onSelect={selectDocumentType}
          onCancel={handleCancel}
        />
      )}

      {state.step === 'document_front' && (
        <DocumentCaptureScreen
          side="front"
          onCapture={(imageData) => uploadDocument(imageData, 'front')}
          onCancel={handleCancel}
        />
      )}

      {state.step === 'document_back' && (
        <DocumentCaptureScreen
          side="back"
          onCapture={(imageData) => uploadDocument(imageData, 'back')}
          onCancel={handleCancel}
        />
      )}

      {state.step === 'selfie' && (
        <SelfieCaptureScreen onCapture={uploadSelfie} onCancel={handleCancel} />
      )}

      {state.step === 'liveness' && (
        <LivenessScreen
          session={state.livenessSession}
          currentChallenge={state.currentChallenge}
          completedChallenges={state.completedChallenges}
          onChallengeComplete={submitChallenge}
          onStart={startLiveness}
          onComplete={complete}
          onCancel={handleCancel}
        />
      )}

      {state.step === 'processing' && <LoadingScreen message="Processing verification..." />}

      {state.step === 'complete' && state.verification && (
        <ResultScreen verification={state.verification} onDone={() => onComplete?.(state.verification!)} />
      )}
    </div>
  );
}
