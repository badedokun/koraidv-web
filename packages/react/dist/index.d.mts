import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ReactNode } from 'react';
import { KoraIDV, Configuration, VerificationStep, Verification, LivenessSession, LivenessChallenge, KoraError, DocumentType } from '@koraidv/core';

/**
 * KoraIDV context value
 */
interface KoraIDVContextValue {
    sdk: KoraIDV;
    isConfigured: boolean;
}
/**
 * KoraIDV Provider props
 */
interface KoraIDVProviderProps {
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
declare function KoraIDVProvider({ apiKey, tenantId, config, children, }: KoraIDVProviderProps): react_jsx_runtime.JSX.Element;

/**
 * Verification state
 */
interface VerificationState {
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
interface UseKoraIDVReturn {
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
declare function useKoraIDV(): UseKoraIDVReturn;

/**
 * VerificationFlow component props
 */
interface VerificationFlowProps {
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
declare function VerificationFlow({ externalId, tier, documentTypes, onComplete, onError, onCancel, className, style, }: VerificationFlowProps): react_jsx_runtime.JSX.Element;

interface ConsentScreenProps {
    onAccept: () => void;
    onDecline: () => void;
}
declare function ConsentScreen({ onAccept, onDecline }: ConsentScreenProps): react_jsx_runtime.JSX.Element;

interface CountryInfo {
    id: string;
    name: string;
    flagEmoji: string;
    documentTypes: DocumentType[];
}
interface CountrySelectionScreenProps {
    onSelect: (country: CountryInfo) => void;
    onCancel: () => void;
}
declare function CountrySelectionScreen({ onSelect, onCancel }: CountrySelectionScreenProps): react_jsx_runtime.JSX.Element;

interface DocumentSelectionScreenProps {
    documentTypes?: DocumentType[];
    selectedCountry?: CountryInfo | null;
    onSelect: (type: DocumentType) => void;
    onCancel: () => void;
}
declare function DocumentSelectionScreen({ documentTypes, selectedCountry, onSelect, onCancel, }: DocumentSelectionScreenProps): react_jsx_runtime.JSX.Element;

interface DocumentCaptureScreenProps {
    side: 'front' | 'back';
    documentType?: string;
    requiresBack?: boolean;
    onCapture: (imageData: Blob) => Promise<boolean>;
    onCancel: () => void;
}
declare function DocumentCaptureScreen({ side, documentType, requiresBack, onCapture, onCancel, }: DocumentCaptureScreenProps): react_jsx_runtime.JSX.Element;

interface SelfieCaptureScreenProps {
    onCapture: (imageData: Blob) => Promise<boolean>;
    onCancel: () => void;
}
declare function SelfieCaptureScreen({ onCapture, onCancel }: SelfieCaptureScreenProps): react_jsx_runtime.JSX.Element;

interface LivenessScreenProps {
    session: LivenessSession | null;
    currentChallenge: LivenessChallenge | null;
    completedChallenges: number;
    onChallengeComplete: (imageData: Blob) => Promise<boolean>;
    onStart: () => Promise<void>;
    onComplete: () => Promise<any>;
    onCancel: () => void;
}
declare function LivenessScreen({ session, currentChallenge, completedChallenges, onChallengeComplete, onStart, onComplete, onCancel, }: LivenessScreenProps): react_jsx_runtime.JSX.Element;

interface ResultScreenProps {
    verification: Verification;
    onDone: () => void;
    onRetry?: () => void;
}
declare function ResultScreen({ verification, onDone, onRetry }: ResultScreenProps): react_jsx_runtime.JSX.Element;

interface ErrorScreenProps {
    error: KoraError;
    onRetry: () => void;
    onCancel: () => void;
}
declare function ErrorScreen({ error, onRetry, onCancel }: ErrorScreenProps): react_jsx_runtime.JSX.Element;

interface StepProgressBarProps {
    total: number;
    current: number;
    isDark?: boolean;
}
declare function StepProgressBar({ total, current, isDark }: StepProgressBarProps): react_jsx_runtime.JSX.Element;
interface ScoreCardProps {
    score: number;
    badge: string;
    gradient: string;
}
declare function ScoreCard({ score, badge, gradient }: ScoreCardProps): react_jsx_runtime.JSX.Element;
type MetricStatus = 'pass' | 'fail' | 'borderline';
interface ScoreMetricRowProps {
    label: string;
    score: number;
    icon: string;
    status: MetricStatus;
    message?: string;
}
declare function ScoreMetricRow({ label, score, icon, status, message }: ScoreMetricRowProps): react_jsx_runtime.JSX.Element;
interface ProcessingStep {
    label: string;
    status: 'done' | 'active' | 'pending';
}
interface ProcessingScreenProps {
    steps: ProcessingStep[];
}
declare function ProcessingScreen({ steps }: ProcessingScreenProps): react_jsx_runtime.JSX.Element;

export { ConsentScreen, type CountryInfo, CountrySelectionScreen, DocumentCaptureScreen, DocumentSelectionScreen, ErrorScreen, type KoraIDVContextValue, KoraIDVProvider, LivenessScreen, ProcessingScreen, ResultScreen, ScoreCard, ScoreMetricRow, SelfieCaptureScreen, StepProgressBar, VerificationFlow, type VerificationFlowProps, useKoraIDV };
