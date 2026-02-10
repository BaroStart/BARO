import fs from 'node:fs';
import zlib from 'node:zlib';

const SVG_PATH = new URL('../public/logo.svg', import.meta.url);

function readUInt32BE(buf, off) {
  return buf.readUInt32BE(off);
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buffer) {
  const sig = buffer.subarray(0, 8);
  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!sig.equals(pngSig)) throw new Error('Not a PNG');

  let off = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idatParts = [];
  let palette = null; // Buffer of RGB triples
  let trns = null; // Buffer of alpha values for palette

  while (off < buffer.length) {
    const length = readUInt32BE(buffer, off);
    off += 4;
    const type = buffer.subarray(off, off + 4).toString('ascii');
    off += 4;
    const data = buffer.subarray(off, off + length);
    off += length;
    off += 4; // CRC

    if (type === 'IHDR') {
      width = readUInt32BE(data, 0);
      height = readUInt32BE(data, 4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idatParts.push(data);
    } else if (type === 'PLTE') {
      palette = Buffer.from(data);
    } else if (type === 'tRNS') {
      trns = Buffer.from(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (interlace !== 0) throw new Error('Interlaced PNG not supported');
  if (bitDepth !== 8) throw new Error(`Bit depth ${bitDepth} not supported`);

  const idat = Buffer.concat(idatParts);
  const raw = zlib.inflateSync(idat);

  // bytes per pixel
  let bpp = 0;
  if (colorType === 6) bpp = 4; // RGBA
  else if (colorType === 2) bpp = 3; // RGB
  else if (colorType === 3) bpp = 1; // indexed
  else throw new Error(`Color type ${colorType} not supported`);

  const stride = width * bpp;
  const out = Buffer.alloc(width * height * 4); // RGBA output

  let inOff = 0;
  let prev = Buffer.alloc(stride);
  let cur = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[inOff++];
    raw.copy(cur, 0, inOff, inOff + stride);
    inOff += stride;

    // unfilter
    switch (filter) {
      case 0: // None
        break;
      case 1: // Sub
        for (let i = 0; i < stride; i++) {
          const left = i >= bpp ? cur[i - bpp] : 0;
          cur[i] = (cur[i] + left) & 0xff;
        }
        break;
      case 2: // Up
        for (let i = 0; i < stride; i++) {
          cur[i] = (cur[i] + prev[i]) & 0xff;
        }
        break;
      case 3: // Average
        for (let i = 0; i < stride; i++) {
          const left = i >= bpp ? cur[i - bpp] : 0;
          const up = prev[i];
          cur[i] = (cur[i] + Math.floor((left + up) / 2)) & 0xff;
        }
        break;
      case 4: // Paeth
        for (let i = 0; i < stride; i++) {
          const left = i >= bpp ? cur[i - bpp] : 0;
          const up = prev[i];
          const upLeft = i >= bpp ? prev[i - bpp] : 0;
          cur[i] = (cur[i] + paethPredictor(left, up, upLeft)) & 0xff;
        }
        break;
      default:
        throw new Error(`Unknown filter ${filter}`);
    }

    // write to RGBA buffer
    for (let x = 0; x < width; x++) {
      const dst = (y * width + x) * 4;
      if (colorType === 6) {
        const src = x * 4;
        out[dst] = cur[src];
        out[dst + 1] = cur[src + 1];
        out[dst + 2] = cur[src + 2];
        out[dst + 3] = cur[src + 3];
      } else if (colorType === 2) {
        const src = x * 3;
        out[dst] = cur[src];
        out[dst + 1] = cur[src + 1];
        out[dst + 2] = cur[src + 2];
        out[dst + 3] = 255;
      } else if (colorType === 3) {
        if (!palette) throw new Error('Indexed PNG missing PLTE');
        const idx = cur[x];
        const palOff = idx * 3;
        out[dst] = palette[palOff] ?? 0;
        out[dst + 1] = palette[palOff + 1] ?? 0;
        out[dst + 2] = palette[palOff + 2] ?? 0;
        out[dst + 3] = trns && idx < trns.length ? trns[idx] : 255;
      }
    }

    // swap
    const tmp = prev;
    prev = cur;
    cur = tmp;
  }

  return { width, height, rgba: out };
}

function rgbToHex(r, g, b) {
  const h = (n) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function main() {
  const svg = fs.readFileSync(SVG_PATH, 'utf8');
  const matches = [...svg.matchAll(/data:image\/png;base64,([A-Za-z0-9+/=]+)/g)];
  if (matches.length === 0) {
    throw new Error('No embedded PNG found in logo.svg');
  }

  const pngBuf = Buffer.from(matches[0][1], 'base64');
  const { width, height, rgba } = decodePng(pngBuf);

  const counts = new Map();
  let total = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    const a = rgba[i + 3];
    if (a < 16) continue; // ignore near-transparent
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    const hex = rgbToHex(r, g, b);
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
    total++;
  }

  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([hex, c]) => {
      const pct = ((c / total) * 100).toFixed(2);
      const hsl = hexToHsl(hex);
      return { hex, count: c, pct, hsl: `${hsl.h} ${hsl.s}% ${hsl.l}%` };
    });

  console.log(`logo embedded PNG: ${width}x${height}`);
  console.log('top colors:');
  for (const t of top) {
    console.log(`${t.hex}  ${t.pct}%  (hsl: ${t.hsl})`);
  }
}

main();

