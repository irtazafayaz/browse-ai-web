'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ArrowLeft, Bookmark, BookmarkCheck, Sparkles,
  Share2, ShoppingBag, ChevronRight, ArrowUpRight,
  Minus, Plus,
} from 'lucide-react';
import { getProduct, getProducts, toggleBookmark } from '@/lib/api';
import { Product } from '@/lib/types';

/* ── Size selector ── */
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

/* ── Related products strip ── */
function RelatedCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="shrink-0 w-40 cursor-pointer"
      style={{
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.15s ease-out',
      }}
    >
      <div className="relative overflow-hidden border-brutal" style={{ aspectRatio: '3/4' }}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="160px"
          style={{
            transform: hovered ? 'scale(1.07)' : 'scale(1)',
            transition: 'transform 0.15s ease-out',
          }}
        />
        {discount && (
          <span
            className="absolute top-2 left-2 text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 border-brutal-thin"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            -{discount}%
          </span>
        )}
      </div>
      <div className="pt-2 px-0.5">
        <p className="text-[8px] font-black tracking-[0.18em] uppercase" style={{ color: 'var(--accent)' }}>
          {product.brand}
        </p>
        <p className="text-[11px] font-semibold leading-snug mt-0.5 line-clamp-1" style={{ color: 'var(--ink)' }}>
          {product.name}
        </p>
        <p className="text-[12px] font-black mt-1" style={{ color: 'var(--ink)' }}>${product.price}</p>
      </div>
    </div>
  );
}

/* ── Reveal hook ── */
function useReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return { ref, visible };
}

/* ── Main page ── */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookmarked, setBookmarked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToBag, setAddedToBag] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const info = useReveal(120);
  const actions = useReveal(240);
  const related = useReveal(360);

  useEffect(() => {
    setLoading(true);

    const cached = localStorage.getItem(`browseai:product:${id}`);
    if (cached) {
      try {
        const prod = JSON.parse(cached) as Product;
        setProduct(prod);
        setBookmarked(prod.isBookmarked ?? false);
        setLoading(false);
        // load related products in background
        getProducts({ page: 1 }).then(all => {
          const rel = all.products
            .filter((p: Product) => p.id !== id && p.tags.some((t: string) => prod.tags?.includes(t)))
            .slice(0, 6);
          setRelatedProducts(rel);
        }).catch(() => {});
        return;
      } catch { /* fall through */ }
    }

    Promise.all([getProduct(id), getProducts()]).then(([prod, all]) => {
      setProduct(prod);
      setBookmarked(prod?.isBookmarked ?? false);
      const rel = all.products
        .filter((p: Product) => p.id !== id && p.tags.some((t: string) => prod?.tags?.includes(t)))
        .slice(0, 6);
      setRelatedProducts(rel);
    }).catch(() => {
      setProduct(null);
    }).finally(() => setLoading(false));
  }, [id]);

  const discount = product?.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleBookmarkToggle = () => {
    setBookmarked(v => !v);
    toggleBookmark(id).catch(() => setBookmarked(v => !v));
  };

  const handleAddToBag = () => {
    if (!selectedSize) return;
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2200);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex gap-2 items-center">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 animate-bounce" style={{ background: 'var(--accent)', animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p className="font-black text-lg" style={{ color: 'var(--ink)' }}>Product not found</p>
          <button onClick={() => router.back()} className="mt-4 text-sm underline" style={{ color: 'var(--accent)' }}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Sticky top bar ── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{
          background: 'var(--surface)',
          borderBottom: '3px solid var(--ink)',
        }}
      >
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all duration-150 ease-out"
          style={{ background: 'var(--accent-soft)' }}
        >
          <ArrowLeft size={16} style={{ color: 'var(--ink)' }} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--ink)' }}>
            <span className="text-white text-[8px] font-black">B</span>
          </div>
          <span className="font-black text-sm" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>Browse AI</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all duration-150 ease-out" style={{ background: 'var(--accent-soft)' }}>
            <Share2 size={14} style={{ color: 'var(--ink)' }} />
          </button>
          <button
            onClick={handleBookmarkToggle}
            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all duration-150 ease-out"
            style={{
              background: 'var(--accent-soft)',
              transform: bookmarked ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {bookmarked
              ? <BookmarkCheck size={14} style={{ color: 'var(--ink)' }} />
              : <Bookmark size={14} style={{ color: 'var(--ink-muted)' }} />
            }
          </button>
        </div>
      </header>

      {/* ── Main content — 2-col on desktop ── */}
      <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">

          {/* LEFT — Image(s) */}
          <div className="lg:w-[52%] shrink-0">
            {/* Hero image */}
            <div
              className="relative overflow-hidden border-brutal shadow-brutal-lg"
              style={{
                aspectRatio: '3/4',
                background: 'var(--accent-soft)',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.35s ease',
              }}
            >
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 52vw"
                priority
                onLoad={() => setImageLoaded(true)}
              />
              {/* Discount badge */}
              {discount && (
                <div
                  className="absolute top-4 left-4 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 border-brutal-thin"
                  style={{ background: 'var(--ink)', color: 'white', letterSpacing: '0.12em' }}
                >
                  -{discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail strip — same image at different crops for demo */}
            <div className="flex gap-2 mt-2">
              {[
                `${product.imageUrl}&sat=-20`,
                `${product.imageUrl}&crop=top`,
                `${product.imageUrl}&flip=h`,
              ].map((url, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden cursor-pointer flex-1 border-brutal-thin"
                  style={{
                    aspectRatio: '3/4',
                    background: 'var(--accent-soft)',
                    outline: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
                    outlineOffset: '1px',
                    transition: 'outline 0.15s ease-out',
                  }}
                >
                  <Image
                    src={product.imageUrl}
                    alt={`${product.name} view ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Info & actions */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Brand + name + price */}
            <div
              ref={info.ref}
              className="card-brutal p-5"
              style={{
                opacity: info.visible ? 1 : 0,
                transform: info.visible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.38s cubic-bezier(0.4,0,0.2,1), transform 0.42s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 mb-4">
                <button
                  onClick={() => router.push('/results')}
                  className="text-[10px] font-semibold transition-colors"
                  style={{ color: 'var(--ink-muted)' }}
                >
                  Results
                </button>
                <ChevronRight size={10} style={{ color: 'var(--ink-muted)' }} />
                <span className="text-[10px] font-semibold" style={{ color: 'var(--ink)' }}>{product.brand}</span>
              </div>

              <p
                className="text-[10px] font-black tracking-[0.22em] uppercase mb-2"
                style={{ color: 'var(--accent)' }}
              >
                {product.brand}
              </p>
              <h1
                className="font-display leading-[1.05] mb-4"
                style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', letterSpacing: '-0.02em', color: 'var(--ink)' }}
              >
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span
                  className="font-display"
                  style={{ fontSize: '1.6rem', letterSpacing: '-0.03em', color: 'var(--ink)' }}
                >
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-base line-through font-medium" style={{ color: 'var(--ink-muted)' }}>
                      ${product.originalPrice}
                    </span>
                    <span
                      className="text-xs font-black px-2 py-0.5 border-brutal-thin"
                      style={{ background: 'var(--ink)', color: 'white', letterSpacing: '0.08em' }}
                    >
                      -{discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {product.tags.slice(0, 5).map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold px-2.5 py-1 capitalize border-brutal-thin"
                    style={{ background: 'var(--accent-soft)', color: 'var(--ink-muted)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Size + quantity + CTA */}
            <div
              ref={actions.ref}
              className="card-brutal p-5 flex flex-col gap-5"
              style={{
                opacity: actions.visible ? 1 : 0,
                transform: actions.visible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.38s cubic-bezier(0.4,0,0.2,1), transform 0.42s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* Divider */}
              <div style={{ height: 3, background: 'var(--ink)' }} />

              {/* Size selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-black tracking-[0.15em] uppercase" style={{ color: 'var(--ink)' }}>Size</p>
                  <button className="text-[10px] font-semibold underline underline-offset-2" style={{ color: 'var(--accent)' }}>
                    Size guide
                  </button>
                </div>
                <div className="flex gap-2">
                  {SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className="w-10 h-10 text-[11px] font-bold transition-all duration-150 ease-out active:scale-95"
                      style={{
                        background: selectedSize === size ? 'var(--accent)' : 'transparent',
                        color: selectedSize === size ? 'white' : 'var(--ink)',
                        border: `2px solid var(--ink)`,
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-[10px] mt-2 font-medium" style={{ color: 'var(--ink-muted)' }}>Select a size to continue</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <p className="text-[11px] font-black tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--ink)' }}>Quantity</p>
                <div className="flex items-center gap-0" style={{ width: 'fit-content' }}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center transition-all duration-150 ease-out active:scale-90"
                    style={{ border: '2px solid var(--ink)', background: 'var(--accent-soft)' }}
                  >
                    <Minus size={12} style={{ color: 'var(--ink)' }} />
                  </button>
                  <div
                    className="w-12 h-9 flex items-center justify-center font-black text-sm"
                    style={{ borderTop: '2px solid var(--ink)', borderBottom: '2px solid var(--ink)', color: 'var(--ink)' }}
                  >
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-9 h-9 flex items-center justify-center transition-all duration-150 ease-out active:scale-90"
                    style={{ border: '2px solid var(--ink)', background: 'var(--accent-soft)' }}
                  >
                    <Plus size={12} style={{ color: 'var(--ink)' }} />
                  </button>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleAddToBag}
                  disabled={!selectedSize}
                  className="w-full py-4 font-black text-sm tracking-[0.1em] uppercase flex items-center justify-center gap-2.5 transition-all duration-150 ease-out active:scale-[0.98] border-brutal shadow-brutal"
                  style={{
                    background: addedToBag ? 'var(--accent-dark)' : selectedSize ? 'var(--accent)' : 'var(--ink-muted)',
                    color: 'white',
                    letterSpacing: '0.12em',
                    cursor: selectedSize ? 'pointer' : 'not-allowed',
                  }}
                >
                  {addedToBag ? (
                    <>✓ Added to Bag</>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      Add to Bag
                    </>
                  )}
                </button>

                <button
                  onClick={handleBookmarkToggle}
                  className="w-full py-3.5 font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-150 ease-out active:scale-[0.98] border-brutal shadow-brutal"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--ink)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {bookmarked
                    ? <><BookmarkCheck size={14} /> Saved</>
                    : <><Bookmark size={14} /> Save for later</>
                  }
                </button>
              </div>

              {/* AI suggestion strip */}
              <div
                className="flex items-center gap-3 p-3.5 border-brutal shadow-brutal-sm"
                style={{ background: 'var(--accent-soft)' }}
              >
                <div
                  className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: 'var(--warn)' }}
                >
                  <Sparkles size={11} style={{ color: 'var(--ink)' }} />
                </div>
                <p className="text-[11px] font-medium leading-snug" style={{ color: 'var(--ink-muted)' }}>
                  <span className="font-black" style={{ color: 'var(--ink)' }}>Browse AI says: </span>
                  Pairs well with a fitted turtleneck and loafers for an elevated everyday look.
                </p>
              </div>

              {/* Shipping info */}
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Free shipping', sub: 'on orders over $150' },
                  { label: 'Free returns', sub: 'within 30 days' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5" style={{ background: 'var(--accent)' }} />
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--ink)' }}>{item.label}</span>
                      <span className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>{item.sub}</span>
                    </div>
                    <ArrowUpRight size={11} style={{ color: 'var(--ink-muted)' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Related products ── */}
        {relatedProducts.length > 0 && (
          <div
            ref={related.ref}
            className="mt-16"
            style={{
              opacity: related.visible ? 1 : 0,
              transform: related.visible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.42s cubic-bezier(0.4,0,0.2,1), transform 0.45s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {/* Section header */}
            <div className="flex items-end justify-between mb-5" style={{ borderBottom: '3px solid var(--ink)', paddingBottom: '12px' }}>
              <div>
                <p className="text-[9px] font-black tracking-[0.22em] uppercase mb-1" style={{ color: 'var(--accent)' }}>
                  You may also like
                </p>
                <h2 className="font-display text-xl" style={{ letterSpacing: '-0.03em', color: 'var(--ink)' }}>
                  Similar Styles
                </h2>
              </div>
              <button
                onClick={() => router.push('/results')}
                className="flex items-center gap-1.5 text-[11px] font-black tracking-wide uppercase transition-colors"
                style={{ letterSpacing: '0.1em', color: 'var(--accent)' }}
              >
                View all <ArrowUpRight size={12} />
              </button>
            </div>

            {/* Horizontal scroll strip */}
            <div className="flex gap-3 overflow-x-auto chat-scroll pb-4">
              {relatedProducts.map(p => (
                <RelatedCard
                  key={p.id}
                  product={p}
                  onClick={() => router.push(`/product/${p.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
