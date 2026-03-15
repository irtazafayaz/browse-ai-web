import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "FAQ — Browse AI | Common Questions Answered",
  description:
    "Everything you need to know about Browse AI — how the AI search works, which brands are supported, international shipping, and more.",
  keywords: ["Browse AI FAQ", "Pakistani fashion search", "how Browse AI works", "AI fashion Pakistan"],
  openGraph: {
    title: "Browse AI FAQ",
    description: "Common questions about AI-powered Pakistani fashion search.",
    type: "website",
  },
};

const FAQS = [
  {
    q: "How does Browse AI's search work?",
    a: "Browse AI uses a large language model to understand what you're describing — fabric, colour, occasion, price range, and style — and matches it against a continuously updated index of products from Pakistan's top fashion brands. You don't need to use exact keywords; plain, conversational descriptions work best.",
  },
  {
    q: "Which brands are included?",
    a: "Our index currently covers Pakistan's leading women's fashion brands including Sana Safinaz, Alkaram Studio, Gul Ahmed, Nishat Linen, Maria B, Limelight, Generation, Bonanza Satrangi, ONE, and Engine. We're adding more brands regularly.",
  },
  {
    q: "Is Browse AI free to use?",
    a: "Yes — searching is completely free with no account required. Creating a free account lets you save and bookmark products for later.",
  },
  {
    q: "Do you sell products directly?",
    a: "No. Browse AI is a discovery and search platform. When you find something you want to buy, we link you directly to the brand's own website where you complete the purchase — so you get the same official price, warranty, and return policy as buying direct.",
  },
  {
    q: "Why are there only women's collections available right now?",
    a: "We launched with women's fashion because it represents the highest search demand and widest product range across Pakistani brands. Men's and children's collections are on our roadmap for later in 2025.",
  },
  {
    q: "How often is the product index updated?",
    a: "We crawl and update our index multiple times per week to keep up with new drops, seasonal launches, and restocks. Lawn season (spring/summer) collections are updated more frequently given their high velocity of launches.",
  },
  {
    q: "Can I search by specific brand?",
    a: `Yes — just include the brand name in your search. For example, "Sana Safinaz chiffon dupatta" or "Gul Ahmed embroidered lawn three-piece" will filter results toward that brand.`,
  },
  {
    q: "Do the brands ship internationally?",
    a: "Most major brands listed on Browse AI offer international shipping — especially to the UK, US, Canada, UAE, and Saudi Arabia. Shipping policies, costs, and delivery times vary by brand. We recommend checking each brand's official website for current international shipping information.",
  },
  {
    q: "Can I use Browse AI to find stitched (pret) outfits only?",
    a: `Absolutely. Just specify "stitched" or "ready to wear" in your search query, or search for "pret" along with your style preferences. You can also add terms like "unstitched" or "three-piece fabric" to filter for unstitched options.`,
  },
  {
    q: "How do I save products I'm interested in?",
    a: "Create a free account to bookmark and save products. Your saved items are accessible across devices so you can build your wishlist on your phone and review it on desktop later.",
  },
];

export default function FaqPage() {
  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">
        <div className="mb-14">
          <p
            className="text-[10px] font-black uppercase tracking-[0.28em] mb-4"
            style={{ color: "#7A9E74" }}
          >
            Help
          </p>
          <h1
            className="font-cormorant font-semibold italic leading-tight tracking-[-0.02em] mb-4"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", color: "#0F0F0E" }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#6B6B6B" }}>
            Can&apos;t find what you&apos;re looking for?{" "}
            <Link href="/results" style={{ color: "#7A9E74", fontWeight: 700 }}>
              Try searching instead →
            </Link>
          </p>
        </div>

        <div className="divide-y" style={{ borderColor: "rgba(212,196,168,0.35)" }}>
          {FAQS.map((faq, i) => (
            <details
              key={i}
              className="group py-5"
              style={{ borderColor: "rgba(212,196,168,0.35)" }}
            >
              <summary
                className="flex items-center justify-between cursor-pointer list-none font-bold text-sm gap-4"
                style={{ color: "#0F0F0E" }}
              >
                <span className="tracking-tight">{faq.q}</span>
                <span
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[13px] transition-transform duration-200 group-open:rotate-45"
                  style={{ background: "#EEF4EE", color: "#4D7A47" }}
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "#6B6B6B" }}>
                {faq.a}
              </p>
            </details>
          ))}
        </div>

        <div
          className="mt-14 p-7 rounded-2xl"
          style={{ background: "#EEF4EE", border: "1px solid rgba(122,158,116,0.2)" }}
        >
          <h2
            className="font-cormorant font-semibold italic mb-2"
            style={{ fontSize: "1.4rem", color: "#0F0F0E" }}
          >
            Still have questions?
          </h2>
          <p className="text-sm mb-4" style={{ color: "#6B6B6B" }}>
            The best way to experience Browse AI is to try it. Describe what you&apos;re looking for and see it in action.
          </p>
          <Link
            href="/results"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#7A9E74", color: "#FFFFFF" }}
          >
            Try Browse AI
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
