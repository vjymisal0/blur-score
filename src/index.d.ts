export interface BlurScoreOptions {
  /**
   * Laplacian variance value that maps to a sharpness score of 0.5.
   * Raise it if sharp images are being scored too high; lower it if
   * blurry images are being scored too high. Default: 60.
   */
  calibration?: number;
}

/**
 * Computes a sharpness score for an image in the range [0, 1].
 * 1 means very sharp, 0 means very blurry.
 */
export function getBlurScore(
  input: string | Buffer | Uint8Array,
  options?: BlurScoreOptions
): Promise<number>;

/**
 * Determines whether an image is blurry relative to a sharpness threshold.
 * An image is considered blurry when its sharpness score is below `threshold`.
 */
export function isBlurry(
  input: string | Buffer | Uint8Array,
  threshold?: number,
  options?: BlurScoreOptions
): Promise<boolean>;
