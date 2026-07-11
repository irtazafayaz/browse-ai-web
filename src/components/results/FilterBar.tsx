"use client";
import { DollarSign, Star, SlidersHorizontal, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

type SortMode = "match" | "price-asc" | "price-desc" | "trending";
type Gender = "Women" | "Men";

const SORT_OPTIONS: { id: SortMode; label: string; icon: React.ReactNode }[] = [
  { id: "match",      label: "Best match", icon: <Star size={11} /> },
  { id: "trending",   label: "Trending",   icon: <TrendingUp size={11} /> },
  { id: "price-asc",  label: "Price ↑",    icon: <DollarSign size={11} /> },
  { id: "price-desc", label: "Price ↓",    icon: <DollarSign size={11} /> },
];

export default function FilterBar({
  gender, onGenderChange,
  sort, onSortChange,
  activeFilterCount, onFilterOpen,
  loading, hasProducts, total, query,
  onComingSoon,
}: {
  gender: Gender;
  onGenderChange: (g: Gender) => void;
  sort: SortMode;
  onSortChange: (s: SortMode) => void;
  activeFilterCount: number;
  onFilterOpen: () => void;
  loading: boolean;
  hasProducts: boolean;
  total: number;
  query: string;
  onComingSoon: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "3px solid var(--ink)" }}>
      <div className="flex border-brutal-thin shrink-0" style={{ background: "var(--surface)" }}>
        {(["Women", "Men"] as Gender[]).map((g, i) => (
          <button
            key={g}
            onClick={() => g === "Men" ? onComingSoon() : onGenderChange(g)}
            className="px-3 py-1 text-[9px] font-black uppercase tracking-wider transition-all duration-150 ease-out"
            style={{
              background: gender === g ? "var(--ink)" : "var(--surface)",
              color: gender === g ? "var(--surface)" : "var(--ink)",
              borderLeft: i > 0 ? "2px solid var(--ink)" : "none",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="h-3 w-20 animate-pulse" style={{ background: "var(--bg)" }} />
        ) : hasProducts ? (
          <p className="text-[11.5px] font-medium truncate" style={{ color: "var(--ink-muted)" }}>
            {total.toLocaleString()} {total === 1 ? "result" : "results"}
            {query && <> · <span style={{ color: "var(--ink-muted)", fontWeight: 700 }}>&ldquo;{query}&rdquo;</span></>}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSortChange(opt.id)}
            className="relative flex items-center gap-1 px-2.5 py-1.5 border-brutal-thin text-[11px] font-semibold active:scale-95"
            style={{ color: sort === opt.id ? "var(--surface)" : "var(--ink)", transition: "color 0.15s ease-out", background: sort === opt.id ? "transparent" : "var(--surface)" }}
          >
            {sort === opt.id && (
              <motion.div
                layoutId="sort-pill-bg"
                className="absolute inset-0"
                style={{ background: "var(--ink)" }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">{opt.icon}<span>{opt.label}</span></span>
          </button>
        ))}
      </div>

      <button
        onClick={onFilterOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 border-brutal-thin text-[11px] font-bold transition-all duration-150 ease-out active:scale-95 shrink-0"
        style={{ background: activeFilterCount > 0 ? "var(--ink)" : "var(--surface)", color: activeFilterCount > 0 ? "var(--surface)" : "var(--ink)" }}
      >
        <SlidersHorizontal size={11} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="w-4 h-4 border-brutal-thin flex items-center justify-center text-[8px] font-black" style={{ background: "var(--warn)", color: "var(--ink)" }}>
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}
