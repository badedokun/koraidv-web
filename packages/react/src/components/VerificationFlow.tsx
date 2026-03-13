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
          onCapture={(imageData) => uploadDocument(imageData, 'front')}
          onCancel={handleCancel}
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

      {state.step === 'processing' && (
        <ProcessingScreen
          steps={[
            { label: 'Document analyzed', status: 'done' },
            { label: 'Checking face match', status: 'active' },
            { label: 'Finalizing results', status: 'pending' },
          ]}
        />
      )}

      {state.step === 'complete' && state.verification && (
        <ResultScreen
          verification={state.verification}
          onDone={() => onComplete?.(state.verification!)}
          onRetry={retry}
        />
      )}
    </div>
  );
}
