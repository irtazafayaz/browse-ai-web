"use client";
import { useRef, useEffect } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let rafId: number;
    let tx = -500, ty = -500, cx = -500, cy = -500;
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${cx - 260}px, ${cy - 260}px)`;
      }
      rafId = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafId); };
  }, []);
  return (
    <div
      ref={glowRef}
      style={{
        position: "fixed", top: 0, left: 0,
        pointerEvents: "none", zIndex: 1,
        width: 520, height: 520,
        background: "radial-gradient(circle, rgba(122,158,116,0.10) 0%, rgba(122,158,116,0.02) 50%, transparent 70%)",
        borderRadius: "50%",
        willChange: "transform",
      }}
    />
  );
}
