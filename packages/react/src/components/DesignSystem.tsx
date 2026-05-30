import React, { useEffect } from 'react';
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
}

export function ScoreMetricRow({ label, score, icon, status, message }: ScoreMetricRowProps) {
  const bgColor =
    status === 'pass'
      ? colors.successBg
      : status === 'fail'
      ? colors.errorBg
      : colors.warningBg;

  const borderColor =
    status === 'pass'
      ? colors.success
      : status === 'fail'
      ? colors.error
      : colors.warning;

  const textColor = borderColor;

  const badgeText = status === 'pass' ? 'PASS' : status === 'fail' ? 'FAIL' : 'REVIEW';

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
        <span style={{ ...styles.metricScore, color: textColor }}>{score}%</span>
        <span
          style={{
            ...styles.metricBadge,
            backgroundColor: `${borderColor}15`,
            color: textColor,
          }}
        >
          {badgeText}
        </span>
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
  steps: ProcessingStep[];
}

export function ProcessingScreen({ steps }: ProcessingScreenProps) {
  useEffect(() => {
    injectKeyframes();
  }, []);

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
        {steps.map((step, i) => (
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
}

export function computeScoreBreakdown(verification: {
  scores?: {
    liveness?: number;
    documentAuth?: number;
    documentQuality?: number;
    faceMatch?: number;
    nameMatch?: number;
  };
  livenessVerification?: { livenessScore: number };
  documentVerification?: { authenticityScore?: number; firstName?: string; lastName?: string };
  faceVerification?: { matchScore: number };
  riskScore?: number;
}): ScoreBreakdownMetric[] {
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

  function getStatus(score: number): MetricStatus {
    if (score >= 75) return 'pass';
    if (score >= 50) return 'borderline';
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
      status: getStatus(nameMatch),
      message: getMessage(getStatus(nameMatch)),
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
