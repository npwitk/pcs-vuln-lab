import React, { useMemo } from 'react';
import { _layout, _parts } from 'blobatar/internal';
import { peanutBody, fitEyes, superellipse } from './peanut';

const r2 = (v) => Math.round(v * 100) / 100;

/**
 * A blobatar with the Peanut logo's silhouette.
 *
 * blobatar's ten shapes are a private, frozen table, so this is a small
 * adapter in the mould of the package's own React one (blobatar/src/react.tsx)
 * rather than a new shape inside it. Everything except the body outline comes
 * from the library for the same name: colours, eye shapes, and — through
 * `_parts` — the root class and custom properties that blobatar/motion.css and
 * gaze.css animate. The markup mirrors styles/compose.ts `render()` class for
 * class (mo-breathe > mo-bob > body, mo-eyes > mo-eye), so blinking,
 * breathing, bobbing, pointer gaze and expressions all work unchanged.
 *
 * Takes the same props as <Blobatar>. `blobatar/internal` is the package's
 * adapter entry point; its shape only changes on a major version.
 */
export default function PeanutBlobatar({
  name,
  size,
  hue,
  tone,
  palette,
  normalize,
  contrast,
  traits,
  animate,
  expression,
  title,
  style,
  ...rest
}) {
  const opts = { hue, tone, palette, normalize, contrast, traits };
  const dep = JSON.stringify([name, opts, animate]);

  // Root class + motion/pose custom properties. Recomputed when the
  // expression changes; the inner markup below is not, so switching
  // expressions morphs instead of rebuilding the subtree.
  const parts = useMemo(
    () => (animate ? _parts(name, { ...opts, animate, expression }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dep, expression],
  );

  const inner = useMemo(() => {
    const mo = !!animate;
    // Unposed and untinted when animating: the pose arrives as CSS variables
    // and the stylesheet paints the tinted fills from --mo-head/--mo-eye.
    const layout = _layout(name, mo ? opts : { ...opts, expression });
    const p = layout.palette;
    const body = peanutBody(name);
    const eyes = fitEyes(layout, body);

    const eye = (e, i) => {
      const path = `<path d="${superellipse(e)}"/>`;
      return mo
        ? `<g class="mo-eye" style="--mo-wrap:${i ? 1 : -1};--mo-lean:${r2(e.rot)};transform-origin:${r2(e.cx)}px ${r2(e.cy)}px">${path}</g>`
        : path;
    };
    const figure =
      `<g fill="${p.head}"><path d="${body.d}"/></g>` +
      `<g fill="${p.eye}"${mo ? ' class="mo-eyes"' : ''}>${eyes.map(eye).join('')}</g>`;
    return mo ? `<g class="mo-breathe"><g class="mo-bob">${figure}</g></g>` : figure;
    // Static mode bakes the expression into the eyes, so it depends on it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, animate ? null : expression]);

  const html = useMemo(() => ({ __html: inner }), [inner]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      style={{ ...(parts?.vars || {}), ...style }}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <g className={parts?.cls} dangerouslySetInnerHTML={html} />
    </svg>
  );
}
