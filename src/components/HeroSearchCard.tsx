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
      className="rounded-3xl p-7 transition-all duration-300"
      style={{
        background: "#EEE9E0",
        border: focused
          ? "1.5px solid rgba(122,158,116,0.60)"
          : "1.5px solid rgba(0,0,0,0.07)",
        boxShadow: focused
          ? "0 0 0 4px rgba(122,158,116,0.12), 0 24px 48px rgba(0,0,0,0.09)"
          : "0 2px 20px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles size={12} style={{ color: "#7A9E74" }} />
          <span
            className="text-[9px] font-black tracking-[0.24em] uppercase"
            style={{ color: "#58574F" }}
          >
            Describe your style
          </span>
        </div>
        <div className="relative">
          <div
            className="flex rounded-full p-[3px]"
            style={{ background: "rgba(0,0,0,0.07)" }}
          >
            {(["Women", "Men"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => g === "Men" ? showComingSoon() : undefined}
                className="px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-200"
                style={{
                  background: g === "Women" ? "#0F0F0E" : "transparent",
                  color: g === "Women" ? "white" : "#9B9B9B",
                  boxShadow: g === "Women" ? "0 2px 6px rgba(0,0,0,0.22)" : "none",
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
                className="absolute right-0 top-full mt-2 flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-[11px] font-bold"
                style={{
                  background: "#0F0F0E",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
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
              color: "#BBBBBB",
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
          style={{ color: "#0F0F0E", caretColor: "#7A9E74" }}
        />
      </div>

      <div className="mb-4" style={{ height: 1, background: "rgba(0,0,0,0.07)" }} />

      <div className="flex flex-wrap gap-1.5 mb-5">
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className="text-[9.5px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all duration-200 hover:bg-[#7A9E74] hover:text-white active:scale-95"
            style={{ background: "rgba(0,0,0,0.055)", color: "#555555" }}
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
          borderRadius: "16px",
          fontWeight: 900,
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          background: hasValue ? "#0F0F0E" : "rgba(0,0,0,0.07)",
          color: hasValue ? "white" : "#AAAAAA",
          boxShadow: hasValue ? "0 8px 24px rgba(0,0,0,0.22)" : "none",
          transition: "background 0.25s, box-shadow 0.25s",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          transform: btnHovered ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.6s cubic-bezier(0.165,0.84,0.44,1)",
        }}>
          <Sparkles size={12} style={{ color: hasValue ? "#7A9E74" : "#CCCCCC" }} />
          Find my style
          <ArrowRight size={12} style={{ opacity: hasValue ? 1 : 0.4 }} />
        </span>
        <span style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          transform: btnHovered ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.6s cubic-bezier(0.165,0.84,0.44,1)",
        }}>
          <Sparkles size={12} style={{ color: "#7A9E74" }} />
          Find my style
          <ArrowRight size={12} />
        </span>
      </button>
    </div>
  );
}
