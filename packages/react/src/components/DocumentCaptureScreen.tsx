import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DocumentQualityResponse } from '@koraidv/core';
import { styles, colors, injectKeyframes } from './styles';
import { StepProgressBar } from './DesignSystem';

const qualityIssueMessages: Record<string, string> = {
  face_blurred: 'Photo on document is blurry. Retake in better lighting.',
  low_resolution: 'Image quality too low. Move closer to document.',
  multiple_faces: 'Multiple faces detected. Only document should be in frame.',
  no_face_detected: 'No photo detected on document. Ensure front is visible.',
  low_image_clarity: 'Image not clear enough. Hold steady with good lighting.',
  insufficient_text: 'Document not fully in frame. Ensure it\'s well-lit.',
  low_ocr_confidence: 'Text hard to read. Try better lighting.',
  face_not_frontal: 'Document appears tilted. Place on flat surface.',
};

interface DocumentCaptureScreenProps {
  side: 'front' | 'back';
  documentType?: string;
  requiresBack?: boolean;
  onQualityCheck?: (imageData: Blob) => Promise<DocumentQualityResponse>;
  onCapture: (imageData: Blob) => Promise<boolean>;
  onCancel: () => void;
}

export function DocumentCaptureScreen({
  side,
  documentType,
  requiresBack = true,
  onQualityCheck,
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
  const [qualityResult, setQualityResult] = useState<DocumentQualityResponse | null>(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [retakeCount, setRetakeCount] = useState(0);

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
    setQualityResult(null);
    setRetakeCount((c) => c + 1);
  };

  const handleAccept = async () => {
    if (!capturedBlob) return;

    // If quality check is available and not yet run, run it first
    if (onQualityCheck && !qualityResult) {
      setIsCheckingQuality(true);
      try {
        const result = await onQualityCheck(capturedBlob);
        setQualityResult(result);
        setIsCheckingQuality(false);

        // Auto-proceed if quality is good
        if (result.qualityScore >= 60) {
          await onCapture(capturedBlob);
        }
        // If quality is bad, the UI will show warnings — user decides
      } catch {
        setIsCheckingQuality(false);
        // If quality check fails, proceed anyway
        await onCapture(capturedBlob);
      }
      return;
    }

    await onCapture(capturedBlob);
  };

  const handleContinueAnyway = async () => {
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
    const qualityPassed = qualityResult && qualityResult.qualityScore >= 60;
    const qualityFailed = qualityResult && qualityResult.qualityScore < 60;
    const canContinueAnyway = qualityFailed && retakeCount >= 2;

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

            {isCheckingQuality && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <span style={{ ...styles.reviewBadge, backgroundColor: 'rgba(255,255,255,0.1)' }}>Checking quality...</span>
              </div>
            )}

            {qualityPassed && (
              <>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <span style={styles.reviewBadge}>✓ Quality score: {Math.round(qualityResult.qualityScore)}%</span>
                </div>
                <div style={styles.qualityChecks}>
                  <QualityCheck label="Sharp" />
                  <QualityCheck label="Well-lit" />
                  <QualityCheck label="Readable" />
                </div>
              </>
            )}

            {qualityFailed && (
              <>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <span style={{ ...styles.reviewBadge, backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                    ⚠ Quality score: {Math.round(qualityResult.qualityScore)}%
                  </span>
                </div>
                <div style={{ padding: '12px 0' }}>
                  {qualityResult.qualityIssues.map((issue: string, i: number) => (
                    <p key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '4px 0', textAlign: 'center' }}>
                      {qualityIssueMessages[issue] || issue}
                    </p>
                  ))}
                </div>
              </>
            )}

            {!qualityResult && !isCheckingQuality && (
              <>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <span style={styles.reviewBadge}>✓ Good quality</span>
                </div>
                <div style={styles.qualityChecks}>
                  <QualityCheck label="Sharp" />
                  <QualityCheck label="Well-lit" />
                  <QualityCheck label="No glare" />
                </div>
              </>
            )}
          </div>
        </div>

        <div style={styles.reviewButtonsRow}>
          {qualityFailed ? (
            <>
              <button style={{ ...styles.darkOutlineButton, flex: 1 }} onClick={handleRetake}>Retake</button>
              {canContinueAnyway && (
                <button style={{ ...styles.primaryButton, flex: 1 }} onClick={handleContinueAnyway}>Continue anyway</button>
              )}
            </>
          ) : (
            <>
              <button style={{ ...styles.darkOutlineButton, flex: 1 }} onClick={handleRetake}>Retake</button>
              <button
                style={{ ...styles.primaryButton, flex: 1, opacity: isCheckingQuality ? 0.5 : 1 }}
                onClick={handleAccept}
                disabled={isCheckingQuality}
              >
                Looks good
              </button>
            </>
          )}
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
