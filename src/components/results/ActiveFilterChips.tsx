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
    <div className="px-4 py-1.5 flex gap-1.5 flex-wrap" style={{ borderBottom: "1px solid rgba(212,196,168,0.15)" }}>
      {filters.brand && (
        <button
          onClick={() => onFiltersChange({ ...filters, brand: undefined })}
          className="flex items-center gap-1 px-2.5 py-1 text-white text-[10.5px] font-semibold rounded-full hover:opacity-80 active:scale-95"
          style={{ background: "#7A9E74" }}
        >
          {filters.brand}<X size={8} className="opacity-60" />
        </button>
      )}
      {(filters.minPrice != null || filters.maxPrice != null) && (
        <button
          onClick={() => onFiltersChange({ ...filters, minPrice: undefined, maxPrice: undefined })}
          className="flex items-center gap-1 px-2.5 py-1 text-white text-[10.5px] font-semibold rounded-full hover:opacity-80 active:scale-95"
          style={{ background: "#7A9E74" }}
        >
          {filters.minPrice != null ? `$${filters.minPrice}` : ""}
          {filters.minPrice != null && filters.maxPrice != null ? "–" : ""}
          {filters.maxPrice != null ? `$${filters.maxPrice}` : ""}
          <X size={8} className="opacity-60" />
        </button>
      )}
      {(filters.tags ?? []).map((t) => (
        <button
          key={t}
          onClick={() => onFiltersChange({ ...filters, tags: (filters.tags ?? []).filter((x) => x !== t) })}
          className="flex items-center gap-1 px-2.5 py-1 text-white text-[10.5px] font-semibold rounded-full capitalize hover:opacity-80 active:scale-95"
          style={{ background: "#7A9E74" }}
        >
          {t}<X size={8} className="opacity-60" />
        </button>
      ))}
      <button
        onClick={() => onFiltersChange({})}
        className="px-2.5 py-1 text-[10.5px] font-medium rounded-full hover:text-[#1A1A1A] active:scale-95"
        style={{ border: "1px solid rgba(122,158,116,0.5)", color: "#7A9E74" }}
      >
        Clear all
      </button>
    </div>
  );
}
