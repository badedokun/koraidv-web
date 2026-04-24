import React from 'react';
import { Verification } from '@koraidv/core';
import { styles, colors } from './styles';
import { ScoreCard, ScoreMetricRow, computeScoreBreakdown } from './DesignSystem';

export type ResultPageMode = 'detailed' | 'simplified';

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

export function ResultScreen({ verification, onDone, onRetry, resultPageMode, simplified, customMessages }: ResultScreenProps) {
  const { status } = verification;
  const effectiveMode: ResultPageMode =
    resultPageMode ?? (simplified ? 'simplified' : 'detailed');

  if (effectiveMode === 'simplified') {
    switch (status) {
      case 'approved':
        return <SimplifiedSuccess onDone={onDone} customMessages={customMessages} />;
      case 'rejected':
        return <SimplifiedFailed onRetry={onRetry || onDone} customMessages={customMessages} />;
      case 'review_required':
        return <SimplifiedReview verification={verification} onDone={onDone} customMessages={customMessages} />;
      case 'expired':
        return <SimplifiedFailed onRetry={onRetry || onDone} customMessages={{ failedTitle: 'Document Expired', failedMessage: 'The document you submitted has expired. Please use a valid document.' }} />;
      default:
        return <SimplifiedSuccess onDone={onDone} customMessages={customMessages} />;
    }
  }

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

// ─── Simplified Results ─────────────────────────────────────────────────────

interface SimplifiedProps {
  customMessages?: ResultScreenProps['customMessages'];
}

function SimplifiedSuccess({ onDone, customMessages }: SimplifiedProps & { onDone: () => void }) {
  return (
    <div style={styles.resultContainer}>
      <div style={{ ...styles.resultContent, textAlign: 'center' as const }}>
        <div
          style={{
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.success}15`,
            width: 96,
            height: 96,
          }}
        >
          <div
            style={{
              ...styles.resultIconCircle,
              background: `linear-gradient(135deg, ${colors.success}, #059669)`,
              color: colors.white,
              margin: 0,
              width: 64,
              height: 64,
              fontSize: 28,
            }}
          >
            ✓
          </div>
        </div>

        <h1 style={{ ...styles.resultTitle, fontSize: 24, marginTop: 16 }}>
          {customMessages?.successTitle || 'Verification Successful'}
        </h1>
        <p style={{ ...styles.resultSubtitle, fontSize: 16, maxWidth: 320, margin: '8px auto 0' }}>
          {customMessages?.successMessage || 'Your identity has been successfully verified. You can now proceed.'}
        </p>
      </div>

      <div style={styles.footer}>
        <button style={styles.primaryButton} onClick={onDone}>Continue</button>
      </div>
    </div>
  );
}

function SimplifiedFailed({ onRetry, customMessages }: SimplifiedProps & { onRetry: () => void }) {
  return (
    <div style={styles.resultContainer}>
      <div style={{ ...styles.resultContent, textAlign: 'center' as const }}>
        <div
          style={{
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.error}15`,
            width: 96,
            height: 96,
          }}
        >
          <div
            style={{
              ...styles.resultIconCircle,
              background: `linear-gradient(135deg, ${colors.error}, #B91C1C)`,
              color: colors.white,
              margin: 0,
              width: 64,
              height: 64,
              fontSize: 28,
            }}
          >
            ✕
          </div>
        </div>

        <h1 style={{ ...styles.resultTitle, fontSize: 24, marginTop: 16 }}>
          {customMessages?.failedTitle || 'Verification Failed'}
        </h1>
        <p style={{ ...styles.resultSubtitle, fontSize: 16, maxWidth: 320, margin: '8px auto 0' }}>
          {customMessages?.failedMessage || 'We could not verify your identity. Please try again with a valid document.'}
        </p>
      </div>

      <div style={styles.footer}>
        <button style={styles.primaryButton} onClick={onRetry}>Try Again</button>
      </div>
    </div>
  );
}

function SimplifiedReview({ verification, onDone, customMessages }: SimplifiedProps & { verification: Verification; onDone: () => void }) {
  return (
    <div style={styles.resultContainer}>
      <div style={{ ...styles.resultContent, textAlign: 'center' as const }}>
        <div
          style={{
            ...styles.resultIconOuterRing,
            backgroundColor: `${colors.warning}15`,
            width: 96,
            height: 96,
          }}
        >
          <div
            style={{
              ...styles.resultIconCircle,
              background: `linear-gradient(135deg, ${colors.warning}, #B45309)`,
              color: colors.white,
              margin: 0,
              width: 64,
              height: 64,
              fontSize: 28,
            }}
          >
            🕐
          </div>
        </div>

        <h1 style={{ ...styles.resultTitle, fontSize: 24, marginTop: 16 }}>
          {customMessages?.reviewTitle || 'Verification Under Review'}
        </h1>
        <p style={{ ...styles.resultSubtitle, fontSize: 16, maxWidth: 320, margin: '8px auto 0' }}>
          {customMessages?.reviewMessage || 'Your verification requires additional review. We will notify you of the result.'}
        </p>

        {/* Reference number */}
        <div style={{
          marginTop: 24,
          padding: '12px 24px',
          backgroundColor: `${colors.info}10`,
          borderRadius: 8,
          border: `1px solid ${colors.info}30`,
          display: 'inline-block',
        }}>
          <span style={{ fontSize: 12, color: colors.textSecondary }}>Reference: </span>
          <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace' }}>{verification.id.slice(0, 8)}</span>
        </div>
      </div>

      <div style={styles.footer}>
        <button style={styles.primaryButton} onClick={onDone}>Got It</button>
      </div>
    </div>
  );
}
