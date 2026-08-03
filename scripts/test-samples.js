import { readdir } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';
import { getBlurScore } from '../src/index.js';
import { computeLaplacianVariance } from '../src/laplacian.js';

const SAMPLES_DIR = new URL('../samples/', import.meta.url).pathname.replace(/^\/([A-Za-z]):/, '$1:');
const BLUR_LEVELS = [
  { label: 'original', radius: null },
  { label: 'blur-1', radius: 1 },
  { label: 'blur-3', radius: 3 },
  { label: 'blur-8', radius: 8 },
  { label: 'blur-15', radius: 15 },
];

async function main() {
  const files = (await readdir(SAMPLES_DIR)).filter((f) => ['.jpg', '.jpeg', '.png'].includes(extname(f).toLowerCase()));

  const rows = [];
  for (const file of files) {
    const path = join(SAMPLES_DIR, file);
    const originalBuffer = await sharp(path).toBuffer();

    for (const level of BLUR_LEVELS) {
      const buffer = level.radius ? await sharp(originalBuffer).blur(level.radius).toBuffer() : originalBuffer;
      const variance = await computeLaplacianVariance(buffer);
      const score = await getBlurScore(buffer);
      rows.push({ file: basename(file), variant: level.label, variance: Math.round(variance), score: Number(score.toFixed(4)) });
    }
  }

  const width = Math.max(...rows.map((r) => r.file.length)) + 2;
  console.log('file'.padEnd(width) + 'variant'.padEnd(12) + 'variance'.padEnd(12) + 'score');
  console.log('-'.repeat(width + 32));
  for (const row of rows) {
    console.log(row.file.padEnd(width) + row.variant.padEnd(12) + String(row.variance).padEnd(12) + row.score);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
