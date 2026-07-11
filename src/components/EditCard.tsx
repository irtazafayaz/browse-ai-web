"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Edit } from "@/lib/types";

interface Props {
  edit: Edit;
  onTap: (edit: Edit) => void;
}

export default function EditCard({ edit, onTap }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="card-brutal relative overflow-hidden cursor-pointer"
      style={{
        aspectRatio: "3/4",
        transform: hovered
          ? "translate(-2px,-2px)"
          : "translate(0,0)",
        boxShadow: hovered
          ? "7px 7px 0 var(--ink)"
          : "4px 4px 0 var(--ink)",
        transition:
          "transform 0.15s ease-out, box-shadow 0.15s ease-out",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onTap(edit)}
    >
      {/* Image with subtle zoom */}
      <Image
        src={edit.imageUrl}
        alt={edit.label}
        fill
        quality={80}
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 33vw"
        style={{
          transform: hovered ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.15s ease-out",
        }}
      />

      {/* Gradient overlay — deepens on hover */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 35%, rgba(10,10,9,${hovered ? 0.78 : 0.54}) 100%)`,
          transition: "background 0.15s ease-out",
        }}
      />

      {/* Tag badge */}
      <div
        className="border-brutal-thin absolute top-3 left-3 px-2.5 py-1"
        style={{
          background: "var(--surface)",
          transform: hovered ? "translate(-1px,-1px)" : "translate(0,0)",
          transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out",
          boxShadow: hovered ? "4px 4px 0 var(--ink)" : "2px 2px 0 var(--ink)",
        }}
      >
        <span className="font-mono-brutal text-[10px] font-bold tracking-wide uppercase" style={{ color: "var(--ink)" }}>
          {edit.tag}
        </span>
      </div>

      {/* Label + arrow */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
        <span
          className="text-white font-bold text-base leading-tight tracking-tight"
          style={{
            transform: hovered ? "translateY(-2px)" : "translateY(0)",
            transition: "transform 0.15s ease-out",
          }}
        >
          {edit.label}
        </span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: hovered ? "var(--accent)" : "var(--surface)",
            opacity: hovered ? 1 : 0,
            transform: hovered
              ? "scale(1) rotate(0deg)"
              : "scale(0.6) rotate(-45deg)",
            transition:
              "opacity 0.15s ease-out, transform 0.25s cubic-bezier(0.34,1.56,0.64,1), background 0.15s ease-out",
          }}
        >
          <ArrowRight size={14} style={{ color: "var(--surface)" }} />
        </div>
      </div>
    </div>
  );
}
