import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PageShell from "@/components/PageShell";
import { getPost, getPosts, formatDate } from "@/lib/blog";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} — Browse AI Blog`,
    description: post.description,
    keywords: [post.category, "Pakistani fashion", "Browse AI"],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      images: [{ url: post.coverImage }],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPost(slug), getPosts()]);

  if (!post) notFound();

  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <PageShell>
      <article className="max-w-3xl mx-auto px-6 md:px-10 py-16">
        <div className="mb-6">
          <Link
            href="/blog"
            className="text-[11px] font-bold uppercase tracking-wider transition-colors"
            style={{ color: "var(--accent)" }}
          >
            ← All articles
          </Link>
        </div>

        <div className="mb-8">
          <div
            className="inline-block border-brutal-thin px-2.5 py-1 text-[10px] font-black uppercase tracking-wider mb-4"
            style={{ background: "var(--accent-soft)", color: "var(--accent-dark)" }}
          >
            {post.category}
          </div>
          <h1
            className="font-display leading-tight tracking-[-0.02em] mb-4"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", color: "var(--ink)" }}
          >
            {post.title}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-medium" style={{ color: "var(--ink-muted)" }}>
              {formatDate(post.date)}
            </span>
            <span style={{ color: "var(--bg)" }}>·</span>
            <span className="text-[12px] font-medium" style={{ color: "var(--ink-muted)" }}>
              {post.readTime}
            </span>
          </div>
        </div>

        <div
          className="relative w-full border-brutal shadow-brutal overflow-hidden mb-10"
          style={{ aspectRatio: "16/7" }}
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        <div
          className="prose-custom"
          style={{ color: "var(--ink)" }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div
          className="mt-12 p-6 border-brutal shadow-brutal flex flex-col md:flex-row items-start md:items-center gap-4"
          style={{ background: "var(--accent-soft)" }}
        >
          <div className="flex-1">
            <p className="font-black text-sm tracking-tight mb-1" style={{ color: "var(--ink)" }}>
              Ready to find your perfect outfit?
            </p>
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              Browse AI searches across Pakistan&apos;s top brands in one search.
            </p>
          </div>
          <Link
            href={`/results?q=${encodeURIComponent(post.title)}`}
            className="btn-brutal btn-brutal-accent shrink-0 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider"
            style={{ color: "var(--surface)" }}
          >
            Search Now
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <div
          className="border-t py-14"
          style={{ borderColor: "var(--ink)" }}
        >
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <p
              className="text-[10px] font-black uppercase tracking-[0.28em] mb-8"
              style={{ color: "var(--accent)" }}
            >
              More buying guides
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group card-brutal flex gap-4 items-start p-4"
                >
                  <div className="relative w-20 h-20 border-brutal-thin overflow-hidden shrink-0">
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-150 ease-out group-hover:scale-105"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--ink-muted)" }}>
                      {p.readTime}
                    </p>
                    <h3
                      className="font-display text-base leading-snug transition-colors"
                      style={{ color: "var(--ink)" }}
                    >
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .prose-custom h2 { font-family: var(--font-archivo-black); font-size: 1.6rem; font-weight: 600; color: var(--ink); margin: 2.2rem 0 0.8rem; line-height: 1.2; letter-spacing: -0.01em; }
        .prose-custom h3 { font-size: 1rem; font-weight: 800; color: var(--ink); margin: 1.8rem 0 0.5rem; letter-spacing: -0.01em; }
        .prose-custom p { font-size: 0.96rem; line-height: 1.8; color: var(--ink-muted); margin: 0 0 1.1rem; }
        .prose-custom ul { margin: 0.6rem 0 1.2rem 1.4rem; list-style: disc; }
        .prose-custom li { font-size: 0.93rem; line-height: 1.75; color: var(--ink-muted); margin-bottom: 0.35rem; }
        .prose-custom strong { font-weight: 700; color: var(--ink); }
      `}</style>
    </PageShell>
  );
}
