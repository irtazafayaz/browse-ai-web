"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/types";

export type CardSize = "tall" | "normal" | "short";

interface Props {
  product: Product;
  onBookmark: (id: string) => void;
  onMoreLikeThis: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  size?: CardSize;
}

const ASPECT = "4/5";

function DiscountBadge({ pct }: { pct: number }) {
  return (
    <span className="tag-brutal" style={{ background: "var(--warn)", color: "var(--ink)" }}>
      -{pct}%
    </span>
  );
}

export default function ProductCard({
  product,
  onBookmark,
  onMoreLikeThis: _m,
  onQuickView,
  size: _s = "normal",
  rotate = -1,
}: Props & { rotate?: number }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [bookmarkPop, setBookmarkPop] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark(product.id);
    setBookmarkPop(true);
    setTimeout(() => setBookmarkPop(false), 380);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView?.(product);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;
  const showFallback = imgError || !product.imageUrl;

  return (
    <motion.div
      className="group relative flex flex-col cursor-pointer"
      onClick={() => {
        localStorage.setItem(
          `browseai:product:${product.id}`,
          JSON.stringify(product),
        );
        router.push(`/product/${product.id}`);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ rotate, y: -3 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {/* ── Image zone ── */}
      <div
        className="relative overflow-hidden border-brutal"
        style={{
          aspectRatio: ASPECT,
          borderRadius: 0,
          boxShadow: hovered ? "7px 7px 0 var(--ink)" : "4px 4px 0 var(--ink)",
          transition: "box-shadow 150ms ease-out",
        }}
      >
        {/* Image / fallback */}
        {showFallback ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4"
            style={{ background: "var(--accent-soft)" }}
          >
            <div
              className="w-12 h-12 flex items-center justify-center border-brutal-thin"
              style={{ background: "var(--surface)" }}
            >
              <Zap size={20} style={{ color: "var(--accent)" }} />
            </div>
            <span
              className="text-[10.5px] font-semibold text-center leading-snug line-clamp-3"
              style={{ color: "var(--accent)", maxWidth: "80%" }}
            >
              {product.name}
            </span>
          </div>
        ) : (
          <>
            {/* Solid placeholder while image loads */}
            {!imgLoaded && (
              <div
                className="absolute inset-0"
                style={{ background: "var(--accent-soft)" }}
              />
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
                transform: hovered ? "scale(1.07)" : "scale(1.01)",
                transition:
                  "transform 0.15s ease-out, opacity 0.3s ease",
              }}
            />
          </>
        )}

        {/* Gradient overlay — deepens on hover */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: hovered
              ? "linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.40) 100%)"
              : "linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.12) 100%)",
            transition: "background 0.4s ease",
          }}
        />

        {/* Discount badge */}
        {discount && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <DiscountBadge pct={discount} />
          </div>
        )}

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          aria-label={product.isBookmarked ? "Remove bookmark" : "Bookmark"}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center border-brutal-thin"
          style={{
            background: product.isBookmarked ? "var(--accent)" : "var(--surface)",
            transform: bookmarkPop
              ? "scale(1.4)"
              : hovered || product.isBookmarked
                ? "scale(1)"
                : "scale(0.82)",
            opacity: hovered || product.isBookmarked ? 1 : 0,
            transition:
              "transform 0.2s ease-out, opacity 0.15s ease-out, background 0.15s ease-out",
            boxShadow: "2px 2px 0 var(--ink)",
          }}
        >
          {product.isBookmarked ? (
            <BookmarkCheck size={13} style={{ color: "var(--surface)" }} />
          ) : (
            <Bookmark size={13} style={{ color: "var(--ink)" }} />
          )}
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
              {/* Quick view */}
              <motion.button
                onClick={handleQuickView}
                whileTap={{ scale: 0.93 }}
                className="btn-brutal flex items-center gap-1.5 text-[9px] px-3 py-1.5 whitespace-nowrap"
              >
                <Zap size={9} style={{ color: "var(--warn)" }} />
                Quick view
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Info strip ── */}
      <div className="px-1 pt-2 pb-0.5">
        <span
          className="font-mono-brutal block text-[8px] tracking-[0.18em] uppercase truncate"
          style={{ color: "var(--accent)" }}
        >
          {product.brand}
        </span>
        <span
          className="block text-[11.5px] font-semibold leading-snug line-clamp-2 mt-0.5"
          style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}
        >
          {product.name}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="font-display text-[12.5px]" style={{ color: "var(--ink)" }}>
            ${product.price}
          </span>
          {product.originalPrice && (
            <span
              className="text-[10.5px] line-through font-medium"
              style={{ color: "var(--ink-muted)" }}
            >
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
