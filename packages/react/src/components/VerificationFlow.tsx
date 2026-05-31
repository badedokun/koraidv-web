import React, { useEffect, useState } from 'react';
import { Verification, KoraError, KoraErrorCode, DocumentType, SupportedCountry } from '@koraidv/core';
import { useKoraIDV } from '../hooks/useKoraIDV';
import { ConsentScreen } from './ConsentScreen';
import { CountrySelectionScreen, CountryInfo } from './CountrySelectionScreen';
import { DocumentSelectionScreen } from './DocumentSelectionScreen';
import { DocumentCaptureScreen } from './DocumentCaptureScreen';
import { FlipDocumentScreen } from './FlipDocumentScreen';
import { SelfieCaptureScreen } from './SelfieCaptureScreen';
import { LivenessScreen } from './LivenessScreen';
import { ResultScreen } from './ResultScreen';
import { ErrorScreen } from './ErrorScreen';
import { LoadingScreen } from './LoadingScreen';
import { ProcessingScreen } from './DesignSystem';

/**
 * VerificationFlow component props
 */
export interface VerificationFlowProps {
  externalId: string;
  tier?: 'basic' | 'standard' | 'enhanced';
  documentTypes?: DocumentType[];
  /**
   * Optional name-match inputs. When set, the backend compares the
   * OCR'd names on the document against these values and surfaces a
   * real `scores.nameMatch` percentage on the verification result —
   * the ResultScreen's "Name Match" row shows real PASS/FAIL instead
   * of the always-0% / always-FAIL it shows when these aren't passed.
   *
   * Wire from your user record at mount time, e.g.
   *   `<VerificationFlow expectedFirstName={user.firstName} ... />`
   *
   * Mirrors iOS's
   * `KoraIDV.startVerification(expectedFirstName:expectedLastName:)`.
   */
  expectedFirstName?: string;
  expectedLastName?: string;
  /**
   * Whether to render Visual Guide illustrations above the capture +
   * liveness viewfinders (default true). Set false for a plain text-
   * only flow. Matches the same flag iOS exposes via `showVisualGuides`
   * on Configuration; Android has had it since v1.3.0.
   */
  showVisualGuides?: boolean;
  onComplete?: (verification: Verification) => void;
  onError?: (error: KoraError) => void;
  onCancel?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Complete verification flow component
 */
export function VerificationFlow({
  externalId,
  tier = 'standard',
  documentTypes,
  expectedFirstName,
  expectedLastName,
  showVisualGuides = true,
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
    checkDocumentQuality,
    uploadDocument,
    uploadSelfie,
    startLiveness,
    submitChallenge,
    complete,
    cancel,
    retry,
    sdk,
  } = useKoraIDV();

  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null);
  const [flowStep, setFlowStep] = useState<'consent' | 'country_selection' | 'flow'>('consent');
  const [showFlipInstruction, setShowFlipInstruction] = useState(true);
  const [supportedCountries, setSupportedCountries] = useState<CountryInfo[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  // Reset flip instruction when starting a new front capture
  useEffect(() => {
    if (state.step === 'document_front') {
      setShowFlipInstruction(true);
    }
  }, [state.step]);

  // Start verification on mount. expectedFirstName/expectedLastName get
  // passed through to the backend's CreateVerificationRequest so name-
  // match scoring runs against real claimed values instead of falling
  // back to the empty default (which surfaces as "Name Match 0% FAIL"
  // on an otherwise-approved verification). Integrators that don't
  // want name matching omit the props and the row stays at 0/FAIL.
  useEffect(() => {
    startVerification(externalId, tier, expectedFirstName, expectedLastName);
  }, [externalId, tier, expectedFirstName, expectedLastName, startVerification]);

  // Before v1.7.9 this useEffect fired `onComplete(state.verification)`
  // the instant state.step flipped to 'complete' — BEFORE the user could
  // read the result. Integrators that listen to onComplete and dismiss
  // the SDK (e.g. to show their own "Submission received" screen) ended
  // up replacing our ResultScreen after one frame; the user saw their
  // status briefly flash in red/green and then disappear. iOS + Android
  // follow the opposite convention: the completion callback fires when
  // the user explicitly dismisses the result screen (Done / Try Again /
  // Continue button), not when the verification reaches a terminal
  // state. ResultScreen's onDone prop already wires that path
  // (`() => onComplete?.(state.verification!)` below), so removing the
  // auto-fire restores cross-platform parity and gives the user time to
  // read their result.

  // Handle errors
  useEffect(() => {
    if (state.error && onError) {
      onError(state.error);
    }
  }, [state.error, onError]);

  // Fetch supported countries from the API when entering country selection
  const fetchCountries = async () => {
    setCountriesLoading(true);
    try {
      const countries = await sdk.getSupportedCountries();
      setSupportedCountries(
        countries.map((c: SupportedCountry) => ({
          id: c.id,
          name: c.name,
          flagEmoji: c.flagEmoji,
          documentTypes: c.documentTypes,
        }))
      );
    } catch (error) {
      onError?.(
        error instanceof KoraError
          ? error
          : new KoraError(KoraErrorCode.NETWORK_ERROR, 'Failed to load supported countries')
      );
    } finally {
      setCountriesLoading(false);
    }
  };

  const handleCancel = () => {
    cancel();
    onCancel?.();
  };

  const handleAcceptConsent = () => {
    fetchCountries();
    setFlowStep('country_selection');
  };

  const handleCountrySelect = (country: CountryInfo) => {
    setSelectedCountry(country);
    setFlowStep('flow');
    acceptConsent();
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    ...style,
  };

  // Show error screen
  if (state.error) {
    return (
      <div className={className} style={containerStyle}>
        <ErrorScreen error={state.error} onRetry={retry} onCancel={handleCancel} />
      </div>
    );
  }

  // Show loading
  if (state.isLoading && state.step !== 'processing') {
    return (
      <div className={className} style={containerStyle}>
        <LoadingScreen />
      </div>
    );
  }

  // Consent screen
  if (flowStep === 'consent' && state.step === 'consent') {
    return (
      <div className={className} style={containerStyle}>
        <ConsentScreen onAccept={handleAcceptConsent} onDecline={handleCancel} />
      </div>
    );
  }

  // Country selection (injected between consent and document selection)
  if (flowStep === 'country_selection') {
    if (countriesLoading) {
      return (
        <div className={className} style={containerStyle}>
          <LoadingScreen />
        </div>
      );
    }
    return (
      <div className={className} style={containerStyle}>
        <CountrySelectionScreen
          countries={supportedCountries}
          onSelect={handleCountrySelect}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Render current step
  return (
    <div className={className} style={containerStyle}>
      {state.step === 'document_selection' && (
        <DocumentSelectionScreen
          documentTypes={documentTypes}
          selectedCountry={selectedCountry}
          onSelect={selectDocumentType}
          onCancel={handleCancel}
        />
      )}

      {state.step === 'document_front' && (
        <DocumentCaptureScreen
          side="front"
          onQualityCheck={(blob) => checkDocumentQuality(blob)}
          onCapture={(imageData) => uploadDocument(imageData, 'front', selectedCountry?.id)}
          onCancel={handleCancel}
          showVisualGuides={showVisualGuides}
        />
      )}

      {state.step === 'document_back' && showFlipInstruction && (
        <FlipDocumentScreen
          onContinue={() => setShowFlipInstruction(false)}
          onCancel={handleCancel}
        />
      )}

      {state.step === 'document_back' && !showFlipInstruction && (
        <DocumentCaptureScreen
          side="back"
          onCapture={(imageData) => uploadDocument(imageData, 'back', selectedCountry?.id)}
          onCancel={handleCancel}
          showVisualGuides={showVisualGuides}
        />
      )}

      {state.step === 'selfie' && (
        <SelfieCaptureScreen
          onCapture={uploadSelfie}
          onCancel={handleCancel}
          showVisualGuides={showVisualGuides}
        />
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
          lastChallengeError={state.lastChallengeError}
          showVisualGuides={showVisualGuides}
        />
      )}

      {state.step === 'processing' && <ProcessingScreen />}

      {state.step === 'complete' && state.verification && (
        <ResultScreen
          verification={state.verification}
          onDone={() => onComplete?.(state.verification!)}
          onRetry={() => {
            // Reset VerificationFlow-local state alongside the hook's
            // retry. The hook resets its own state + restarts the
            // verification, but flowStep, selectedCountry, and
            // showFlipInstruction live in this component's useState
            // and would otherwise persist — leaving the user staring
            // at a blank screen after retry because flowStep='flow'
            // + state.step='consent' has no matching render branch.
            // Pre-v1.8.2 retry was a no-op (just cleared error), so
            // this gap never surfaced. Surfaced by Luckycat 2026-05-31.
            setFlowStep('consent');
            setSelectedCountry(null);
            setShowFlipInstruction(true);
            retry();
          }}
        />
      )}
    </div>
  );
}
