"use client";
import { useState, useRef } from "react";

export const BRAND_STYLE: Record<
  string,
  { bg: string; text: string; mono: string; tag: string }
> = {
  "Sana Safinaz":    { bg: "#E6EEE3", text: "#3D6138", mono: "SS",  tag: "Luxury Pret" },
  "Alkaram Studio":  { bg: "#F0E8DF", text: "#7A5540", mono: "AS",  tag: "Lawn & Casuals" },
  "Gul Ahmed":       { bg: "#F5EDD8", text: "#8A6010", mono: "GA",  tag: "Heritage Fabrics" },
  "Nishat Linen":    { bg: "#DDE7F0", text: "#25527A", mono: "NL",  tag: "Premium Basics" },
  "Maria B":         { bg: "#F0E2E2", text: "#7A3535", mono: "MB",  tag: "Luxury Formal" },
  Limelight:         { bg: "#E2F0E6", text: "#28663E", mono: "LL",  tag: "Everyday Pret" },
  Generation:        { bg: "#F0E6DE", text: "#8B3E12", mono: "GN",  tag: "Sustainable Fashion" },
  "Bonanza Satrangi":{ bg: "#EDE2F0", text: "#652A7A", mono: "BS",  tag: "Colorful Pret" },
  ONE:               { bg: "#E8E8E8", text: "#2A2A2A", mono: "ONE", tag: "Contemporary" },
  Engine:            { bg: "#DDE2F0", text: "#1E3575", mono: "ENG", tag: "Urban Fashion" },
};

export default function BrandCard({
  brand,
  delay,
  visible,
  onSearch,
}: {
  brand: { name: string; domain: string; url: string };
  delay: number;
  visible: boolean;
  onSearch: (q: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [mag, setMag] = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const style = BRAND_STYLE[brand.name] ?? {
    bg: "#EDE8E0", text: "#6B5540", mono: brand.name[0], tag: "Fashion Brand",
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMag({
      x: (e.clientX - (r.left + r.width / 2)) * 0.14,
      y: (e.clientY - (r.top + r.height / 2)) * 0.14,
    });
    setHovered(true);
  };
  const onMouseLeave = () => { setHovered(false); setMag({ x: 0, y: 0 }); };

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "transform 0.55s, opacity 0.55s",
        transitionDelay: visible ? `${delay}ms` : "0ms",
      }}
    >
      <button
        ref={btnRef}
        onClick={() => onSearch(brand.name)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative flex flex-row items-center w-full rounded-2xl overflow-hidden text-left gap-3"
        style={{
          background: hovered ? "#EDEAE4" : "#E8E3DC",
          border: hovered ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(0,0,0,0.06)",
          boxShadow: hovered ? "0 10px 32px rgba(0,0,0,0.10)" : "0 2px 8px rgba(0,0,0,0.05)",
          padding: "10px 12px 10px 10px",
          transform: `translate(${mag.x}px, ${hovered ? mag.y - 3 : 0}px)`,
          transition: "background 0.2s, box-shadow 0.2s, border 0.2s, transform 0.35s cubic-bezier(0.165,0.84,0.44,1)",
        }}
      >
        <div
          className="shrink-0 flex items-center justify-center rounded-xl"
          style={{
            width: 52, height: 52, background: "#0F0F0E",
            boxShadow: hovered ? "0 6px 18px rgba(0,0,0,0.30)" : "0 3px 10px rgba(0,0,0,0.20)",
            transition: "box-shadow 0.2s",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontStyle: "italic", fontWeight: 700,
              fontSize: style.mono.length > 2 ? "11px" : "18px",
              letterSpacing: "0.02em", color: style.bg,
            }}
          >
            {style.mono}
          </span>
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="font-black uppercase leading-tight truncate"
            style={{ fontSize: "9.5px", letterSpacing: "0.10em", color: "#0F0F0E" }}
          >
            {brand.name}
          </span>
          <span
            className="font-semibold uppercase truncate mt-0.5"
            style={{ fontSize: "7.5px", letterSpacing: "0.14em", color: "#7A9E74" }}
          >
            {style.tag}
          </span>
          <div
            style={{
              marginTop: hovered ? 6 : 0,
              maxHeight: hovered ? 20 : 0,
              opacity: hovered ? 1 : 0,
              overflow: "hidden",
              transition: "opacity 0.18s ease, max-height 0.18s ease, margin-top 0.18s ease",
            }}
          >
            <span
              className="inline-block px-2.5 py-0.5 rounded-full font-bold uppercase"
              style={{
                fontSize: "7px", letterSpacing: "0.12em",
                background: "#7A9E74", color: "#ffffff", whiteSpace: "nowrap",
              }}
            >
              Show results →
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
