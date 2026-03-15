"use client";
import { useRef, useEffect } from "react";

export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
        if (barRef.current) barRef.current.style.width = `${pct}%`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, []);
  return (
    <div
      ref={barRef}
      style={{
        position: "fixed", top: 0, left: 0, zIndex: 9999,
        height: "2.5px", width: "0%",
        background: "linear-gradient(90deg, #7A9E74 0%, #4D7A47 50%, #7A9E74 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 2.5s linear infinite",
        pointerEvents: "none",
        borderRadius: "0 2px 2px 0",
        boxShadow: "0 0 8px rgba(122,158,116,0.5)",
      }}
    />
  );
}
