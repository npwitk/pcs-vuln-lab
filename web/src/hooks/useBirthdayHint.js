import { useEffect, useState } from 'react';
import { isBirthdayWindow } from '../utils/birthday';

// During Peanut's birthday month, search placeholders now and then swap their
// text for a hint. `fading` is true for a moment around each swap, so callers
// can fade the old text out and the new one in.
const FADE_MS = 220;

export default function useBirthdayHint({ normalMs = 4500, hintMs = 3200 } = {}) {
  const live = isBirthdayWindow();
  const [state, setState] = useState({ hint: false, fading: false });

  useEffect(() => {
    if (!live) return undefined;
    let timer;
    const swap = (toHint) => {
      setState(s => ({ ...s, fading: true }));
      timer = setTimeout(() => {
        setState({ hint: toHint, fading: false });
        timer = setTimeout(() => swap(!toHint), toHint ? hintMs : normalMs);
      }, FADE_MS);
    };
    timer = setTimeout(() => swap(true), normalMs);
    return () => clearTimeout(timer);
  }, [live, normalMs, hintMs]);

  return live ? state : { hint: false, fading: false };
}
