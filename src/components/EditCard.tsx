'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Edit } from '@/lib/types';

interface Props {
  edit: Edit;
  onTap: (edit: Edit) => void;
}

export default function EditCard({ edit, onTap }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${
        hovered ? 'scale-[1.03] shadow-2xl shadow-black/20' : 'shadow-md shadow-black/8'
      }`}
      style={{ aspectRatio: '3/4' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onTap(edit)}
    >
      <Image
        src={edit.imageUrl}
        alt={edit.label}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          background: `linear-gradient(to bottom, transparent 40%, rgba(0,0,0,${hovered ? 0.72 : 0.52}) 100%)`,
        }}
      />
      {/* Tag badge */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1">
        <span className="text-[10px] font-bold text-[#1A1A1A] tracking-wide uppercase">{edit.tag}</span>
      </div>
      {/* Label + arrow */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
        <span className="text-white font-bold text-base leading-tight tracking-tight">{edit.label}</span>
        <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <ArrowRight size={14} className="text-[#1A1A1A]" />
        </div>
      </div>
    </div>
  );
}
