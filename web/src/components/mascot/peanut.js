// Geometry for the peanut mascot: the Peanut logo's silhouette (a smaller
// top lobe, a larger bottom lobe, and a smooth pinched waist) in blobatar's
// 0-100 viewBox, plus the seed's own eyes moved onto the top lobe. Drawn by
// PeanutBlobatar; see Mascot.js for when a name becomes a peanut.
import { traits } from 'blobatar';

const r2 = (v) => {
  const s = Math.round(v * 100) / 100;
  return Object.is(s, -0) ? '0' : String(s);
};

const deg = (d) => (d * Math.PI) / 180;

// Share of mascot names drawn as peanuts. Read from a trait key blobatar
// itself never uses, so it is stable per name and independent of every
// other trait (colour, eyes, timing).
const PEANUT_SHARE = 0.25;

export function isPeanut(name) {
  return traits(String(name ?? '')).bool('site.peanut', PEANUT_SHARE);
}

/**
 * The outline, as one closed path, and the top lobe (where the face goes).
 *
 * Two overlapping circles (the lobes, close to the same size as in the logo)
 * bridged on each side by a small fillet circle tangent to both, so the waist
 * is a smooth concave pinch rather than the cusp two unioned circles make.
 * Every piece is a circular arc meeting the next at a shared tangent, so the
 * outline is smooth everywhere by construction.
 *
 * Seeded: lobe sizes, their spacing, how deep the waist pinches, and a
 * slight lean, so a crowd of peanuts doesn't look stamped out. The figure is
 * centred in the frame and stays inside roughly 10-90, like blobatar's own
 * bodies.
 */
export function peanutBody(name) {
  const t = traits(String(name ?? ''));
  const r1 = 20.5 * t.num('peanut.top', 0.95, 1.05);
  const r2b = 22.5 * t.num('peanut.bottom', 0.96, 1.06);
  const d = 34 * t.num('peanut.gap', 0.97, 1.03);
  // Fillet radius: bigger is a gentler, shallower waist.
  const rf = r1 * t.num('peanut.waist', 0.32, 0.5);
  const tilt = t.num('peanut.tilt', -6, 6);

  const cx = 50;
  const height = r1 + d + r2b;
  const y1 = 50 - height / 2 + r1;
  const y2 = y1 + d;

  // Right-hand fillet centre F: at distance r1+rf from the top lobe's centre
  // and r2+rf from the bottom one's (externally tangent to both).
  const fy = (y1 + y2) / 2 + ((r1 + rf) ** 2 - (r2b + rf) ** 2) / (2 * d);
  const fx = Math.sqrt(Math.max(0, (r1 + rf) ** 2 - (fy - y1) ** 2));
  const F = [cx + fx, fy];
  // Tangent points: on each lobe, along the line to the fillet centre.
  const T1 = [cx + fx * (r1 / (r1 + rf)), y1 + (fy - y1) * (r1 / (r1 + rf))];
  const T2 = [cx + fx * (r2b / (r2b + rf)), y2 + (fy - y2) * (r2b / (r2b + rf))];
  const mirror = ([x, y]) => [2 * cx - x, y];

  // Lean the whole figure about the frame centre.
  const cos = Math.cos(deg(tilt));
  const sin = Math.sin(deg(tilt));
  const rot = ([x, y]) => {
    const dx = x - 50;
    const dy = y - 50;
    return [50 + dx * cos - dy * sin, 50 + dx * sin + dy * cos];
  };
  const p = (pt) => {
    const [x, y] = rot(pt);
    return `${r2(x)} ${r2(y)}`;
  };
  const arc = (r, large, sweep, to) => `A${r2(r)} ${r2(r)} 0 ${large} ${sweep} ${p(to)}`;

  const top = [cx, y1 - r1];
  const d_ =
    `M${p(top)}` +
    arc(r1, 0, 1, T1) + // top lobe, clockwise down its right side
    arc(rf, 0, 0, T2) + // waist fillet, curving inward
    arc(r2b, 1, 1, mirror(T2)) + // bottom lobe, the long way round
    arc(rf, 0, 0, mirror(T1)) + // left waist
    arc(r1, 0, 1, top) + // back up the top lobe's left side
    'Z';

  const [hx, hy] = rot([cx, y1]);
  return {
    d: d_,
    // `head` is where the top lobe is drawn; `upright` is its centre before
    // the lean, which is where the eyes are placed before being leaned too.
    head: { cx: hx, cy: hy, r: r1 },
    upright: { cx, cy: y1 },
    waist: fx - rf,
    tilt,
    rotate: rot,
    fillet: F,
  };
}

/**
 * The seed's own eyes (from blobatar's layout, fitted to its face region),
 * scaled and moved onto the peanut's top lobe, then leaned with the body.
 * Keeps each name's eye personality: spacing, size ratio, lean, squareness.
 */
export function fitEyes(layout, body) {
  const { face, eyes } = layout;
  // Scaled so the cluster fills the head about as much as it fills a
  // regular blobatar's face, and nudged up a little, as in the logo mascot.
  const s = (0.92 * body.head.r) / Math.max(face.rx, face.ry);
  const lift = -0.08 * body.head.r;
  return eyes.map((e) => {
    const [x, y] = body.rotate([
      body.upright.cx + (e.cx - face.cx) * s,
      body.upright.cy + (e.cy - face.cy) * s + lift,
    ]);
    return { cx: x, cy: y, rx: e.rx * s, ry: e.ry * s, n: e.n, rot: e.rot + body.tilt };
  });
}

/**
 * Superellipse path, copied from blobatar's src/shape.ts (MIT, (c) 2026
 * Alain), which the package doesn't export. Same output, so peanut eyes are
 * drawn exactly like every other mascot's.
 */
export function superellipse({ cx, cy, rx, ry, n = 4, rot = 0 }) {
  const k = Math.min(1, (8 * Math.pow(2, -1 / n) - 4) / 3);
  const a = rx;
  const b = ry;
  const ak = a * k;
  const bk = b * k;
  const pts = [
    [a, 0],
    [a, bk], [ak, b], [0, b],
    [-ak, b], [-a, bk], [-a, 0],
    [-a, -bk], [-ak, -b], [0, -b],
    [ak, -b], [a, -bk], [a, 0],
  ];
  const t = deg(rot);
  const cos = Math.cos(t);
  const sin = Math.sin(t);
  const at = (i) => {
    const [x, y] = pts[i];
    return `${r2(cx + x * cos - y * sin)} ${r2(cy + x * sin + y * cos)}`;
  };
  let d = `M${at(0)}`;
  for (let i = 1; i < 13; i += 3) d += `C${at(i)} ${at(i + 1)} ${at(i + 2)}`;
  return d + 'Z';
}
