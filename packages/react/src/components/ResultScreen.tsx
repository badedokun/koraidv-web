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
        return (
          <SimplifiedFailed
            verification={verification}
            onRetry={onRetry || onDone}
            customMessages={customMessages}
          />
        );
      case 'review_required':
        return <SimplifiedReview verification={verification} onDone={onDone} customMessages={customMessages} />;
      case 'expired':
        return (
          <SimplifiedFailed
            verification={verification}
            onRetry={onRetry || onDone}
            customMessages={{
              failedTitle: 'Document Expired',
              failedMessage:
                'The document you submitted has expired. Please use a valid document.',
            }}
          />
        );
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
  // Headline score should reflect verification CONFIDENCE (higher is
  // better). Prefer scores.overall (already 0-100); fall back to
  // inverting riskScore (which is the inverse — lower = less risky).
  // Pre-v1.7.10 this rendered raw riskScore as "X% PASSED" — so an
  // approved verification with riskScore: 25 showed "25% PASSED" on
  // the success screen. Surfaced 2026-05-30.
  const score = Math.round(
    verification.scores?.overall ?? (100 - (verification.riskScore ?? 16)),
  );
  // approvedOverall: this is the APPROVED screen, so no per-axis tile may show
  // "Requires review" — the backend accepted every axis. Prevents the
  // approved-overall-but-tile-REVIEW contradiction (e.g. "90% PASSED" with a
  // 57% Selfie Match tile reading "Requires review").
  const metrics = computeScoreBreakdown(verification, { approvedOverall: true });

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
  // Deliberately NO headline percentage on rejected results.
  //
  // Pre-v1.8.3 this rendered a big "{N}% REJECTED" ScoreCard. That
  // created a real misleading-UX problem: the same 88% composite
  // score that drove an APPROVED outcome in one test (good ML
  // signals) appears identically on a REJECTED outcome here (the
  // composite is still ~88% because the underlying signals are
  // fine — the rejection came from a hard categorical gate like
  // selected-vs-detected doc/country mismatch, not from the score
  // failing a threshold). Showing "88% REJECTED" implies "approval
  // requires > 88%" which is wrong and confuses both end users and
  // compliance reviewers. Surfaced by Luckycat 2026-05-31 running
  // country/doc mismatch tests. The reason from decisionReason now
  // gets the visual prominence the score percentage used to consume.
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
        {/* Reason card replaces the score card — visually prominent
            so users + compliance reviewers see WHY the verification
            failed, not just the catch-all "we could not verify"
            copy. decisionReason carries the actual cause (selected-
            vs-detected doc mismatch, sanctions hit, expired date,
            country mismatch, etc.). */}
        <div
          style={{
            margin: '16px 0',
            padding: '16px 20px',
            borderRadius: '12px',
            backgroundColor: `${colors.error}10`,
            border: `1px solid ${colors.error}40`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: colors.error,
              marginBottom: 6,
            }}
          >
            Reason for rejection
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '15px',
              lineHeight: 1.45,
              color: colors.textPrimary,
            }}
          >
            {verification.decisionReason ||
              verification.rejectionReason ||
              'We could not verify your identity. Please try again with a valid document.'}
          </p>
        </div>

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
          {/* Backend's decisionReason carries the exact expiry date
              (e.g. "Document has expired (expiry: 2022-02-28)").
              Prefer it when present; fall back to the static copy. */}
          {verification.decisionReason ||
            verification.rejectionReason ||
            'The document you submitted has expired. Please use a valid, non-expired document.'}
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
  // Same headline-score logic as SuccessResult.
  const score = Math.round(
    verification.scores?.overall ?? (100 - (verification.riskScore ?? 32)),
  );
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

function SimplifiedFailed({
  verification,
  onRetry,
  customMessages,
}: SimplifiedProps & {
  verification?: Verification;
  onRetry: () => void;
}) {
  // Prefer the backend-supplied decisionReason (rich, specific to
  // what actually triggered the rejection — selected-vs-detected doc
  // mismatch, sanctions hit, document expired with date, etc.).
  // Fall back to integrator-supplied customMessages.failedMessage,
  // then to the generic catch-all. Pre-v1.8.3 both customMessages
  // and decisionReason were ignored in favour of the static
  // "we could not verify your identity" copy — surfaced by Luckycat
  // 2026-05-31 running country/doc mismatch tests where every reject
  // was opaque.
  const backendReason =
    verification?.decisionReason || verification?.rejectionReason || '';
  const message =
    customMessages?.failedMessage ||
    backendReason ||
    'We could not verify your identity. Please try again with a valid document.';

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
        <p
          style={{
            ...styles.resultSubtitle,
            fontSize: 16,
            maxWidth: 380,
            margin: '8px auto 0',
            lineHeight: 1.45,
          }}
        >
          {message}
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
