'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Bookmark, BookmarkCheck, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';

interface Props {
  product: Product;
  onBookmark: (id: string) => void;
  onMoreLikeThis: (product: Product) => void;
}

export default function ProductCard({ product, onBookmark, onMoreLikeThis }: Props) {
  const [hovered, setHovered] = useState(false);
  const [bookmarkPop, setBookmarkPop] = useState(false);

  const handleBookmark = () => {
    onBookmark(product.id);
    setBookmarkPop(true);
    setTimeout(() => setBookmarkPop(false), 400);
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered
          ? '0 24px 48px rgba(0,0,0,0.13), 0 6px 16px rgba(0,0,0,0.07)'
          : '0 2px 10px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-5px) scale(1.015)' : 'translateY(0) scale(1)',
        transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
          style={{
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1)',
          }}
        />

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md z-10"
          style={{
            transform: bookmarkPop ? 'scale(1.35)' : hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease',
            boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.18)' : '0 2px 6px rgba(0,0,0,0.12)',
          }}
        >
          {product.isBookmarked
            ? <BookmarkCheck size={14} className="text-[#1A1A1A]" />
            : <Bookmark size={14} className="text-[#6B6B6B]" />
          }
        </button>

        {/* Sale badge */}
        {product.originalPrice && (
          <div className="absolute top-2.5 left-2.5 bg-[#1A1A1A] text-white text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full z-10">
            Sale
          </div>
        )}

        {/* Hover overlay — gradient + button */}
        <div
          className="absolute inset-0 flex flex-col justify-end"
          style={{
            background: `linear-gradient(to bottom, transparent 45%, rgba(0,0,0,${hovered ? 0.68 : 0}) 100%)`,
            transition: 'background 0.3s ease',
          }}
        >
          <div
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
              padding: '0 12px 12px',
            }}
          >
            <button
              onClick={() => onMoreLikeThis(product)}
              className="w-full py-2 rounded-full text-xs font-semibold text-[#1A1A1A] flex items-center justify-center gap-1.5"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
            >
              <Sparkles size={11} />
              More like this
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <span className="text-[10px] font-bold text-[#8B8B8B] tracking-widest uppercase">{product.brand}</span>
        <span className="text-[13px] font-medium text-[#1A1A1A] leading-snug line-clamp-2">{product.name}</span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[13px] font-bold text-[#1A1A1A]">${product.price}</span>
          {product.originalPrice && (
            <span className="text-[12px] text-[#BBBBBB] line-through">${product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
