"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}

function fmt(n: number, decimals: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function AnimatedNumber({
  value,
  prefix = "$",
  suffix = "",
  decimals = 2,
  className,
  duration = 500,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(() => fmt(value, decimals));
  const prevValue = useRef(value);
  const rafId = useRef(0);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;

    // No change — just display
    if (from === to) {
      setDisplay(fmt(to, decimals));
      return;
    }

    // Coming from 0 (cold start / page load) — show instantly, no animation
    if (from === 0 && to > 0) {
      setDisplay(fmt(to, decimals));
      return;
    }

    // Cancel any running animation
    cancelAnimationFrame(rafId.current);

    const start = performance.now();

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;

      setDisplay(fmt(current, decimals));

      if (progress < 1) {
        rafId.current = requestAnimationFrame(step);
      }
    }

    rafId.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafId.current);
  }, [value, decimals, duration]);

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
