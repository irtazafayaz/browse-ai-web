import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "About Browse AI — AI-Powered Pakistani Fashion Discovery",
  description:
    "Browse AI uses artificial intelligence to help you find exactly what you're looking for across Pakistan's top fashion brands — no filters, no endless scrolling.",
  keywords: ["Browse AI", "Pakistani fashion AI", "fashion discovery Pakistan", "AI shopping"],
  openGraph: {
    title: "About Browse AI",
    description: "AI-powered fashion discovery across Pakistan's top brands.",
    type: "website",
  },
};

const STEPS = [
  {
    number: "01",
    title: "Describe it in plain English",
    body: `Type what you want as if you're telling a friend — "a soft chiffon dupatta set in pastels under PKR 5,000" or "something elegant for a valima in emerald green".`,
  },
  {
    number: "02",
    title: "AI finds the matches",
    body: "Our engine searches across Pakistan's top brands simultaneously — Sana Safinaz, Gul Ahmed, Alkaram, Maria B, and more — ranking results by how closely they match your description.",
  },
  {
    number: "03",
    title: "Shop with confidence",
    body: "Click through to buy directly from the brand. No middlemen, no markups — just the product you want, exactly where you'd normally find it.",
  },
];

const STATS = [
  { value: "500+", label: "Brands indexed" },
  { value: "50,000+", label: "Products searchable" },
  { value: "98%", label: "Match accuracy" },
  { value: "< 2s", label: "Average search time" },
];

export default function AboutPage() {
  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div
          className="py-24 max-w-3xl"
        >
          <p
            className="font-mono-brutal text-[10px] font-black uppercase tracking-[0.28em] mb-5"
            style={{ color: "var(--accent)" }}
          >
            Our Story
          </p>
          <h1
            className="font-display leading-tight tracking-[-0.02em] mb-6"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", color: "var(--ink)" }}
          >
            Fashion discovery, finally as smart as you are
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            Browse AI was built out of a simple frustration: shopping for Pakistani fashion online shouldn't require visiting ten websites, applying twenty filters, and still not finding what you had in mind. We built the search experience it deserved.
          </p>
        </div>

        <div
          className="py-14 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {STATS.map((s) => (
            <div key={s.label} className="card-brutal p-6">
              <p
                className="font-display"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--ink)", lineHeight: 1 }}
              >
                {s.value}
              </p>
              <p className="font-mono-brutal text-[11px] font-semibold uppercase tracking-widest mt-2" style={{ color: "var(--accent)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="py-20">
          <p
            className="font-mono-brutal text-[10px] font-black uppercase tracking-[0.28em] mb-4"
            style={{ color: "var(--accent)" }}
          >
            How it works
          </p>
          <h2
            className="font-display leading-tight tracking-[-0.02em] mb-14"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "var(--ink)" }}
          >
            Three steps to your perfect outfit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="card-brutal p-7"
              >
                <p
                  className="font-display mb-4"
                  style={{ fontSize: "2.5rem", color: "var(--accent)", lineHeight: 1 }}
                >
                  {step.number}
                </p>
                <h3 className="font-bold text-base mb-2 tracking-tight" style={{ color: "var(--ink)" }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="py-16 border-t-[3px] flex flex-col md:flex-row items-start md:items-center gap-6"
          style={{ borderColor: "var(--ink)" }}
        >
          <div className="flex-1">
            <h2
              className="font-display leading-tight mb-2"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "var(--ink)" }}
            >
              Try it yourself
            </h2>
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              No account needed. Just describe what you&apos;re looking for.
            </p>
          </div>
          <Link
            href="/results"
            className="btn-brutal-accent font-mono-brutal px-7 py-3 text-sm font-black uppercase tracking-wider"
          >
            Start Searching
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
