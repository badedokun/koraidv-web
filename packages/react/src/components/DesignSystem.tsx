import React, { useEffect, useState } from 'react';
import { styles, colors, injectKeyframes } from './styles';

// ─── Step Progress Bar ──────────────────────────────────────────────────────

interface StepProgressBarProps {
  total: number;
  current: number;
  isDark?: boolean;
}

export function StepProgressBar({ total, current, isDark = false }: StepProgressBarProps) {
  return (
    <div style={styles.progressBar}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            ...styles.progressSegment,
            backgroundColor:
              i < current
                ? colors.teal
                : isDark
                ? 'rgba(255,255,255,0.15)'
                : colors.border,
          }}
        />
      ))}
    </div>
  );
}

// ─── Score Card ─────────────────────────────────────────────────────────────

interface ScoreCardProps {
  score: number;
  badge: string;
  gradient: string;
}

export function ScoreCard({ score, badge, gradient }: ScoreCardProps) {
  return (
    <div style={{ ...styles.scoreCard, background: gradient }}>
      <div style={styles.scoreValue}>{score}%</div>
      <div style={styles.scoreBadge}>{badge}</div>
      <div style={styles.scoreProgressBg}>
        <div style={{ ...styles.scoreProgressFill, width: `${score}%` }} />
      </div>
    </div>
  );
}

// ─── Score Metric Row ───────────────────────────────────────────────────────

type MetricStatus = 'pass' | 'fail' | 'borderline';

interface ScoreMetricRowProps {
  label: string;
  score: number;
  icon: string;
  status: MetricStatus;
  message?: string;
  /** When true the metric was not evaluated (e.g. name match with no expected name):
   *  render "N/A" with a neutral style instead of a percentage/pass-fail. */
  notApplicable?: boolean;
}

export function ScoreMetricRow({ label, score, icon, status, message, notApplicable }: ScoreMetricRowProps) {
  const bgColor = notApplicable
    ? colors.surface
    : status === 'pass'
      ? colors.successBg
      : status === 'fail'
      ? colors.errorBg
      : colors.warningBg;

  const borderColor = notApplicable
    ? colors.textSecondary
    : status === 'pass'
      ? colors.success
      : status === 'fail'
      ? colors.error
      : colors.warning;

  const textColor = borderColor;

  const badgeText = notApplicable ? '' : status === 'pass' ? 'PASS' : status === 'fail' ? 'FAIL' : 'REVIEW';

  return (
    <div
      style={{
        ...styles.metricRow,
        backgroundColor: bgColor,
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <div
        style={{
          ...styles.metricIcon,
          backgroundColor: `${borderColor}15`,
        }}
      >
        {icon}
      </div>
      <div style={styles.metricInfo}>
        <div style={styles.metricLabel}>{label}</div>
        {message && (
          <div style={{ ...styles.metricMessage, color: textColor }}>{message}</div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ ...styles.metricScore, color: textColor }}>{notApplicable ? 'N/A' : `${score}%`}</span>
        {badgeText && (
          <span
            style={{
              ...styles.metricBadge,
              backgroundColor: `${borderColor}15`,
              color: textColor,
            }}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Processing Screen ──────────────────────────────────────────────────────

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

const DEFAULT_AUTO_STEPS: ReadonlyArray<string> = [
  'Document analyzed',
  'Checking face match',
  'Finalizing results',
];

export function ProcessingScreen({ steps, autoAdvance = true }: ProcessingScreenProps) {
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Auto-advancing step state: starts at 0 (first step active, rest
  // pending), advances every 1.4s. When the last step becomes active
  // it stays there until ProcessingScreen unmounts — VerificationFlow
  // will swap to ResultScreen once complete() resolves.
  const [autoIndex, setAutoIndex] = useState(0);
  useEffect(() => {
    if (steps || !autoAdvance) return;
    if (autoIndex >= DEFAULT_AUTO_STEPS.length - 1) return;
    const t = setTimeout(() => setAutoIndex((i) => i + 1), 1400);
    return () => clearTimeout(t);
  }, [autoIndex, steps, autoAdvance]);

  const renderedSteps: ProcessingStep[] = steps
    ? steps
    : DEFAULT_AUTO_STEPS.map((label, i) => ({
        label,
        status:
          i < autoIndex ? 'done' : i === autoIndex ? 'active' : 'pending',
      }));

  return (
    <div style={styles.processingContainer}>
      {/* Spinning rings */}
      <div style={styles.spinnerContainer}>
        <div
          style={{
            ...styles.spinnerRing,
            inset: '0',
            borderTopColor: `${colors.teal}40`,
            animation: 'kora-ring1 3s linear infinite',
          }}
        />
        <div
          style={{
            ...styles.spinnerRing,
            inset: '15px',
            borderRightColor: `${colors.cyan}40`,
            animation: 'kora-ring2 2s linear infinite',
          }}
        />
        <div
          style={{
            ...styles.spinnerRing,
            inset: '30px',
            borderBottomColor: `${colors.teal}40`,
            animation: 'kora-ring3 1.5s linear infinite',
          }}
        />
        {/* Shield icon */}
        <div
          style={{
            position: 'absolute',
            inset: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}
        >
          🛡️
        </div>
      </div>

      {/* Steps */}
      <div style={styles.processingSteps}>
        {renderedSteps.map((step, i) => (
          <div key={i} style={styles.processingStep}>
            <div
              style={{
                ...styles.processingStepIcon,
                backgroundColor:
                  step.status === 'done'
                    ? colors.success
                    : step.status === 'active'
                    ? colors.teal
                    : 'rgba(255,255,255,0.1)',
                color:
                  step.status === 'pending' ? 'rgba(255,255,255,0.3)' : colors.white,
              }}
            >
              {step.status === 'done' ? '✓' : step.status === 'active' ? '…' : '·'}
            </div>
            <span
              style={{
                color:
                  step.status === 'pending'
                    ? 'rgba(255,255,255,0.3)'
                    : colors.white,
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Score Breakdown Helper ─────────────────────────────────────────────────

interface ScoreBreakdownMetric {
  label: string;
  score: number;
  icon: string;
  status: MetricStatus;
  message?: string;
  notApplicable?: boolean;
}

export function computeScoreBreakdown(verification: {
  scores?: {
    liveness?: number;
    documentAuth?: number;
    documentQuality?: number;
    faceMatch?: number;
    nameMatch?: number;
    nameMatchResult?: { hasExpectedNames?: boolean };
  };
  livenessVerification?: { livenessScore: number };
  documentVerification?: { authenticityScore?: number; firstName?: string; lastName?: string };
  faceVerification?: { matchScore: number };
  riskScore?: number;
  /**
   * Source signal carried via metadata (set by the Web SDK on
   * createVerification as `source: 'web'`; mobile SDKs set
   * `source: 'mobile'` or leave it unset). Used here to pick the
   * right per-axis display thresholds: web verifications get
   * relaxed PASS/borderline cutoffs to match the backend's source-
   * aware threshold tuning (v1.8.0). Without this alignment, a web
   * selfie that backend AUTO-APPROVES at 72% still renders as
   * "REVIEW" on the score row — confusing for users + compliance
   * reviewers looking at a verified flow.
   */
  metadata?: { source?: string } | null;
}): ScoreBreakdownMetric[] {
  const source = verification.metadata?.source ?? '';
  // The top-level `verification.scores` object holds everything in a
  // consistent 0-100 scale. Prefer it. The per-feature fallbacks below
  // have inconsistent scaling — livenessScore + matchScore are already
  // 0-100 from the backend, but authenticityScore is 0-1. Treating
  // them uniformly caused the 2026-05-30 display bug where Liveness
  // rendered as "7368%" and Selfie Match as "6255%" because 73.87 and
  // 62.55 got multiplied by 100 again. Scaling is now explicit
  // per-field so the fallback path can't drift back into that trap.
  const livenessPercent = Math.round(
    verification.scores?.liveness ??
    verification.livenessVerification?.livenessScore ?? 0,
  );

  const docPercent = Math.round(
    verification.scores?.documentAuth ??
    ((verification.documentVerification?.authenticityScore ?? 0) * 100),
  );

  const nameMatch = Math.round(
    verification.scores?.nameMatch ??
    (verification.documentVerification?.firstName && verification.documentVerification?.lastName
      ? 100
      : 0),
  );

  const selfiePercent = Math.round(
    verification.scores?.faceMatch ??
    verification.faceVerification?.matchScore ?? 0,
  );

  // Source-aware display thresholds (v1.8.1). Backend's PASS floor
  // for web is 50 (after -10 source adjustment in
  // VerificationThresholds.EffectiveForSource); SDK display
  // historically used PASS@75 / borderline@50. Aligning web's
  // display PASS to 65 keeps a small headroom above the backend
  // floor (so SDK shows REVIEW for scores the backend would still
  // accept but where a reviewer might want eyes), without
  // showing REVIEW on scores the backend has clearly auto-approved.
  // Mobile + unknown sources keep the existing strict PASS@75 since
  // their backend floor is also higher.
  const isWeb = source === 'web';
  // Web display PASS floor aligned to the backend's web face-match floor (~60 after the
  // -10 source adjustment) rather than a higher "headroom" — the headroom created an
  // approved-overall-but-tile-REVIEW contradiction (a 60% web selfie the backend accepts
  // rendered amber). Now a per-axis score the backend would pass shows green.
  const passFloor = isWeb ? 60 : 75;
  const borderlineFloor = isWeb ? 40 : 50;

  function getStatus(score: number): MetricStatus {
    if (score >= passFloor) return 'pass';
    if (score >= borderlineFloor) return 'borderline';
    return 'fail';
  }

  function getMessage(status: MetricStatus): string | undefined {
    if (status === 'fail') return 'Below threshold';
    if (status === 'borderline') return 'Requires review';
    return undefined;
  }

  const metrics: ScoreBreakdownMetric[] = [
    {
      label: 'Liveness',
      score: livenessPercent,
      icon: '👁️',
      status: getStatus(livenessPercent),
      message: getMessage(getStatus(livenessPercent)),
    },
    {
      label: 'Name Match',
      score: nameMatch,
      icon: '📝',
      // No expected name supplied → nameMatch is an OCR extraction proxy, not a match → N/A.
      notApplicable: verification.scores?.nameMatchResult?.hasExpectedNames === false,
      status: getStatus(nameMatch),
      message:
        verification.scores?.nameMatchResult?.hasExpectedNames === false
          ? undefined
          : getMessage(getStatus(nameMatch)),
    },
    {
      label: 'Document Quality',
      score: docPercent,
      icon: '📄',
      status: getStatus(docPercent),
      message: getMessage(getStatus(docPercent)),
    },
    {
      label: 'Selfie Match',
      score: selfiePercent,
      icon: '🤳',
      status: getStatus(selfiePercent),
      message: getMessage(getStatus(selfiePercent)),
    },
  ];

  return metrics;
}
