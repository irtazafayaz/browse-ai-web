'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
        className="animate-float absolute rounded-full opacity-20 blur-3xl"
        style={{ width: 520, height: 520, top: '-10%', left: '-8%', background: 'radial-gradient(circle, #c9b99a 0%, transparent 70%)' }}
      />
      <div
        className="animate-float-delayed absolute rounded-full opacity-15 blur-3xl"
        style={{ width: 400, height: 400, top: '30%', right: '-6%', background: 'radial-gradient(circle, #b5a48c 0%, transparent 70%)' }}
      />
      <div
        className="animate-float-slow absolute rounded-full opacity-10 blur-3xl"
        style={{ width: 300, height: 300, bottom: '10%', left: '20%', background: 'radial-gradient(circle, #d4c4aa 0%, transparent 70%)' }}
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
      className="flex flex-col items-center gap-1 transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}
    >
      <div className="w-9 h-9 rounded-xl bg-[#1A1A1A]/8 flex items-center justify-center mb-1">
        <Icon size={16} className="text-[#1A1A1A]" />
      </div>
      <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">{value}</span>
      <span className="text-xs text-[#6B6B6B] font-medium text-center leading-tight">{label}</span>
    </div>
  );
}

/* ─── Suggestion chip ─── */
function SuggestionChip({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150"
      style={{
        background: hovered ? '#1A1A1A' : 'white',
        color: hovered ? 'white' : '#1A1A1A',
        borderColor: hovered ? '#1A1A1A' : '#E0DDD6',
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

export default function LandingPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setBadgeVisible(true), 100);
    const t2 = setTimeout(() => setVisible(true), 350);
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
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <span className="font-bold text-[#1A1A1A] text-base tracking-tight">Browse AI</span>
        </div>
        <GenderToggle />
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-12 pb-10 max-w-3xl mx-auto">
        {/* Badge */}
        <div
          className="transition-all duration-500 mb-6"
          style={{ opacity: badgeVisible ? 1 : 0, transform: badgeVisible ? 'translateY(0)' : 'translateY(-10px)' }}
        >
          <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-[#E0DDD6] rounded-full px-4 py-1.5 text-xs font-semibold text-[#1A1A1A]">
            <Sparkles size={12} className="text-[#8B7355]" />
            AI-Powered Fashion Discovery
          </div>
        </div>

        {/* Headline */}
        <h1
          className="transition-all duration-700 font-bold text-[#1A1A1A] tracking-tight leading-tight mb-4"
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          Shop with words,<br />
          <span className="text-[#8B7355]">not filters.</span>
        </h1>

        {/* Subheading */}
        <p
          className="text-[#6B6B6B] text-base leading-relaxed max-w-md mb-8 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '100ms',
          }}
        >
          Describe what you're looking for in plain English. Our AI finds the perfect pieces from 500+ brands — instantly.
        </p>

        {/* Search bar */}
        <div
          className="w-full transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '200ms',
          }}
        >
          <SearchBar onSubmit={handleSearch} />
        </div>

        {/* Suggestions */}
        <div
          className="flex flex-wrap gap-2 justify-center mt-4 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transitionDelay: '350ms',
          }}
        >
          {SUGGESTIONS.map(s => (
            <SuggestionChip key={s} label={s} onClick={() => handleSearch(s)} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-xl mx-auto px-6 py-6">
        <div className="bg-white/70 backdrop-blur-sm border border-[#E0DDD6] rounded-2xl px-8 py-5 grid grid-cols-4 gap-4">
          <StatCard icon={Star} value="500+" label="Brands" delay={500} />
          <StatCard icon={Zap} value="50K+" label="Products" delay={620} />
          <StatCard icon={Sparkles} value="AI" label="Powered" delay={740} />
          <StatCard icon={ShieldCheck} value="100%" label="Curated" delay={860} />
        </div>
      </section>

      {/* Marquee */}
      <section className="relative z-10 py-4 overflow-hidden">
        <div className="text-[10px] font-bold tracking-widest uppercase text-[#AAAAAA] text-center mb-2">Featured brands</div>
        <MarqueeBrands />
      </section>

      {/* Curated Edits */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-16">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-bold text-[#1A1A1A] text-xl tracking-tight">Curated edits</h2>
          <span className="text-xs text-[#6B6B6B] font-medium">Updated weekly</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {curatedEdits.map((edit, i) => (
            <div
              key={edit.label}
              className="transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: `${400 + i * 80}ms`,
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
