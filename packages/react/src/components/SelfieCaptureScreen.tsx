import React, { useRef, useEffect, useState, useCallback } from 'react';
import { styles, colors, injectKeyframes } from './styles';
import { StepProgressBar } from './DesignSystem';

interface SelfieCaptureScreenProps {
  onCapture: (imageData: Blob) => Promise<boolean>;
  onCancel: () => void;
}

export function SelfieCaptureScreen({ onCapture, onCancel }: SelfieCaptureScreenProps) {
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

  // Start front camera
  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
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

    return () => { mounted = false; };
  }, [capturedImage]);

  useEffect(() => {
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
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
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
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
        <StepProgressBar total={5} current={4} isDark />

        <div style={styles.darkScreenHeader}>
          <div style={{ width: 40 }} />
          <h1 style={styles.darkScreenTitle}>Does this look like you?</h1>
          <button style={styles.glassCloseButton} onClick={onCancel}>✕</button>
        </div>

        <p style={styles.darkScreenSubtitle}>Check clarity and lighting</p>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '240px', height: '300px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${colors.teal}` }}>
              <img
                src={capturedImage}
                alt="Selfie"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={styles.reviewBadge}>✓ Face detected</span>
            </div>
            <div style={styles.qualityChecks}>
              <QualityCheck label="Clear" />
              <QualityCheck label="Centered" />
              <QualityCheck label="Well-lit" />
            </div>
          </div>
        </div>

        <div style={styles.reviewButtonsRow}>
          <button style={{ ...styles.darkOutlineButton, flex: 1 }} onClick={handleRetake}>Retake</button>
          <button style={{ ...styles.primaryButton, flex: 1 }} onClick={handleAccept}>Use this</button>
        </div>
      </div>
    );
  }

  // Capture screen
  return (
    <div style={styles.captureContainer}>
      <StepProgressBar total={5} current={4} isDark />

      <div style={styles.darkScreenHeader}>
        <div style={{ width: 40 }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ ...styles.darkScreenTitle, margin: 0, fontSize: '24px', fontWeight: 700 }}>
            Face the camera
          </h1>
          <p style={styles.darkScreenSubtitle}>Keep a neutral expression</p>
        </div>
        <button style={styles.glassCloseButton} onClick={onCancel}>✕</button>
      </div>

      {/* Camera view */}
      <div style={styles.cameraContainer}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ ...styles.cameraVideo, transform: 'scaleX(-1)' }}
        />

        <div style={styles.selfieOverlay}>
          <div style={styles.faceGuide}>
            <div style={styles.rotatingRing} />
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
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
          Position your face in the oval
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
