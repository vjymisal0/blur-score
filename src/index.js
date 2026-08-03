import { loadImageBuffer } from './loadImage.js';
import { computeLaplacianVariance, varianceToScore } from './laplacian.js';

/**
 * Computes a sharpness score for an image in the range [0, 1].
 * 1 means very sharp, 0 means very blurry.
 * @param {string | Buffer | Uint8Array} input - File path, http(s) URL, or image bytes.
 * @param {{ calibration?: number }} [options]
 * @returns {Promise<number>}
 */
export async function getBlurScore(input, options = {}) {
  const buffer = await loadImageBuffer(input);
  const variance = await computeLaplacianVariance(buffer);
  return varianceToScore(variance, options.calibration);
}

/**
 * Determines whether an image is blurry relative to a sharpness threshold.
 * An image is considered blurry when its sharpness score is below `threshold`.
 * @param {string | Buffer | Uint8Array} input - File path, http(s) URL, or image bytes.
 * @param {number} [threshold=0.5] - Sharpness score below which an image counts as blurry (0-1).
 * @param {{ calibration?: number }} [options]
 * @returns {Promise<boolean>}
 */
export async function isBlurry(input, threshold = 0.5, options = {}) {
  const score = await getBlurScore(input, options);
  return score < threshold;
}
