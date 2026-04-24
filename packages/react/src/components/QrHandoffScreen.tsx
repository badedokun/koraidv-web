import React, { useEffect, useState, useRef, useCallback } from 'react';
/** Handoff session from the identity service */
interface HandoffSession {
  token: string;
  captureUrl: string;
  expiresAt: string;
  expiresIn: number;
}
import { styles, colors } from './styles';

interface QrHandoffScreenProps {
  /** Handoff session containing the QR token and capture URL */
  session: HandoffSession;
  /** Called when the mobile capture completes */
  onMobileCaptureComplete: () => void;
  /** Called when the user chooses to continue on this device */
  onContinueOnDevice: () => void;
  /** Called when the session expires */
  onExpired: () => void;
  /** Called to refresh the session (generate new QR) */
  onRefresh: () => void;
  /** EventSource for SSE status updates */
  eventSource?: EventSource | null;
}

/**
 * QR Handoff Screen — displays a QR code for the user to scan with their
 * mobile phone to continue the verification capture on a better camera.
 */
export function QrHandoffScreen({
  session,
  onMobileCaptureComplete,
  onContinueOnDevice,
  onExpired,
  onRefresh,
  eventSource,
}: QrHandoffScreenProps) {
  const [timeLeft, setTimeLeft] = useState(session.expiresIn);
  const [scanned, setScanned] = useState(false);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Countdown timer
  useEffect(() => {
    setTimeLeft(session.expiresIn);
    setExpired(false);
    setScanned(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setExpired(true);
          onExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [session.token]);

  // Listen for SSE events
  useEffect(() => {
    if (!eventSource) return;

    const handleStatus = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'document_required' || data.status === 'selfie_required') {
          setScanned(true);
        }
      } catch {}
    };

    const handleComplete = () => {
      clearInterval(timerRef.current);
      onMobileCaptureComplete();
    };

    eventSource.addEventListener('status', handleStatus);
    eventSource.addEventListener('complete', handleComplete);

    return () => {
      eventSource.removeEventListener('status', handleStatus);
      eventSource.removeEventListener('complete', handleComplete);
    };
  }, [eventSource, onMobileCaptureComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Generate QR code as SVG (simple QR using a data URL approach)
  // In production, use a proper QR library. For now, display the URL with instructions.
  const qrSize = 200;

  if (expired) {
    return (
      <div style={qrStyles.container}>
        <div style={qrStyles.content}>
          <div style={qrStyles.expiredIcon}>⏱</div>
          <h2 style={qrStyles.title}>QR Code Expired</h2>
          <p style={qrStyles.subtitle}>
            The QR code has expired. Generate a new one to continue.
          </p>
          <button style={qrStyles.primaryButton} onClick={onRefresh}>
            Generate New QR Code
          </button>
          <button style={qrStyles.secondaryButton} onClick={onContinueOnDevice}>
            Continue on this device instead
          </button>
        </div>
      </div>
    );
  }

  if (scanned) {
    return (
      <div style={qrStyles.container}>
        <div style={qrStyles.content}>
          <div style={qrStyles.spinnerContainer}>
            <div style={qrStyles.spinner} />
          </div>
          <h2 style={qrStyles.title}>Capturing on your phone...</h2>
          <p style={qrStyles.subtitle}>
            Complete the document scan and selfie on your mobile device.
            This page will update automatically when done.
          </p>
          <div style={qrStyles.statusBadge}>
            <span style={qrStyles.statusDot} />
            Connected — waiting for capture
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={qrStyles.container}>
      <div style={qrStyles.content}>
        <h2 style={qrStyles.title}>Scan with your phone</h2>
        <p style={qrStyles.subtitle}>
          Use your phone's camera for a better capture experience.
          Scan the QR code below to continue on your mobile device.
        </p>

        {/* QR Code placeholder — in production, use qrcode.react or similar */}
        <div style={qrStyles.qrContainer}>
          <div style={{
            ...qrStyles.qrBox,
            width: qrSize,
            height: qrSize,
          }}>
            {/* Render QR as an img tag using a QR code API */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(session.captureUrl)}&margin=8`}
              alt="QR Code"
              width={qrSize}
              height={qrSize}
              style={{ borderRadius: 12 }}
            />
          </div>
          <div style={qrStyles.timer}>
            {minutes}:{seconds.toString().padStart(2, '0')} remaining
          </div>
        </div>

        {/* Steps */}
        <div style={qrStyles.steps}>
          <Step number={1} text="Open your phone's camera" />
          <Step number={2} text="Point at the QR code" />
          <Step number={3} text="Complete the capture on your phone" />
        </div>

        {/* Fallback */}
        <div style={qrStyles.divider}>
          <span style={qrStyles.dividerText}>or</span>
        </div>

        <button style={qrStyles.secondaryButton} onClick={onContinueOnDevice}>
          Continue on this device
        </button>
      </div>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div style={qrStyles.step}>
      <div style={qrStyles.stepNumber}>{number}</div>
      <span style={qrStyles.stepText}>{text}</span>
    </div>
  );
}

const qrStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    padding: 24,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  content: {
    textAlign: 'center',
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: '1.5',
    marginBottom: 24,
  },
  qrContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  qrBox: {
    padding: 16,
    background: '#ffffff',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
  },
  timer: {
    fontSize: 13,
    color: '#9ca3af',
    fontVariantNumeric: 'tabular-nums',
  },
  steps: {
    textAlign: 'left' as const,
    marginBottom: 24,
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    background: `${colors.teal}15`,
    color: colors.teal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '16px 0',
    borderTop: '1px solid #e5e7eb',
  },
  dividerText: {
    position: 'relative',
    top: -10,
    background: '#f9fafb',
    padding: '0 12px',
    fontSize: 13,
    color: '#9ca3af',
  },
  primaryButton: {
    width: '100%',
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 600,
    color: '#ffffff',
    background: colors.teal,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    marginBottom: 12,
  },
  secondaryButton: {
    width: '100%',
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 500,
    color: '#6b7280',
    background: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    cursor: 'pointer',
  },
  expiredIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  spinnerContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 16,
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: `3px solid ${colors.teal}30`,
    borderTopColor: colors.teal,
    animation: 'spin 1s linear infinite',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: `${colors.teal}10`,
    borderRadius: 20,
    fontSize: 13,
    color: colors.teal,
    fontWeight: 500,
    marginTop: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    background: colors.teal,
  },
};
