import React, { useEffect, useState } from 'react';
import { LivenessSession, LivenessChallenge } from '@koraidv/core';
import { styles, colors, injectKeyframes } from './styles';
import { StepProgressBar } from './DesignSystem';

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
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    injectKeyframes();
  }, []);

  // Start liveness session
  useEffect(() => {
    if (!session) onStart();
  }, [session, onStart]);

  // Complete when all challenges done
  useEffect(() => {
    if (session && !currentChallenge && completedChallenges > 0) {
      onComplete();
    }
  }, [session, currentChallenge, completedChallenges, onComplete]);

  // Countdown per challenge
  useEffect(() => {
    if (!currentChallenge) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentChallenge?.id]);

  if (!session) {
    return (
      <div style={styles.darkContainer}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={{ ...styles.loadingText, color: 'rgba(255,255,255,0.6)' }}>
            Starting liveness check...
          </p>
        </div>
      </div>
    );
  }

  const totalChallenges = session.challenges.length;

  return (
    <div style={styles.captureContainer}>
      <StepProgressBar total={5} current={5} isDark />

      <div style={styles.darkScreenHeader}>
        <div style={{ width: 40 }} />
        <h1 style={styles.darkScreenTitle}>Liveness Check</h1>
        <button style={styles.glassCloseButton} onClick={onCancel}>✕</button>
      </div>

      {/* Challenge title */}
      {currentChallenge && (
        <div style={{ padding: '16px 0' }}>
          <h2 style={styles.challengeTitle}>{currentChallenge.instruction}</h2>
        </div>
      )}

      {/* Face guide with progress */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          <div style={styles.faceGuide}>
            {/* Progress ring */}
            <svg
              style={{ position: 'absolute', top: '-8px', left: '-8px' }}
              width="256"
              height="316"
              viewBox="0 0 256 316"
            >
              <ellipse
                cx="128"
                cy="158"
                rx="124"
                ry="154"
                fill="none"
                stroke={colors.teal}
                strokeWidth="5"
                strokeDasharray={`${(completedChallenges / totalChallenges) * 880} 880`}
                transform="rotate(-90 128 158)"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Countdown badge */}
          {countdown > 0 && (
            <div style={styles.countdownBadge}>{countdown}</div>
          )}
        </div>
      </div>

      {/* Challenge progress dots */}
      <div style={{ padding: '16px 0' }}>
        <div style={styles.progressDots}>
          {session.challenges.map((_, index) => (
            <div
              key={index}
              style={{
                ...styles.progressDot,
                backgroundColor:
                  index < completedChallenges
                    ? colors.success
                    : index === completedChallenges
                    ? colors.teal
                    : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
        <p style={styles.progressText}>
          Challenge {completedChallenges + 1} of {totalChallenges}
        </p>
      </div>

      {/* Mock challenge complete button */}
      <div style={{ padding: '16px 24px 32px' }}>
        <button
          style={styles.primaryButton}
          onClick={async () => {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            canvas.toBlob(async (blob) => {
              if (blob) await onChallengeComplete(blob);
            });
          }}
        >
          Complete Challenge
        </button>
      </div>
    </div>
  );
}
