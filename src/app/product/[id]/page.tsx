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
        transition: 'transform 0.3s cubic-bezier(0.19,1,0.22,1)',
      }}
    >
      <div className="relative overflow-hidden rounded-sm" style={{ aspectRatio: '3/4' }}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="160px"
          style={{
            transform: hovered ? 'scale(1.07)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.19,1,0.22,1)',
          }}
        />
        {discount && (
          <span
            className="absolute top-2 left-2 text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5"
            style={{ background: '#7A9E74', color: 'white' }}
          >
            -{discount}%
          </span>
        )}
      </div>
      <div className="pt-2 px-0.5">
        <p className="text-[8px] font-black tracking-[0.18em] uppercase" style={{ color: '#7A9E74' }}>
          {product.brand}
        </p>
        <p className="text-[11px] font-semibold text-[#1A1A1A] leading-snug mt-0.5 line-clamp-1">
          {product.name}
        </p>
        <p className="text-[12px] font-black text-[#1A1A1A] mt-1">${product.price}</p>
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
      <div className="flex h-screen items-center justify-center" style={{ background: '#FAFAF8' }}>
        <div className="flex gap-2 items-center">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#7A9E74', animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#FAFAF8' }}>
        <div className="text-center">
          <p className="font-black text-[#1A1A1A] text-lg">Product not found</p>
          <button onClick={() => router.back()} className="mt-4 text-sm text-[#7A9E74] underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAFAF8' }}>

      {/* ── Sticky top bar ── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(250,250,248,0.94)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(230,226,218,0.3)',
        }}
      >
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E0D4] active:scale-90 transition-all duration-200"
        >
          <ArrowLeft size={16} className="text-[#1A1A1A]" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#1A1A1A' }}>
            <span className="text-white text-[8px] font-black">B</span>
          </div>
          <span className="font-black text-[#1A1A1A] text-sm" style={{ letterSpacing: '-0.02em' }}>Browse AI</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E0D4] active:scale-90 transition-all duration-200">
            <Share2 size={14} className="text-[#1A1A1A]" />
          </button>
          <button
            onClick={handleBookmarkToggle}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E0D4] active:scale-90 transition-all duration-200"
            style={{
              transform: bookmarked ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {bookmarked
              ? <BookmarkCheck size={14} className="text-[#1A1A1A]" />
              : <Bookmark size={14} className="text-[#6B6B6B]" />
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
              className="relative overflow-hidden"
              style={{
                aspectRatio: '3/4',
                background: '#EEF4EE',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.5s ease',
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
                  className="absolute top-4 left-4 text-[10px] font-black tracking-widest uppercase px-2.5 py-1"
                  style={{ background: '#0F0F0E', color: 'white', letterSpacing: '0.12em' }}
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
                  className="relative overflow-hidden cursor-pointer flex-1"
                  style={{
                    aspectRatio: '3/4',
                    background: '#EEF4EE',
                    outline: i === 0 ? '2px solid #7A9E74' : '2px solid transparent',
                    outlineOffset: '1px',
                    transition: 'outline 0.15s ease',
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
              style={{
                opacity: info.visible ? 1 : 0,
                transform: info.visible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.55s cubic-bezier(0.19,1,0.22,1), transform 0.6s cubic-bezier(0.19,1,0.22,1)',
              }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 mb-4">
                <button
                  onClick={() => router.push('/results')}
                  className="text-[10px] font-semibold text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors"
                >
                  Results
                </button>
                <ChevronRight size={10} className="text-[#CCCCCC]" />
                <span className="text-[10px] font-semibold text-[#1A1A1A]">{product.brand}</span>
              </div>

              <p
                className="text-[10px] font-black tracking-[0.22em] uppercase mb-2"
                style={{ color: '#7A9E74' }}
              >
                {product.brand}
              </p>
              <h1
                className="font-black text-[#1A1A1A] leading-[1.05] mb-4"
                style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.6rem)', letterSpacing: '-0.02em', fontFamily: 'var(--font-cormorant), Georgia, serif', fontStyle: 'italic' }}
              >
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span
                  className="font-black text-[#1A1A1A]"
                  style={{ fontSize: '1.6rem', letterSpacing: '-0.03em' }}
                >
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-base text-[#BBBBBB] line-through font-medium">
                      ${product.originalPrice}
                    </span>
                    <span
                      className="text-xs font-black px-2 py-0.5"
                      style={{ background: '#0F0F0E', color: 'white', letterSpacing: '0.08em' }}
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
                    className="text-[10px] font-semibold px-2.5 py-1 capitalize"
                    style={{ background: '#EEF4EE', color: '#58574F' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Size + quantity + CTA */}
            <div
              ref={actions.ref}
              className="flex flex-col gap-5"
              style={{
                opacity: actions.visible ? 1 : 0,
                transform: actions.visible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.55s cubic-bezier(0.19,1,0.22,1), transform 0.6s cubic-bezier(0.19,1,0.22,1)',
              }}
            >
              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(230,226,218,0.5)' }} />

              {/* Size selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-black tracking-[0.15em] uppercase text-[#1A1A1A]">Size</p>
                  <button className="text-[10px] font-semibold text-[#7A9E74] underline underline-offset-2">
                    Size guide
                  </button>
                </div>
                <div className="flex gap-2">
                  {SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className="w-10 h-10 text-[11px] font-bold transition-all duration-200 active:scale-95"
                      style={{
                        background: selectedSize === size ? '#7A9E74' : 'transparent',
                        color: selectedSize === size ? 'white' : '#1A1A1A',
                        border: `1.5px solid ${selectedSize === size ? '#7A9E74' : '#D0CCC4'}`,
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-[10px] text-[#AAAAAA] mt-2 font-medium">Select a size to continue</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <p className="text-[11px] font-black tracking-[0.15em] uppercase text-[#1A1A1A] mb-3">Quantity</p>
                <div className="flex items-center gap-0" style={{ width: 'fit-content' }}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-[#E8E0D4] active:scale-90"
                    style={{ border: '1.5px solid #D0CCC4' }}
                  >
                    <Minus size={12} className="text-[#1A1A1A]" />
                  </button>
                  <div
                    className="w-12 h-9 flex items-center justify-center font-black text-sm text-[#1A1A1A]"
                    style={{ borderTop: '1.5px solid #D0CCC4', borderBottom: '1.5px solid #D0CCC4' }}
                  >
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-[#E8E0D4] active:scale-90"
                    style={{ border: '1.5px solid #D0CCC4' }}
                  >
                    <Plus size={12} className="text-[#1A1A1A]" />
                  </button>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleAddToBag}
                  disabled={!selectedSize}
                  className="w-full py-4 font-black text-sm tracking-[0.1em] uppercase flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.98]"
                  style={{
                    background: addedToBag ? '#4D7A47' : selectedSize ? '#7A9E74' : '#C0BDB6',
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
                  className="w-full py-3.5 font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] hover:bg-[#E8E0D4]"
                  style={{
                    background: 'transparent',
                    color: '#1A1A1A',
                    border: '1.5px solid #D0CCC4',
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
                className="flex items-center gap-3 p-3.5"
                style={{ background: '#EEF4EE', border: '1px solid rgba(122,158,116,0.25)' }}
              >
                <div
                  className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: '#EEF4EE' }}
                >
                  <Sparkles size={11} style={{ color: '#7A9E74' }} />
                </div>
                <p className="text-[11px] font-medium text-[#58574F] leading-snug">
                  <span className="font-black text-[#1A1A1A]">Browse AI says: </span>
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
                      <div className="w-1 h-1 rounded-full bg-[#7A9E74]" />
                      <span className="text-[11px] font-semibold text-[#1A1A1A]">{item.label}</span>
                      <span className="text-[11px] text-[#9B9B9B]">{item.sub}</span>
                    </div>
                    <ArrowUpRight size={11} className="text-[#CCCCCC]" />
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
              transition: 'opacity 0.6s cubic-bezier(0.19,1,0.22,1), transform 0.65s cubic-bezier(0.19,1,0.22,1)',
            }}
          >
            {/* Section header */}
            <div className="flex items-end justify-between mb-5" style={{ borderBottom: '1px solid rgba(230,226,218,0.4)', paddingBottom: '12px' }}>
              <div>
                <p className="text-[9px] font-black tracking-[0.22em] uppercase mb-1" style={{ color: '#7A9E74' }}>
                  You may also like
                </p>
                <h2 className="font-black text-[#1A1A1A] text-xl" style={{ letterSpacing: '-0.03em' }}>
                  Similar Styles
                </h2>
              </div>
              <button
                onClick={() => router.push('/results')}
                className="flex items-center gap-1.5 text-[11px] font-black tracking-wide uppercase text-[#7A9E74] hover:text-[#1A1A1A] transition-colors"
                style={{ letterSpacing: '0.1em' }}
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
