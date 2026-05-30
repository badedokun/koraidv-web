import { useEffect, useRef, useState } from 'react';

/**
 * Advisory document-presence signal. Used by DocumentCaptureScreen to
 * render a "Document detected ✓" / "Fill the frame with your ID" hint
 * during capture. Strictly advisory — does NOT auto-trigger capture
 * (the user still presses the button per the v1.7.x flow shape that
 * the v1.8.0 plan preserves).
 *
 * The browser's `Shape Detection API` (Chromium-only) ships a
 * `BarcodeDetector` (which we already use for back-side PDF417) and
 * a `FaceDetector` (used in useLivenessSignals). There's NO native
 * "DocumentDetector" — Chromium considered shipping one but never
 * landed it. So this hook uses a pragmatic proxy: when the camera
 * frame contains a barcode (back side) we know a document is there;
 * when it contains a face (front of any ID with a portrait) we know
 * a document is likely there. Combined either-or signal is good
 * enough for advisory UX.
 *
 * Future v1.8.x can swap this for a real document-edge detector once
 * the MediaPipe Object Detection model is integrated (would also
 * benefit liveness for landmark gestures).
 */
export interface DocumentSignals {
  /**
   * True when the detector sees something document-like in the frame
   * — either a face (front side of a portrait ID) OR a barcode (back
   * side of a typical DL/passport).
   */
  documentDetected: boolean;
  /**
   * True when an active detector is available. Used by the UI to
   * suppress the advisory overlay entirely on browsers that can't run
   * any detection (Safari/Firefox without polyfills) rather than
   * showing a stuck "no document detected" message.
   */
  detectorActive: boolean;
}

const FRAME_INTERVAL_MS = 300; // ~3Hz — slower than face detector since this is a less time-sensitive signal

export function useDocumentDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  side: 'front' | 'back',
): DocumentSignals {
  const [signals, setSignals] = useState<DocumentSignals>({
    documentDetected: false,
    detectorActive: false,
  });

  const detectorRef = useRef<unknown>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      // Front side: use FaceDetector (every ID has a portrait).
      // Back side: use BarcodeDetector (PDF417 / QR / DataMatrix on
      // every modern driver's license + many national IDs).
      const win = typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : null;
      if (!win) return;

      let DetectorCtor: (new (opts?: object) => unknown) | null = null;
      if (side === 'front' && 'FaceDetector' in win) {
        DetectorCtor = win['FaceDetector'] as new (opts?: object) => unknown;
      } else if (side === 'back' && 'BarcodeDetector' in win) {
        DetectorCtor = win['BarcodeDetector'] as new (opts?: object) => unknown;
      }

      if (!DetectorCtor) {
        // No native detector available — UI suppresses the overlay.
        return;
      }

      try {
        const detector = new DetectorCtor(
          side === 'front'
            ? { fastMode: true, maxDetectedFaces: 1 }
            : { formats: ['pdf417', 'qr_code', 'data_matrix', 'code_128'] },
        );
        if (cancelled) return;
        detectorRef.current = detector;
        setSignals((prev) => ({ ...prev, detectorActive: true }));
      } catch {
        return;
      }

      intervalRef.current = setInterval(async () => {
        const detector = detectorRef.current as { detect: (input: HTMLVideoElement) => Promise<unknown[]> } | null;
        const video = videoRef.current;
        if (!detector || !video || video.readyState < 2) return;
        try {
          const results = await detector.detect(video);
          if (cancelled) return;
          setSignals((prev) => {
            const next = results.length > 0;
            if (prev.documentDetected === next) return prev;
            return { ...prev, documentDetected: next };
          });
        } catch {
          // One-frame failure isn't fatal.
        }
      }, FRAME_INTERVAL_MS);
    }

    setup();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      detectorRef.current = null;
    };
  }, [videoRef, side]);

  return signals;
}
