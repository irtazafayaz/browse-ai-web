"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import MarqueeBrands, { BRAND_LIST } from "@/components/MarqueeBrands";
import Logo from "@/components/Logo";
import EditCard from "@/components/EditCard";
import AuthModal from "@/components/AuthModal";
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";
import PageEnterTransition from "@/components/ui/PageEnterTransition";
import CardTilt from "@/components/ui/CardTilt";
import CharReveal from "@/components/ui/CharReveal";
import WordReveal from "@/components/ui/WordReveal";
import ScrollHeading from "@/components/ui/ScrollHeading";
import StatItem from "@/components/ui/StatItem";
import HeroSearchCard from "@/components/HeroSearchCard";
import BrandCard from "@/components/BrandCard";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";
import { getEdits } from "@/lib/api";
import { Edit } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [edits, setEdits] = useState<Edit[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const statsReveal = useScrollReveal(0.1);
  const editsReveal = useScrollReveal(0.04);
  const brandsReveal = useScrollReveal(0.06);

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
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

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
    getEdits()
      .then(setEdits)
      .catch(() => {});
  }, []);

  const handleSearch = (text: string) =>
    router.push(`/results?q=${encodeURIComponent(text)}`);
  const handleEditTap = (edit: Edit) =>
    router.push(`/results?q=${encodeURIComponent(edit.label)}`);

  return (
    <div className="relative bg-[var(--bg)] overflow-x-hidden">
      <ScrollProgressBar />
      <PageEnterTransition />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

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
          className="hidden md:flex items-center gap-7 transition-all duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-12px)",
            transitionDelay: "40ms",
          }}
        >
          {[
            { href: "/blog", label: "Blog" },
            { href: "/about", label: "About" },
            { href: "/faq", label: "FAQ" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[11px] font-black uppercase tracking-[0.14em] transition-colors duration-200 hover:opacity-60"
              style={{ color: "var(--ink)" }}
            >
              {label}
            </Link>
          ))}
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
              style={{ background: "var(--ink)" }}
              title={user.email}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                [user.first_name, user.last_name]
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || user.email[0].toUpperCase()
              )}
            </button>
          ) : (
            <button
              ref={signInRef}
              onClick={() => setAuthOpen(true)}
              onMouseMove={onSignInMove}
              onMouseLeave={onSignInLeave}
              className="btn-brutal text-[11px]"
              style={{
                height: "34px",
                width: "80px",
                transform: `translate(${signInMag.x}px, ${signInMag.y}px)`,
                transition: "transform 0.15s ease-out",
              }}
            >
              <span>Sign in</span>
            </button>
          )}
        </div>
      </nav>

      <section className="relative z-10 min-h-[88vh] flex items-center px-6 md:px-12 max-w-7xl mx-auto py-12">
        <div className="w-full grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div ref={heroTextRef} style={{ willChange: "transform" }}>
            <div
              className="mb-7 transition-all duration-700"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(-8px)",
                transitionDelay: "150ms",
              }}
            >
              <div className="inline-flex items-center gap-2 border-brutal shadow-brutal-sm px-4 py-2" style={{ background: 'var(--surface)' }}>
                <Sparkles size={12} style={{ color: "var(--accent)" }} />
                <span className="text-[10px] font-bold text-[var(--ink)] tracking-widest uppercase">
                  AI-Powered Fashion Discovery
                </span>
              </div>
            </div>

            <h1
              className="font-display text-[var(--ink)] leading-[0.90] tracking-[-0.02em] mb-7"
              style={{ fontSize: "clamp(3.6rem, 7.5vw, 6.4rem)" }}
            >
              <span className="block">
                <CharReveal text="Shop with" baseDelay={180} />
              </span>
              <span className="block">
                <CharReveal text="words," baseDelay={460} />
              </span>
              <span className="block" style={{ color: "var(--ink-muted)" }}>
                <CharReveal text="not filters." baseDelay={700} />
              </span>
            </h1>

            <p className="text-[var(--ink-muted)] text-base leading-relaxed max-w-[360px] mb-7">
              <WordReveal
                text="Describe what you're looking for in plain English — our AI finds perfect pieces from Pakistan's finest brands instantly."
                baseDelay={1050}
              />
            </p>

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
                  className="relative overflow-hidden flex-1"
                  style={{
                    aspectRatio: "3/4",
                    maxWidth: 130,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 0.6s ease ${900 + i * 80}ms, transform 0.15s ease-out ${900 + i * 80}ms`,
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
                      background:
                        "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)",
                    }}
                  />
                </div>
              ))}
            </div>

            <div
              className="hidden md:flex items-center gap-2 mt-6 transition-all duration-700"
              style={{ opacity: mounted ? 0.45 : 0, transitionDelay: "1100ms" }}
            >
              <div className="w-px h-6 bg-gradient-to-b from-[var(--ink-muted)] to-transparent" />
              <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-[var(--ink-muted)]">
                Scroll to explore
              </span>
            </div>
          </div>

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

      <section
        className="relative z-10 py-24 px-6 md:px-12 border-t border-b border-[var(--bg)]"
        ref={statsReveal.ref}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            <StatItem
              value="500+"
              label="Brands"
              delay={statsReveal.visible ? 0 : 9999}
              counterTarget={500}
              counterSuffix="+"
            />
            <StatItem
              value="50K+"
              label="Products"
              delay={statsReveal.visible ? 120 : 9999}
              counterTarget={50}
              counterSuffix="K+"
            />
            <StatItem
              value="< 2s"
              label="Search time"
              delay={statsReveal.visible ? 240 : 9999}
            />
            <StatItem
              value="100%"
              label="Curated"
              delay={statsReveal.visible ? 360 : 9999}
              counterTarget={100}
              counterSuffix="%"
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 py-8 overflow-hidden bg-[var(--ink)]">
        <div className="text-[9px] font-bold tracking-[0.3em] uppercase text-[var(--ink-muted)] text-center mb-4">
          Featured brands
        </div>
        <MarqueeBrands dark />
      </section>

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

      <section
        className="relative z-10 py-24 px-6 md:px-12 bg-[var(--ink)]"
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
              className="text-xs text-[var(--ink-muted)] font-semibold uppercase tracking-widest hidden md:block"
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

      <footer className="relative z-10 border-t border-[var(--bg)] py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="xs" />
            <span className="text-sm text-[var(--ink-muted)]">
              · Fashion discovery, reimagined
            </span>
          </div>
          <span className="text-xs text-[var(--ink-muted)]">
            © 2025 Browse AI. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
