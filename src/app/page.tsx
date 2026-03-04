'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import MarqueeBrands, { BRAND_LIST } from '@/components/MarqueeBrands';
import Logo from '@/components/Logo';
import EditCard from '@/components/EditCard';
import GenderToggle from '@/components/GenderToggle';
import { getEdits } from '@/lib/api';
import { Edit } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import AuthModal from '@/components/AuthModal';

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
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ══════════════════════════════════════
   Word-by-word stagger reveal
══════════════════════════════════════ */
function WordReveal({ text, baseDelay = 0, className = '' }: { text: string; baseDelay?: number; className?: string }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span key={i} className="clip-wrap">
          <span
            className={`word-reveal ${className}`}
            style={{ animationDelay: `${baseDelay + i * 80}ms` }}
          >
            {word}{i < text.split(' ').length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </>
  );
}

/* ══════════════════════════════════════
   Ambient orbs
══════════════════════════════════════ */
function AmbientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-float absolute rounded-full blur-[120px]"
        style={{ width: 700, height: 700, top: '-20%', left: '-15%', background: 'radial-gradient(circle, #d4b896 0%, transparent 70%)', opacity: 0.35 }} />
      <div className="animate-float-delayed absolute rounded-full blur-[100px]"
        style={{ width: 500, height: 500, top: '20%', right: '-10%', background: 'radial-gradient(circle, #b5a08a 0%, transparent 70%)', opacity: 0.22 }} />
      <div className="animate-float-slow absolute rounded-full blur-[80px]"
        style={{ width: 380, height: 380, bottom: '5%', left: '30%', background: 'radial-gradient(circle, #e2ceb0 0%, transparent 70%)', opacity: 0.18 }} />
    </div>
  );
}

/* ══════════════════════════════════════
   Stat item
══════════════════════════════════════ */
function StatItem({ value, label, delay }: { value: string; label: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="flex flex-col gap-1 transition-all duration-700" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)' }}>
      <span className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter leading-none">{value}</span>
      <span className="text-sm text-[#8B7355] font-semibold uppercase tracking-widest">{label}</span>
    </div>
  );
}

const QUICK_TAGS = ['Lawn', 'Chiffon', 'Embroidered', 'Casual', 'Formal', 'Pret'];

const HERO_PLACEHOLDERS = [
  'embroidered lawn suit in soft pastels…',
  'something elegant for a formal dinner…',
  'wide-leg trousers in earthy tones…',
  'a casual chiffon dupatta set under $80…',
  'stitched pret kurta for everyday wear…',
];

/* ══════════════════════════════════════
   Hero search card — glass panel with
   textarea, quicktags and submit CTA
══════════════════════════════════════ */
function HeroSearchCard({ onSubmit }: { onSubmit: (q: string) => void }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [phIdx, setPhIdx] = useState(0);
  const [phVisible, setPhVisible] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setInterval(async () => {
      if (focused || value) return;
      setPhVisible(false);
      await new Promise(r => setTimeout(r, 300));
      setPhIdx(i => (i + 1) % HERO_PLACEHOLDERS.length);
      setPhVisible(true);
    }, 3400);
    return () => clearInterval(t);
  }, [focused, value]);

  const submit = () => { if (value.trim()) onSubmit(value.trim()); };

  const addTag = (tag: string) => {
    setValue(v => v ? `${v}, ${tag.toLowerCase()}` : tag.toLowerCase());
    textareaRef.current?.focus();
  };

  const hasValue = value.trim().length > 0;

  return (
    <div
      className="rounded-3xl p-7 transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.76)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: focused
          ? '1.5px solid rgba(196,168,130,0.70)'
          : '1.5px solid rgba(0,0,0,0.07)',
        boxShadow: focused
          ? '0 0 0 4px rgba(196,168,130,0.14), 0 32px 64px rgba(0,0,0,0.12)'
          : '0 4px 36px rgba(0,0,0,0.10)',
      }}
    >
      {/* Eyebrow */}
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={12} style={{ color: '#C4A882' }} />
        <span className="text-[9px] font-black tracking-[0.24em] uppercase" style={{ color: '#8B7355' }}>
          Describe your style
        </span>
      </div>

      {/* Textarea with floating placeholder */}
      <div className="relative mb-5" style={{ minHeight: 80 }}>
        {!focused && !value && (
          <span
            className="absolute top-0 left-0 text-sm leading-relaxed italic pointer-events-none"
            style={{
              color: '#BBBBBB',
              opacity: phVisible ? 1 : 0,
              transform: phVisible ? 'translateY(0)' : 'translateY(-5px)',
              transition: 'opacity 0.28s ease, transform 0.28s ease',
            }}
          >
            {HERO_PLACEHOLDERS[phIdx]}
          </span>
        )}
        <textarea
          ref={textareaRef}
          rows={3}
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
          className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed"
          style={{ color: '#1A1A1A', caretColor: '#C4A882' }}
        />
      </div>

      {/* Divider */}
      <div className="mb-4" style={{ height: 1, background: 'rgba(0,0,0,0.07)' }} />

      {/* Quick-style chips */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {QUICK_TAGS.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className="text-[9.5px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all duration-200 hover:bg-[#1A1A1A] hover:text-white active:scale-95"
            style={{ background: 'rgba(0,0,0,0.055)', color: '#555555' }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={submit}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-black text-[11px] uppercase tracking-[0.12em] transition-all duration-250 active:scale-[0.98]"
        style={{
          background: hasValue ? '#1A1A1A' : 'rgba(0,0,0,0.07)',
          color: hasValue ? 'white' : '#AAAAAA',
          boxShadow: hasValue ? '0 8px 24px rgba(0,0,0,0.22)' : 'none',
        }}
      >
        <Sparkles size={12} style={{ color: hasValue ? '#C4A882' : '#CCCCCC' }} />
        Find my style
        <ArrowRight size={12} style={{ opacity: hasValue ? 1 : 0.4 }} />
      </button>
    </div>
  );
}

/* ── Brand monogram palette ─────────────────────────────────
   Each brand gets a unique earthy/fashion-house colour pair.
   bg  = tile background (idle)
   text = monogram text colour (idle)
   mono = abbreviation shown in the tile
─────────────────────────────────────────────────────────── */
const BRAND_STYLE: Record<string, { bg: string; text: string; mono: string }> = {
  'Sana Safinaz':     { bg: '#E6EEE3', text: '#3D6138', mono: 'SS' },
  'Alkaram Studio':   { bg: '#F0E8DF', text: '#7A5540', mono: 'AS' },
  'Gul Ahmed':        { bg: '#F5EDD8', text: '#8A6010', mono: 'GA' },
  'Nishat Linen':     { bg: '#DDE7F0', text: '#25527A', mono: 'NL' },
  'Maria B':          { bg: '#F0E2E2', text: '#7A3535', mono: 'MB' },
  'Limelight':        { bg: '#E2F0E6', text: '#28663E', mono: 'LL' },
  'Generation':       { bg: '#F0E6DE', text: '#8B3E12', mono: 'GN' },
  'Bonanza Satrangi': { bg: '#EDE2F0', text: '#652A7A', mono: 'BS' },
  'ONE':              { bg: '#E8E8E8', text: '#2A2A2A', mono: 'ONE' },
  'Engine':           { bg: '#DDE2F0', text: '#1E3575', mono: 'ENG' },
};

/* ══════════════════════════════════════
   Brand card for the showcase grid
══════════════════════════════════════ */
function BrandCard({
  brand, delay, visible, onSearch,
}: {
  brand: { name: string; domain: string; url: string };
  delay: number;
  visible: boolean;
  onSearch: (q: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const style = BRAND_STYLE[brand.name] ?? { bg: '#EDE8E0', text: '#6B5540', mono: brand.name[0] };

  return (
    <button
      onClick={() => onSearch(brand.name)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col items-center justify-center gap-3 rounded-2xl p-5 w-full text-center"
      style={{
        background: hovered ? '#1A1A1A' : 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(12px)',
        border: hovered ? '1.5px solid rgba(255,255,255,0.06)' : '1.5px solid rgba(0,0,0,0.06)',
        boxShadow: hovered
          ? '0 20px 48px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.10)'
          : '0 2px 12px rgba(0,0,0,0.06)',
        transform: visible
          ? hovered ? 'translateY(-6px) scale(1.03)' : 'translateY(0) scale(1)'
          : 'translateY(32px) scale(0.94)',
        opacity: visible ? 1 : 0,
        transition: 'background 0.25s, box-shadow 0.25s, border-color 0.25s, transform 0.6s, opacity 0.6s',
        transitionDelay: visible ? `${delay}ms` : '0ms',
      }}
    >
      {/* Monogram tile */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
        style={{
          background: hovered ? 'rgba(255,255,255,0.10)' : style.bg,
          boxShadow: hovered ? 'none' : `0 2px 8px ${style.bg}88`,
        }}
      >
        <span
          className="font-black leading-none transition-colors duration-300"
          style={{
            fontSize: style.mono.length > 2 ? '11px' : '15px',
            letterSpacing: '0.04em',
            color: hovered ? 'rgba(255,255,255,0.85)' : style.text,
          }}
        >
          {style.mono}
        </span>
      </div>

      {/* Brand name */}
      <span
        className="text-[10px] font-black uppercase tracking-[0.12em] leading-snug transition-colors duration-300"
        style={{ color: hovered ? 'rgba(255,255,255,0.90)' : '#1A1A1A' }}
      >
        {brand.name}
      </span>

      {/* Shop → on hover */}
      <span
        className="text-[9px] font-bold uppercase tracking-widest transition-all duration-300"
        style={{
          color: hovered ? '#C4A882' : 'transparent',
          transform: hovered ? 'translateY(0)' : 'translateY(5px)',
        }}
      >
        Shop →
      </span>
    </button>
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
  const statsReveal = useScrollReveal(0.1);
  const editsReveal = useScrollReveal(0.04);
  const brandsReveal = useScrollReveal(0.06);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { getEdits().then(setEdits).catch(() => {}); }, []);

  const handleSearch = (text: string) => router.push(`/results?q=${encodeURIComponent(text)}`);
  const handleEditTap = (edit: Edit) => router.push(`/results?q=${encodeURIComponent(edit.label)}`);

  return (
    <div className="relative bg-[#F2EDE4] overflow-x-hidden">
      <AmbientOrbs />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* ── NAV ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <div
          className="transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-12px)' }}
        >
          <Logo size="md" />
        </div>
        <div
          className="flex items-center gap-3 transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-12px)', transitionDelay: '80ms' }}
        >
          <GenderToggle />
          {user ? (
            /* Avatar button when logged in */
            <button
              onClick={() => setAuthOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-xs transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: '#1A1A1A' }}
              title={user.email}
            >
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                : ([user.first_name, user.last_name].filter(Boolean).map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase())
              }
            </button>
          ) : (
            /* Sign in button when guest */
            <button
              onClick={() => setAuthOpen(true)}
              className="px-4 py-2 text-[11px] font-black tracking-wide uppercase transition-all duration-200 hover:bg-[#1A1A1A] hover:text-white active:scale-95"
              style={{ border: '1.5px solid #1A1A1A', color: '#1A1A1A', letterSpacing: '0.08em' }}
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO — split: headline left · search right
      ══════════════════════════════════════ */}
      <section className="relative z-10 min-h-[88vh] flex items-center px-6 md:px-12 max-w-7xl mx-auto py-12">
        <div className="w-full grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── LEFT: badge + headline + subtext ── */}
          <div>
            {/* AI badge */}
            <div
              className="mb-7 transition-all duration-700"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-8px)', transitionDelay: '150ms' }}
            >
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 animate-pulse-glow">
                <Sparkles size={12} className="text-[#8B7355]" />
                <span className="text-[10px] font-bold text-[#1A1A1A] tracking-widest uppercase">AI-Powered Fashion Discovery</span>
              </div>
            </div>

            {/* Headline — 2 lines, tighter size so search stays above fold */}
            <h1
              className="font-black text-[#1A1A1A] leading-[0.93] tracking-[-0.04em] mb-7"
              style={{ fontSize: 'clamp(3rem, 6.5vw, 5.6rem)' }}
            >
              <span className="block">
                <WordReveal text="Shop with" baseDelay={200} />
              </span>
              <span className="block">
                <WordReveal text="words," baseDelay={310} />
              </span>
              <span className="block" style={{ color: '#8B8B8B' }}>
                <WordReveal text="not filters." baseDelay={420} />
              </span>
            </h1>

            {/* Subline */}
            <p
              className="text-[#6B6B6B] text-base leading-relaxed max-w-[360px] mb-7 transition-all duration-700"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transitionDelay: '580ms' }}
            >
              Describe what you&apos;re looking for in plain English — our AI finds perfect pieces from Pakistan&apos;s finest brands instantly.
            </p>

            {/* Scroll hint */}
            <div
              className="hidden md:flex items-center gap-2 transition-all duration-700"
              style={{ opacity: mounted ? 0.45 : 0, transitionDelay: '1000ms' }}
            >
              <div className="w-px h-6 bg-gradient-to-b from-[#AAAAAA] to-transparent" />
              <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#AAAAAA]">Scroll to explore</span>
            </div>
          </div>

          {/* ── RIGHT: glass search card ── */}
          <div
            className="transition-all duration-700"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(28px)', transitionDelay: '420ms' }}
          >
            <HeroSearchCard onSubmit={handleSearch} />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS — big bold numbers
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 md:px-12 border-t border-b border-[#E0DDD6]" ref={statsReveal.ref}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            <StatItem value="500+" label="Brands" delay={statsReveal.visible ? 0 : 9999} />
            <StatItem value="50K+" label="Products" delay={statsReveal.visible ? 120 : 9999} />
            <StatItem value="< 2s" label="Search time" delay={statsReveal.visible ? 240 : 9999} />
            <StatItem value="100%" label="Curated" delay={statsReveal.visible ? 360 : 9999} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MARQUEE
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-8 overflow-hidden bg-[#1A1A1A]">
        <div className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#666] text-center mb-4">Featured brands</div>
        <MarqueeBrands dark />
      </section>

      {/* ══════════════════════════════════════
          BRANDS SHOWCASE — 5×2 clickable grid
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 md:px-12" ref={brandsReveal.ref}>
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div
            className="mb-12 text-center transition-all duration-700"
            style={{
              opacity: brandsReveal.visible ? 1 : 0,
              transform: brandsReveal.visible ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <p className="text-[10px] font-black tracking-[0.28em] uppercase text-[#8B7355] mb-3">Our brands</p>
            <h2
              className="font-black text-[#1A1A1A] leading-tight tracking-[-0.03em]"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
            >
              Pakistan&apos;s finest fashion
            </h2>
            <p className="text-[#6B6B6B] text-sm mt-3 max-w-xs mx-auto leading-relaxed">
              Click any brand to explore their collection
            </p>
          </div>

          {/* 5-col grid — 2-col on mobile, 3 on tablet, 5 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
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
      <section className="relative z-10 py-24 px-6 md:px-12 bg-[#1A1A1A]" ref={editsReveal.ref}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div
            className="flex items-end justify-between mb-10 transition-all duration-700"
            style={{ opacity: editsReveal.visible ? 1 : 0, transform: editsReveal.visible ? 'translateY(0)' : 'translateY(20px)' }}
          >
            <div>
              <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#8B7355] mb-3">Curated edits</p>
              <h2
                className="font-black text-white leading-tight tracking-[-0.03em]"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
              >
                Trending right now
              </h2>
            </div>
            <span className="text-xs text-[#666] font-semibold uppercase tracking-widest hidden md:block">Updated weekly</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {edits.map((edit, i) => (
              <div
                key={edit.label}
                className="transition-all duration-700"
                style={{
                  opacity: editsReveal.visible ? 1 : 0,
                  transform: editsReveal.visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.96)',
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
