import React, { useEffect } from 'react';
import { styles, colors, injectKeyframes } from './styles';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  useEffect(() => {
    injectKeyframes();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.loadingContainer}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.teal}, ${colors.tealDark})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            animation: 'kora-pulse 2s ease-in-out infinite',
          }}
        >
          🛡️
        </div>
        <p style={styles.loadingText}>{message}</p>
      </div>
    </div>
  );
}
