"use client";

import { useEffect, useMemo, useState } from "react";

export interface CountdownState {
  now: number;
  target: number;
  remainingMs: number;
  isElapsed: boolean;
}

export function useCountdown(
  targetDate: string | Date,
  intervalMs = 1000,
): CountdownState {
  const target = useMemo(() => new Date(targetDate).getTime(), [targetDate]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  const remainingMs = Math.max(target - now, 0);

  return {
    now,
    target,
    remainingMs,
    isElapsed: remainingMs === 0,
  };
}
