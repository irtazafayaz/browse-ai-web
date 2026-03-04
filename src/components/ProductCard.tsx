'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bookmark, BookmarkCheck, ShoppingBag, Zap } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/types';

export type CardSize = 'tall' | 'normal' | 'short';

interface Props {
  product: Product;
  onBookmark: (id: string) => void;
  onMoreLikeThis: (product: Product) => void;
  onAddToCart?: (id: string) => void;
  size?: CardSize;
}

const ASPECT = '4/5';

function DiscountBadge({ pct }: { pct: number }) {
  return (
    <span
      className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
      style={{ background: '#1A1A1A', color: 'white', letterSpacing: '0.08em' }}
    >
      -{pct}%
    </span>
  );
}

export default function ProductCard({
  product, onBookmark, onMoreLikeThis: _m, onAddToCart, size: _s = 'normal',
}: Props) {
  const router = useRouter();
  const [hovered, setHovered]         = useState(false);
  const [bookmarkPop, setBookmarkPop] = useState(false);
  const [imgError, setImgError]       = useState(false);
  const [imgLoaded, setImgLoaded]     = useState(false);
  const [addedToBag, setAddedToBag]   = useState(false);

  /* ── 3-D tilt via mouse position ── */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]),  { stiffness: 280, damping: 28 });
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [4, -4]),  { stiffness: 280, damping: 28 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width);
    mouseY.set((e.clientY - r.top)  / r.height);
  };
  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => {
    setHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark(product.id);
    setBookmarkPop(true);
    setTimeout(() => setBookmarkPop(false), 380);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product.id);
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 1600);
  };

  const discount     = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
  const showFallback = imgError || !product.imageUrl;

  return (
    <motion.div
      className="group relative flex flex-col cursor-pointer"
      onClick={() => router.push(`/product/${product.id}`)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        background: 'transparent',
        willChange: 'transform',
        rotateX,
        rotateY,
        transformPerspective: 900,
      }}
    >
      {/* ── Image zone ── */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: ASPECT,
          borderRadius: 12,
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered
            ? '0 22px 44px rgba(0,0,0,0.20), 0 4px 12px rgba(0,0,0,0.10)'
            : '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'transform 0.4s cubic-bezier(0.19,1,0.22,1), box-shadow 0.4s cubic-bezier(0.19,1,0.22,1)',
        }}
      >
        {/* Image / fallback */}
        {showFallback ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4"
            style={{ background: 'linear-gradient(145deg, #EDE8E0 0%, #DDD5C6 60%, #D4C8B6 100%)' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)' }}>
              <ShoppingBag size={20} style={{ color: '#9B8877' }} />
            </div>
            <span className="text-[10.5px] font-semibold text-center leading-snug line-clamp-3"
              style={{ color: '#9B8877', maxWidth: '80%' }}>
              {product.name}
            </span>
          </div>
        ) : (
          <>
            {/* Shimmer placeholder while image loads */}
            {!imgLoaded && (
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(90deg, #EDE9E1 25%, #E4DDD3 50%, #EDE9E1 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeletonShimmer 1.6s ease-in-out infinite',
              }} />
            )}
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              style={{
                opacity: imgLoaded ? 1 : 0,
                transform: hovered ? 'scale(1.07)' : 'scale(1.01)',
                transition: 'transform 0.6s cubic-bezier(0.19,1,0.22,1), opacity 0.45s ease',
              }}
            />
          </>
        )}

        {/* Gradient overlay — deepens on hover */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: hovered
            ? 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.40) 100%)'
            : 'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.12) 100%)',
          transition: 'background 0.4s ease',
        }} />

        {/* Discount badge */}
        {discount && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <DiscountBadge pct={discount} />
          </div>
        )}

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          aria-label={product.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: product.isBookmarked ? '#1A1A1A' : 'rgba(255,255,255,0.90)',
            backdropFilter: 'blur(10px)',
            transform: bookmarkPop
              ? 'scale(1.4)'
              : hovered || product.isBookmarked ? 'scale(1)' : 'scale(0.82)',
            opacity: hovered || product.isBookmarked ? 1 : 0,
            transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease, background 0.2s ease',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          }}
        >
          {product.isBookmarked
            ? <BookmarkCheck size={13} style={{ color: 'white' }} />
            : <Bookmark      size={13} style={{ color: '#1A1A1A' }} />
          }
        </button>

        {/* ── Quick action buttons ── */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10 px-3"
            >
              {/* Add to bag */}
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.93 }}
                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap"
                style={{
                  background: addedToBag ? '#C4A882' : '#1A1A1A',
                  color: 'white',
                  letterSpacing: '0.10em',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.28)',
                  transition: 'background 0.3s ease',
                }}
              >
                <ShoppingBag size={9} />
                {addedToBag ? 'Added ✓' : 'Add to bag'}
              </motion.button>

              {/* Quick view */}
              <motion.button
                onClick={e => e.stopPropagation()}
                whileTap={{ scale: 0.93 }}
                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(12px)',
                  color: '#1A1A1A',
                  letterSpacing: '0.10em',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.15)',
                }}
              >
                <Zap size={9} style={{ color: '#C4A882' }} />
                Quick view
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Info strip ── */}
      <div className="px-1 pt-2 pb-0.5">
        <span className="block text-[8px] font-black tracking-[0.18em] uppercase truncate" style={{ color: '#9B8060' }}>
          {product.brand}
        </span>
        <span className="block text-[11.5px] font-semibold leading-snug line-clamp-2 text-[#1A1A1A] mt-0.5"
          style={{ letterSpacing: '-0.01em' }}>
          {product.name}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[12.5px] font-black text-[#1A1A1A] tracking-tight">${product.price}</span>
          {product.originalPrice && (
            <span className="text-[10.5px] text-[#BBBBBB] line-through font-medium">${product.originalPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
