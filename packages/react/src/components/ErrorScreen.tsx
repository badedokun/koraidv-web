import React from 'react';
import { KoraError } from '@koraidv/core';
import { styles } from './styles';

interface ErrorScreenProps {
  error: KoraError;
  onRetry: () => void;
  onCancel: () => void;
}

export function ErrorScreen({ error, onRetry, onCancel }: ErrorScreenProps) {
  return (
    <div style={styles.container}>
      <div style={styles.resultContent}>
        {/* Error icon */}
        <div style={{ ...styles.resultIcon, backgroundColor: '#FEE2E2' }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#DC2626"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Title */}
        <h1 style={styles.resultTitle}>Something went wrong</h1>

        {/* Error message */}
        <p style={styles.resultSubtitle}>{error.message}</p>

        {/* Recovery suggestion */}
        {error.recoverySuggestion && (
          <p style={styles.recoverySuggestion}>{error.recoverySuggestion}</p>
        )}
      </div>

      {/* Footer */}
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
