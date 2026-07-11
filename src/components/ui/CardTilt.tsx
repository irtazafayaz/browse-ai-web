"use client";

export default function CardTilt({
  children,
  rotate = -1,
}: {
  children: React.ReactNode;
  rotate?: number;
}) {
  return (
    <div
      style={{
        transition: "transform 0.15s ease-out",
        willChange: "transform",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = `rotate(${rotate}deg) translateY(-3px)`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "rotate(0deg) translateY(0)"; }}
    >
      {children}
    </div>
  );
}
