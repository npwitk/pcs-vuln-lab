// Seeded CSS mesh gradients in the peanut brand colours: a base shade with
// four soft radial blobs on top. The seed only changes which brand shades
// are picked and where the blobs sit, so every result stays on-brand. The
// same seed always gives the same result, so a sheet keeps its look across
// Home, the carousel and My Library.

const PEANUT_SHADES = [
  '#AE5C2A', // primary
  '#C9773F',
  '#D4793D', // dark-mode primary
  '#E0A96D',
  '#F2C58A',
  '#8F4A22',
  '#7C3F1D',
];
const DEEP_SHADES = ['#AE5C2A', '#8F4A22', '#7C3F1D', '#C9773F'];

// FNV-1a, then a small xorshift stream for the blob positions.
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRandom(seed) {
  let x = hashString(String(seed)) || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 10000) / 10000;
  };
}

function withAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * @param seed   anything stable (sheet id, exam key)
 * @param opts.alpha  blob opacity; < 1 for a tinted, background-safe wash
 * @param opts.base   base colour under the blobs (defaults to a deep brand shade)
 */
export function meshGradient(seed, { alpha = 1, base } = {}) {
  const rand = makeRandom(seed);
  // Seeded shuffle, then take four shades for the blobs.
  const shades = [...PEANUT_SHADES];
  for (let i = shades.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shades[i], shades[j]] = [shades[j], shades[i]];
  }
  const colors = shades.slice(0, 4);

  const blobs = colors.map((color) => {
    const x = Math.round(rand() * 100);
    const y = Math.round(rand() * 100);
    const reach = 45 + Math.round(rand() * 25);
    const c = alpha < 1 ? withAlpha(color, alpha) : color;
    return `radial-gradient(at ${x}% ${y}%, ${c} 0px, transparent ${reach}%)`;
  });

  // Base is always a deep shade so white text on top stays readable; the
  // lighter shades only appear as highlights in the blobs.
  const fallbackBase = DEEP_SHADES[Math.floor(rand() * DEEP_SHADES.length)];
  return `${blobs.join(', ')}, ${base || fallbackBase}`;
}
