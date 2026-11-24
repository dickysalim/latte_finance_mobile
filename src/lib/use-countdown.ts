import { useCallback, useEffect, useState } from 'react';

/** Seconds left on a wait (the 60 second wait between verification emails). */
export function useCountdown(seconds: number, startRunning = false) {
  const [left, setLeft] = useState(startRunning ? seconds : 0);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const start = useCallback(() => setLeft(seconds), [seconds]);
  return { left, running: left > 0, start };
}
