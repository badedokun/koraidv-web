import React from 'react';
import { styles } from './styles';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div style={styles.container}>
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>{message}</p>
      </div>
    </div>
  );
}
