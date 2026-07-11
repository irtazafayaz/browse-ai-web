"use client";
import { useState } from "react";

export const BRAND_STYLE: Record<
  string,
  { bg: string; text: string; mono: string; tag: string }
> = {
  "Sana Safinaz":    { bg: "#3D6138", text: "#E6EEE3", mono: "SS",  tag: "Luxury Pret" },
  "Alkaram Studio":  { bg: "#7A5540", text: "#F0E8DF", mono: "AS",  tag: "Lawn & Casuals" },
  "Gul Ahmed":       { bg: "#8A6010", text: "#F5EDD8", mono: "GA",  tag: "Heritage Fabrics" },
  "Nishat Linen":    { bg: "#25527A", text: "#DDE7F0", mono: "NL",  tag: "Premium Basics" },
  "Maria B":         { bg: "#7A3535", text: "#F0E2E2", mono: "MB",  tag: "Luxury Formal" },
  Limelight:         { bg: "#28663E", text: "#E2F0E6", mono: "LL",  tag: "Everyday Pret" },
  Generation:        { bg: "#8B3E12", text: "#F0E6DE", mono: "GN",  tag: "Sustainable Fashion" },
  "Bonanza Satrangi":{ bg: "#652A7A", text: "#EDE2F0", mono: "BS",  tag: "Colorful Pret" },
  ONE:               { bg: "#2A2A2A", text: "#E8E8E8", mono: "ONE", tag: "Contemporary" },
  Engine:            { bg: "#1E3575", text: "#DDE2F0", mono: "ENG", tag: "Urban Fashion" },
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

  const style = BRAND_STYLE[brand.name] ?? {
    bg: "#6B5540", text: "#EDE8E0", mono: brand.name[0], tag: "Fashion Brand",
  };

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
        onClick={() => onSearch(brand.name)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex flex-row items-center w-full overflow-hidden text-left gap-3"
        style={{
          background: hovered ? "var(--accent-soft)" : "var(--surface)",
          border: "3px solid var(--ink)",
          boxShadow: hovered ? "4px 4px 0 var(--ink)" : "2px 2px 0 var(--ink)",
          padding: "10px 12px 10px 10px",
          transform: hovered ? "translate(-2px, -2px)" : "translate(0, 0)",
          transition: "background 0.2s, box-shadow 0.2s, transform 0.15s ease-out",
        }}
      >
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            width: 52, height: 52, background: style.bg,
            border: "3px solid var(--ink)",
          }}
        >
          <span
            className="font-display"
            style={{
              fontWeight: 700,
              fontSize: style.mono.length > 2 ? "11px" : "18px",
              letterSpacing: "0.02em", color: "var(--surface)",
            }}
          >
            {style.mono}
          </span>
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="font-black uppercase leading-tight truncate"
            style={{ fontSize: "9.5px", letterSpacing: "0.10em", color: "var(--ink)" }}
          >
            {brand.name}
          </span>
          <span
            className="font-mono-brutal font-semibold uppercase truncate mt-0.5"
            style={{ fontSize: "7.5px", letterSpacing: "0.14em", color: "var(--accent)" }}
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
              className="tag-brutal"
              style={{
                fontSize: "7px", letterSpacing: "0.12em",
                background: "var(--accent)", color: "var(--surface)", whiteSpace: "nowrap",
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
