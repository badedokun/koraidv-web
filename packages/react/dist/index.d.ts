import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ReactNode } from 'react';
import { KoraIDV, Configuration, VerificationStep, Verification, LivenessSession, LivenessChallenge, KoraError, DocumentType, DocumentQualityResponse } from '@koraidv/core';

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
interface UseKoraIDVReturn {
    /**
     * Current verification state
     */
    state: VerificationState;
    /**
     * Start a new verification
     */
    startVerification: (externalId: string, tier?: string, expectedFirstName?: string, expectedLastName?: string) => Promise<void>;
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
    uploadDocument: (imageData: Blob, side: 'front' | 'back', country?: string) => Promise<boolean>;
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
declare function VerificationFlow({ externalId, tier, documentTypes, expectedFirstName, expectedLastName, showVisualGuides, onComplete, onError, onCancel, className, style, }: VerificationFlowProps): react_jsx_runtime.JSX.Element;

interface ConsentScreenProps {
    onAccept: () => void;
    onDecline: () => void;
}
declare function ConsentScreen({ onAccept, onDecline }: ConsentScreenProps): react_jsx_runtime.JSX.Element;

interface CountryInfo {
    id: string;
    name: string;
    flagEmoji: string;
    documentTypes: string[];
}
interface CountrySelectionScreenProps {
    countries?: CountryInfo[];
    onSelect: (country: CountryInfo) => void;
    onCancel: () => void;
}
declare function CountrySelectionScreen({ countries, onSelect, onCancel }: CountrySelectionScreenProps): react_jsx_runtime.JSX.Element;

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
    onQualityCheck?: (imageData: Blob) => Promise<DocumentQualityResponse>;
    onCapture: (imageData: Blob) => Promise<boolean>;
    onCancel: () => void;
    /** Render Visual Guide illustration above the capture area (v1.8.0). */
    showVisualGuides?: boolean;
}
declare function DocumentCaptureScreen({ side, documentType, requiresBack, onQualityCheck, onCapture, onCancel, showVisualGuides, }: DocumentCaptureScreenProps): react_jsx_runtime.JSX.Element;

interface SelfieCaptureScreenProps {
    onCapture: (imageData: Blob) => Promise<boolean>;
    onCancel: () => void;
    /** Render Visual Guide above the selfie viewfinder (v1.8.0). */
    showVisualGuides?: boolean;
}
declare function SelfieCaptureScreen({ onCapture, onCancel, showVisualGuides }: SelfieCaptureScreenProps): react_jsx_runtime.JSX.Element;

interface LivenessScreenProps {
    session: LivenessSession | null;
    currentChallenge: LivenessChallenge | null;
    completedChallenges: number;
    onChallengeComplete: (imageData: Blob) => Promise<boolean>;
    onStart: () => Promise<void>;
    onComplete: () => Promise<any>;
    onCancel: () => void;
    /**
     * Inline retake feedback for the LAST attempt the backend rejected.
     * Surfaced in the prompt card during the 'preparing' phase of the
     * next attempt so the user knows what went wrong before they try
     * again. Cleared by the hook when a challenge passes or a new
     * challenge starts.
     */
    lastChallengeError?: string | null;
    /** Render per-challenge VisualGuide above the instruction (v1.8.0). */
    showVisualGuides?: boolean;
}
/**
 * Web liveness screen with a real front-facing camera.
 *
 * Before v1.7.7 this was a stub: a static oval guide + a "Complete
 * Challenge" button that submitted a blank 100×100 white canvas. The
 * camera was never wired up — Web shipped without a real liveness
 * implementation while iOS + Android had full liveness from day one.
 * Found and called out by Luckycat's first end-to-end integration on
 * 2026-05-29.
 *
 * This implementation pairs a real `getUserMedia` camera feed with the
 * server's existing liveness pipeline (ml-service detects whether the
 * submitted frame shows the requested gesture). Per-challenge flow:
 *
 *   1. Render the front camera in the oval guide (object-fit cover,
 *      circular clip — same visual shape as the previous stub).
 *   2. Show the challenge instruction (Smile / Turn left / Blink / ...).
 *   3. Run a 3-second countdown so the user has time to perform the
 *      gesture.
 *   4. When the countdown hits zero, capture a frame from the video
 *      and post it to /verifications/{id}/liveness/challenge with the
 *      challenge type. The hook's submitChallenge advances state on
 *      pass; on fail the same challenge stays current and the
 *      countdown re-arms for retry.
 *
 * Client-side gesture detection (MediaPipe Face Mesh + auto-capture
 * when the gesture is satisfied) is the planned follow-up — that would
 * close the UX gap with iOS, where the user doesn't have to time
 * themselves against a countdown. Today's ship is "real camera, real
 * frames, server decides," which is the parity floor.
 */
declare function LivenessScreen({ session, currentChallenge, completedChallenges, onChallengeComplete, onStart, onComplete, onCancel, lastChallengeError, showVisualGuides, }: LivenessScreenProps): react_jsx_runtime.JSX.Element;

type ResultPageMode = 'detailed' | 'simplified';
interface ResultScreenProps {
    verification: Verification;
    onDone: () => void;
    onRetry?: () => void;
    /**
     * Result page mode. "simplified" shows only pass/fail/review with no metrics or scores;
     * "detailed" (default) shows the full breakdown. Overrides the tenant-level
     * `result_page_mode` setting when provided.
     */
    resultPageMode?: ResultPageMode;
    /** @deprecated Use `resultPageMode="simplified"` instead. */
    simplified?: boolean;
    /** Custom messages for simplified mode */
    customMessages?: {
        successTitle?: string;
        successMessage?: string;
        failedTitle?: string;
        failedMessage?: string;
        reviewTitle?: string;
        reviewMessage?: string;
    };
}
declare function ResultScreen({ verification, onDone, onRetry, resultPageMode, simplified, customMessages }: ResultScreenProps): react_jsx_runtime.JSX.Element;

interface ErrorScreenProps {
    error: KoraError;
    onRetry: () => void;
    onCancel: () => void;
}
declare function ErrorScreen({ error, onRetry, onCancel }: ErrorScreenProps): react_jsx_runtime.JSX.Element;

/** Handoff session from the identity service */
interface HandoffSession {
    token: string;
    captureUrl: string;
    expiresAt: string;
    expiresIn: number;
}
interface QrHandoffScreenProps {
    /** Handoff session containing the QR token and capture URL */
    session: HandoffSession;
    /** Called when the mobile capture completes */
    onMobileCaptureComplete: () => void;
    /** Called when the user chooses to continue on this device */
    onContinueOnDevice: () => void;
    /** Called when the session expires */
    onExpired: () => void;
    /** Called to refresh the session (generate new QR) */
    onRefresh: () => void;
    /** EventSource for SSE status updates */
    eventSource?: EventSource | null;
}
/**
 * QR Handoff Screen — displays a QR code for the user to scan with their
 * mobile phone to continue the verification capture on a better camera.
 */
declare function QrHandoffScreen({ session, onMobileCaptureComplete, onContinueOnDevice, onExpired, onRefresh, eventSource, }: QrHandoffScreenProps): react_jsx_runtime.JSX.Element;

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
    /**
     * Optional explicit steps. When provided, the screen renders them as-
     * is (the v1.7.x behavior — kept for backwards compat with any caller
     * passing a custom array).
     */
    steps?: ProcessingStep[];
    /**
     * When true (and `steps` is omitted), the screen auto-advances
     * through a default 3-step sequence on a timer — the user sees
     * "Document analyzed → Checking face match → Finalizing results"
     * progress visually instead of a static screen. Each step transition
     * is ~1.4s so the full sequence completes in ~4s, long enough to
     * read but short enough that the typical sub-second backend
     * `/complete` resolution still shows visible motion. Pre-v1.8.0 the
     * labels were hardcoded with "Checking face match" pinned as
     * 'active' regardless of actual progress — looked frozen on any
     * processing window over ~500ms.
     */
    autoAdvance?: boolean;
}
declare function ProcessingScreen({ steps, autoAdvance }: ProcessingScreenProps): react_jsx_runtime.JSX.Element;

export { ConsentScreen, type CountryInfo, CountrySelectionScreen, DocumentCaptureScreen, DocumentSelectionScreen, ErrorScreen, type KoraIDVContextValue, KoraIDVProvider, LivenessScreen, ProcessingScreen, QrHandoffScreen, ResultScreen, ScoreCard, ScoreMetricRow, SelfieCaptureScreen, StepProgressBar, VerificationFlow, type VerificationFlowProps, useKoraIDV };
