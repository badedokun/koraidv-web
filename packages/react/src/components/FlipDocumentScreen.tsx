import React, { useEffect } from 'react';
import { styles, colors, injectKeyframes } from './styles';
import { StepProgressBar } from './DesignSystem';

interface FlipDocumentScreenProps {
  onContinue: () => void;
  onCancel: () => void;
}

export function FlipDocumentScreen({ onContinue, onCancel }: FlipDocumentScreenProps) {
  useEffect(() => {
    injectKeyframes();
  }, []);

  return (
    <div style={styles.darkContainer}>
      <StepProgressBar total={5} current={3} isDark />

      <div style={styles.darkScreenHeader}>
        <div style={{ width: 40 }} />
        <h1 style={styles.darkScreenTitle}>Flip your document</h1>
        <button style={styles.glassCloseButton} onClick={onCancel}>✕</button>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        gap: '32px',
      }}>
        {/* Flip icon */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: 'rgba(13,148,136,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill={colors.teal} />
            <path d="M16 17.01V10H14V17.01H11L15 21L19 17.01H16Z" fill={colors.teal} />
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: colors.white,
            margin: '0 0 12px 0',
          }}>
            Now capture the back
          </h2>
          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
            lineHeight: 1.6,
            maxWidth: '280px',
          }}>
            Turn your document over to the back side, then tap continue to take a photo.
          </p>
        </div>

        {/* Step pills */}
        <div style={styles.stepPillsRow}>
          <span style={{
            ...styles.stepPill,
            backgroundColor: 'rgba(16,185,129,0.15)',
            color: colors.success,
          }}>
            ✓ Front
          </span>
          <span style={{
            ...styles.stepPill,
            backgroundColor: colors.teal,
            color: colors.white,
          }}>
            Back
          </span>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <button style={styles.primaryButton} onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
