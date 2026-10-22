// Turns the master photos in /photos into everything the site serves:
//   public/images/<name>-<width>.webp   responsive WebP variants
//   src/data/photos.json                dimensions, variant widths, colour and blur placeholder
//   public/og.jpg                       1200×630 Open Graph card (rendered with headless Chrome)
//   public/apple-touch-icon.png         180×180 icon rendered from public/favicon.svg
//
// Run with `npm run images` whenever a photo is added or replaced.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'photos');
const OUT = path.join(root, 'public/images');
const MANIFEST = path.join(root, 'src/data/photos.json');
// Each master is also published at its native width, so the loupe has every pixel to magnify.
const WIDTHS = [640, 1024, 1600, 2048, 2880];
const QUALITY = 80;

const toHex = ({ r, g, b }) => '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');

async function buildVariants() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|tiff?)$/i.test(f)).sort();
  const manifest = {};

  for (const file of files) {
    const name = path.parse(file).name;
    const input = path.join(SRC, file);
    const meta = await sharp(input).metadata();
    const turned = (meta.orientation ?? 1) >= 5;
    const [width, height] = turned ? [meta.height, meta.width] : [meta.width, meta.height];

    const widths = [...WIDTHS.filter((w) => w < width), width];

    let bytes = 0;
    for (const w of widths) {
      const info = await sharp(input)
        .rotate()
        .resize({ width: w })
        .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
        .toFile(path.join(OUT, `${name}-${w}.webp`));
      bytes += info.size;
    }

    const tiny = await sharp(input).rotate().resize({ width: 24 }).webp({ quality: 50 }).toBuffer();
    const { dominant } = await sharp(input).stats();

    manifest[name] = {
      width,
      height,
      widths,
      color: toHex(dominant),
      placeholder: `data:image/webp;base64,${tiny.toString('base64')}`,
    };
    console.log(`  ${name.padEnd(8)} ${width}×${height} → ${widths.join(', ')}  (${(bytes / 1024).toFixed(0)} KB total)`);
  }

  await mkdir(path.dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

async function buildTouchIcon() {
  const svg = await readFile(path.join(root, 'public/favicon.svg'), 'utf8');
  // The favicon follows the colour scheme; the touch icon is always the light variant on paper.
  await sharp(Buffer.from(svg), { density: 600 })
    .resize(132, 132)
    .extend({ top: 24, bottom: 24, left: 24, right: 24, background: '#f3f0ea' })
    .flatten({ background: '#f3f0ea' })
    .png()
    .toFile(path.join(root, 'public/apple-touch-icon.png'));
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  return candidates.find((c) => c && existsSync(c));
}

async function buildOgImage() {
  const chrome = findChrome();
  if (!chrome) {
    console.warn('  ! Chrome not found (set CHROME_PATH) — skipping og.jpg');
    return;
  }
  const tmp = path.join(os.tmpdir(), `og-${process.pid}.png`);
  const template = pathToFileURL(path.join(root, 'scripts/og.html')).href;
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      '--virtual-time-budget=4000',
      '--allow-file-access-from-files',
      `--screenshot=${tmp}`,
      template,
    ],
    { stdio: 'ignore' },
  );
  await sharp(tmp)
    .resize(1200, 630)
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(root, 'public/og.jpg'));
  await rm(tmp, { force: true });
}

console.log('Photos');
await buildVariants();
console.log('Touch icon');
await buildTouchIcon();
console.log('Open Graph card');
await buildOgImage();
console.log('Done.');
