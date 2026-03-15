"use client";
import { useRef, useState } from "react";

export default function CardTilt({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTilt({
      x: ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * -4.5,
      y: ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 4.5,
    });
  };
  const onLeave = () => setTilt({ x: 0, y: 0 });
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.55s cubic-bezier(0.165,0.84,0.44,1)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
