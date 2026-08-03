import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { getBlurScore, isBlurry } from '../src/index.js';

const SIZE = 128;

async function makeCheckerboardPng() {
  const raw = Buffer.alloc(SIZE * SIZE);
  const squares = 16;
  const squareSize = SIZE / squares;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cx = Math.floor(x / squareSize);
      const cy = Math.floor(y / squareSize);
      raw[y * SIZE + x] = (cx + cy) % 2 === 0 ? 255 : 0;
    }
  }
  return sharp(raw, { raw: { width: SIZE, height: SIZE, channels: 1 } }).png().toBuffer();
}

test('sharp image scores higher than its blurred version', async () => {
  const sharpPng = await makeCheckerboardPng();
  const blurryPng = await sharp(sharpPng).blur(20).toBuffer();

  const sharpScore = await getBlurScore(sharpPng);
  const blurryScore = await getBlurScore(blurryPng);

  assert.ok(sharpScore > blurryScore, `expected ${sharpScore} > ${blurryScore}`);
});

test('isBlurry respects the threshold', async () => {
  const sharpPng = await makeCheckerboardPng();
  const blurryPng = await sharp(sharpPng).blur(20).toBuffer();

  assert.equal(await isBlurry(blurryPng, 0.5), true);
  assert.equal(await isBlurry(sharpPng, 0.01), false);
});

test('accepts a file path', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'blur-score-'));
  const filePath = join(dir, 'checker.png');
  try {
    await writeFile(filePath, await makeCheckerboardPng());
    const score = await getBlurScore(filePath);
    assert.ok(score >= 0 && score <= 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('rejects unsupported input types', async () => {
  await assert.rejects(() => getBlurScore(12345), TypeError);
});
