"use client";
import { Search, Camera, X, ArrowRight, CornerDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const PLACEHOLDERS = [
  "lawn suit in soft pastels…",
  "something elegant for a dinner…",
  "wide-leg trousers in earthy tones…",
  "chiffon dupatta set under $80…",
  "stitched pret kurta for everyday…",
];

export const TRENDING = [
  { emoji: "🌿", query: "Embroidered lawn suit" },
  { emoji: "🍂", query: "Earthy tones kurta" },
  { emoji: "✨", query: "Formal chiffon dupatta" },
  { emoji: "🖤", query: "Minimal black pret" },
  { emoji: "🌸", query: "Soft pastel co-ord set" },
];

interface Props {
  inputFocused: boolean;
  setInputFocused: (v: boolean) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  phIdx: number;
  phVisible: boolean;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
  onCameraClick: () => void;
  onTrendingSelect: (q: string) => void;
}

export default function SearchPill({
  inputFocused,
  setInputFocused,
  inputValue,
  setInputValue,
  phIdx,
  phVisible,
  loading,
  onSubmit,
  onClear,
  onCameraClick,
  onTrendingSelect,
}: Props) {
  return (
    <div className="relative">
      <form onSubmit={onSubmit}>
        <div
          className={`flex items-center ${!inputFocused ? "animate-pill-breathe" : ""}`}
          style={{
            background: "var(--ink)",
            borderRadius: 0,
            border: "3px solid var(--ink)",
            padding: "6px 6px 6px 20px",
            boxShadow: inputFocused
              ? "6px 6px 0 var(--accent)"
              : "4px 4px 0 var(--ink)",
            transform: inputFocused
              ? "translate(-2px, -2px)"
              : "translate(0, 0)",
            transition: "box-shadow 0.15s ease-out, transform 0.15s ease-out",
          }}
        >
          <Search size={16} style={{ marginRight: 8, color: "rgba(255,255,255,0.92)", flexShrink: 0 }} />

          <button
            type="button"
            onClick={onCameraClick}
            title="Image search (coming soon)"
            className="shrink-0 active:scale-90"
            style={{ marginRight: 14, lineHeight: 0 }}
          >
            <Camera size={16} style={{ color: "rgba(255,255,255,0.28)" }} />
          </button>

          <div className="shrink-0 self-stretch" style={{ width: 1, background: "rgba(255,255,255,0.09)", margin: "5px 16px 5px 0" }} />

          <div className="relative flex-1 min-w-0" style={{ marginRight: 8 }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder=""
              className="w-full bg-transparent outline-none"
              style={{
                color: "rgba(255,255,255,0.88)",
                caretColor: "var(--accent)",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            />
            {!inputValue && (
              <span
                key={phIdx}
                className="absolute inset-0 flex items-center pointer-events-none select-none"
                style={{
                  color: inputFocused ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.36)",
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  opacity: phVisible ? 1 : 0,
                  transform: phVisible ? "translateY(0)" : "translateY(-5px)",
                  transition: "opacity 0.28s ease, transform 0.3s ease",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {PLACEHOLDERS[phIdx]}
              </span>
            )}
          </div>

          {inputValue && (
            <button
              type="button"
              onClick={onClear}
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.09)", marginRight: 4 }}
            >
              <X size={11} style={{ color: "rgba(255,255,255,0.45)" }} />
            </button>
          )}

          <button
            type="submit"
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-90"
            style={{
              background: loading || inputFocused ? "var(--accent)" : "rgba(255,255,255,0.10)",
              boxShadow: loading || inputFocused ? "2px 2px 0 var(--accent-dark)" : "none",
              transition: "background 0.15s ease-out, box-shadow 0.15s ease-out",
            }}
          >
            {loading ? (
              <div
                className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: "rgba(255,255,255,0.25)", borderTopColor: "white" }}
              />
            ) : (
              <ArrowRight size={15} className="text-white" />
            )}
          </button>
        </div>

        <div
          className="relative mx-3 mt-1.5 overflow-hidden"
          style={{ height: 2, opacity: loading ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          <div
            className="absolute top-0 h-full"
            style={{
              width: "42%",
              background: "linear-gradient(90deg, transparent, var(--accent) 40%, var(--accent-soft) 60%, transparent)",
              animation: "searchSweep 1.35s ease-in-out infinite",
            }}
          />
        </div>
      </form>

      <AnimatePresence>
        {inputFocused && !inputValue && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 z-50 overflow-hidden"
            style={{
              top: "calc(100% + 8px)",
              background: "var(--ink)",
              border: "3px solid var(--ink)",
              boxShadow: "4px 4px 0 var(--ink)",
            }}
          >
            <div className="px-3 pt-3 pb-2">
              <p
                className="text-[9px] font-black uppercase tracking-[0.16em] mb-1.5 px-2"
                style={{ color: "rgba(255,255,255,0.28)" }}
              >
                Trending searches
              </p>
              {TRENDING.map((item, i) => (
                <motion.button
                  key={item.query}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  onMouseDown={() => onTrendingSelect(item.query)}
                  className="w-full flex items-center gap-3 py-2 px-2 text-left transition-colors"
                  style={{ color: "rgba(255,255,255,0.78)" }}
                  whileHover={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <span className="text-base leading-none">{item.emoji}</span>
                  <span className="flex-1 text-[13px] font-medium">{item.query}</span>
                  <CornerDownLeft size={11} style={{ color: "rgba(255,255,255,0.22)", flexShrink: 0 }} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
