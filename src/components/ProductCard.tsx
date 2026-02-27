'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Product } from '@/lib/types';

interface Props {
  product: Product;
  onBookmark: (id: string) => void;
  onMoreLikeThis: (product: Product) => void;
}

export default function ProductCard({ product, onBookmark, onMoreLikeThis }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative" style={{ aspectRatio: '4/5' }}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {/* Bookmark */}
        <button
          onClick={() => onBookmark(product.id)}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          {product.isBookmarked
            ? <BookmarkCheck size={14} className="text-[#1A1A1A]" />
            : <Bookmark size={14} className="text-[#1A1A1A]" />
          }
        </button>
        {/* More like this overlay */}
        <div
          className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.65) 100%)' }}
        >
          <button
            onClick={() => onMoreLikeThis(product)}
            className="mx-3 mb-3 py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-[#1A1A1A] hover:bg-white transition-colors"
          >
            More like this
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <span className="text-[10px] font-bold text-[#6B6B6B] tracking-widest uppercase">{product.brand}</span>
        <span className="text-[13px] font-medium text-[#1A1A1A] leading-snug line-clamp-2">{product.name}</span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[13px] font-bold text-[#1A1A1A]">${product.price}</span>
          {product.originalPrice && (
            <span className="text-[12px] text-[#AAAAAA] line-through">${product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
