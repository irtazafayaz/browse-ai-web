"use client";
import { X } from "lucide-react";
import { SearchFilters } from "@/lib/types";

export default function ActiveFilterChips({
  filters,
  onFiltersChange,
}: {
  filters: SearchFilters;
  onFiltersChange: (f: SearchFilters) => void;
}) {
  return (
    <div className="px-4 py-1.5 flex gap-1.5 flex-wrap" style={{ borderBottom: "2px solid var(--ink)" }}>
      {filters.brand && (
        <button
          onClick={() => onFiltersChange({ ...filters, brand: undefined })}
          className="tag-brutal shadow-brutal-sm flex items-center gap-1 px-2.5 py-1 text-[10.5px]"
          style={{ background: "var(--accent)", color: "var(--surface)" }}
        >
          {filters.brand}<X size={9} />
        </button>
      )}
      {(filters.minPrice != null || filters.maxPrice != null) && (
        <button
          onClick={() => onFiltersChange({ ...filters, minPrice: undefined, maxPrice: undefined })}
          className="tag-brutal shadow-brutal-sm flex items-center gap-1 px-2.5 py-1 text-[10.5px]"
          style={{ background: "var(--accent)", color: "var(--surface)" }}
        >
          {filters.minPrice != null ? `$${filters.minPrice}` : ""}
          {filters.minPrice != null && filters.maxPrice != null ? "–" : ""}
          {filters.maxPrice != null ? `$${filters.maxPrice}` : ""}
          <X size={9} />
        </button>
      )}
      {(filters.tags ?? []).map((t) => (
        <button
          key={t}
          onClick={() => onFiltersChange({ ...filters, tags: (filters.tags ?? []).filter((x) => x !== t) })}
          className="tag-brutal shadow-brutal-sm flex items-center gap-1 px-2.5 py-1 text-[10.5px]"
          style={{ background: "var(--accent)", color: "var(--surface)" }}
        >
          {t}<X size={9} />
        </button>
      ))}
      <button
        onClick={() => onFiltersChange({})}
        className="tag-brutal shadow-brutal-sm px-2.5 py-1 text-[10.5px] transition-colors duration-150 ease-out hover:bg-[var(--ink)] hover:text-[var(--surface)]"
        style={{ color: "var(--accent-dark)" }}
      >
        Clear all
      </button>
    </div>
  );
}
