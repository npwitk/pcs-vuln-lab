import { useState, useEffect } from 'react';

// Tracks a max-width media query via matchMedia's own change event, so
// components can render different content per breakpoint (not just different
// CSS) without waiting on a resize-driven re-render.
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(`(max-width: ${breakpoint}px)`).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
};

export default useIsMobile;
