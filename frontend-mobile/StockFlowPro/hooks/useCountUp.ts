import { useEffect, useRef, useState } from 'react';

/** Animates from 0 up to `target` whenever target changes (e.g. dashboard data loads/refreshes). Always returns a number (0 while target is null/undefined) — pair with your own `data?.x != null` check for '—' placeholder display. */
export function useCountUp(target?: number | null, durationMs = 900): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (target == null || Number.isNaN(target)) return;
    const start = Date.now();
    const endValue = target;

    const tick = () => {
      const progress = Math.min(1, (Date.now() - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(endValue * eased);
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setValue(endValue);
      }
    };
    frame.current = requestAnimationFrame(tick);
    return () => { if (frame.current != null) cancelAnimationFrame(frame.current); };
  }, [target, durationMs]);

  return value;
}
