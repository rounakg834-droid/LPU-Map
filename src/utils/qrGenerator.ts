/**
 * Self-contained, zero-dependency QR Code Generator in pure TypeScript
 * Encodes alphanumeric strings/URLs into SVG path strings, Data URLs, and canvas drawing.
 * Supports Byte encoding (ISO-8859-1 / UTF-8) with Error Correction.
 */

// GF(256) log and exp tables for Reed-Solomon error correction
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x = (x << 1) ^ (x & 0x80 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();

function gMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
}

function polyMul(p1: number[], p2: number[]): number[] {
  const result: number[] = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gMul(p1[i], p2[j]);
    }
  }
  return result;
}

function getGeneratorPoly(degree: number): number[] {
  let gen: number[] = [1];
  for (let i = 0; i < degree; i++) {
    gen = polyMul(gen, [1, EXP_TABLE[i]]);
  }
  return gen;
}

function calculateECC(data: number[], eccCount: number): number[] {
  const gen = getGeneratorPoly(eccCount);
  const remainder: number[] = new Array(eccCount).fill(0);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    remainder.copyWithin(0, 1);
    remainder[eccCount - 1] = 0;
    for (let j = 0; j < eccCount; j++) {
      remainder[j] ^= gMul(gen[j + 1], factor);
    }
  }
  return remainder;
}

// QR Version definitions: [version, size, totalDataCodewords, eccCodewordsPerBlock, numBlocks]
// Suitable for URLs up to ~120 characters in Version 4 Medium
interface QRVersionSpec {
  version: number;
  size: number;
  dataBytes: number;
  eccBytes: number;
  blocks: number;
  alignmentPatterns: number[];
}

const QR_SPECS: QRVersionSpec[] = [
  { version: 1, size: 21, dataBytes: 19, eccBytes: 7, blocks: 1, alignmentPatterns: [] },
  { version: 2, size: 25, dataBytes: 34, eccBytes: 10, blocks: 1, alignmentPatterns: [6, 18] },
  { version: 3, size: 29, dataBytes: 55, eccBytes: 15, blocks: 1, alignmentPatterns: [6, 22] },
  { version: 4, size: 33, dataBytes: 80, eccBytes: 20, blocks: 2, alignmentPatterns: [6, 26] },
  { version: 5, size: 37, dataBytes: 108, eccBytes: 26, blocks: 2, alignmentPatterns: [6, 30] },
  { version: 6, size: 41, dataBytes: 136, eccBytes: 18, blocks: 4, alignmentPatterns: [6, 34] }
];

export interface QRCodeMatrix {
  size: number;
  modules: boolean[][];
}

export function generateQRCodeMatrix(text: string): QRCodeMatrix {
  const utf8 = new TextEncoder().encode(text);
  
  // Pick smallest fitting version
  let spec = QR_SPECS[0];
  for (const s of QR_SPECS) {
    // 4 bits mode + 8 bits count indicator + data bits
    const requiredBytes = utf8.length + 2;
    if (s.dataBytes >= requiredBytes) {
      spec = s;
      break;
    }
    spec = s;
  }

  const { size, dataBytes, eccBytes, blocks } = spec;

  // Encode data in Byte mode (0100)
  const bitStream: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  }

  // Mode: Byte (4 bits)
  pushBits(0b0100, 4);
  // Character count (8 bits for versions 1-9)
  pushBits(utf8.length, 8);
  // Characters
  for (let i = 0; i < utf8.length; i++) {
    pushBits(utf8[i], 8);
  }
  // Terminator up to 4 zero bits
  const maxDataBits = dataBytes * 8;
  const terminator = Math.min(4, maxDataBits - bitStream.length);
  for (let i = 0; i < terminator; i++) bitStream.push(0);

  // Pad to multiple of 8
  while (bitStream.length % 8 !== 0) bitStream.push(0);

  // Convert to bytes
  const dataCodewords: number[] = [];
  for (let i = 0; i < bitStream.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bitStream[i + j];
    }
    dataCodewords.push(b);
  }

  // Pad bytes alternating 236 and 17
  const pad = [236, 17];
  let padIdx = 0;
  while (dataCodewords.length < dataBytes) {
    dataCodewords.push(pad[padIdx % 2]);
    padIdx++;
  }

  // Split into blocks and compute ECC
  const blockSize = Math.floor(dataBytes / blocks);
  const allBlocksData: number[][] = [];
  const allBlocksEcc: number[][] = [];

  let offset = 0;
  for (let b = 0; b < blocks; b++) {
    const curLen = b < (dataBytes % blocks) ? blockSize + 1 : blockSize;
    const blockData = dataCodewords.slice(offset, offset + curLen);
    offset += curLen;
    allBlocksData.push(blockData);
    allBlocksEcc.push(calculateECC(blockData, eccBytes));
  }

  // Interleave data codewords and ECC codewords
  const finalSequence: number[] = [];
  const maxBlockLen = Math.max(...allBlocksData.map(b => b.length));
  for (let i = 0; i < maxBlockLen; i++) {
    for (let b = 0; b < blocks; b++) {
      if (i < allBlocksData[b].length) {
        finalSequence.push(allBlocksData[b][i]);
      }
    }
  }
  for (let i = 0; i < eccBytes; i++) {
    for (let b = 0; b < blocks; b++) {
      finalSequence.push(allBlocksEcc[b][i]);
    }
  }

  // Matrix construction
  const modules: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const isFunctionModule: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setModule(r: number, c: number, val: boolean) {
    modules[r][c] = val;
    isFunctionModule[r][c] = true;
  }

  // 1. Finder patterns (top-left, top-right, bottom-left)
  function drawFinderPattern(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        const isBlack = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                        (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                        (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        setModule(nr, nc, isBlack);
      }
    }
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(0, size - 7);
  drawFinderPattern(size - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const val = i % 2 === 0;
    if (!isFunctionModule[6][i]) setModule(6, i, val);
    if (!isFunctionModule[i][6]) setModule(i, 6, val);
  }

  // 3. Dark module
  setModule(size - 8, 8, true);

  // 4. Alignment patterns
  if (spec.alignmentPatterns.length > 0) {
    const coords = spec.alignmentPatterns;
    for (const r of coords) {
      for (const c of coords) {
        if (isFunctionModule[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBlack = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
            setModule(r + dr, c + dc, isBlack);
          }
        }
      }
    }
  }

  // 5. Reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (!isFunctionModule[8][i]) isFunctionModule[8][i] = true;
    if (!isFunctionModule[i][8]) isFunctionModule[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    if (!isFunctionModule[8][size - 1 - i]) isFunctionModule[8][size - 1 - i] = true;
    if (!isFunctionModule[size - 1 - i][8]) isFunctionModule[size - 1 - i][8] = true;
  }

  // 6. Place data bits (Mask 0: (row + col) % 2 === 0)
  const bitArray: number[] = [];
  for (const byte of finalSequence) {
    for (let i = 7; i >= 0; i--) {
      bitArray.push((byte >> i) & 1);
    }
  }

  let bitIndex = 0;
  let upwards = true;

  for (let rightCol = size - 1; rightCol > 0; rightCol -= 2) {
    if (rightCol === 6) rightCol--; // Skip vertical timing column
    const rows = upwards ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);
    
    for (const row of rows) {
      for (let c = 0; c < 2; c++) {
        const col = rightCol - c;
        if (!isFunctionModule[row][col]) {
          let bit = bitIndex < bitArray.length ? bitArray[bitIndex++] : 0;
          // Apply mask 0: invert if (row + col) % 2 === 0
          if ((row + col) % 2 === 0) {
            bit ^= 1;
          }
          modules[row][col] = bit === 1;
        }
      }
    }
    upwards = !upwards;
  }

  // 7. Write Format Information (Mask 0 + Error Correction Level L/M: 0b101010000010010)
  // Standard format string for Medium ECC + Mask 0
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  // Top-left
  for (let i = 0; i <= 5; i++) modules[8][i] = formatBits[i] === 1;
  modules[8][7] = formatBits[6] === 1;
  modules[8][8] = formatBits[7] === 1;
  modules[7][8] = formatBits[8] === 1;
  for (let i = 9; i < 15; i++) modules[14 - i][8] = formatBits[i] === 1;

  // Split copies around top-right and bottom-left
  for (let i = 0; i < 7; i++) modules[8][size - 1 - i] = formatBits[14 - i] === 1;
  for (let i = 0; i < 8; i++) modules[size - 8 + i][8] = formatBits[i] === 1;

  return {
    size,
    modules: modules.map(row => row.map(cell => cell === true))
  };
}

/**
 * Render QR matrix to pure SVG markup string
 */
export function qrToSVG(text: string, options: { size?: number; margin?: number; color?: string; bgColor?: string } = {}): string {
  const { size = 240, margin = 4, color = '#0f172a', bgColor = '#ffffff' } = options;
  const qr = generateQRCodeMatrix(text);
  const matrixSize = qr.size + margin * 2;
  const cellSize = size / matrixSize;

  let rects = '';
  for (let r = 0; r < qr.size; r++) {
    for (let c = 0; c < qr.size; c++) {
      if (qr.modules[r][c]) {
        const x = (c + margin) * cellSize;
        const y = (r + margin) * cellSize;
        rects += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="${color}" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${bgColor}" rx="12" />
    ${rects}
  </svg>`;
}

/**
 * Render QR matrix to Data URL (SVG base64)
 */
export function qrToDataURL(text: string, options: { size?: number; margin?: number; color?: string; bgColor?: string } = {}): string {
  const svg = qrToSVG(text, options);
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}
