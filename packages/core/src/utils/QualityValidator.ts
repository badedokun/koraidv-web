/**
 * Quality validation thresholds
 */
export interface QualityThresholds {
  /** Minimum blur score (Laplacian variance) */
  minBlurScore: number;
  /** Minimum brightness (0-1) */
  minBrightness: number;
  /** Maximum brightness (0-1) */
  maxBrightness: number;
  /** Maximum glare percentage */
  maxGlarePercentage: number;
  /** Minimum face size as percentage of frame */
  minFaceSizePercentage: number;
  /** Face detection confidence threshold */
  minFaceConfidence: number;
}

/**
 * Default quality thresholds
 */
export const defaultThresholds: QualityThresholds = {
  minBlurScore: 100,
  minBrightness: 0.3,
  maxBrightness: 0.85,
  maxGlarePercentage: 0.05,
  minFaceSizePercentage: 0.2,
  minFaceConfidence: 0.7,
};

/**
 * Quality validation result
 */
export interface QualityResult {
  isValid: boolean;
  issues: QualityIssue[];
  metrics: QualityMetrics;
}

/**
 * Quality issue
 */
export interface QualityIssue {
  type: QualityIssueType;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Quality issue types
 */
export type QualityIssueType =
  | 'blur'
  | 'too_dark'
  | 'too_bright'
  | 'glare'
  | 'face_not_detected'
  | 'face_too_small'
  | 'face_off_center'
  | 'multiple_faces'
  | 'document_not_detected'
  | 'document_partially_visible';

/**
 * Quality metrics
 */
export interface QualityMetrics {
  blurScore?: number;
  brightness?: number;
  glarePercentage?: number;
  faceSize?: number;
  faceConfidence?: number;
  faceCenterOffset?: { x: number; y: number };
}

/**
 * Quality validator for captured images
 */
export class QualityValidator {
  private thresholds: QualityThresholds;

  constructor(thresholds: Partial<QualityThresholds> = {}) {
    this.thresholds = { ...defaultThresholds, ...thresholds };
  }

  /**
   * Validate document image quality
   */
  async validateDocumentImage(imageData: ImageData): Promise<QualityResult> {
    const issues: QualityIssue[] = [];
    const metrics: QualityMetrics = {};

    // Calculate blur score
    const blurScore = this.calculateBlurScore(imageData);
    metrics.blurScore = blurScore;

    if (blurScore < this.thresholds.minBlurScore) {
      issues.push({
        type: 'blur',
        message: 'Image is too blurry. Hold the device steady.',
        severity: 'error',
      });
    }

    // Calculate brightness
    const brightness = this.calculateBrightness(imageData);
    metrics.brightness = brightness;

    if (brightness < this.thresholds.minBrightness) {
      issues.push({
        type: 'too_dark',
        message: 'Image is too dark. Move to a brighter area.',
        severity: 'error',
      });
    } else if (brightness > this.thresholds.maxBrightness) {
      issues.push({
        type: 'too_bright',
        message: 'Image is too bright. Reduce lighting.',
        severity: 'warning',
      });
    }

    // Calculate glare
    const glarePercentage = this.calculateGlarePercentage(imageData);
    metrics.glarePercentage = glarePercentage;

    if (glarePercentage > this.thresholds.maxGlarePercentage) {
      issues.push({
        type: 'glare',
        message: 'Glare detected. Adjust angle to reduce reflections.',
        severity: 'warning',
      });
    }

    return {
      isValid: !issues.some((issue) => issue.severity === 'error'),
      issues,
      metrics,
    };
  }

  /**
   * Validate selfie image quality
   */
  async validateSelfieImage(
    imageData: ImageData,
    faceDetection?: { confidence: number; boundingBox: DOMRect }
  ): Promise<QualityResult> {
    const issues: QualityIssue[] = [];
    const metrics: QualityMetrics = {};

    // Basic image quality checks
    const blurScore = this.calculateBlurScore(imageData);
    metrics.blurScore = blurScore;

    if (blurScore < this.thresholds.minBlurScore) {
      issues.push({
        type: 'blur',
        message: 'Image is too blurry. Hold the device steady.',
        severity: 'error',
      });
    }

    const brightness = this.calculateBrightness(imageData);
    metrics.brightness = brightness;

    if (brightness < this.thresholds.minBrightness) {
      issues.push({
        type: 'too_dark',
        message: 'Image is too dark. Move to a brighter area.',
        severity: 'error',
      });
    }

    // Face detection checks
    if (!faceDetection) {
      issues.push({
        type: 'face_not_detected',
        message: 'Face not detected. Position your face in the frame.',
        severity: 'error',
      });
    } else {
      metrics.faceConfidence = faceDetection.confidence;

      if (faceDetection.confidence < this.thresholds.minFaceConfidence) {
        issues.push({
          type: 'face_not_detected',
          message: 'Face not clearly visible. Ensure good lighting.',
          severity: 'warning',
        });
      }

      // Check face size
      const frameArea = imageData.width * imageData.height;
      const faceArea = faceDetection.boundingBox.width * faceDetection.boundingBox.height;
      const faceSizePercentage = faceArea / frameArea;
      metrics.faceSize = faceSizePercentage;

      if (faceSizePercentage < this.thresholds.minFaceSizePercentage) {
        issues.push({
          type: 'face_too_small',
          message: 'Face is too small. Move closer to the camera.',
          severity: 'error',
        });
      }

      // Check face position (centered)
      const faceCenterX = faceDetection.boundingBox.x + faceDetection.boundingBox.width / 2;
      const faceCenterY = faceDetection.boundingBox.y + faceDetection.boundingBox.height / 2;
      const frameCenterX = imageData.width / 2;
      const frameCenterY = imageData.height / 2;

      const offsetX = (faceCenterX - frameCenterX) / imageData.width;
      const offsetY = (faceCenterY - frameCenterY) / imageData.height;
      metrics.faceCenterOffset = { x: offsetX, y: offsetY };

      if (Math.abs(offsetX) > 0.2 || Math.abs(offsetY) > 0.2) {
        issues.push({
          type: 'face_off_center',
          message: 'Center your face in the frame.',
          severity: 'warning',
        });
      }
    }

    return {
      isValid: !issues.some((issue) => issue.severity === 'error'),
      issues,
      metrics,
    };
  }

  /**
   * Calculate blur score using Laplacian variance
   */
  private calculateBlurScore(imageData: ImageData): number {
    const { data, width, height } = imageData;

    // Convert to grayscale
    const grayscale = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      grayscale[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }

    // Apply Laplacian kernel
    const laplacian = new Float32Array(width * height);
    const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx);
            const kidx = (ky + 1) * 3 + (kx + 1);
            sum += grayscale[idx] * kernel[kidx];
          }
        }
        laplacian[y * width + x] = sum;
      }
    }

    // Calculate variance
    let mean = 0;
    for (let i = 0; i < laplacian.length; i++) {
      mean += laplacian[i];
    }
    mean /= laplacian.length;

    let variance = 0;
    for (let i = 0; i < laplacian.length; i++) {
      variance += Math.pow(laplacian[i] - mean, 2);
    }
    variance /= laplacian.length;

    return variance;
  }

  /**
   * Calculate average brightness (0-1)
   */
  private calculateBrightness(imageData: ImageData): number {
    const { data } = imageData;
    let totalBrightness = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      // Use perceived brightness formula
      const brightness = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      totalBrightness += brightness;
    }

    return totalBrightness / pixelCount;
  }

  /**
   * Calculate percentage of overexposed pixels (glare)
   */
  private calculateGlarePercentage(imageData: ImageData): number {
    const { data } = imageData;
    let glarePixels = 0;
    const pixelCount = data.length / 4;
    const glareThreshold = 250; // Near white

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > glareThreshold && data[i + 1] > glareThreshold && data[i + 2] > glareThreshold) {
        glarePixels++;
      }
    }

    return glarePixels / pixelCount;
  }
}
