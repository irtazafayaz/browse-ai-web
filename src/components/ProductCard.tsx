'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bookmark, BookmarkCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import { Product } from '@/lib/types';

/* Size variants — determines image aspect ratio & card feel */
export type CardSize = 'tall' | 'normal' | 'short';

interface Props {
  product: Product;
  onBookmark: (id: string) => void;
  onMoreLikeThis: (product: Product) => void;
  size?: CardSize;
}

/* Aspect ratios — tall feels editorial, short feels punchy */
const ASPECT: Record<CardSize, string> = {
  tall:   '2/3',   // editorial portrait — dominant
  normal: '3/4',   // standard portrait
  short:  '4/5',   // slightly compressed
};

export default function ProductCard({ product, onBookmark, onMoreLikeThis, size = 'normal' }: Props) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [bookmarkPop, setBookmarkPop] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark(product.id);
    setBookmarkPop(true);
    setTimeout(() => setBookmarkPop(false), 380);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <article
      className="group relative flex flex-col cursor-pointer rounded-md overflow-hidden"
      onClick={() => router.push(`/product/${product.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? 'translateY(-8px) scale(1.015)' : 'translateY(0) scale(1)',
        transition: 'transform 0.4s cubic-bezier(0.19,1,0.22,1), box-shadow 0.4s cubic-bezier(0.19,1,0.22,1)',
        boxShadow: hovered
          ? '0 32px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10)'
          : '0 2px 10px rgba(0,0,0,0.07)',
        background: '#fff',
        willChange: 'transform',
      }}
    >
      {/* ── Image zone ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: ASPECT[size] }}>

        {/* Product image with Ken Burns zoom */}
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          style={{
            transform: hovered ? 'scale(1.1)' : 'scale(1.01)',
            transition: 'transform 0.7s cubic-bezier(0.19,1,0.22,1)',
          }}
        />

        {/* Gradient — stronger at bottom on hover */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: hovered
              ? 'linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.65) 100%)'
              : 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.22) 100%)',
            transition: 'background 0.45s ease',
          }}
        />

        {/* ── TOP badges row ── */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between z-10">
          {/* Discount pill */}
          {discount ? (
            <span
              className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
              style={{
                background: '#1A1A1A',
                color: 'white',
                letterSpacing: '0.1em',
              }}
            >
              -{discount}%
            </span>
          ) : <span />}

          {/* Bookmark button */}
          <button
            onClick={handleBookmark}
            aria-label={product.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: product.isBookmarked ? '#1A1A1A' : 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(10px)',
              transform: bookmarkPop
                ? 'scale(1.45)'
                : hovered || product.isBookmarked ? 'scale(1)' : 'scale(0.88)',
              opacity: hovered || product.isBookmarked ? 1 : 0,
              transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease, background 0.2s ease',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            }}
          >
            {product.isBookmarked
              ? <BookmarkCheck size={13} style={{ color: 'white' }} />
              : <Bookmark size={13} style={{ color: '#1A1A1A' }} />
            }
          </button>
        </div>

        {/* ── BOTTOM hover overlay — "More like this" + price ── */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 p-3 flex flex-col gap-2"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.25s ease, transform 0.32s cubic-bezier(0.19,1,0.22,1)',
          }}
        >
          {/* Price strip (shows over dark gradient on hover) */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-white font-black text-sm tracking-tight">${product.price}</span>
            {product.originalPrice && (
              <span className="text-white/55 text-[11px] line-through font-medium">${product.originalPrice}</span>
            )}
          </div>

          {/* "More like this" pill */}
          <button
            onClick={(e) => { e.stopPropagation(); onMoreLikeThis(product); }}
            className="w-full py-2 rounded text-[11px] font-bold tracking-wide flex items-center justify-center gap-1.5"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(14px)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              color: '#1A1A1A',
              letterSpacing: '0.03em',
            }}
          >
            <Sparkles size={10} />
            More like this
          </button>
        </div>
      </div>

      {/* ── Info strip ── */}
      <div className="px-3 pt-2.5 pb-3 flex items-start justify-between gap-1">
        <div className="flex flex-col gap-0.5 min-w-0">
          {/* Brand label */}
          <span
            className="text-[8.5px] font-black tracking-[0.2em] uppercase truncate"
            style={{ color: '#8B7355' }}
          >
            {product.brand}
          </span>
          {/* Product name */}
          <span
            className="text-[12px] font-semibold leading-snug line-clamp-2 text-[#1A1A1A]"
            style={{ letterSpacing: '-0.01em' }}
          >
            {product.name}
          </span>

          {/* Price row — visible only when NOT hovered (hidden on hover, shows in overlay) */}
          <div
            className="flex items-center gap-1.5 mt-0.5"
            style={{
              opacity: hovered ? 0 : 1,
              transition: 'opacity 0.2s ease',
            }}
          >
            <span className="text-[13px] font-black text-[#1A1A1A] tracking-tight">${product.price}</span>
            {product.originalPrice && (
              <span className="text-[11px] text-[#C0C0C0] line-through font-medium">${product.originalPrice}</span>
            )}
          </div>
        </div>

        {/* Arrow icon — appears on hover */}
        <div
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
          style={{
            background: hovered ? '#1A1A1A' : '#F0EDE8',
            opacity: hovered ? 1 : 0.6,
            transform: hovered ? 'scale(1) rotate(0deg)' : 'scale(0.85) rotate(-10deg)',
            transition: 'all 0.32s cubic-bezier(0.19,1,0.22,1)',
          }}
        >
          <ArrowUpRight
            size={11}
            style={{ color: hovered ? 'white' : '#8B7355' }}
          />
        </div>
      </div>
    </article>
  );
}
