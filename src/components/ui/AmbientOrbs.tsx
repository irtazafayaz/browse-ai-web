"use client";
import { useRef, useEffect } from "react";

export default function AmbientOrbs() {
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const sy = window.scrollY;
        if (orb1Ref.current) orb1Ref.current.style.transform = `translateY(${sy * 0.20}px)`;
        if (orb2Ref.current) orb2Ref.current.style.transform = `translateY(${sy * 0.13}px)`;
        if (orb3Ref.current) orb3Ref.current.style.transform = `translateY(${sy * 0.08}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        ref={orb1Ref}
        className="animate-float absolute rounded-full blur-[120px]"
        style={{
          width: 700, height: 700, top: "-20%", left: "-15%",
          background: "radial-gradient(circle, #a8c4a4 0%, transparent 70%)",
          opacity: 0.28, willChange: "transform",
        }}
      />
      <div
        ref={orb2Ref}
        className="animate-float-delayed absolute rounded-full blur-[100px]"
        style={{
          width: 500, height: 500, top: "20%", right: "-10%",
          background: "radial-gradient(circle, #b4cbb0 0%, transparent 70%)",
          opacity: 0.18, willChange: "transform",
        }}
      />
      <div
        ref={orb3Ref}
        className="animate-float-slow absolute rounded-full blur-[80px]"
        style={{
          width: 380, height: 380, bottom: "5%", left: "30%",
          background: "radial-gradient(circle, #c8d8c5 0%, transparent 70%)",
          opacity: 0.14, willChange: "transform",
        }}
      />
    </div>
  );
}
