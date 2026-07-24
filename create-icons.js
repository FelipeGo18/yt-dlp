/**
 * Genera íconos válidos para Tauri en src-tauri/icons/
 * El ICO es un archivo binario real de 16x16 con una imagen negra sólida.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.resolve(__dirname, "src-tauri", "icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

/** Genera un PNG mínimo válido (1x1 pixel, color sólido #5b21b6 violeta) */
function makePNG(width = 1, height = 1) {
  // PNG header + IHDR + IDAT (pixel violeta) + IEND
  // Usamos un PNG hardcoded de 1x1 px violeta generado y validado
  // Formato mínimo: PNG signature + IHDR + IDAT + IEND
  const header = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
  ]);
  const ihdr = makePNGChunk("IHDR", Buffer.from([
    0, 0, 0, 1, // width = 1
    0, 0, 0, 1, // height = 1
    8, 2, 0, 0, 0, // 8 bit depth, RGB, no interlace
  ]));
  // Raw scanline: filter byte (0) + R G B = 91 33 182 (violeta)
  const rawPixel = Buffer.from([0, 91, 33, 182]);
  const zlib = deflateSync(rawPixel);
  const idat = makePNGChunk("IDAT", zlib);
  const iend = makePNGChunk("IEND", Buffer.alloc(0));
  return Buffer.concat([header, ihdr, idat, iend]);
}

function makePNGChunk(type, data) {
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length);
  const typeBytes = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBytes, data]);
  const crc = crc32(crcInput);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc >>> 0);
  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

// Minimal deflate for a tiny buffer (zlib wrapper with no compression)
function deflateSync(buf) {
  const len = buf.length;
  const out = Buffer.allocUnsafe(2 + 5 + len + 4);
  out[0] = 0x78; out[1] = 0x01; // zlib header: deflate, default compression
  out[2] = 0x01; // BFINAL=1, BTYPE=00 (no compression)
  out.writeUInt16LE(len, 3);
  out.writeUInt16LE((~len) & 0xffff, 5);
  buf.copy(out, 7);
  const adler = adler32(buf);
  out.writeUInt32BE(adler, 7 + len);
  return out;
}

function adler32(buf) {
  let s1 = 1, s2 = 0;
  for (let i = 0; i < buf.length; i++) {
    s1 = (s1 + buf[i]) % 65521;
    s2 = (s2 + s1) % 65521;
  }
  return (s2 << 16) | s1;
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff);
}

/**
 * Genera un ICO válido de 16x16 pixels (RGB sólido violeta)
 * Formato ICO: ICONDIR + ICONDIRENTRY + BMP DIB
 */
function makeICO() {
  const size = 16;
  const bpp = 24;
  const rowBytes = Math.ceil((size * bpp) / 32) * 4; // padded to 4 bytes
  const pixelDataSize = rowBytes * size;
  const maskRowBytes = Math.ceil(size / 32) * 4;
  const maskSize = maskRowBytes * size;
  const dibSize = 40 + pixelDataSize + maskSize;

  // ICONDIR
  const iconDir = Buffer.from([
    0, 0,       // Reserved
    1, 0,       // Type = 1 (ICO)
    1, 0,       // Count = 1 image
  ]);

  // ICONDIRENTRY
  const entry = Buffer.allocUnsafe(16);
  entry[0] = size;          // width
  entry[1] = size;          // height
  entry[2] = 0;             // color count (0 = more than 256)
  entry[3] = 0;             // reserved
  entry.writeUInt16LE(1, 4);  // planes
  entry.writeUInt16LE(bpp, 6); // bit count
  entry.writeUInt32LE(dibSize, 8); // size of image data
  entry.writeUInt32LE(6 + 16, 12); // offset = ICONDIR(6) + ICONDIRENTRY(16)

  // BITMAPINFOHEADER (DIB)
  const dib = Buffer.allocUnsafe(40 + pixelDataSize + maskSize);
  dib.writeUInt32LE(40, 0);        // biSize
  dib.writeInt32LE(size, 4);       // biWidth
  dib.writeInt32LE(size * 2, 8);   // biHeight (double for ICO)
  dib.writeUInt16LE(1, 12);        // biPlanes
  dib.writeUInt16LE(bpp, 14);      // biBitCount
  dib.writeUInt32LE(0, 16);        // biCompression = BI_RGB
  dib.writeUInt32LE(pixelDataSize, 20); // biSizeImage
  dib.writeInt32LE(0, 24);         // biXPelsPerMeter
  dib.writeInt32LE(0, 28);         // biYPelsPerMeter
  dib.writeUInt32LE(0, 32);        // biClrUsed
  dib.writeUInt32LE(0, 36);        // biClrImportant

  // Pixel data: violeta (#5B21B6) — BMP stores rows bottom-up, BGR order
  const pixel = [0xb6, 0x21, 0x5b]; // BGR
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const offset = 40 + row * rowBytes + col * 3;
      dib[offset] = pixel[0];
      dib[offset + 1] = pixel[1];
      dib[offset + 2] = pixel[2];
    }
  }

  // AND mask (all zeros = fully opaque)
  dib.fill(0, 40 + pixelDataSize);

  return Buffer.concat([iconDir, entry, dib]);
}

// Escribir archivos
const png = makePNG();
const ico = makeICO();

fs.writeFileSync(path.join(iconsDir, "icon.png"), png);
fs.writeFileSync(path.join(iconsDir, "32x32.png"), png);
fs.writeFileSync(path.join(iconsDir, "128x128.png"), png);
fs.writeFileSync(path.join(iconsDir, "128x128@2x.png"), png);
fs.writeFileSync(path.join(iconsDir, "icon.icns"), png); // placeholder para macOS
fs.writeFileSync(path.join(iconsDir, "icon.ico"), ico);

console.log("✅ Íconos válidos generados en src-tauri/icons/");
console.log("   icon.ico:", fs.statSync(path.join(iconsDir, "icon.ico")).size, "bytes");
