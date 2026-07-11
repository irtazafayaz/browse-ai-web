"use client";
import { useState, useEffect } from "react";

export default function PageEnterTransition() {
  const [lifted, setLifted] = useState(false);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLifted(true), 50);
    const t2 = setTimeout(() => setGone(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (gone) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "#111110",
        transform: lifted ? "translateY(-100%)" : "translateY(0)",
        transition: lifted ? "transform 0.6s cubic-bezier(0.4,0,0.2,1)" : "none",
        pointerEvents: "none",
      }}
    />
  );
}
