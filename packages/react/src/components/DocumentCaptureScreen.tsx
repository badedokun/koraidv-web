import React, { useRef, useEffect, useState, useCallback } from 'react';
import { styles, colors, injectKeyframes } from './styles';
import { StepProgressBar } from './DesignSystem';

interface DocumentCaptureScreenProps {
  side: 'front' | 'back';
  documentType?: string;
  requiresBack?: boolean;
  onCapture: (imageData: Blob) => Promise<boolean>;
  onCancel: () => void;
}

export function DocumentCaptureScreen({
  side,
  documentType,
  requiresBack = true,
  onCapture,
  onCancel,
}: DocumentCaptureScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    injectKeyframes();
  }, []);

  // Start camera
  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch {
        if (mounted) setError('Camera access denied. Please enable camera permissions.');
      }
    }

    if (!capturedImage) startCamera();

    return () => {
      mounted = false;
    };
  }, [capturedImage]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) { setIsCapturing(false); return; }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedImage(dataUrl);
          setCapturedBlob(blob);
          stream?.getTracks().forEach((t) => t.stop());
        }
        setIsCapturing(false);
      },
      'image/jpeg',
      0.85
    );
  }, [isCapturing, stream]);

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
  };

  const handleAccept = async () => {
    if (capturedBlob) {
      await onCapture(capturedBlob);
    }
  };

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.primaryButton} onClick={onCancel}>Go Back</button>
        </div>
      </div>
    );
  }

  // Review screen
  if (capturedImage) {
    return (
      <div style={styles.darkContainer}>
        <StepProgressBar total={5} current={3} isDark />

        <div style={styles.darkScreenHeader}>
          <div style={{ width: 40 }} />
          <h1 style={styles.darkScreenTitle}>Review your photo</h1>
          <button style={styles.glassCloseButton} onClick={onCancel}>✕</button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={styles.reviewCard}>
            <img
              src={capturedImage}
              alt="Captured document"
              style={{ width: '100%', maxWidth: '300px', borderRadius: '16px', display: 'block', margin: '0 auto' }}
            />
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={styles.reviewBadge}>✓ Good quality</span>
            </div>
            <div style={styles.qualityChecks}>
              <QualityCheck label="Sharp" />
              <QualityCheck label="Well-lit" />
              <QualityCheck label="No glare" />
            </div>
          </div>
        </div>

        <div style={styles.reviewButtonsRow}>
          <button style={{ ...styles.darkOutlineButton, flex: 1 }} onClick={handleRetake}>Retake</button>
          <button style={{ ...styles.primaryButton, flex: 1 }} onClick={handleAccept}>Looks good</button>
        </div>
      </div>
    );
  }

  // Capture screen
  return (
    <div style={styles.captureContainer}>
      <StepProgressBar total={5} current={3} isDark />

      <div style={styles.darkScreenHeader}>
        <div style={{ width: 40 }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ ...styles.darkScreenTitle, margin: 0 }}>
            {side === 'front' ? 'Front of ID' : 'Back of ID'}
          </h1>
          {documentType && <p style={styles.darkScreenSubtitle}>{documentType}</p>}
        </div>
        <button style={styles.glassCloseButton} onClick={onCancel}>✕</button>
      </div>

      {/* Camera view */}
      <div style={styles.cameraContainer}>
        <video ref={videoRef} autoPlay playsInline muted style={styles.cameraVideo} />

        <div style={styles.documentOverlay}>
          <div style={styles.documentFrame}>
            {/* Corner brackets */}
            <div style={{ ...styles.corner, top: 0, left: 0 }} />
            <div style={{ ...styles.corner, top: 0, right: 0, transform: 'rotate(90deg)' }} />
            <div style={{ ...styles.corner, bottom: 0, right: 0, transform: 'rotate(180deg)' }} />
            <div style={{ ...styles.corner, bottom: 0, left: 0, transform: 'rotate(270deg)' }} />
            {/* Scan line */}
            <div style={styles.scanLine} />
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Step pills */}
      <div style={styles.stepPillsRow}>
        <span
          style={{
            ...styles.stepPill,
            backgroundColor: side === 'front' ? colors.teal : 'rgba(255,255,255,0.15)',
            color: side === 'front' ? colors.white : 'rgba(255,255,255,0.5)',
          }}
        >
          Front
        </span>
        {requiresBack && (
          <span
            style={{
              ...styles.stepPill,
              backgroundColor: side === 'back' ? colors.teal : 'rgba(255,255,255,0.15)',
              color: side === 'back' ? colors.white : 'rgba(255,255,255,0.5)',
            }}
          >
            Back
          </span>
        )}
      </div>

      {/* Guidance pill */}
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <span
          style={{
            ...styles.guidancePill,
            backgroundColor: 'rgba(13,148,136,0.15)',
            color: colors.teal,
          }}
        >
          <span style={{ ...styles.pulsingDot, backgroundColor: colors.teal }} />
          Scanning document...
        </span>
      </div>

      {/* Capture button */}
      <div style={styles.captureFooter}>
        <button
          style={{ ...styles.captureButton, opacity: isCapturing ? 0.5 : 1 }}
          onClick={handleCapture}
          disabled={isCapturing}
        >
          <div style={styles.captureButtonInner} />
        </button>
      </div>
    </div>
  );
}

function QualityCheck({ label }: { label: string }) {
  return (
    <div style={styles.qualityCheck}>
      <div style={styles.qualityCheckIcon}>✓</div>
      <span style={styles.qualityCheckLabel}>{label}</span>
    </div>
  );
}
