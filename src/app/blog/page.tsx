import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageShell from "@/components/PageShell";
import { getPosts, formatDate } from "@/lib/blog";

export const revalidate = 60;

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

export default async function BlogIndex() {
  const posts = await getPosts();

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
        <div className="mb-14 max-w-2xl">
          <p
            className="font-mono-brutal text-[10px] font-black uppercase tracking-[0.28em] mb-4"
            style={{ color: "var(--accent)" }}
          >
            Journal
          </p>
          <h1
            className="font-display leading-tight tracking-[-0.02em] mb-4"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", color: "var(--ink)" }}
          >
            Pakistani Fashion,<br />Decoded
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            Buying guides, brand deep-dives, and styling advice to help you shop smarter.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
            No articles yet — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="card-brutal group flex flex-col overflow-hidden"
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: i === 0 ? "16/7" : "16/9" }}>
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-150 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div
                    className="tag-brutal absolute top-3 left-3"
                    style={{ background: "var(--accent)", color: "var(--surface)" }}
                  >
                    {post.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono-brutal text-[11px] font-medium" style={{ color: "var(--ink-muted)" }}>
                      {formatDate(post.date)}
                    </span>
                    <span style={{ color: "var(--ink-muted)" }}>·</span>
                    <span className="font-mono-brutal text-[11px] font-medium" style={{ color: "var(--ink-muted)" }}>
                      {post.readTime}
                    </span>
                  </div>
                  <h2
                    className="font-display leading-tight mb-3 group-hover:text-[var(--accent)] transition-colors duration-150 ease-out"
                    style={{ fontSize: "1.35rem", color: "var(--ink)" }}
                  >
                    {post.title}
                  </h2>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--ink-muted)" }}>
                    {post.description}
                  </p>
                  <div className="mt-5 flex items-center gap-1.5">
                    <span className="font-mono-brutal text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                      Read guide
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--accent)" }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
