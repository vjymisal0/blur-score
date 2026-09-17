# blur-score

## Module format

This package is ESM-only. Use `import` syntax in Node.js projects with `type: module`. CommonJS applications can load it with `await import("blur-score")`.


Detect how blurry an image is. Returns a sharpness score from `0` (very blurry) to `1` (very sharp) using the [variance of Laplacian](https://en.wikipedia.org/wiki/Discrete_Laplace_operator) method.

## Install

```bash
npm install blur-score
```

Requires Node.js >= 18. Uses [`sharp`](https://sharp.pixelplumbing.com/) internally for image decoding.

## Usage

```js
import { getBlurScore, isBlurry } from 'blur-score';

// From a file path
const score = await getBlurScore('photo.jpg'); // e.g. 0.83

// From a Buffer
const score2 = await getBlurScore(fs.readFileSync('photo.jpg'));

// From a URL
const score3 = await getBlurScore('https://example.com/photo.jpg');

// Check against a threshold - true if score is below the threshold
const blurry = await isBlurry('photo.jpg', 0.5);
```

CommonJS is also supported via dynamic import:

```js
const { getBlurScore, isBlurry } = await import('blur-score');
```

## API

### `getBlurScore(input, options?)`

Returns `Promise<number>` - a sharpness score between 0 and 1.

- `input`: a file path (`string`), an `http(s)` URL (`string`), or image bytes (`Buffer` / `Uint8Array`).
- `options.calibration` (default `60`): the Laplacian variance value that maps to a score of `0.5`. Raise it if sharp images score too high for your dataset; lower it if blurry images score too high.

### `isBlurry(input, threshold?, options?)`

Returns `Promise<boolean>` - `true` when the image's sharpness score is **below** `threshold`.

- `threshold` (default `0.5`): the cutoff sharpness score.
- `options`: same as `getBlurScore`.

## How it works

1. The image is converted to greyscale.
2. A Laplacian kernel is convolved over the pixels to highlight edges.
3. The variance of the Laplacian response is computed - sharp images with lots of edges produce high variance, blurry images produce low variance.
4. The variance is mapped to a `0-1` score via `variance / (variance + calibration)`.

Because the raw variance is unbounded and depends heavily on image content (not just blur), the `calibration` constant may need tuning for your specific use case.

## Calibration notes

Real Laplacian variance is much lower than you might expect: a genuinely sharp handheld photo typically lands in the 20-100 range, while a UI screenshot with crisp text can hit 10,000+. The default `calibration: 60` is tuned against real photos (not screenshots) so that:

- Sharp, in-focus photos score roughly 0.5-0.7
- Mild, barely-visible blur drops that to ~0.2-0.3
- Clearly blurred images drop below 0.1

**Known limitation:** this method measures edge/high-frequency content, not "blur" directly. A photo with genuinely low detail - a soft-focus shot, a shallow depth-of-field background, a smooth studio backdrop - can score similarly low even when perfectly sharp, because there just isn't much high-frequency content to measure. If your images are visually distinctive in this way (product shots on plain backgrounds, portraits, macro photography), test against a representative sample and adjust `calibration` or your threshold accordingly rather than trusting the default blindly.

## License

MIT
