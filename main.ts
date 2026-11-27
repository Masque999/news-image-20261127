// news-image-20261127: writes this entry's front page to /output/entry.png.
//
// The image sums up the world's news of Friday 27 November 2026: leading
// economies push back on the US plan for new tariffs on 14 trading partners;
// Kim Jong Un vows to build more nuclear weapons; a Houthi rocket strike
// hits a Saudi refinery; a fire engulfs the Bangchak refinery in Bangkok;
// a fuel tanker fire on Cairo's ring road kills at least 31; plus Thanksgiving
// storms disrupting US holiday travel and Iraq jailing eight French IS
// members for life. The image is copied byte for byte, so every run of this
// program writes identical bytes. No network is used.

import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENTRY = 'entry.png';
const MAX_BYTES = 1024 * 1024; // the competition's 1 MiB cap
const EXPECTED_WIDTH = 1024;
const EXPECTED_HEIGHT = 1024;

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const here = dirname(fileURLToPath(import.meta.url));

const srcPath = join(here, ENTRY);
const data = readFileSync(srcPath);

if (data.length === 0) {
  throw new Error(`${ENTRY} is empty`);
}
if (data.length > MAX_BYTES) {
  throw new Error(`${ENTRY} is ${data.length} bytes, over the ${MAX_BYTES} byte cap`);
}

const size = imageSize(data);
if (size.width !== EXPECTED_WIDTH || size.height !== EXPECTED_HEIGHT) {
  throw new Error(`${ENTRY} is ${size.width}x${size.height}, expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}`);
}

mkdirSync(outDir, { recursive: true });
const dstPath = join(outDir, ENTRY);
copyFileSync(srcPath, dstPath);

const written = statSync(dstPath).size;
if (written !== data.length) {
  throw new Error(`copy incomplete: wrote ${written} of ${data.length} bytes`);
}

// A size match alone cannot catch a corrupted copy, so compare content
// hashes as well: the output must be byte-identical to the source.
const srcHash = sha256(data);
const dstHash = sha256(readFileSync(dstPath));
if (srcHash !== dstHash) {
  throw new Error(`copy mismatch: sha256 ${dstHash}, expected ${srcHash}`);
}

console.log(
  `${ENTRY}: ${size.width}x${size.height}, ${data.length} bytes, ` +
    `sha256 ${srcHash.slice(0, 12)}… -> ${dstPath}`,
);

function sha256(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

// Reads width and height from an image's own header: a PNG's IHDR chunk or
// a JPEG's first start-of-frame segment. Anything else is rejected.
function imageSize(buf: Buffer): { width: number; height: number } {
  if (isPng(buf)) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (isJpeg(buf)) {
    return jpegSize(buf);
  }
  throw new Error(`${ENTRY}: unrecognised image format (expected PNG or JPEG)`);
}

function isPng(buf: Buffer): boolean {
  return (
    buf.length >= 24 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  );
}

function isJpeg(buf: Buffer): boolean {
  return buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8;
}

function jpegSize(buf: Buffer): { width: number; height: number } {
  let pos = 2; // past the SOI marker
  while (pos + 9 <= buf.length) {
    if (buf[pos] !== 0xff) {
      throw new Error(`${ENTRY}: bad JPEG marker at offset ${pos}`);
    }
    let marker = buf[pos + 1];
    while (marker === 0xff) {
      pos += 1;
      marker = buf[pos + 1];
    }
    // SOF0-SOF15, except DHT (0xc4), JPG (0xc8) and DAC (0xcc).
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(pos + 5), width: buf.readUInt16BE(pos + 7) };
    }
    if (marker === 0xd9) break; // EOI before any SOF marker
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      pos += 2; // standalone marker, no length field
      continue;
    }
    const segLen = buf.readUInt16BE(pos + 2);
    if (segLen < 2) {
      throw new Error(`${ENTRY}: bad JPEG segment length at offset ${pos}`);
    }
    pos += 2 + segLen;
  }
  throw new Error(`${ENTRY}: no JPEG SOF marker found`);
}
