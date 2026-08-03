// Real file-format/dimension detection from raw bytes — never trusts a
// browser-supplied MIME type or filename extension, both fully attacker-
// controlled. No dependency, matching the rest of this project's posture
// on small, well-understood parsing (HMAC signing, CSV export, the PayPal
// REST client are all hand-rolled too). Supports exactly PNG and JPEG, the
// two formats this feature accepts — WebP/others are rejected outright.

export type SniffedImage = {
  format: "png" | "jpeg";
  width: number;
  height: number;
};

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION_PX = 8000;
const MIN_DIMENSION_PX = 1;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const IHDR = [0x49, 0x48, 0x44, 0x52]; // "IHDR" ASCII

function matchesSignature(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

function readUint16BE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] * 256 + bytes[offset + 1];
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] * 16777216 + bytes[offset + 1] * 65536 + bytes[offset + 2] * 256 + bytes[offset + 3]
  );
}

function isValidDimension(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_DIMENSION_PX && value <= MAX_DIMENSION_PX;
}

// PNG layout: 8-byte signature, then chunks. The first chunk after the
// signature must be IHDR (13 bytes: width u32, height u32, then bit
// depth/color type/etc, all big-endian) — this is mandated by the PNG
// spec, not a convention, so its absence is itself a strong signal the
// file isn't really a PNG.
function sniffPng(bytes: Uint8Array): SniffedImage | null {
  if (!matchesSignature(bytes, PNG_SIGNATURE)) return null;
  if (bytes.length < 8 + 4 + 4 + 8) return null; // signature + length + "IHDR" + width/height
  if (!matchesSignature(bytes, IHDR, 12)) return null;

  const width = readUint32BE(bytes, 16);
  const height = readUint32BE(bytes, 20);
  if (!isValidDimension(width) || !isValidDimension(height)) return null;

  return { format: "png", width, height };
}

// JPEG layout: SOI (FFD8) followed by a sequence of marker segments. Each
// segment is FF <marker byte> <2-byte length, big-endian, includes itself>
// <payload>, except the handful of markers with no payload (SOI/EOI/RST*).
// Width/height live in the SOF0-SOF15 segment (excluding FFC4/FFC8/FFCC,
// which reuse that range for other purposes): 1 byte precision, then
// height (u16 BE), then width (u16 BE). Walk segments until an SOF marker
// is found or the buffer runs out.
function sniffJpeg(bytes: Uint8Array): SniffedImage | null {
  if (!matchesSignature(bytes, JPEG_SIGNATURE)) return null;

  let pos = 2;
  while (pos + 1 < bytes.length) {
    if (bytes[pos] !== 0xff) return null; // not a marker where one was expected — malformed

    // 0xFF fill bytes between markers are legal — skip them.
    if (bytes[pos + 1] === 0xff) {
      pos += 1;
      continue;
    }

    const marker = bytes[pos + 1];

    // Markers with no length field: SOI (D8), EOI (D9), RST0-RST7 (D0-D7),
    // TEM (01). None of these carry frame dimensions.
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      pos += 2;
      continue;
    }

    if (pos + 3 >= bytes.length) return null;
    const segmentLength = readUint16BE(bytes, pos + 2);
    if (segmentLength < 2) return null; // length field includes itself; can't be smaller

    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

    if (isSof) {
      const heightOffset = pos + 2 + 2 + 1; // marker + length field + precision byte
      if (heightOffset + 4 > bytes.length) return null;
      const height = readUint16BE(bytes, heightOffset);
      const width = readUint16BE(bytes, heightOffset + 2);
      if (!isValidDimension(width) || !isValidDimension(height)) return null;
      return { format: "jpeg", width, height };
    }

    pos += 2 + segmentLength;
  }

  return null;
}

// Entry point: format + real dimensions from bytes, or null if the file is
// too large, too small/large in either dimension, or doesn't match a known
// signature — the caller treats null as an outright rejection, never a
// soft warning.
export function sniffImage(bytes: Uint8Array): SniffedImage | null {
  if (bytes.length === 0 || bytes.length > MAX_UPLOAD_BYTES) return null;
  return sniffPng(bytes) ?? sniffJpeg(bytes);
}
