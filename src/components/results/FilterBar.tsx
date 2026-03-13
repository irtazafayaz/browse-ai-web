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
    <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid rgba(212,196,168,0.2)" }}>
      <div className="flex rounded-full p-[3px] shrink-0" style={{ background: "rgba(0,0,0,0.06)" }}>
        {(["Women", "Men"] as Gender[]).map((g) => (
          <button
            key={g}
            onClick={() => g === "Men" ? onComingSoon() : onGenderChange(g)}
            className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-200"
            style={{
              background: gender === g ? "#7A9E74" : "transparent",
              color: gender === g ? "white" : "#9B9B9B",
              boxShadow: gender === g ? "0 2px 6px rgba(0,0,0,0.2)" : "none",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="h-3 w-20 rounded-full animate-pulse" style={{ background: "#EDE9E1" }} />
        ) : hasProducts ? (
          <p className="text-[11.5px] font-medium truncate" style={{ color: "#9B9B9B" }}>
            {total.toLocaleString()} {total === 1 ? "result" : "results"}
            {query && <> · <span style={{ color: "#6B6B6B", fontWeight: 700 }}>&ldquo;{query}&rdquo;</span></>}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSortChange(opt.id)}
            className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold active:scale-95"
            style={{ color: sort === opt.id ? "white" : "#6B6B6B", transition: "color 0.18s ease", background: sort === opt.id ? "transparent" : "#EAE5DC" }}
          >
            {sort === opt.id && (
              <motion.div
                layoutId="sort-pill-bg"
                className="absolute inset-0 rounded-full"
                style={{ background: "#7A9E74", boxShadow: "0 0 0 2px rgba(122,158,116,0.40), 0 4px 14px rgba(0,0,0,0.18)" }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">{opt.icon}<span>{opt.label}</span></span>
          </button>
        ))}
      </div>

      <button
        onClick={onFilterOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 active:scale-95 shrink-0"
        style={{ background: activeFilterCount > 0 ? "#7A9E74" : "#EAE5DC", color: activeFilterCount > 0 ? "white" : "#6B6B6B" }}
      >
        <SlidersHorizontal size={11} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black" style={{ background: "rgba(255,255,255,0.22)" }}>
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}
