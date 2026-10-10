import React, { useLayoutEffect, useRef, useState } from 'react';
import { formatExamTypes, formatExamTypesShort } from '../utils/examTypes';

// A sheet's exam types in a tag-row pill: "Midterm + Final" when it fits on
// the row, "Mid + Final" when it doesn't. The row (the pill's parent) must
// take the room it has (flex: 1 in a flex row), so its width is the space
// available rather than the width of its content.
//
// Measures before paint, so there's no flash of the long label, and again
// whenever the row or anything in it changes size (a resized window, the
// institution logo sliding in). `pill` is the file's own styled pill.

// Room the full label needs, given the row and its other items.
function fullLabelFits(pillEl, measureEl) {
  const row = pillEl.parentElement;
  const rowStyle = getComputedStyle(row);
  const gap = parseFloat(rowStyle.columnGap) || 0;
  const pillChrome = pillEl.offsetWidth - pillEl.querySelector('[data-label]').offsetWidth;
  const needed = measureEl.offsetWidth + pillChrome;

  let used = 0;
  let items = 0;
  for (const child of row.children) {
    if (child === pillEl) continue;
    const style = getComputedStyle(child);
    used += child.getBoundingClientRect().width + (parseFloat(style.marginLeft) || 0) + (parseFloat(style.marginRight) || 0);
    items += 1;
  }
  return needed <= row.clientWidth - used - gap * items;
}

export default function ExamTypesPill({ sheet, pill: Pill }) {
  const full = formatExamTypes(sheet);
  const short = formatExamTypesShort(sheet);
  const [useShort, setUseShort] = useState(false);
  const pillRef = useRef(null);
  const measureRef = useRef(null);

  useLayoutEffect(() => {
    const pillEl = pillRef.current;
    if (!pillEl || full === short) {
      setUseShort(false);
      return undefined;
    }
    const check = () => setUseShort(!fullLabelFits(pillEl, measureRef.current));
    check();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(check);
    observer.observe(pillEl.parentElement);
    for (const child of pillEl.parentElement.children) {
      if (child !== pillEl) observer.observe(child);
    }
    return () => observer.disconnect();
  }, [full, short]);

  if (!full) return null;

  return (
    <Pill ref={pillRef} title={useShort ? full : undefined} style={{ position: 'relative' }}>
      <span data-label>{useShort ? short : full}</span>
      {/* Invisible copy of the full label, to measure it while the short one shows. */}
      {full !== short && (
        <span
          ref={measureRef}
          aria-hidden="true"
          style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', left: 0, top: 0, pointerEvents: 'none' }}
        >
          {full}
        </span>
      )}
    </Pill>
  );
}
