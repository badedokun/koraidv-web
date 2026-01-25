import React from 'react';
import { Verification } from '@koraidv/core';
import { styles } from './styles';

interface ResultScreenProps {
  verification: Verification;
  onDone: () => void;
}

export function ResultScreen({ verification, onDone }: ResultScreenProps) {
  const { status } = verification;

  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isReview = status === 'review_required';

  return (
    <div style={styles.container}>
      <div style={styles.resultContent}>
        {/* Result icon */}
        <div
          style={{
            ...styles.resultIcon,
            backgroundColor: isApproved
              ? '#DCFCE7'
              : isRejected
              ? '#FEE2E2'
              : '#FEF3C7',
          }}
        >
          {isApproved && (
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
          {isRejected && (
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#DC2626"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          {isReview && (
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h1 style={styles.resultTitle}>
          {isApproved && 'Verification Successful'}
          {isRejected && 'Verification Failed'}
          {isReview && 'Review Required'}
          {!isApproved && !isRejected && !isReview && 'Processing'}
        </h1>

        {/* Subtitle */}
        <p style={styles.resultSubtitle}>
          {isApproved && 'Your identity has been successfully verified.'}
          {isRejected &&
            "We couldn't verify your identity. Please try again or contact support."}
          {isReview &&
            "Your verification requires manual review. We'll notify you of the result."}
          {!isApproved &&
            !isRejected &&
            !isReview &&
            'Your verification is being processed.'}
        </p>

        {/* Verified info card */}
        {isApproved && verification.documentVerification && (
          <div style={styles.infoCard}>
            <div style={styles.infoCardHeader}>
              <span style={styles.infoCardIcon}>🪪</span>
              <span style={styles.infoCardTitle}>Verified Information</span>
            </div>
            <div style={styles.infoCardBody}>
              {verification.documentVerification.firstName &&
                verification.documentVerification.lastName && (
                  <InfoRow
                    label="Name"
                    value={`${verification.documentVerification.firstName} ${verification.documentVerification.lastName}`}
                  />
                )}
              {verification.documentVerification.dateOfBirth && (
                <InfoRow
                  label="Date of Birth"
                  value={verification.documentVerification.dateOfBirth}
                />
              )}
              {verification.documentVerification.documentNumber && (
                <InfoRow
                  label="Document"
                  value={maskDocumentNumber(
                    verification.documentVerification.documentNumber
                  )}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button style={styles.primaryButton} onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

function maskDocumentNumber(number: string): string {
  if (number.length <= 4) return '****';
  const suffix = number.slice(-4);
  const masked = '*'.repeat(number.length - 4);
  return masked + suffix;
}
