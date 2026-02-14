import React from 'react';
import { Verification } from '@koraidv/core';
import { styles, colors } from './styles';
import { ScoreCard, ScoreMetricRow, computeScoreBreakdown } from './DesignSystem';

interface ResultScreenProps {
  verification: Verification;
  onDone: () => void;
  onRetry?: () => void;
}

export function ResultScreen({ verification, onDone, onRetry }: ResultScreenProps) {
  const { status } = verification;

  switch (status) {
    case 'approved':
      return <SuccessResult verification={verification} onDone={onDone} />;
    case 'rejected':
      return <RejectedResult verification={verification} onRetry={onRetry || onDone} />;
    case 'expired':
      return <ExpiredResult verification={verification} onRetry={onRetry || onDone} />;
    case 'review_required':
      return <ManualReviewResult verification={verification} onDone={onDone} />;
    default:
      return <SuccessResult verification={verification} onDone={onDone} />;
  }
}

// ─── Success ────────────────────────────────────────────────────────────────

function SuccessResult({ verification, onDone }: { verification: Verification; onDone: () => void }) {
  const score = verification.riskScore ?? 84;
  const metrics = computeScoreBreakdown(verification);

  return (
    <div style={styles.resultContainer}>
      <div style={styles.resultContent}>
        {/* Icon */}
        <div
          style={{
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.success}15`,
          }}
        >
          <div
            style={{
              ...styles.resultIconCircle,
              background: `linear-gradient(135deg, ${colors.success}, #059669)`,
              color: colors.white,
              margin: 0,
            }}
          >
            ✓
          </div>
        </div>

        <h1 style={styles.resultTitle}>Verification approved</h1>
        <p style={styles.resultSubtitle}>Your identity has been successfully verified.</p>

        {/* Score card */}
        <ScoreCard
          score={score}
          badge="PASSED"
          gradient={`linear-gradient(135deg, ${colors.teal}, ${colors.tealDark})`}
        />

        {/* Metrics */}
        {metrics.map((m, i) => (
          <ScoreMetricRow key={i} {...m} />
        ))}
      </div>

      <div style={styles.footer}>
        <button style={styles.primaryButton} onClick={onDone}>Done</button>
      </div>
    </div>
  );
}

// ─── Rejected ───────────────────────────────────────────────────────────────

function RejectedResult({ verification, onRetry }: { verification: Verification; onRetry: () => void }) {
  const score = verification.riskScore ?? 42;
  const metrics = computeScoreBreakdown(verification);

  return (
    <div style={styles.resultContainer}>
      <div style={styles.resultContent}>
        {/* Icon */}
        <div
          style={{
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.error}15`,
          }}
        >
          <div
            style={{
              ...styles.resultIconCircle,
              background: `linear-gradient(135deg, ${colors.error}, #B91C1C)`,
              color: colors.white,
              margin: 0,
            }}
          >
            ✕
          </div>
        </div>

        <h1 style={styles.resultTitle}>Verification rejected</h1>
        <p style={styles.resultSubtitle}>
          We could not verify your identity. Please try again with a valid document.
        </p>

        {/* Score card */}
        <ScoreCard
          score={score}
          badge="REJECTED"
          gradient={`linear-gradient(135deg, ${colors.error}, #B91C1C)`}
        />

        {/* Metrics */}
        {metrics.map((m, i) => (
          <ScoreMetricRow key={i} {...m} />
        ))}
      </div>

      <div style={styles.footer}>
        <button style={styles.primaryButton} onClick={onRetry}>Try again</button>
      </div>
    </div>
  );
}

// ─── Expired ────────────────────────────────────────────────────────────────

function ExpiredResult({ verification, onRetry }: { verification: Verification; onRetry: () => void }) {
  return (
    <div style={styles.resultContainer}>
      <div style={styles.resultContent}>
        {/* Icon with outer ring */}
        <div
          style={{
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.warning}15`,
            border: `2px solid ${colors.warning}30`,
          }}
        >
          <div
            style={{
              ...styles.resultIconCircle,
              background: `linear-gradient(135deg, ${colors.warning}, #B45309)`,
              color: colors.white,
              margin: 0,
            }}
          >
            ⚠
          </div>
        </div>

        <h1 style={styles.resultTitle}>Document expired</h1>
        <p style={styles.resultSubtitle}>
          The document you submitted has expired. Please use a valid, non-expired document.
        </p>

        {/* Expiry details */}
        {verification.documentVerification && (
          <div style={styles.expiryCard}>
            <div style={styles.expiryRow}>
              <span style={styles.expiryLabel}>Document type</span>
              <span style={styles.expiryValue}>
                {verification.documentVerification.documentType || 'ID Card'}
              </span>
            </div>
            {verification.documentVerification.issuingCountry && (
              <div style={styles.expiryRow}>
                <span style={styles.expiryLabel}>Country</span>
                <span style={styles.expiryValue}>
                  {verification.documentVerification.issuingCountry}
                </span>
              </div>
            )}
            {verification.documentVerification.expirationDate && (
              <div style={styles.expiryRow}>
                <span style={styles.expiryLabel}>Expired on</span>
                <span style={styles.expiryBadge}>
                  {verification.documentVerification.expirationDate}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Guidance tips */}
        <div style={{ textAlign: 'left' }}>
          <GuidanceTip number={1} text="Check the expiration date on your document" />
          <GuidanceTip number={2} text="Use a different document that is currently valid" />
          <GuidanceTip number={3} text="Ensure the document details are clearly visible" />
        </div>
      </div>

      <div style={styles.footer}>
        <button style={styles.primaryButton} onClick={onRetry}>
          Try with a valid document
        </button>
      </div>
    </div>
  );
}

// ─── Manual Review ──────────────────────────────────────────────────────────

function ManualReviewResult({ verification, onDone }: { verification: Verification; onDone: () => void }) {
  const score = verification.riskScore ?? 68;
  const metrics = computeScoreBreakdown(verification);

  return (
    <div style={styles.resultContainer}>
      <div style={styles.resultContent}>
        {/* Icon with outer ring */}
        <div
          style={{
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.info}15`,
            border: `2px solid ${colors.info}30`,
          }}
        >
          <div
            style={{
              ...styles.resultIconCircle,
              background: `linear-gradient(135deg, ${colors.info}, #0369A1)`,
              color: colors.white,
              margin: 0,
            }}
          >
            🕐
          </div>
        </div>

        <h1 style={styles.resultTitle}>Under review</h1>
        <p style={styles.resultSubtitle}>
          Your verification requires manual review. We'll notify you of the result.
        </p>

        {/* Score card */}
        <ScoreCard
          score={score}
          badge="REVIEW"
          gradient={`linear-gradient(135deg, ${colors.info}, #0369A1)`}
        />

        {/* Metrics */}
        {metrics.map((m, i) => (
          <ScoreMetricRow key={i} {...m} />
        ))}
      </div>

      <div style={styles.footer}>
        <button style={styles.primaryButton} onClick={onDone}>Got it</button>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function GuidanceTip({ number, text }: { number: number; text: string }) {
  return (
    <div style={styles.guidanceTip}>
      <div style={styles.guidanceTipNumber}>{number}</div>
      <span style={styles.guidanceTipText}>{text}</span>
    </div>
  );
}
