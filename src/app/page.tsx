'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Zap, ShieldCheck, Star } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import MarqueeBrands from '@/components/MarqueeBrands';
import EditCard from '@/components/EditCard';
import GenderToggle from '@/components/GenderToggle';
import { curatedEdits } from '@/lib/mockData';
import { Edit } from '@/lib/types';

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
   Fancy pill button
══════════════════════════════════════ */
function FancyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="btn-fancy group inline-flex items-center gap-2 border border-[#1A1A1A] rounded-full px-6 py-3 text-sm font-semibold text-[#1A1A1A]"
    >
      <span>{label}</span>
      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
    </button>
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

/* ══════════════════════════════════════
   Feature row item
══════════════════════════════════════ */
function FeatureRow({ icon: Icon, title, desc, delay, visible }: {
  icon: React.ElementType; title: string; desc: string; delay: number; visible: boolean;
}) {
  return (
    <div
      className="flex items-start gap-5 py-7 border-b border-[#E0DDD6] group transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-24px)', transitionDelay: `${delay}ms` }}
    >
      <div className="w-11 h-11 rounded-2xl bg-[#1A1A1A]/6 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-[#1A1A1A] group-hover:scale-110">
        <Icon size={18} className="text-[#1A1A1A] transition-colors duration-300 group-hover:text-white" />
      </div>
      <div>
        <p className="font-bold text-[#1A1A1A] text-base mb-1">{title}</p>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Suggestion chip
══════════════════════════════════════ */
function SuggestionChip({ label, onClick, delay }: { label: string; onClick: () => void; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <button
      onClick={onClick}
      className="btn-fancy border border-[#D4C4A8] rounded-full px-4 py-2 text-sm font-medium text-[#1A1A1A] transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)' }}
    >
      <span>{label}</span>
    </button>
  );
}

const SUGGESTIONS = ['baggy jeans 🛍️', 'maroon pants 🍷', 'wide leg cargo ✨', 'elevated basics 🎯', 'straight leg under $100 💫'];

/* ══════════════════════════════════════
   Landing page
══════════════════════════════════════ */
export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const statsReveal = useScrollReveal(0.1);
  const featuresReveal = useScrollReveal(0.08);
  const editsReveal = useScrollReveal(0.04);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSearch = (text: string) => router.push(`/results?q=${encodeURIComponent(text)}`);
  const handleEditTap = (edit: Edit) => router.push(`/results?q=${encodeURIComponent(edit.label)}`);

  return (
    <div className="relative bg-[#F2EDE4] overflow-x-hidden">
      <AmbientOrbs />

      {/* ── NAV ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <div
          className="flex items-center gap-2.5 transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-12px)' }}
        >
          <div className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center">
            <span className="text-white text-sm font-black tracking-tighter">B</span>
          </div>
          <span className="font-black text-[#1A1A1A] text-lg tracking-tight">Browse AI</span>
        </div>
        <div
          className="flex items-center gap-4 transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-12px)', transitionDelay: '80ms' }}
        >
          <GenderToggle />
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO — full viewport
      ══════════════════════════════════════ */}
      <section className="relative z-10 min-h-[92vh] flex flex-col justify-center px-6 md:px-12 max-w-7xl mx-auto pt-8 pb-20">

        {/* AI badge */}
        <div
          className="mb-8 transition-all duration-600"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-8px)', transitionDelay: '150ms' }}
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 animate-pulse-glow">
            <Sparkles size={13} className="text-[#8B7355]" />
            <span className="text-xs font-bold text-[#1A1A1A] tracking-wide uppercase">AI-Powered Fashion Discovery</span>
          </div>
        </div>

        {/* Giant headline */}
        <h1
          className="font-black text-[#1A1A1A] leading-[0.95] tracking-[-0.04em] mb-8"
          style={{ fontSize: 'clamp(3.8rem, 9vw, 8rem)' }}
        >
          <span className="block">
            <WordReveal text="Shop with" baseDelay={200} />
          </span>
          <span className="block">
            <span className="clip-wrap">
              <span className="word-reveal gradient-text" style={{ animationDelay: '340ms' }}>words,</span>
            </span>
          </span>
          <span className="block text-[#8B8B8B]">
            <WordReveal text="not filters." baseDelay={450} />
          </span>
        </h1>

        {/* Two-col: subtext left, search right */}
        <div className="grid md:grid-cols-2 gap-10 items-end">
          <div>
            <p
              className="text-[#6B6B6B] text-lg leading-relaxed max-w-sm mb-8 transition-all duration-700"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transitionDelay: '620ms' }}
            >
              Describe what you&apos;re looking for in plain English. Our AI finds perfect pieces from 500+ brands — instantly.
            </p>
            <div
              className="flex flex-wrap gap-2 transition-all duration-700"
              style={{ opacity: mounted ? 1 : 0, transitionDelay: '720ms' }}
            >
              {SUGGESTIONS.map((s, i) => (
                <SuggestionChip key={s} label={s} onClick={() => handleSearch(s)} delay={760 + i * 60} />
              ))}
            </div>
          </div>

          <div
            className="transition-all duration-700"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)', transitionDelay: '550ms' }}
          >
            <SearchBar onSubmit={handleSearch} maxWidth={9999} />
            <p className="text-xs text-[#AAAAAA] mt-3 pl-1">Try: "oversized blazer in earth tones under $200"</p>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700"
          style={{ opacity: mounted ? 0.5 : 0, transitionDelay: '1200ms' }}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#AAAAAA]">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#AAAAAA] to-transparent" />
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
          FEATURES — editorial two-col layout
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-6 md:px-12 max-w-7xl mx-auto" ref={featuresReveal.ref}>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: big label + headline */}
          <div>
            <div
              className="inline-block text-[10px] font-black tracking-[0.25em] uppercase text-[#8B7355] mb-6 transition-all duration-700"
              style={{ opacity: featuresReveal.visible ? 1 : 0, transform: featuresReveal.visible ? 'translateY(0)' : 'translateY(16px)' }}
            >
              Why Browse AI
            </div>
            <h2
              className="font-black text-[#1A1A1A] leading-[1.0] tracking-[-0.03em] mb-4 transition-all duration-700"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', opacity: featuresReveal.visible ? 1 : 0, transform: featuresReveal.visible ? 'translateY(0)' : 'translateY(24px)', transitionDelay: '80ms' }}
            >
              Fashion discovery,<br />
              <span className="gradient-text">reimagined.</span>
            </h2>
            <p
              className="text-[#6B6B6B] leading-relaxed text-base max-w-sm transition-all duration-700"
              style={{ opacity: featuresReveal.visible ? 1 : 0, transitionDelay: '160ms' }}
            >
              No more endless filtering. Just tell us what you want — the way you&apos;d tell a personal stylist.
            </p>
            <div className="mt-10 transition-all duration-700" style={{ opacity: featuresReveal.visible ? 1 : 0, transitionDelay: '240ms' }}>
              <FancyButton label="Try it now" onClick={() => document.querySelector('input')?.focus()} />
            </div>
          </div>

          {/* Right: feature rows */}
          <div>
            <FeatureRow icon={Sparkles} title="Natural language search" desc="Type exactly how you think. 'Maroon wide-leg pants under $150' — done." delay={0} visible={featuresReveal.visible} />
            <FeatureRow icon={Zap} title="Instant results" desc="AI-powered matching returns curated picks in under 2 seconds." delay={80} visible={featuresReveal.visible} />
            <FeatureRow icon={Star} title="500+ brand catalogue" desc="From luxury to high-street — one search covers everything." delay={160} visible={featuresReveal.visible} />
            <FeatureRow icon={ShieldCheck} title="100% human-curated brands" desc="Every brand is vetted. No dropshippers, no dupes." delay={240} visible={featuresReveal.visible} />
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
            {curatedEdits.map((edit, i) => (
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
          CTA BANNER
      ══════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-6 md:px-12 overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(circle, #c4a882 0%, transparent 70%)', opacity: 0.2 }} />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-[#8B7355] mb-6">Ready to shop smarter?</p>
          <h2
            className="font-black text-[#1A1A1A] leading-[1.0] tracking-[-0.04em] mb-8"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}
          >
            Find your<br />
            <span className="gradient-text">perfect fit.</span>
          </h2>
          <p className="text-[#6B6B6B] text-base mb-10 max-w-sm mx-auto leading-relaxed">
            Join thousands of shoppers who have ditched the filters for good.
          </p>
          <SearchBar onSubmit={handleSearch} maxWidth={560} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-[#E0DDD6] py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center">
              <span className="text-white text-[10px] font-black">B</span>
            </div>
            <span className="text-sm font-bold text-[#1A1A1A]">Browse AI</span>
            <span className="text-sm text-[#AAAAAA]">· Fashion discovery, reimagined</span>
          </div>
          <span className="text-xs text-[#AAAAAA]">© 2025 Browse AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
