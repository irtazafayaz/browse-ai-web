'use client';
import { useEffect, useRef, useState } from 'react';
import ProductCard, { CardSize } from './ProductCard';
import { Product } from '@/lib/types';

interface Props {
  products: Product[];
  onBookmark: (id: string) => void;
  onMoreLikeThis: (p: Product) => void;
}

/*
  Deterministic size pattern — 7-card repeating rhythm.
  Creates the visual "inhale/exhale" of a Pinterest/editorial grid.
  Tall cards anchor the columns; short cards create breathing room.
*/
const SIZE_PATTERN: CardSize[] = [
  'tall',    // 0 — tall hero card
  'short',   // 1 — short accent
  'normal',  // 2
  'tall',    // 3 — tall again
  'short',   // 4
  'normal',  // 5
  'tall',    // 6
];

/* Simple intersection-observer hook for scroll-triggered reveals */
function useReveal(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

/* Individual card wrapper with reveal animation */
function RevealCard({
  product, index, size, onBookmark, onMoreLikeThis,
}: {
  product: Product;
  index: number;
  size: CardSize;
  onBookmark: (id: string) => void;
  onMoreLikeThis: (p: Product) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useReveal(ref);

  return (
    <div
      ref={ref}
      style={{
        breakInside: 'avoid',
        marginBottom: 14,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
        transition: `opacity 0.55s cubic-bezier(0.19,1,0.22,1) ${Math.min(index * 50, 300)}ms,
                     transform 0.6s cubic-bezier(0.19,1,0.22,1) ${Math.min(index * 50, 300)}ms`,
      }}
    >
      <ProductCard
        product={product}
        onBookmark={onBookmark}
        onMoreLikeThis={onMoreLikeThis}
        size={size}
      />
    </div>
  );
}

export default function MasonryGrid({ products, onBookmark, onMoreLikeThis }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-4 animate-fade-in">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: '#1A1A1A' }}
        >
          <span className="text-2xl">🔍</span>
        </div>
        <div>
          <p className="font-black text-[#1A1A1A] text-base tracking-tight">No results found</p>
          <p className="text-sm text-[#8B8B8B] mt-1">Try a different search or refine with AI</p>
        </div>
      </div>
    );
  }

  return (
    /*
      CSS columns masonry — the most cross-browser masonry approach.
      Items flow top-to-bottom per column, creating Pinterest-style height variation.
      We use style={{ columns }} (no Tailwind breakpoint classes on this prop)
      to avoid Tailwind/inline style conflicts.
    */
    <div
      style={{
        columns: 'var(--masonry-cols, 2)',
        columnGap: '12px',
      }}
      className="[--masonry-cols:2] sm:[--masonry-cols:2] md:[--masonry-cols:3]"
    >
      {products.map((p, i) => (
        <RevealCard
          key={p.id}
          product={p}
          index={i}
          size={SIZE_PATTERN[i % SIZE_PATTERN.length]}
          onBookmark={onBookmark}
          onMoreLikeThis={onMoreLikeThis}
        />
      ))}
    </div>
  );
}
