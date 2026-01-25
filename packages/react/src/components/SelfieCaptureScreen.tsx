import React, { useRef, useEffect, useState, useCallback } from 'react';
import { styles } from './styles';

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

  // Start front camera
  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        if (mounted) {
          setError('Camera access denied. Please enable camera permissions.');
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Stop stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    // Set canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror the image (front camera is mirrored)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const success = await onCapture(blob);
          if (!success) {
            setIsCapturing(false);
          }
        } else {
          setIsCapturing(false);
        }
      },
      'image/jpeg',
      0.85
    );
  }, [isCapturing, onCapture]);

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.primaryButton} onClick={onCancel}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.captureContainer}>
      {/* Header */}
      <div style={styles.captureHeader}>
        <button style={styles.closeButtonLight} onClick={onCancel}>
          ✕
        </button>
        <h1 style={styles.captureTitle}>Take a Selfie</h1>
        <div style={{ width: 40 }} />
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

        {/* Face guide overlay */}
        <div style={styles.selfieOverlay}>
          <div style={styles.faceGuide} />
        </div>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Instructions */}
      <div style={styles.captureInstructions}>
        <p style={styles.instructionText}>Position your face in the oval</p>
      </div>

      {/* Capture button */}
      <div style={styles.captureFooter}>
        <button
          style={{
            ...styles.captureButton,
            opacity: isCapturing ? 0.5 : 1,
          }}
          onClick={handleCapture}
          disabled={isCapturing}
        >
          <div style={styles.captureButtonInner} />
        </button>
      </div>
    </div>
  );
}
