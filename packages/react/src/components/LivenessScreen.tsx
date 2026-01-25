import React, { useEffect } from 'react';
import { LivenessSession, LivenessChallenge } from '@koraidv/core';
import { styles } from './styles';

interface LivenessScreenProps {
  session: LivenessSession | null;
  currentChallenge: LivenessChallenge | null;
  completedChallenges: number;
  onChallengeComplete: (imageData: Blob) => Promise<boolean>;
  onStart: () => Promise<void>;
  onComplete: () => Promise<any>;
  onCancel: () => void;
}

export function LivenessScreen({
  session,
  currentChallenge,
  completedChallenges,
  onChallengeComplete,
  onStart,
  onComplete,
  onCancel,
}: LivenessScreenProps) {
  // Start liveness session if not already started
  useEffect(() => {
    if (!session) {
      onStart();
    }
  }, [session, onStart]);

  // Complete verification when all challenges are done
  useEffect(() => {
    if (session && !currentChallenge && completedChallenges > 0) {
      onComplete();
    }
  }, [session, currentChallenge, completedChallenges, onComplete]);

  if (!session) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Starting liveness check...</p>
        </div>
      </div>
    );
  }

  const totalChallenges = session.challenges.length;

  return (
    <div style={styles.captureContainer}>
      {/* Header */}
      <div style={styles.captureHeader}>
        <button style={styles.closeButtonLight} onClick={onCancel}>
          ✕
        </button>
        <h1 style={styles.captureTitle}>Liveness Check</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Camera view placeholder */}
      <div style={styles.cameraContainer}>
        <div style={styles.livenessPlaceholder}>
          {/* Challenge icon */}
          <div style={styles.challengeIcon}>{getChallengeIcon(currentChallenge?.type)}</div>
        </div>

        {/* Face guide */}
        <div style={styles.selfieOverlay}>
          <div style={styles.faceGuide} />
        </div>
      </div>

      {/* Challenge instruction */}
      <div style={styles.livenessInstructions}>
        {currentChallenge && (
          <p style={styles.challengeText}>{currentChallenge.instruction}</p>
        )}

        {/* Progress dots */}
        <div style={styles.progressDots}>
          {session.challenges.map((_, index) => (
            <div
              key={index}
              style={{
                ...styles.progressDot,
                backgroundColor:
                  index < completedChallenges
                    ? '#16A34A'
                    : index === completedChallenges
                    ? '#2563EB'
                    : '#E2E8F0',
              }}
            />
          ))}
        </div>

        <p style={styles.progressText}>
          Challenge {completedChallenges + 1} of {totalChallenges}
        </p>
      </div>

      {/* Mock button for demo - in production, challenges would be detected automatically */}
      <div style={styles.captureFooter}>
        <button
          style={styles.primaryButton}
          onClick={async () => {
            // Create a mock blob for the challenge
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            canvas.toBlob(async (blob) => {
              if (blob) {
                await onChallengeComplete(blob);
              }
            });
          }}
        >
          Complete Challenge
        </button>
      </div>
    </div>
  );
}

function getChallengeIcon(type?: string): string {
  switch (type) {
    case 'blink':
      return '👁️';
    case 'smile':
      return '😊';
    case 'turn_left':
      return '⬅️';
    case 'turn_right':
      return '➡️';
    case 'nod_up':
      return '⬆️';
    case 'nod_down':
      return '⬇️';
    default:
      return '😐';
  }
}
