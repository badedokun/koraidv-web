import React from 'react';
import { styles } from './styles';

interface ConsentScreenProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentScreen({ onAccept, onDecline }: ConsentScreenProps) {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <h1 style={styles.title}>Identity Verification</h1>
        <p style={styles.subtitle}>We need to verify your identity to continue</p>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* What you'll need */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>What you'll need</h2>
          <div style={styles.checkList}>
            <ChecklistItem icon="📄" text="A valid government-issued ID" />
            <ChecklistItem icon="📷" text="A device with a camera" />
            <ChecklistItem icon="💡" text="Good lighting conditions" />
          </div>
        </section>

        {/* Information collected */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Information we collect</h2>
          <ul style={styles.bulletList}>
            <li style={styles.bulletItem}>Photos of your identity document</li>
            <li style={styles.bulletItem}>A selfie for face matching</li>
            <li style={styles.bulletItem}>Liveness check to confirm you're a real person</li>
          </ul>
        </section>

        {/* Privacy */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Your privacy</h2>
          <p style={styles.bodyText}>
            Your data is encrypted and stored securely. We only use your information for identity
            verification purposes and in accordance with our privacy policy.
          </p>
        </section>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button style={styles.primaryButton} onClick={onAccept}>
          Accept & Continue
        </button>
        <button style={styles.textButton} onClick={onDecline}>
          Decline
        </button>
      </div>
    </div>
  );
}

function ChecklistItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={styles.checklistItem}>
      <span style={styles.checklistIcon}>{icon}</span>
      <span style={styles.checklistText}>{text}</span>
    </div>
  );
}
