import { useEffect, useState } from 'react';

/**
 * Tracks whether the viewport is phone-sized so the verification flow can render
 * edge-to-edge on mobile (full width + full dynamic viewport height) instead of
 * the desktop card width. On a phone the camera steps need the whole screen, and
 * the country grid and capture controls must not be squeezed into a narrow card.
 *
 * SSR-safe: returns false until mounted, then reflects the live media query.
 */
export function useIsMobile(maxWidthPx = 600): boolean {
  const query = `(max-width: ${maxWidthPx}px)`;
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    // addEventListener is the modern API; addListener is the fallback for older iOS Safari.
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return isMobile;
}
