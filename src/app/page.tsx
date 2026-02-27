'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Sparkles, Zap, ShieldCheck, Star } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import MarqueeBrands from '@/components/MarqueeBrands';
import EditCard from '@/components/EditCard';
import GenderToggle from '@/components/GenderToggle';
import { curatedEdits } from '@/lib/mockData';
import { Edit } from '@/lib/types';

/* ─── Ambient orbs ─── */
function AmbientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="animate-float absolute rounded-full blur-3xl"
        style={{ width: 600, height: 600, top: '-15%', left: '-10%', background: 'radial-gradient(circle, #c9b99a 0%, transparent 70%)', opacity: 0.25 }}
      />
      <div
        className="animate-float-delayed absolute rounded-full blur-3xl"
        style={{ width: 450, height: 450, top: '25%', right: '-8%', background: 'radial-gradient(circle, #b5a48c 0%, transparent 70%)', opacity: 0.18 }}
      />
      <div
        className="animate-float-slow absolute rounded-full blur-3xl"
        style={{ width: 360, height: 360, bottom: '8%', left: '25%', background: 'radial-gradient(circle, #d4c4aa 0%, transparent 70%)', opacity: 0.12 }}
      />
      {/* Extra accent orb */}
      <div
        className="animate-float absolute rounded-full blur-2xl"
        style={{ width: 200, height: 200, top: '55%', left: '60%', background: 'radial-gradient(circle, #e8d5b7 0%, transparent 70%)', opacity: 0.10, animationDelay: '4s' }}
      />
    </div>
  );
}

/* ─── Animated stat card ─── */
function StatCard({ icon: Icon, value, label, delay }: { icon: React.ElementType; value: string; label: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="flex flex-col items-center gap-1.5 transition-all duration-700 group"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
    >
      <div className="w-10 h-10 rounded-xl bg-[#1A1A1A]/7 flex items-center justify-center mb-0.5 transition-all duration-300 group-hover:bg-[#1A1A1A]/12 group-hover:scale-110">
        <Icon size={17} className="text-[#1A1A1A]" />
      </div>
      <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">{value}</span>
      <span className="text-[11px] text-[#6B6B6B] font-medium text-center leading-tight">{label}</span>
    </div>
  );
}

/* ─── Suggestion chip ─── */
function SuggestionChip({ label, onClick, delay }: { label: string; onClick: () => void; delay: number }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200"
      style={{
        background: hovered ? '#1A1A1A' : 'rgba(255,255,255,0.85)',
        color: hovered ? 'white' : '#1A1A1A',
        borderColor: hovered ? '#1A1A1A' : '#E0DDD6',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.96)',
        backdropFilter: 'blur(8px)',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {label}
    </button>
  );
}

const SUGGESTIONS = [
  'baggy jeans 🛍️',
  'maroon pants 🍷',
  'wide leg cargo ✨',
  'elevated basics 🎯',
  'straight leg under $100 💫',
];

/* ─── Scroll reveal hook ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export default function LandingPage() {
  const router = useRouter();
  const [heroVisible, setHeroVisible] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(false);
  const statsReveal = useScrollReveal(0.1);
  const editsReveal = useScrollReveal(0.05);

  useEffect(() => {
    const t1 = setTimeout(() => setBadgeVisible(true), 80);
    const t2 = setTimeout(() => setHeroVisible(true), 280);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleSearch = (text: string) => {
    router.push(`/results?q=${encodeURIComponent(text)}`);
  };

  const handleEditTap = (edit: Edit) => {
    router.push(`/results?q=${encodeURIComponent(edit.label)}`);
  };

  return (
    <div className="relative min-h-screen bg-[#F7F5F0] overflow-x-hidden">
      <AmbientOrbs />

      {/* Nav */}
      <nav
        className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto animate-fade-in"
        style={{ animationDuration: '0.6s' }}
      >
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <span className="font-bold text-[#1A1A1A] text-base tracking-tight">Browse AI</span>
        </div>
        <GenderToggle />
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-10 pb-10 max-w-3xl mx-auto">
        {/* Badge */}
        <div
          className="transition-all duration-500 mb-6"
          style={{ opacity: badgeVisible ? 1 : 0, transform: badgeVisible ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.95)' }}
        >
          <div className="inline-flex items-center gap-1.5 glass border-[#E0DDD6]/60 rounded-full px-4 py-1.5 text-xs font-semibold text-[#1A1A1A] shadow-sm animate-pulse-glow">
            <Sparkles size={12} className="text-[#8B7355]" />
            AI-Powered Fashion Discovery
          </div>
        </div>

        {/* Headline */}
        <h1
          className="transition-all duration-700 font-bold text-[#1A1A1A] tracking-tight leading-[1.08] mb-4"
          style={{
            fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(28px)',
          }}
        >
          Shop with words,<br />
          <span className="gradient-text">not filters.</span>
        </h1>

        {/* Subheading */}
        <p
          className="text-[#6B6B6B] text-base leading-relaxed max-w-md mb-8 transition-all duration-700"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '120ms',
          }}
        >
          Describe what you&apos;re looking for in plain English. Our AI finds the perfect pieces from 500+ brands — instantly.
        </p>

        {/* Search bar */}
        <div
          className="w-full transition-all duration-700"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '230ms',
          }}
        >
          <SearchBar onSubmit={handleSearch} />
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 justify-center mt-5">
          {SUGGESTIONS.map((s, i) => (
            <SuggestionChip
              key={s}
              label={s}
              onClick={() => handleSearch(s)}
              delay={420 + i * 70}
            />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-xl mx-auto px-6 py-6" ref={statsReveal.ref}>
        <div
          className="glass border-[#E0DDD6]/50 rounded-2xl px-8 py-6 grid grid-cols-4 gap-4 shadow-xl shadow-black/5 transition-all duration-700"
          style={{ opacity: statsReveal.visible ? 1 : 0, transform: statsReveal.visible ? 'translateY(0)' : 'translateY(32px)' }}
        >
          <StatCard icon={Star}       value="500+" label="Brands"   delay={statsReveal.visible ? 100 : 9999} />
          <StatCard icon={Zap}        value="50K+" label="Products" delay={statsReveal.visible ? 220 : 9999} />
          <StatCard icon={Sparkles}   value="AI"   label="Powered"  delay={statsReveal.visible ? 340 : 9999} />
          <StatCard icon={ShieldCheck}value="100%" label="Curated"  delay={statsReveal.visible ? 460 : 9999} />
        </div>
      </section>

      {/* Marquee */}
      <section className="relative z-10 py-5 overflow-hidden">
        <div className="text-[10px] font-bold tracking-widest uppercase text-[#AAAAAA] text-center mb-3">Featured brands</div>
        <MarqueeBrands />
      </section>

      {/* Curated Edits */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-16" ref={editsReveal.ref}>
        <div
          className="flex items-baseline justify-between mb-6 transition-all duration-700"
          style={{ opacity: editsReveal.visible ? 1 : 0, transform: editsReveal.visible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <h2 className="font-bold text-[#1A1A1A] text-xl tracking-tight">Curated edits</h2>
          <span className="text-xs text-[#6B6B6B] font-medium">Updated weekly</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {curatedEdits.map((edit, i) => (
            <div
              key={edit.label}
              className="transition-all duration-700"
              style={{
                opacity: editsReveal.visible ? 1 : 0,
                transform: editsReveal.visible ? 'translateY(0)' : 'translateY(32px)',
                transitionDelay: `${i * 70}ms`,
              }}
            >
              <EditCard edit={edit} onTap={handleEditTap} />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#E0DDD6] py-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">B</span>
            </div>
            <span className="text-xs text-[#6B6B6B] font-medium">Browse AI · Fashion discovery, reimagined</span>
          </div>
          <span className="text-xs text-[#AAAAAA]">© 2025</span>
        </div>
      </footer>
    </div>
  );
}
