"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import ProductCard, { CardSize } from "./ProductCard";
import { Product } from "@/lib/types";

interface Props {
  products: Product[];
  onBookmark: (id: string) => void;
  onMoreLikeThis: (p: Product) => void;
  onQuickView?: (product: Product) => void;
}

/*
  Size pattern — kept for semantic variety (could affect future card designs),
  but APPROX_H is now UNIFORM since all cards share a fixed 4/5 aspect ratio.
*/
const SIZE_PATTERN: CardSize[] = [
  "tall", // 0
  "short", // 1
  "normal", // 2
  "tall", // 3
  "short", // 4
  "normal", // 5
  "tall", // 6
];

/*
  All cards are 4/5 aspect ratio → same real height.
  Uniform APPROX_H ensures the greedy algorithm distributes items
  sequentially (col0, col1, col2, …) so the last row items
  always land in adjacent columns — no visual gap.
*/
const APPROX_H = 340; // px — single value used for every card size

/* ── Responsive column count ── */
function useColumnCount() {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w >= 1280 ? 5 : w >= 1024 ? 4 : w >= 640 ? 3 : 2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

/* ── Intersection-observer reveal ── */
function useReveal(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

/* ── Animated card wrapper ── */
function RevealCard({
  product,
  index,
  colIndex,
  rowInCol,
  size,
  onBookmark,
  onMoreLikeThis,
  onQuickView,
}: {
  product: Product;
  index: number;
  colIndex: number;
  rowInCol: number;
  size: CardSize;
  onBookmark: (id: string) => void;
  onMoreLikeThis: (p: Product) => void;
  onQuickView?: (product: Product) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useReveal(ref);

  /*
    Left-to-right column wave:
    - Each column starts revealing 55ms after the previous one
    - Within each column, cards stagger by 40ms top-to-bottom
    - Capped at 520ms so deep items don't wait forever
  */
  const delay = Math.min(colIndex * 55 + rowInCol * 40, 520);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(22px) scale(0.97)",
        transition: `
          opacity   0.35s cubic-bezier(0.4,0,0.2,1) ${delay}ms,
          transform 0.38s cubic-bezier(0.4,0,0.2,1) ${delay}ms
        `,
      }}
    >
      <ProductCard
        product={product}
        onBookmark={onBookmark}
        onMoreLikeThis={onMoreLikeThis}
        onQuickView={onQuickView}
        size={size}
        rotate={index % 2 === 0 ? -1 : 1}
      />
    </div>
  );
}

/*
  Greedy shortest-column packing.
  With uniform APPROX_H, this resolves to simple round-robin distribution:
  items 0→col0, 1→col1, 2→col2 … giving perfectly balanced columns.
  The last N items (where N < numCols) always land in adjacent columns,
  eliminating the visual gap seen with uneven height estimates.
*/
type ColItem = { product: Product; size: CardSize; index: number };

function packColumns(products: Product[], numCols: number): ColItem[][] {
  const cols: ColItem[][] = Array.from({ length: numCols }, () => []);
  const heights = new Array<number>(numCols).fill(0);

  products.forEach((product, i) => {
    const size = SIZE_PATTERN[i % SIZE_PATTERN.length];
    // Pick the column with the least accumulated height
    let shortestCol = 0;
    for (let c = 1; c < numCols; c++) {
      if (heights[c] < heights[shortestCol]) shortestCol = c;
    }
    cols[shortestCol].push({ product, size, index: i });
    heights[shortestCol] += APPROX_H + 14; // 14 = gap between cards
  });

  return cols;
}

/* ── Shimmer skeleton card ── */
function SkeletonCard() {
  return (
    <div
      className="overflow-hidden border-brutal"
      style={{
        aspectRatio: "4/5",
        background: "var(--accent-soft)",
        boxShadow: "4px 4px 0 var(--ink)",
      }}
    />
  );
}

/* ══ MasonryGrid ══ */
export default function MasonryGrid({
  products,
  onBookmark,
  onMoreLikeThis,
  onQuickView,
}: Props) {
  const numCols = useColumnCount();
  const columns = useMemo(
    () => packColumns(products, numCols),
    [products, numCols],
  );

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
        <div
          className="w-14 h-14 flex items-center justify-center border-brutal"
          style={{ background: "var(--ink)", boxShadow: "4px 4px 0 var(--ink)" }}
        >
          <span className="text-2xl">🔍</span>
        </div>
        <div>
          <p
            className="font-display text-base tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            No results found
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
            Try a different search or refine with AI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {columns.map((colItems, ci) => (
        <div key={ci} className="flex-1 flex flex-col gap-3 min-w-0">
          {colItems.map(({ product, size, index }, rowInCol) => (
            <RevealCard
              key={product.id}
              product={product}
              index={index}
              colIndex={ci}
              rowInCol={rowInCol}
              size={size}
              onBookmark={onBookmark}
              onMoreLikeThis={onMoreLikeThis}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* Exported skeleton for results page loading state */
export function MasonrySkeletonGrid({ cols = 4 }: { cols?: number }) {
  const perCol = [3, 3, 3, 3, 3].slice(0, cols);
  return (
    <div className="flex gap-3">
      {perCol.map((count, ci) => (
        <div key={ci} className="flex-1 flex flex-col gap-3 min-w-0">
          {Array.from({ length: count }).map((_, ri) => (
            <SkeletonCard key={ri} />
          ))}
        </div>
      ))}
    </div>
  );
}
