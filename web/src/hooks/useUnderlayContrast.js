import { useEffect, useState } from 'react';

// Watches what's scrolling under a translucent (glass) element and reports a
// fallback color when `color` would have too little contrast against it.
// Returns null while contrast is fine, otherwise a shade of `color` itself:
// same hue and saturation, lightness nudged down or up just far enough to
// read, so the logo stays on-brand instead of flipping to black or white.
//
// The browser can't tell us what a backdrop-filter actually rendered, so this
// approximates it: hit-test a few points under the element, composite the
// background colors (and same-origin image pixels) found beneath, saturate
// like the glass does, then lay the glass tint over the top.

const MIN_CONTRAST = 3; // WCAG 1.4.11 minimum for graphics and large text
// Lightness range for the shades, kept off the ends so the result is always
// recognisably the brand colour rather than black or white.
const MIN_LIGHTNESS = 0.14;
const MAX_LIGHTNESS = 0.92;
const LIGHTNESS_STEP = 0.01;
const SAMPLE_POINTS = 5;

const parseColor = (str) => {
  if (!str) return null;
  if (str[0] === '#') {
    let hex = str.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex.slice(0, 6), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const m = str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/);
  if (!m) return null;
  let a = m[4] === undefined ? 1 : parseFloat(m[4]);
  if (m[4] && m[4].endsWith('%')) a /= 100;
  return { r: +m[1], g: +m[2], b: +m[3], a };
};

// Paint `top` over `bottom` (bottom assumed opaque).
const over = (top, bottom) => ({
  r: top.r * top.a + bottom.r * (1 - top.a),
  g: top.g * top.a + bottom.g * (1 - top.a),
  b: top.b * top.a + bottom.b * (1 - top.a),
  a: 1,
});

// CSS saturate(): the standard feColorMatrix saturate matrix.
const saturate = ({ r, g, b }, s) => {
  const clamp = v => Math.max(0, Math.min(255, v));
  return {
    r: clamp((0.213 + 0.787 * s) * r + (0.715 - 0.715 * s) * g + (0.072 - 0.072 * s) * b),
    g: clamp((0.213 - 0.213 * s) * r + (0.715 + 0.285 * s) * g + (0.072 - 0.072 * s) * b),
    b: clamp((0.213 - 0.213 * s) * r + (0.715 - 0.715 * s) * g + (0.072 + 0.928 * s) * b),
    a: 1,
  };
};

const rgbToHsl = ({ r, g, b }) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h / 6, s, l };
};

const hslToRgb = ({ h, s, l }) => {
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255, a: 1 };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return { r: channel(h + 1 / 3) * 255, g: channel(h) * 255, b: channel(h - 1 / 3) * 255, a: 1 };
};

const toHex = ({ r, g, b }) => '#' + [r, g, b]
  .map(v => Math.round(v).toString(16).padStart(2, '0'))
  .join('');

const luminance = ({ r, g, b }) => {
  const lin = v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const contrast = (a, b) => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

// The shade of `fg` nearest its own lightness that reaches MIN_CONTRAST on
// `bg`, searching darker and lighter. If neither direction gets there within
// the lightness range, the end of the range that contrasts best.
const brandShadeFor = (fg, bg) => {
  const hsl = rgbToHsl(fg);
  const candidates = [];
  for (const dir of [-1, 1]) {
    for (let l = hsl.l; l >= MIN_LIGHTNESS && l <= MAX_LIGHTNESS; l += dir * LIGHTNESS_STEP) {
      const shade = hslToRgb({ ...hsl, l });
      if (contrast(shade, bg) >= MIN_CONTRAST) {
        candidates.push({ shade, distance: Math.abs(l - hsl.l) });
        break;
      }
    }
  }
  if (candidates.length) {
    candidates.sort((a, b) => a.distance - b.distance);
    return toHex(candidates[0].shade);
  }
  const ends = [MIN_LIGHTNESS, MAX_LIGHTNESS].map(l => hslToRgb({ ...hsl, l }));
  return toHex(contrast(ends[0], bg) >= contrast(ends[1], bg) ? ends[0] : ends[1]);
};

// Images from origins without CORS taint the canvas; remember them so we
// don't throw on every scroll frame.
const taintedSrcs = new Set();
let sampleCanvas = null;

// Color of the image pixels at client point (x, y), honoring object-fit
// fill/cover/contain with centered object-position. Null if unreadable.
const sampleImage = (img, x, y) => {
  const src = img.currentSrc || img.src;
  if (!img.complete || !img.naturalWidth || taintedSrcs.has(src)) return null;
  const rect = img.getBoundingClientRect();
  const fit = getComputedStyle(img).objectFit;
  let sx = rect.width / img.naturalWidth;
  let sy = rect.height / img.naturalHeight;
  if (fit === 'cover') sx = sy = Math.max(sx, sy);
  else if (fit === 'contain') sx = sy = Math.min(sx, sy);
  const offX = (rect.width - img.naturalWidth * sx) / 2;
  const offY = (rect.height - img.naturalHeight * sy) / 2;
  const ix = (x - rect.left - offX) / sx;
  const iy = (y - rect.top - offY) / sy;
  if (ix < 0 || iy < 0 || ix >= img.naturalWidth || iy >= img.naturalHeight) return null;

  try {
    sampleCanvas = sampleCanvas || document.createElement('canvas');
    sampleCanvas.width = sampleCanvas.height = 1;
    const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, 1, 1);
    // Average a small patch rather than one pixel, so text and noise in
    // the image don't make the result flicker.
    const patch = 8 / sx;
    ctx.drawImage(img, ix - patch / 2, iy - patch / 2, patch, patch, 0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return { r, g, b, a: a / 255 };
  } catch {
    taintedSrcs.add(src);
    return null;
  }
};

// What's visible at (x, y) beneath `exclude`, flattened to one opaque color.
const colorUnder = (x, y, exclude) => {
  const layers = [];
  for (const el of document.elementsFromPoint(x, y)) {
    if (exclude.contains(el)) continue;
    const layer = el.tagName === 'IMG'
      ? sampleImage(el, x, y)
      : parseColor(getComputedStyle(el).backgroundColor);
    if (layer && layer.a > 0) layers.push(layer);
    if (layer && layer.a >= 0.99) break;
  }
  return layers.reduceRight((acc, layer) => over(layer, acc), { r: 255, g: 255, b: 255, a: 1 });
};

export default function useUnderlayContrast(ref, { enabled, color, tint, saturation = 1 }) {
  const [fallback, setFallback] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setFallback(null);
      return undefined;
    }
    const fg = parseColor(color);
    const glass = parseColor(tint);
    const el = ref.current;
    const container = el?.closest('nav') || el;
    if (!fg || !glass || !el) return undefined;

    let frame = null;
    const measure = () => {
      frame = null;
      const rect = el.getBoundingClientRect();
      if (!rect.width) return;
      let worst = null;
      let worstRatio = Infinity;
      for (let i = 0; i < SAMPLE_POINTS; i++) {
        const x = rect.left + (rect.width * (i + 0.5)) / SAMPLE_POINTS;
        const y = rect.top + rect.height / 2;
        const bg = over(glass, saturate(colorUnder(x, y, container), saturation));
        const ratio = contrast(fg, bg);
        if (ratio < worstRatio) {
          worstRatio = ratio;
          worst = bg;
        }
      }
      if (worstRatio >= MIN_CONTRAST) {
        setFallback(null);
        return;
      }
      setFallback(brandShadeFor(fg, worst));
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };

    schedule();
    // Content can change under a still page too (carousels, lazy images).
    const interval = setInterval(schedule, 1000);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('load', schedule, true);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      clearInterval(interval);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('load', schedule, true);
    };
  }, [ref, enabled, color, tint, saturation]);

  return fallback;
}
