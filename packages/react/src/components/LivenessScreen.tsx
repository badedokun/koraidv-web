import React, { useEffect, useRef, useState, useCallback } from 'react';
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

/**
 * Web liveness screen with a real front-facing camera.
 *
 * Before v1.7.7 this was a stub: a static oval guide + a "Complete
 * Challenge" button that submitted a blank 100×100 white canvas. The
 * camera was never wired up — Web shipped without a real liveness
 * implementation while iOS + Android had full liveness from day one.
 * Found and called out by Luckycat's first end-to-end integration on
 * 2026-05-29.
 *
 * This implementation pairs a real `getUserMedia` camera feed with the
 * server's existing liveness pipeline (ml-service detects whether the
 * submitted frame shows the requested gesture). Per-challenge flow:
 *
 *   1. Render the front camera in the oval guide (object-fit cover,
 *      circular clip — same visual shape as the previous stub).
 *   2. Show the challenge instruction (Smile / Turn left / Blink / ...).
 *   3. Run a 3-second countdown so the user has time to perform the
 *      gesture.
 *   4. When the countdown hits zero, capture a frame from the video
 *      and post it to /verifications/{id}/liveness/challenge with the
 *      challenge type. The hook's submitChallenge advances state on
 *      pass; on fail the same challenge stays current and the
 *      countdown re-arms for retry.
 *
 * Client-side gesture detection (MediaPipe Face Mesh + auto-capture
 * when the gesture is satisfied) is the planned follow-up — that would
 * close the UX gap with iOS, where the user doesn't have to time
 * themselves against a countdown. Today's ship is "real camera, real
 * frames, server decides," which is the parity floor.
 */
export function LivenessScreen({
  session,
  currentChallenge,
  completedChallenges,
  onChallengeComplete,
  onStart,
  onComplete,
  onCancel,
}: LivenessScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  // Two-phase per challenge:
  //   'preparing' — show the instruction, user reads + positions, soft
  //                 countdown. No capture.
  //   'capturing' — flip the prompt to action mode, user performs the
  //                 gesture, capture frame at countdown 0.
  // 3 + 3 = 6 seconds per challenge. v1.7.7's single 3s countdown was
  // too tight to read + position + perform; user reported "barely able
  // to place the head in the oval circle before the shot was taken."
  const [phase, setPhase] = useState<'preparing' | 'capturing'>('preparing');
  const [countdown, setCountdown] = useState(3);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    injectKeyframes();
  }, []);

  // Start the liveness session once on mount.
  useEffect(() => {
    if (!session) onStart();
  }, [session, onStart]);

  // Acquire the camera. Front-facing for liveness. 720×720 is enough for
  // ml-service's face/gesture detectors and keeps upload payload small.
  useEffect(() => {
    let mounted = true;
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 720 },
            height: { ideal: 720 },
          },
        });
        if (!mounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch {
        if (mounted) {
          setCameraError(
            'Camera access denied. Please enable camera permissions and try again.',
          );
        }
      }
    }
    startCamera();
    return () => {
      mounted = false;
    };
  }, []);

  // Tear down the camera on unmount.
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  // Reset to the 'preparing' phase + fresh countdown each time the
  // current challenge changes (next challenge OR retry of the same one).
  useEffect(() => {
    if (!currentChallenge) return;
    setPhase('preparing');
    setCountdown(3);
  }, [currentChallenge?.id]);

  const captureFrame = useCallback(async () => {
    if (
      !currentChallenge ||
      !videoRef.current ||
      !canvasRef.current ||
      capturing
    ) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

    setCapturing(true);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (blob) {
          await onChallengeComplete(blob);
        }
        setCapturing(false);
      },
      'image/jpeg',
      0.85,
    );
  }, [currentChallenge, capturing, onChallengeComplete]);

  // Countdown tick — every second. On zero, advance the phase:
  //   'preparing' → 'capturing' (flip the overlay to action mode, reset
  //                 countdown for the gesture window)
  //   'capturing' → capture the frame and submit
  useEffect(() => {
    if (!currentChallenge || capturing) return;
    if (countdown === 0) {
      if (phase === 'preparing') {
        setPhase('capturing');
        setCountdown(3);
      } else {
        captureFrame();
      }
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, currentChallenge?.id, capturing, captureFrame, phase]);

  // Advance to processing/complete once every challenge has been passed.
  // The hook's submitChallenge already flips state.step to 'processing'
  // when the last challenge resolves; this useEffect is a defensive
  // backstop for any path that ends up here with no remaining challenges.
  useEffect(() => {
    if (session && !currentChallenge && completedChallenges > 0) {
      onComplete();
    }
  }, [session, currentChallenge, completedChallenges, onComplete]);

  if (cameraError) {
    return (
      <div style={styles.darkContainer}>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{cameraError}</p>
          <button style={styles.primaryButton} onClick={onCancel}>
            Go back
          </button>
        </div>
      </div>
    );
  }

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
        <button style={styles.glassCloseButton} onClick={onCancel}>
          ✕
        </button>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '16px 0',
        }}
      >
        {/* Camera oval — live feed clipped to the guide, mirrored. */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '240px',
              height: '300px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#000',
              border: '3px solid rgba(255,255,255,0.2)',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
              }}
            />
          </div>

          {/* Progress ring around the oval — fills as challenges complete. */}
          <svg
            style={{
              position: 'absolute',
              top: '-8px',
              left: '-8px',
              pointerEvents: 'none',
            }}
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
              stroke={phase === 'capturing' ? colors.teal : 'rgba(13,148,136,0.4)'}
              strokeWidth="5"
              strokeDasharray={`${(completedChallenges / totalChallenges) * 880} 880`}
              transform="rotate(-90 128 158)"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Persistent challenge prompt, sized so it can't be squeezed off
            small viewports. v1.7.7 put this above the camera section as
            its own row — on a small Luckycat-style modal embed the
            flex:1 camera ate the vertical budget and the title pushed
            out of view ("just the oval circle and an auto snap"). It now
            lives next to the camera inside the same flex container with
            an explicit gap and a guaranteed minimum height. */}
        {currentChallenge && (
          <div
            style={{
              textAlign: 'center',
              padding: '20px 24px',
              borderRadius: '16px',
              backgroundColor:
                phase === 'capturing'
                  ? 'rgba(13,148,136,0.18)'
                  : 'rgba(255,255,255,0.06)',
              border:
                phase === 'capturing'
                  ? `1px solid ${colors.teal}`
                  : '1px solid rgba(255,255,255,0.08)',
              minWidth: '260px',
              transition: 'background-color 200ms, border-color 200ms',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color:
                  phase === 'capturing'
                    ? colors.teal
                    : 'rgba(255,255,255,0.5)',
              }}
            >
              {capturing
                ? 'Checking...'
                : phase === 'preparing'
                ? 'Get ready'
                : 'Now — hold the pose'}
            </p>
            <h2
              style={{
                ...styles.challengeTitle,
                margin: '8px 0 0',
                fontSize: '26px',
              }}
            >
              {currentChallenge.instruction}
            </h2>
            {!capturing && (
              <p
                style={{
                  margin: '12px 0 0',
                  fontSize: '32px',
                  fontWeight: 700,
                  color:
                    phase === 'capturing'
                      ? colors.teal
                      : 'rgba(255,255,255,0.75)',
                  lineHeight: 1,
                }}
              >
                {countdown}
              </p>
            )}
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Per-challenge progress dots. */}
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
          Challenge {Math.min(completedChallenges + 1, totalChallenges)} of{' '}
          {totalChallenges}
        </p>
      </div>

      {/* Footer guidance — keeps the user oriented across both phases. */}
      <div style={{ padding: '0 24px 24px', textAlign: 'center' }}>
        <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '13px',
            margin: 0,
          }}
        >
          {phase === 'preparing'
            ? 'Position your face inside the oval. Get ready for the next prompt.'
            : 'Hold the pose until the capture completes.'}
        </p>
      </div>
    </div>
  );
}
