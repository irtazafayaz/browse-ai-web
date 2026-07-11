"use client";
import { useState, useEffect } from "react";

export default function StatItem({
  value,
  label,
  delay,
  counterTarget,
  counterSuffix = "",
}: {
  value: string;
  label: string;
  delay: number;
  counterTarget?: number;
  counterSuffix?: string;
}) {
  const [triggered, setTriggered] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (delay >= 9999) return;
    const t = setTimeout(() => {
      setTriggered(true);
      if (counterTarget !== undefined) {
        const duration = 1800;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setCount(Math.round(eased * counterTarget));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [delay, counterTarget]);

  const displayValue =
    counterTarget !== undefined && triggered ? `${count}${counterSuffix}` : value;

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden">
        <span
          className="font-display text-5xl md:text-6xl text-[var(--ink)] tracking-tight leading-none"
          style={{
            display: "inline-block",
            animation: triggered
              ? "charReveal 0.7s cubic-bezier(0.4,0,0.2,1) both"
              : "none",
            opacity: triggered ? undefined : 0,
          }}
        >
          {displayValue}
        </span>
      </div>
      <div className="overflow-hidden">
        <span
          className="text-sm font-semibold uppercase tracking-widest"
          style={{
            color: "var(--accent)",
            display: "inline-block",
            animation: triggered
              ? "charReveal 0.7s cubic-bezier(0.4,0,0.2,1) 80ms both"
              : "none",
            opacity: triggered ? undefined : 0,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
