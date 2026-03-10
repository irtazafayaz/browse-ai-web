"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MarqueeBrands, { BRAND_LIST } from "@/components/MarqueeBrands";
import Logo from "@/components/Logo";
import EditCard from "@/components/EditCard";

import { getEdits } from "@/lib/api";
import { Edit } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import AuthModal from "@/components/AuthModal";

/* ══════════════════════════════════════
   Scroll reveal hook
══════════════════════════════════════ */
function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ══════════════════════════════════════
   1. SCROLL PROGRESS BAR
   Thin amber gradient line at top that
   grows as the user scrolls — rAF-based
   direct DOM writes for 60 fps.
══════════════════════════════════════ */
function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
        if (barRef.current) barRef.current.style.width = `${pct}%`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, []);
  return (
    <div
      ref={barRef}
      style={{
        position: "fixed", top: 0, left: 0, zIndex: 9999,
        height: "2.5px", width: "0%",
        background: "linear-gradient(90deg, #C4A882 0%, #8B7355 50%, #C4A882 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 2.5s linear infinite",
        pointerEvents: "none",
        borderRadius: "0 2px 2px 0",
        boxShadow: "0 0 8px rgba(196,168,130,0.5)",
      }}
    />
  );
}

/* ══════════════════════════════════════
   2. CURSOR AMBIENT GLOW
   Soft radial gradient that trails the
   cursor. rAF + lerp for buttery smooth
   60 fps movement, zero React re-renders.
══════════════════════════════════════ */
function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let rafId: number;
    let tx = -500, ty = -500, cx = -500, cy = -500;
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${cx - 260}px, ${cy - 260}px)`;
      }
      rafId = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafId); };
  }, []);
  return (
    <div
      ref={glowRef}
      style={{
        position: "fixed", top: 0, left: 0,
        pointerEvents: "none", zIndex: 1,
        width: 520, height: 520,
        background: "radial-gradient(circle, rgba(196,168,130,0.13) 0%, rgba(196,168,130,0.03) 50%, transparent 70%)",
        borderRadius: "50%",
        willChange: "transform",
      }}
    />
  );
}

/* ══════════════════════════════════════
   3. PAGE ENTER TRANSITION
   Dark (#1A1A1A) veil covers the page
   on first load, then slides up to reveal
   the cream background underneath.
══════════════════════════════════════ */
function PageEnterTransition() {
  const [lifted, setLifted] = useState(false);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setLifted(true), 50);
    const t2 = setTimeout(() => setGone(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (gone) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "#1A1A1A",
        transform: lifted ? "translateY(-100%)" : "translateY(0)",
        transition: lifted ? "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)" : "none",
        pointerEvents: "none",
      }}
    />
  );
}

/* ══════════════════════════════════════
   6. 3D CARD TILT wrapper
   Applies perspective + rotateX/Y based
   on cursor position over the child.
══════════════════════════════════════ */
function CardTilt({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTilt({
      x: ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * -4.5,
      y: ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 4.5,
    });
  };
  const onLeave = () => setTilt({ x: 0, y: 0 });
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.55s cubic-bezier(0.165,0.84,0.44,1)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════
   Character-by-character reveal
   itsoffbrand style — pure clip, no fade
══════════════════════════════════════ */
function CharReveal({
  text,
  baseDelay = 0,
  className = "",
}: {
  text: string;
  baseDelay?: number;
  className?: string;
}) {
  return (
    <>
      {text.split("").map((char, i) =>
        char === " " ? (
          <span key={i} style={{ display: "inline-block", width: "0.26em" }} />
        ) : (
          <span key={i} className="clip-wrap">
            <span
              className={`char-reveal ${className}`}
              style={{ animationDelay: `${baseDelay + i * 32}ms` }}
            >
              {char}
            </span>
          </span>
        )
      )}
    </>
  );
}

/* ══════════════════════════════════════
   Word-by-word stagger reveal
══════════════════════════════════════ */
function WordReveal({
  text,
  baseDelay = 0,
  className = "",
}: {
  text: string;
  baseDelay?: number;
  className?: string;
}) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i} className="clip-wrap">
          <span
            className={`word-reveal ${className}`}
            style={{ animationDelay: `${baseDelay + i * 85}ms` }}
          >
            {word}
            {i < text.split(" ").length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </>
  );
}

/* ══════════════════════════════════════
   Scroll-triggered section heading
══════════════════════════════════════ */
function ScrollHeading({
  eyebrow,
  title,
  light = false,
  visible,
}: {
  eyebrow: string;
  title: string;
  light?: boolean;
  visible: boolean;
}) {
  return (
    <div className="mb-12 text-center">
      <div className="overflow-hidden mb-3">
        <span
          className="text-[10px] font-black tracking-[0.28em] uppercase"
          style={{
            color: "#8B7355",
            display: "inline-block",
            animation: visible
              ? "eyebrowIn 0.7s cubic-bezier(0.165,0.84,0.44,1) both"
              : "none",
            opacity: visible ? undefined : 0,
          }}
        >
          {eyebrow}
        </span>
      </div>
      <h2
        className="font-black leading-tight tracking-[-0.03em]"
        style={{
          fontSize: "clamp(2rem, 4vw, 3.2rem)",
          color: light ? "#ffffff" : "#1A1A1A",
        }}
      >
        {title.split(" ").map((word, i) => (
          <span key={i} className="clip-wrap">
            <span
              style={{
                display: "inline-block",
                animation: visible
                  ? `lineReveal 0.9s cubic-bezier(0.165,0.84,0.44,1) ${80 + i * 100}ms both`
                  : "none",
                opacity: visible ? undefined : 0,
              }}
            >
              {word}
              {i < title.split(" ").length - 1 ? "\u00A0" : ""}
            </span>
          </span>
        ))}
      </h2>
    </div>
  );
}

/* ══════════════════════════════════════
   4. AMBIENT ORBS — with PARALLAX
   Each orb manages its own rAF scroll
   listener and moves at a different rate,
   creating layered depth as you scroll.
══════════════════════════════════════ */
function AmbientOrbs() {
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const sy = window.scrollY;
        if (orb1Ref.current) orb1Ref.current.style.transform = `translateY(${sy * 0.20}px)`;
        if (orb2Ref.current) orb2Ref.current.style.transform = `translateY(${sy * 0.13}px)`;
        if (orb3Ref.current) orb3Ref.current.style.transform = `translateY(${sy * 0.08}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        ref={orb1Ref}
        className="animate-float absolute rounded-full blur-[120px]"
        style={{
          width: 700, height: 700, top: "-20%", left: "-15%",
          background: "radial-gradient(circle, #d4b896 0%, transparent 70%)",
          opacity: 0.35, willChange: "transform",
        }}
      />
      <div
        ref={orb2Ref}
        className="animate-float-delayed absolute rounded-full blur-[100px]"
        style={{
          width: 500, height: 500, top: "20%", right: "-10%",
          background: "radial-gradient(circle, #b5a08a 0%, transparent 70%)",
          opacity: 0.22, willChange: "transform",
        }}
      />
      <div
        ref={orb3Ref}
        className="animate-float-slow absolute rounded-full blur-[80px]"
        style={{
          width: 380, height: 380, bottom: "5%", left: "30%",
          background: "radial-gradient(circle, #e2ceb0 0%, transparent 70%)",
          opacity: 0.18, willChange: "transform",
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════
   5. STAT ITEM with animated counter
   Numbers count up with easeOutExpo
   when the stats section scrolls into view.
══════════════════════════════════════ */
function StatItem({
  value,
  label,
  delay,
  counterTarget,
  counterSuffix = "",
}: {
  value: string;
  label: string;
  delay: number;
  counterTarget?: number;
  counterSuffix?: string;
}) {
  const [triggered, setTriggered] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (delay >= 9999) return;
    const t = setTimeout(() => {
      setTriggered(true);
      if (counterTarget !== undefined) {
        const duration = 1800;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setCount(Math.round(eased * counterTarget));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [delay, counterTarget]);

  const displayValue =
    counterTarget !== undefined && triggered
      ? `${count}${counterSuffix}`
      : value;

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden">
        <span
          className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter leading-none"
          style={{
            display: "inline-block",
            animation: triggered
              ? `charReveal 0.9s cubic-bezier(0.165,0.84,0.44,1) both`
              : "none",
            opacity: triggered ? undefined : 0,
          }}
        >
          {displayValue}
        </span>
      </div>
      <div className="overflow-hidden">
        <span
          className="text-sm text-[#8B7355] font-semibold uppercase tracking-widest"
          style={{
            display: "inline-block",
            animation: triggered
              ? `charReveal 0.9s cubic-bezier(0.165,0.84,0.44,1) 80ms both`
              : "none",
            opacity: triggered ? undefined : 0,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

const QUICK_TAGS = ["Lawn", "Chiffon", "Embroidered", "Casual", "Formal", "Pret"];

const HERO_PLACEHOLDERS = [
  "embroidered lawn suit in soft pastels…",
  "something elegant for a formal dinner…",
  "wide-leg trousers in earthy tones…",
  "a casual chiffon dupatta set under $80…",
  "stitched pret kurta for everyday wear…",
];

/* ══════════════════════════════════════
   Hero search card — glass panel with
   textarea, quicktags and submit CTA
══════════════════════════════════════ */
function HeroSearchCard({ onSubmit }: { onSubmit: (q: string) => void }) {
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
        background: "#E8E1D7",
        border: focused
          ? "1.5px solid rgba(196,168,130,0.60)"
          : "1.5px solid rgba(0,0,0,0.08)",
        boxShadow: focused
          ? "0 0 0 4px rgba(196,168,130,0.12), 0 24px 48px rgba(0,0,0,0.10)"
          : "0 2px 20px rgba(0,0,0,0.07)",
      }}
    >
      {/* Eyebrow + gender toggle */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles size={12} style={{ color: "#C4A882" }} />
          <span
            className="text-[9px] font-black tracking-[0.24em] uppercase"
            style={{ color: "#8B7355" }}
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
                  background: g === "Women" ? "#1A1A1A" : "transparent",
                  color: g === "Women" ? "white" : "#9B9B9B",
                  boxShadow: g === "Women" ? "0 2px 6px rgba(0,0,0,0.25)" : "none",
                }}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Coming Soon toast */}
          <AnimatePresence>
            {comingSoon && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute right-0 top-full mt-2 flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-[11px] font-bold"
                style={{
                  background: "#1A1A1A",
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

      {/* Textarea with floating placeholder */}
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
          style={{ color: "#1A1A1A", caretColor: "#C4A882" }}
        />
      </div>

      {/* Divider */}
      <div className="mb-4" style={{ height: 1, background: "rgba(0,0,0,0.07)" }} />

      {/* Quick-style chips */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className="text-[9.5px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all duration-200 hover:bg-[#1A1A1A] hover:text-white active:scale-95"
            style={{ background: "rgba(0,0,0,0.055)", color: "#555555" }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Submit — dual-text slide on hover (inline approach avoids CSS cascade issues) */}
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
          background: hasValue ? "#1A1A1A" : "rgba(0,0,0,0.07)",
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
          <Sparkles size={12} style={{ color: hasValue ? "#C4A882" : "#CCCCCC" }} />
          Find my style
          <ArrowRight size={12} style={{ opacity: hasValue ? 1 : 0.4 }} />
        </span>
        <span style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          transform: btnHovered ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.6s cubic-bezier(0.165,0.84,0.44,1)",
        }}>
          <Sparkles size={12} style={{ color: "#C4A882" }} />
          Find my style
          <ArrowRight size={12} />
        </span>
      </button>
    </div>
  );
}

/* ── Brand monogram palette ─────────────────────────────────── */
const BRAND_STYLE: Record<
  string,
  { bg: string; text: string; mono: string; tag: string }
> = {
  "Sana Safinaz":    { bg: "#E6EEE3", text: "#3D6138", mono: "SS",  tag: "Luxury Pret" },
  "Alkaram Studio":  { bg: "#F0E8DF", text: "#7A5540", mono: "AS",  tag: "Lawn & Casuals" },
  "Gul Ahmed":       { bg: "#F5EDD8", text: "#8A6010", mono: "GA",  tag: "Heritage Fabrics" },
  "Nishat Linen":    { bg: "#DDE7F0", text: "#25527A", mono: "NL",  tag: "Premium Basics" },
  "Maria B":         { bg: "#F0E2E2", text: "#7A3535", mono: "MB",  tag: "Luxury Formal" },
  Limelight:         { bg: "#E2F0E6", text: "#28663E", mono: "LL",  tag: "Everyday Pret" },
  Generation:        { bg: "#F0E6DE", text: "#8B3E12", mono: "GN",  tag: "Sustainable Fashion" },
  "Bonanza Satrangi":{ bg: "#EDE2F0", text: "#652A7A", mono: "BS",  tag: "Colorful Pret" },
  ONE:               { bg: "#E8E8E8", text: "#2A2A2A", mono: "ONE", tag: "Contemporary" },
  Engine:            { bg: "#DDE2F0", text: "#1E3575", mono: "ENG", tag: "Urban Fashion" },
};

/* ══════════════════════════════════════
   Brand card — horizontal layout with
   monogram tile + magnetic tilt on hover
══════════════════════════════════════ */
function BrandCard({
  brand,
  delay,
  visible,
  onSearch,
}: {
  brand: { name: string; domain: string; url: string };
  delay: number;
  visible: boolean;
  onSearch: (q: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  /* 7. MAGNETIC on brand cards */
  const [mag, setMag] = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const style = BRAND_STYLE[brand.name] ?? {
    bg: "#EDE8E0", text: "#6B5540", mono: brand.name[0], tag: "Fashion Brand",
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMag({
      x: (e.clientX - (r.left + r.width / 2)) * 0.14,
      y: (e.clientY - (r.top + r.height / 2)) * 0.14,
    });
    setHovered(true);
  };
  const onMouseLeave = () => { setHovered(false); setMag({ x: 0, y: 0 }); };

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "transform 0.55s, opacity 0.55s",
        transitionDelay: visible ? `${delay}ms` : "0ms",
      }}
    >
      <button
        ref={btnRef}
        onClick={() => onSearch(brand.name)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative flex flex-row items-center w-full rounded-2xl overflow-hidden text-left gap-3"
        style={{
          background: hovered ? "#EDEAE4" : "#E8E3DC",
          border: hovered ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(0,0,0,0.06)",
          boxShadow: hovered ? "0 10px 32px rgba(0,0,0,0.10)" : "0 2px 8px rgba(0,0,0,0.05)",
          padding: "10px 12px 10px 10px",
          transform: `translate(${mag.x}px, ${hovered ? mag.y - 3 : 0}px)`,
          transition: "background 0.2s, box-shadow 0.2s, border 0.2s, transform 0.35s cubic-bezier(0.165,0.84,0.44,1)",
        }}
      >
        {/* Monogram tile */}
        <div
          className="shrink-0 flex items-center justify-center rounded-xl"
          style={{
            width: 52, height: 52, background: "#1A1A1A",
            boxShadow: hovered ? "0 6px 18px rgba(0,0,0,0.30)" : "0 3px 10px rgba(0,0,0,0.20)",
            transition: "box-shadow 0.2s",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontStyle: "italic", fontWeight: 700,
              fontSize: style.mono.length > 2 ? "11px" : "18px",
              letterSpacing: "0.02em", color: style.bg,
            }}
          >
            {style.mono}
          </span>
        </div>

        {/* Text block */}
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="font-black uppercase leading-tight truncate"
            style={{ fontSize: "9.5px", letterSpacing: "0.10em", color: "#1A1A1A" }}
          >
            {brand.name}
          </span>
          <span
            className="font-semibold uppercase truncate mt-0.5"
            style={{ fontSize: "7.5px", letterSpacing: "0.14em", color: "#9B8B75" }}
          >
            {style.tag}
          </span>

          {/* Show results pill */}
          <div
            style={{
              marginTop: hovered ? 6 : 0,
              maxHeight: hovered ? 20 : 0,
              opacity: hovered ? 1 : 0,
              overflow: "hidden",
              transition: "opacity 0.18s ease, max-height 0.18s ease, margin-top 0.18s ease",
            }}
          >
            <span
              className="inline-block px-2.5 py-0.5 rounded-full font-bold uppercase"
              style={{
                fontSize: "7px", letterSpacing: "0.12em",
                background: "#1A1A1A", color: "#ffffff", whiteSpace: "nowrap",
              }}
            >
              Show results →
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════
   Landing page
══════════════════════════════════════ */
export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [edits, setEdits] = useState<Edit[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const statsReveal  = useScrollReveal(0.1);
  const editsReveal  = useScrollReveal(0.04);
  const brandsReveal = useScrollReveal(0.06);

  /* 8. HERO TEXT PARALLAX — rAF direct DOM, no re-renders */
  const heroTextRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (heroTextRef.current) {
          heroTextRef.current.style.transform = `translateY(${window.scrollY * -0.06}px)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, []);

  /* 7. SIGN-IN BUTTON MAGNETIC */
  const signInRef = useRef<HTMLButtonElement>(null);
  const [signInMag, setSignInMag] = useState({ x: 0, y: 0 });
  const onSignInMove = (e: React.MouseEvent) => {
    const el = signInRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSignInMag({
      x: (e.clientX - (r.left + r.width / 2)) * 0.28,
      y: (e.clientY - (r.top + r.height / 2)) * 0.28,
    });
  };
  const onSignInLeave = () => setSignInMag({ x: 0, y: 0 });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    getEdits().then(setEdits).catch(() => {});
  }, []);

  const handleSearch   = (text: string) => router.push(`/results?q=${encodeURIComponent(text)}`);
  const handleEditTap  = (edit: Edit)   => router.push(`/results?q=${encodeURIComponent(edit.label)}`);

  return (
    <div className="relative bg-[#F2EDE4] overflow-x-hidden">

      {/* ── Global motion layers ── */}
      <ScrollProgressBar />
      <CursorGlow />
      <PageEnterTransition />
      <AmbientOrbs />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* ── NAV ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <div
          className="transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-12px)",
          }}
        >
          <Logo size="md" />
        </div>
        <div
          className="flex items-center gap-3 transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-12px)",
            transitionDelay: "80ms",
          }}
        >
          {user ? (
            <button
              onClick={() => setAuthOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-xs transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "#1A1A1A" }}
              title={user.email}
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                [user.first_name, user.last_name]
                  .filter(Boolean).map((n) => n[0]).join("").toUpperCase() || user.email[0].toUpperCase()
              )}
            </button>
          ) : (
            /* 7. Sign-in button with magnetic pull */
            <button
              ref={signInRef}
              onClick={() => setAuthOpen(true)}
              onMouseMove={onSignInMove}
              onMouseLeave={onSignInLeave}
              className="btn-dual text-[11px] font-black tracking-wide uppercase"
              style={{
                border: "1.5px solid #1A1A1A",
                color: "#1A1A1A",
                letterSpacing: "0.08em",
                height: "34px",
                width: "80px",
                transform: `translate(${signInMag.x}px, ${signInMag.y}px)`,
                transition: "transform 0.4s cubic-bezier(0.165,0.84,0.44,1)",
              }}
            >
              <span className="txt-a">Sign in</span>
              <span className="txt-b" style={{ background: "#1A1A1A", color: "white" }}>Sign in</span>
            </button>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO — split: headline left · search right
      ══════════════════════════════════════ */}
      <section className="relative z-10 min-h-[88vh] flex items-center px-6 md:px-12 max-w-7xl mx-auto py-12">
        <div className="w-full grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── LEFT: badge + headline + subtext — 8. PARALLAX ── */}
          <div ref={heroTextRef} style={{ willChange: "transform" }}>
            {/* AI badge */}
            <div
              className="mb-7 transition-all duration-700"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(-8px)",
                transitionDelay: "150ms",
              }}
            >
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 animate-pulse-glow">
                <Sparkles size={12} className="text-[#8B7355]" />
                <span className="text-[10px] font-bold text-[#1A1A1A] tracking-widest uppercase">
                  AI-Powered Fashion Discovery
                </span>
              </div>
            </div>

            {/* Headline — char-by-char clip reveal */}
            <h1
              className="font-black text-[#1A1A1A] leading-[0.93] tracking-[-0.04em] mb-7"
              style={{ fontSize: "clamp(3rem, 6.5vw, 5.6rem)" }}
            >
              <span className="block"><CharReveal text="Shop with" baseDelay={180} /></span>
              <span className="block"><CharReveal text="words," baseDelay={460} /></span>
              <span className="block" style={{ color: "#8B8B8B" }}>
                <CharReveal text="not filters." baseDelay={700} />
              </span>
            </h1>

            {/* Subline */}
            <p className="text-[#6B6B6B] text-base leading-relaxed max-w-[360px] mb-7">
              <WordReveal
                text="Describe what you're looking for in plain English — our AI finds perfect pieces from Pakistan's finest brands instantly."
                baseDelay={1050}
              />
            </p>

            {/* Fashion image strip */}
            <div
              className="flex gap-2.5 mt-8 transition-all duration-700"
              style={{ opacity: mounted ? 1 : 0, transitionDelay: "900ms" }}
            >
              {[
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=280&fit=crop",
                "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=200&h=280&fit=crop",
                "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200&h=280&fit=crop",
              ].map((url, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-2xl flex-1"
                  style={{
                    aspectRatio: "3/4",
                    maxWidth: 130,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 0.6s ease ${900 + i * 80}ms, transform 0.6s cubic-bezier(0.19,1,0.22,1) ${900 + i * 80}ms`,
                  }}
                >
                  <Image
                    src={url}
                    alt="Fashion"
                    fill
                    className="object-cover"
                    sizes="130px"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Scroll hint */}
            <div
              className="hidden md:flex items-center gap-2 mt-6 transition-all duration-700"
              style={{ opacity: mounted ? 0.45 : 0, transitionDelay: "1100ms" }}
            >
              <div className="w-px h-6 bg-gradient-to-b from-[#AAAAAA] to-transparent" />
              <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#AAAAAA]">
                Scroll to explore
              </span>
            </div>
          </div>

          {/* ── RIGHT: 6. 3D tilt card ── */}
          <div
            className="transition-all duration-700"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(28px)",
              transitionDelay: "420ms",
            }}
          >
            <CardTilt>
              <HeroSearchCard onSubmit={handleSearch} />
            </CardTilt>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS — 5. animated number counters
      ══════════════════════════════════════ */}
      <section
        className="relative z-10 py-24 px-6 md:px-12 border-t border-b border-[#E0DDD6]"
        ref={statsReveal.ref}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            <StatItem value="500+"  label="Brands"      delay={statsReveal.visible ? 0   : 9999} counterTarget={500} counterSuffix="+" />
            <StatItem value="50K+"  label="Products"    delay={statsReveal.visible ? 120 : 9999} counterTarget={50}  counterSuffix="K+" />
            <StatItem value="< 2s"  label="Search time" delay={statsReveal.visible ? 240 : 9999} />
            <StatItem value="100%"  label="Curated"     delay={statsReveal.visible ? 360 : 9999} counterTarget={100} counterSuffix="%" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MARQUEE
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-8 overflow-hidden bg-[#1A1A1A]">
        <div className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#666] text-center mb-4">
          Featured brands
        </div>
        <MarqueeBrands dark />
      </section>

      {/* ══════════════════════════════════════
          BRANDS SHOWCASE — 5×2 clickable grid
      ══════════════════════════════════════ */}
      <section
        className="relative z-10 py-24 px-6 md:px-12"
        ref={brandsReveal.ref}
      >
        <div className="max-w-7xl mx-auto">
          <ScrollHeading
            eyebrow="Our brands"
            title="Pakistan's finest fashion"
            visible={brandsReveal.visible}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-10">
            {BRAND_LIST.map((brand, i) => (
              <BrandCard
                key={brand.name}
                brand={brand}
                delay={i * 55}
                visible={brandsReveal.visible}
                onSearch={handleSearch}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CURATED EDITS
      ══════════════════════════════════════ */}
      <section
        className="relative z-10 py-24 px-6 md:px-12 bg-[#1A1A1A]"
        ref={editsReveal.ref}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <ScrollHeading
              eyebrow="Curated edits"
              title="Trending right now"
              light
              visible={editsReveal.visible}
            />
            <span
              className="text-xs text-[#666] font-semibold uppercase tracking-widest hidden md:block"
              style={{
                opacity: editsReveal.visible ? 1 : 0,
                transition: "opacity 0.7s 0.4s",
              }}
            >
              Updated weekly
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {edits.map((edit, i) => (
              <div
                key={edit.label}
                className="transition-all duration-700"
                style={{
                  opacity: editsReveal.visible ? 1 : 0,
                  transform: editsReveal.visible
                    ? "translateY(0) scale(1)"
                    : "translateY(40px) scale(0.96)",
                  transitionDelay: `${i * 65}ms`,
                }}
              >
                <EditCard edit={edit} onTap={handleEditTap} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-[#E0DDD6] py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-sm text-[#AAAAAA]">· Fashion discovery, reimagined</span>
          </div>
          <span className="text-xs text-[#AAAAAA]">© 2025 Browse AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
