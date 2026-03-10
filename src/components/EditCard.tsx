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
      className="relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        aspectRatio: "3/4",
        transform: hovered
          ? "translateY(-6px) scale(1.025)"
          : "translateY(0) scale(1)",
        boxShadow: hovered
          ? "0 28px 56px rgba(0,0,0,0.22), 0 8px 20px rgba(0,0,0,0.10)"
          : "0 4px 16px rgba(0,0,0,0.09)",
        transition:
          "transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s cubic-bezier(0.22,1,0.36,1)",
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
          transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1)",
        }}
      />

      {/* Gradient overlay — deepens on hover */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 35%, rgba(0,0,0,${hovered ? 0.76 : 0.52}) 100%)`,
          transition: "background 0.3s ease",
        }}
      />

      {/* Tag badge */}
      <div
        className="absolute top-3 left-3 rounded-xl px-2.5 py-1"
        style={{
          background: "rgba(255,255,255,0.90)",
          backdropFilter: "blur(10px)",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          transition: "transform 0.3s ease",
          boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
        }}
      >
        <span className="text-[10px] font-bold text-[#1A1A1A] tracking-wide uppercase">
          {edit.tag}
        </span>
      </div>

      {/* Label + arrow */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
        <span
          className="text-white font-bold text-base leading-tight tracking-tight"
          style={{
            transform: hovered ? "translateY(-2px)" : "translateY(0)",
            transition: "transform 0.3s ease",
          }}
        >
          {edit.label}
        </span>
        <div
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered
              ? "scale(1) rotate(0deg)"
              : "scale(0.6) rotate(-45deg)",
            transition:
              "opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <ArrowRight size={14} className="text-[#1A1A1A]" />
        </div>
      </div>
    </div>
  );
}
