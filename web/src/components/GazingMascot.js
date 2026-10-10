import React, { useEffect, useRef } from 'react';
import Mascot from './mascot/Mascot';
import { useGaze } from '@blobatar/react/gaze';
import 'blobatar/motion.css';
import 'blobatar/gaze.css';

// A single decorative mascot (a blobatar, or sometimes a peanut; see
// mascot/Mascot.js) whose eyes track the pointer. Mirrors the same
// ref-to-wrapping-span + querySelector workaround already used on
// CheatSheetDetail.js's buy bar — installed @blobatar/react's <Blobatar> is a
// plain function component, not forwardRef, so useGaze's ref can't attach to
// it directly.
export default function GazingMascot({ name, size, style, expression }) {
  const wrapperRef = useRef(null);
  // Scales a little with size so bigger mascots' eyes move a proportionally
  // similar amount instead of all sharing one fixed excursion.
  const { ref: gazeRef } = useGaze({ travel: Math.max(2, size / 16), lookAt: 'pointer' });

  useEffect(() => {
    const node = wrapperRef.current?.querySelector('svg, img') || null;
    gazeRef(node);
    return () => gazeRef(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gazeRef, name]);

  return (
    <span ref={wrapperRef} style={{ position: 'absolute', ...style }} aria-hidden="true">
      <Mascot name={name} size={size} animate="always" expression={expression} />
    </span>
  );
}
