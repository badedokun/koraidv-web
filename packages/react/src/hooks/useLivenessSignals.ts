import { useEffect, useRef, useState } from 'react';

/**
 * Advisory liveness signals derived from the live camera feed during
 * the countdown. Used by LivenessScreen to render "Face detected ✓"
 * style overlays so the user knows the SDK is seeing them in real
 * time. Pre-v1.8.0 the countdown ran blind — no feedback whether the
 * camera was capturing their face or empty space.
 *
 * Detection ladder (best → fallback):
 *
 *   1. **MediaPipe Face Mesh** (planned v1.8.1) — 478 landmarks +
 *      per-gesture detection (smile / blink / turn / nod). Dynamic-
 *      import-only so bundle stays small until the package is added.
 *   2. **Browser `FaceDetector` API** — Chromium-based browsers (Chrome,
 *      Edge, Opera) ship a native face detector that returns bounding
 *      boxes + 6 landmarks. Zero bundle cost; runtime feature
 *      detection. Provides face-presence signal only; landmark count
 *      is too low for blink/smile classification.
 *   3. **No signals** — fallback when neither is available (Safari,
 *      Firefox). LivenessScreen renders the countdown without
 *      advisory overlays, matching pre-v1.8.0 behavior. Liveness
 *      verification still works because the backend evaluates the
 *      captured frame regardless of client-side advisory signals.
 *
 * The countdown timing in LivenessScreen does NOT depend on these
 * signals — they're purely advisory. Capture still fires at the end
 * of the existing 3+3s countdown regardless of what this hook returns.
 */
export interface LivenessSignals {
  /** True when the detector sees one or more faces in the current frame. */
  faceDetected: boolean;
  /**
   * True when an active detector loaded successfully and is processing
   * frames. False if every detection path failed (Safari/Firefox
   * without MediaPipe installed) — UI suppresses the advisory overlay
   * in that case rather than showing a misleading "no face detected"
   * indicator while not actually detecting anything.
   */
  detectorActive: boolean;
}

const FRAME_INTERVAL_MS = 250; // 4 detections per second — plenty for advisory use

export function useLivenessSignals(videoRef: React.RefObject<HTMLVideoElement | null>): LivenessSignals {
  const [signals, setSignals] = useState<LivenessSignals>({
    faceDetected: false,
    detectorActive: false,
  });

  // Keep references to long-lived detection state so the effect doesn't
  // recreate them on every render.
  const detectorRef = useRef<unknown>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setupDetector() {
      // Tier 2: Browser native FaceDetector (Chromium-only, but ~70%
      // of installed browser share). MediaPipe Face Mesh integration
      // is the v1.8.1 enhancement — would slot in as Tier 1 above.
      const NativeFaceDetector =
        typeof window !== 'undefined' && 'FaceDetector' in window
          ? (window as unknown as { FaceDetector: new (opts?: object) => unknown }).FaceDetector
          : null;

      if (!NativeFaceDetector) {
        // No detector available; signals stay at defaults and
        // LivenessScreen suppresses the advisory overlay.
        return;
      }

      try {
        const detector = new NativeFaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        if (cancelled) return;
        detectorRef.current = detector;
        setSignals((prev) => ({ ...prev, detectorActive: true }));
      } catch {
        // Constructor can throw on Brave (privacy block) and some
        // sandboxed contexts. Fall through to no-signal state.
        return;
      }

      // Per-frame detection loop. Throttled to FRAME_INTERVAL_MS so we
      // don't pin the JS thread or burn CPU — advisory overlays only
      // need ~4Hz to feel responsive.
      intervalRef.current = setInterval(async () => {
        const detector = detectorRef.current as { detect: (input: HTMLVideoElement) => Promise<unknown[]> } | null;
        const video = videoRef.current;
        if (!detector || !video || video.readyState < 2) return;
        try {
          const faces = await detector.detect(video);
          if (cancelled) return;
          setSignals((prev) => {
            const next = faces.length > 0;
            if (prev.faceDetected === next) return prev;
            return { ...prev, faceDetected: next };
          });
        } catch {
          // Single-frame detection failure isn't fatal — loop continues.
        }
      }, FRAME_INTERVAL_MS);
    }

    setupDetector();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      detectorRef.current = null;
    };
  }, [videoRef]);

  return signals;
}
