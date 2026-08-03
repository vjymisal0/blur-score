import sharp from 'sharp';

// Standard 4-neighbor discrete Laplacian kernel used for edge/focus detection.
const KERNEL_OFFSETS = [
  [0, -1, 1],
  [-1, 0, 1],
  [0, 0, -4],
  [1, 0, 1],
  [0, 1, 1],
];

/**
 * Computes the variance of the Laplacian of an image buffer.
 * Sharp, high-detail images produce large edge responses and high variance;
 * blurry images produce weak, uniform responses and low variance.
 * @param {Buffer} imageBuffer
 * @returns {Promise<number>}
 */
export async function computeLaplacianVariance(imageBuffer) {
  const { data, info } = await sharp(imageBuffer)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  if (width < 3 || height < 3) {
    throw new Error('Image must be at least 3x3 pixels to compute a Laplacian');
  }

  let sum = 0;
  let sumSquares = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let response = 0;
      for (const [dx, dy, weight] of KERNEL_OFFSETS) {
        response += weight * data[(y + dy) * width + (x + dx)];
      }
      sum += response;
      sumSquares += response * response;
      count++;
    }
  }

  const mean = sum / count;
  return sumSquares / count - mean * mean;
}

/**
 * Maps an unbounded Laplacian variance to a 0-1 sharpness score.
 * Higher variance (sharper, more edges) approaches 1; low variance (blurry) approaches 0.
 * `calibration` is the variance value that maps to a score of 0.5 - tune it against
 * representative images if the defaults misclassify your dataset.
 * @param {number} variance
 * @param {number} calibration
 * @returns {number}
 */
export function varianceToScore(variance, calibration = 60) {
  const score = variance / (variance + calibration);
  return Math.min(1, Math.max(0, score));
}
