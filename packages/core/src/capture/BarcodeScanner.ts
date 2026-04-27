/**
 * On-device barcode decoder for the back side of identity documents.
 *
 * The KoraIDV pipeline cascades through three decoders in priority order:
 *   1. **This class (browser BarcodeDetector)** — runs on the captured
 *      back-side image before upload. When it succeeds, the decoded
 *      AAMVA payload travels to the server in
 *      `uploadDocument(..., decodedBarcodePayload)` and the server skips
 *      image decoding entirely.
 *   2. **zxing-cpp** (server-side) — primary decoder when the client failed
 *      or the browser lacks BarcodeDetector.
 *   3. **pdf417decoder** (server-side) — fallback for captures zxing-cpp
 *      can't read.
 *
 * Why decode in the browser when the server can do it? Three reasons:
 *   - **Latency**: in-browser decode finishes in ~100-300 ms vs. ~1-3 s
 *     server round-trip + cascade.
 *   - **Cost**: zero ml-service compute on the happy path.
 *   - **Offline-friendly**: in some embedded flows (kiosk, on-prem),
 *     server-side decode is unavailable but the browser can still read
 *     the barcode.
 *
 * Browser support (as of 2026):
 *   - **Native**: Chrome 88+, Edge 88+, Samsung Internet 15+, Opera 74+
 *     on Android. Safari 16.4+ macOS/iOS supports a subset (no PDF417 on
 *     iOS Safari yet — the symbology list is a moving target). When
 *     unsupported, `isSupported()` returns false and the SDK silently
 *     falls back to the server cascade.
 *   - **Polyfill**: applications that need cross-browser support can
 *     install a JS polyfill (e.g. `barcode-detector` from npm) before
 *     the SDK loads; it registers `globalThis.BarcodeDetector` and this
 *     class will pick it up automatically.
 *
 * See `docs/architecture/idv-decode-roadmap.md` Phase 4.
 */

// Minimal type shims for the BarcodeDetector API. Avoids requiring a
// `@types/dom-barcode-detector` dependency. Matches the W3C Shape
// Detection API draft.
type BarcodeFormat =
  | 'pdf417'
  | 'qr_code'
  | 'data_matrix'
  | 'aztec'
  | 'code_128'
  | 'code_39'
  | 'code_93'
  | 'codabar'
  | 'ean_13'
  | 'ean_8'
  | 'itf'
  | 'upc_a'
  | 'upc_e';

interface DetectedBarcode {
  rawValue: string;
  format: BarcodeFormat;
  boundingBox: DOMRectReadOnly;
  cornerPoints: ReadonlyArray<{ x: number; y: number }>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: BarcodeFormat[] }): {
    detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
  };
  getSupportedFormats(): Promise<BarcodeFormat[]>;
}

declare const BarcodeDetector: BarcodeDetectorConstructor | undefined;

export class WebBarcodeScanner {
  private detector: InstanceType<BarcodeDetectorConstructor> | null = null;

  /**
   * Whether the current environment has a usable BarcodeDetector.
   * Either native (modern Chromium / Samsung) or a polyfill.
   */
  static isSupported(): boolean {
    return typeof globalThis !== 'undefined'
      && typeof (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector
        === 'function';
  }

  /**
   * Construct a scanner. Restricts to PDF417 by default to avoid false
   * positives on the small Code128 strip US DLs also carry. Callers
   * onboarding QR-based docs (Nigeria voter's card) should pass
   * `['pdf417', 'qr_code']`.
   */
  constructor(formats: BarcodeFormat[] = ['pdf417']) {
    if (WebBarcodeScanner.isSupported()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Ctor: BarcodeDetectorConstructor = (globalThis as any).BarcodeDetector;
      try {
        this.detector = new Ctor({ formats });
      } catch {
        // Some browsers throw on unsupported format combinations; fall
        // back to no-arg construction.
        this.detector = new Ctor();
      }
    }
  }

  /**
   * Attempt to decode a PDF417 barcode from the supplied image source.
   * Accepts any `ImageBitmapSource`: Blob, HTMLImageElement,
   * HTMLCanvasElement, ImageBitmap, OffscreenCanvas.
   *
   * Returns the raw AAMVA payload as a single string (newline-separated
   * records, exactly the form the server's AAMVA parser expects) or
   * `null` when no barcode was found, decoding failed, or the API is
   * unavailable.
   */
  async decodePdf417(source: ImageBitmapSource): Promise<string | null> {
    if (!this.detector) return null;
    try {
      const results = await this.detector.detect(source);
      for (const r of results) {
        if (r.rawValue && r.rawValue.length > 0) {
          return r.rawValue;
        }
      }
      return null;
    } catch {
      // BarcodeDetector throws on internal errors; we don't escalate —
      // the server cascade picks it up.
      return null;
    }
  }
}
