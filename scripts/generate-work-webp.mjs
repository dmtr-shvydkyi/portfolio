#!/usr/bin/env node

// Convert static work and case-study media to high-quality WebP.
// The source files stay in public/ so they remain available as fallbacks;
// runtime references use the generated WebP files.
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const publicDir = join(import.meta.dirname, '..', 'public');
const sources = [
  'assistant-min.jpg',
  'bookshelf-ai-min.jpg',
  'mobile-min.jpg',
  'task-master-min.jpg',
  'taxi-app-min.jpg',
  'video-ai-min.jpg',
  'web-pages-min.jpg',
  'case-studies/luminar-collage/section-1.jpg',
  'case-studies/luminar-collage/section-2.jpg',
  'case-studies/luminar-collage/section-3.jpg',
  'case-studies/luminar-collage/section-4.jpg',
  'case-studies/luminar-collage/section-5.jpg',
];

for (const relativeSource of sources) {
  const source = join(publicDir, relativeSource);
  const output = source.replace(/\.jpg$/i, '.webp');
  await mkdir(dirname(output), { recursive: true });
  await sharp(source).webp({ quality: 90, effort: 5 }).toFile(output);
  console.log(`Generated ${output}`);
}
