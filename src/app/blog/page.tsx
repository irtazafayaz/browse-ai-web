import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageShell from "@/components/PageShell";
import { BLOG_POSTS, formatDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Browse AI | Pakistani Fashion Buying Guides",
  description:
    "Expert buying guides for Pakistani fashion — lawn suits, chiffon dupatta sets, pret wear, and wedding outfit advice from Browse AI.",
  keywords: ["Pakistani fashion blog", "lawn suit guide", "pret wear Pakistan", "chiffon dupatta", "wedding outfits Pakistan"],
  openGraph: {
    title: "Browse AI Blog — Pakistani Fashion Buying Guides",
    description: "Expert guides to shopping Pakistani fashion online.",
    type: "website",
  },
};

export default function BlogIndex() {
  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
        <div className="mb-14 max-w-2xl">
          <p
            className="text-[10px] font-black uppercase tracking-[0.28em] mb-4"
            style={{ color: "#7A9E74" }}
          >
            Journal
          </p>
          <h1
            className="font-cormorant font-semibold italic leading-tight tracking-[-0.02em] mb-4"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", color: "#0F0F0E" }}
          >
            Pakistani Fashion,<br />Decoded
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#6B6B6B" }}>
            Buying guides, brand deep-dives, and styling advice to help you shop smarter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_POSTS.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(212,196,168,0.35)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: i === 0 ? "16/7" : "16/9" }}>
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                  style={{ background: "#7A9E74", color: "#FFFFFF" }}
                >
                  {post.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-medium" style={{ color: "#AAAAAA" }}>
                    {formatDate(post.date)}
                  </span>
                  <span style={{ color: "#E0DDD6" }}>·</span>
                  <span className="text-[11px] font-medium" style={{ color: "#AAAAAA" }}>
                    {post.readTime}
                  </span>
                </div>
                <h2
                  className="font-cormorant font-semibold italic leading-tight mb-3 group-hover:text-[#7A9E74] transition-colors"
                  style={{ fontSize: "1.35rem", color: "#0F0F0E" }}
                >
                  {post.title}
                </h2>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "#6B6B6B" }}>
                  {post.description}
                </p>
                <div className="mt-5 flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: "#7A9E74" }}>
                    Read guide
                  </span>
                  <span className="text-[11px]" style={{ color: "#7A9E74" }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
