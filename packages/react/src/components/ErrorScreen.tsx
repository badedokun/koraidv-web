import React from 'react';
import { KoraError } from '@koraidv/core';
import { styles, colors } from './styles';

interface ErrorScreenProps {
  error: KoraError;
  onRetry: () => void;
  onCancel: () => void;
}

export function ErrorScreen({ error, onRetry, onCancel }: ErrorScreenProps) {
  return (
    <div style={styles.resultContainer}>
      <div style={styles.resultContent}>
        {/* Error icon */}
        <div
          style={{
            ...styles.resultIconOuterRing,
            backgroundColor: colors.errorBg,
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
            !
          </div>
        </div>

        <h1 style={styles.resultTitle}>Something went wrong</h1>
        <p style={styles.resultSubtitle}>{error.message}</p>

        {error.recoverySuggestion && (
          <p style={{ ...styles.bodyText, marginTop: '12px' }}>{error.recoverySuggestion}</p>
        )}
      </div>

      <div style={styles.footer}>
        {error.isRetryable && (
          <button style={styles.primaryButton} onClick={onRetry}>
            Try Again
          </button>
        )}
        <button style={styles.textButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
