"use client";
import { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_TAGS = ["Lawn", "Chiffon", "Embroidered", "Casual", "Formal", "Pret"];

const HERO_PLACEHOLDERS = [
  "embroidered lawn suit in soft pastels…",
  "something elegant for a formal dinner…",
  "wide-leg trousers in earthy tones…",
  "a casual chiffon dupatta set under $80…",
  "stitched pret kurta for everyday wear…",
];

export default function HeroSearchCard({ onSubmit }: { onSubmit: (q: string) => void }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [phIdx, setPhIdx] = useState(0);
  const [phVisible, setPhVisible] = useState(true);
  const [btnHovered, setBtnHovered] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setInterval(async () => {
      if (focused || value) return;
      setPhVisible(false);
      await new Promise((r) => setTimeout(r, 300));
      setPhIdx((i) => (i + 1) % HERO_PLACEHOLDERS.length);
      setPhVisible(true);
    }, 3400);
    return () => clearInterval(t);
  }, [focused, value]);

  const showComingSoon = () => {
    setComingSoon(true);
    setTimeout(() => setComingSoon(false), 2200);
  };

  const submit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
  };

  const addTag = (tag: string) => {
    setValue((v) => (v ? `${v}, ${tag.toLowerCase()}` : tag.toLowerCase()));
    textareaRef.current?.focus();
  };

  const hasValue = value.trim().length > 0;

  return (
    <div
      className="p-7 shadow-brutal-lg"
      style={{
        background: "var(--bg)",
        border: "3px solid var(--ink)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles size={12} style={{ color: "var(--accent)" }} />
          <span
            className="text-[9px] font-black tracking-[0.24em] uppercase"
            style={{ color: "var(--ink-muted)" }}
          >
            Describe your style
          </span>
        </div>
        <div className="relative">
          <div
            className="flex p-[3px] border-brutal-thin"
            style={{ background: "rgba(0,0,0,0.07)" }}
          >
            {(["Women", "Men"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => g === "Men" ? showComingSoon() : undefined}
                className="px-3.5 py-1 text-[9px] font-black uppercase tracking-wider transition-all duration-150"
                style={{
                  background: g === "Women" ? "var(--ink)" : "transparent",
                  color: g === "Women" ? "var(--surface)" : "var(--ink-muted)",
                }}
              >
                {g}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {comingSoon && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute right-0 top-full mt-2 flex items-center gap-2 px-3.5 py-2 text-white text-[11px] font-bold"
                style={{
                  background: "var(--ink)",
                  border: "2px solid var(--ink)",
                  boxShadow: "4px 4px 0 var(--ink)",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                }}
              >
                <span style={{ fontSize: 13 }}>🚀</span>
                Men&apos;s collection coming soon
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative mb-5" style={{ minHeight: 80 }}>
        {!focused && !value && (
          <span
            className="absolute top-0 left-0 text-sm leading-relaxed italic pointer-events-none"
            style={{
              color: "var(--ink-muted)",
              opacity: phVisible ? 1 : 0,
              transform: phVisible ? "translateY(0)" : "translateY(-5px)",
              transition: "opacity 0.28s ease, transform 0.28s ease",
            }}
          >
            {HERO_PLACEHOLDERS[phIdx]}
          </span>
        )}
        <textarea
          ref={textareaRef}
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed"
          style={{ color: "var(--ink)", caretColor: "var(--accent)" }}
        />
      </div>

      <div className="mb-4" style={{ height: 1, background: "rgba(0,0,0,0.07)" }} />

      <div className="flex flex-wrap gap-1.5 mb-5">
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className="text-[9.5px] font-black uppercase tracking-widest px-3 py-1 border-brutal-thin transition-all duration-150 hover:bg-[var(--accent)] hover:text-[var(--surface)] active:scale-95"
            style={{ background: "rgba(0,0,0,0.055)", color: "var(--ink-muted)" }}
          >
            {tag}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        style={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          height: "48px",
          fontFamily: "var(--font-space-mono), monospace",
          fontWeight: 700,
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          background: hasValue ? "var(--pop)" : "rgba(0,0,0,0.07)",
          color: hasValue ? "var(--ink)" : "var(--ink-muted)",
          border: "3px solid var(--ink)",
          boxShadow: hasValue ? (btnHovered ? "6px 6px 0 var(--ink)" : "4px 4px 0 var(--ink)") : "none",
          transform: hasValue && btnHovered ? "translate(-2px, -2px)" : "translate(0, 0)",
          transition: "background 0.15s ease-out, box-shadow 0.15s ease-out, transform 0.15s ease-out",
          cursor: "pointer",
        }}
      >
        <span style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          transform: btnHovered ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.15s ease-out",
        }}>
          <Sparkles size={12} style={{ color: hasValue ? "var(--accent)" : "var(--ink-muted)" }} />
          Find my style
          <ArrowRight size={12} style={{ opacity: hasValue ? 1 : 0.4 }} />
        </span>
        <span style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          transform: btnHovered ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.15s ease-out",
        }}>
          <Sparkles size={12} style={{ color: "var(--accent)" }} />
          Find my style
          <ArrowRight size={12} />
        </span>
      </button>
    </div>
  );
}
