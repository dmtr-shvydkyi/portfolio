#!/usr/bin/env node

// Run after changing a source video. Generated assets are committed, so builds
// do not depend on FFmpeg being installed on the deployment server.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
mkdirSync(`${publicDir}video`, { recursive: true });

for (const name of ['collage-onboarding-p', 'light-depth', 'bookshelf-video']) {
  const input = `${publicDir}${name}.mp4`;
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', input,
    '-an', '-vf', 'scale=960:-2,fps=30', '-c:v', 'libx264',
    '-crf', '26', '-preset', 'slow', '-threads', '2', '-movflags', '+faststart',
    `${publicDir}video/${name}-mobile.mp4`,
  ], { stdio: 'inherit' });
  // No seek: use the actual first decoded frame, with the video's aspect ratio.
  const firstFrame = execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', input,
    '-frames:v', '1', '-c:v', 'png', '-f', 'image2pipe', 'pipe:1',
  ], { maxBuffer: 32 * 1024 * 1024 });
  await sharp(firstFrame).resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 90 }).toFile(`${publicDir}video/${name}-first-frame.webp`);
  console.log(`Generated first frame and mobile video: ${name}`);
}
