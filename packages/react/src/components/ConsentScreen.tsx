import React from 'react';
import { styles, colors } from './styles';
import { StepProgressBar } from './DesignSystem';

interface ConsentScreenProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentScreen({ onAccept, onDecline }: ConsentScreenProps) {
  return (
    <div style={styles.container}>
      {/* Progress bar */}
      <StepProgressBar total={5} current={1} />

      {/* Header */}
      <div style={styles.header}>
        {/* Teal gradient icon */}
        <div style={styles.iconContainer}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${colors.teal}, ${colors.cyan})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              fontSize: '32px',
            }}
          >
            🛡️
          </div>
        </div>
        <h1 style={styles.title}>Verify your identity</h1>
        <p style={styles.subtitle}>We need to confirm your identity to continue</p>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.checkList}>
          <ConsentItem
            icon="🪪"
            bgColor={colors.infoBg}
            title="Government-issued ID"
            description="Photo of your passport or front & back of your ID"
          />
          <ConsentItem
            icon="📸"
            bgColor={colors.successBg}
            title="Selfie photo"
            description="A quick photo to match your face to your document"
          />
          <ConsentItem
            icon="✨"
            bgColor="#F3E8FF"
            title="Liveness check"
            description="Follow simple prompts to confirm you're a real person"
          />
        </div>

        <div style={{ marginTop: '24px' }}>
          <p style={styles.bodyText}>
            Your data is encrypted and stored securely. We only use your information for identity
            verification purposes and in accordance with our{' '}
            <span style={{ color: colors.teal, cursor: 'pointer' }}>privacy policy</span>.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button style={styles.primaryButton} onClick={onAccept}>
          Get started <span style={{ fontSize: '18px' }}>→</span>
        </button>
        <button style={styles.textButton} onClick={onDecline}>
          Decline
        </button>
      </div>
    </div>
  );
}

function ConsentItem({
  icon,
  bgColor,
  title,
  description,
}: {
  icon: string;
  bgColor: string;
  title: string;
  description: string;
}) {
  return (
    <div style={styles.checklistItem}>
      <div style={{ ...styles.checklistIconBox, backgroundColor: bgColor }}>{icon}</div>
      <div style={styles.checklistTextWrapper}>
        <span style={styles.checklistTitle}>{title}</span>
        <span style={styles.checklistDescription}>{description}</span>
      </div>
    </div>
  );
}
