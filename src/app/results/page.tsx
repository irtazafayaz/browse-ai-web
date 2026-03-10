'use client';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import {
  ArrowLeft, BookmarkCheck, ArrowRight, X, Bookmark, Zap,
  Search, Camera, SlidersHorizontal,
  TrendingUp, DollarSign, Star, ArrowUp,
  CornerDownLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MasonryGrid, { MasonrySkeletonGrid } from '@/components/MasonryGrid';
import Logo from '@/components/Logo';
import FilterDrawer from '@/components/FilterDrawer';
import AuthModal from '@/components/AuthModal';
import { Product, SearchFilters } from '@/lib/types';
import { searchProducts, toggleBookmark } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

type SortMode = 'match' | 'price-asc' | 'price-desc' | 'trending';
type Gender   = 'Women' | 'Men';

function sortProducts(products: Product[], sort: SortMode): Product[] {
  const arr = [...products];
  switch (sort) {
    case 'price-asc':  return arr.sort((a, b) => a.price - b.price);
    case 'price-desc': return arr.sort((a, b) => b.price - a.price);
    case 'trending':   return arr.sort((a, b) => b.id.localeCompare(a.id));
    default:           return arr;
  }
}

const SORT_OPTIONS: { id: SortMode; label: string; icon: React.ReactNode }[] = [
  { id: 'match',      label: 'Best match', icon: <Star size={11} /> },
  { id: 'trending',   label: 'Trending',   icon: <TrendingUp size={11} /> },
  { id: 'price-asc',  label: 'Price ↑',    icon: <DollarSign size={11} /> },
  { id: 'price-desc', label: 'Price ↓',    icon: <DollarSign size={11} /> },
];

const NAV_H = 49;

const PLACEHOLDERS = [
  'Search for anything…',
  'Try "oversized blazer"…',
  'Try "floral midi dress"…',
  'Try "leather ankle boots"…',
  'Try "cashmere turtleneck"…',
  'Try "wide-leg linen trousers"…',
];

const TRENDING = [
  { query: 'Oversized blazer',    emoji: '🔥' },
  { query: 'Floral midi dress',   emoji: '🌸' },
  { query: 'Leather ankle boots', emoji: '👢' },
  { query: 'Wide-leg trousers',   emoji: '✨' },
  { query: 'Cashmere turtleneck', emoji: '🍂' },
];

function ResultsContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user }     = useAuth();
  const initialQuery = searchParams.get('q') ?? '';

  /* ── Search state ── */
  const [inputValue, setInputValue]     = useState(initialQuery);
  const [inputFocused, setInputFocused] = useState(false);
  const [query, setQuery]               = useState(initialQuery);

  /* ── Placeholder cycling ── */
  const [phIdx, setPhIdx]         = useState(0);
  const [phVisible, setPhVisible] = useState(true);

  /* ── Results state ── */
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [hasNext, setHasNext]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  /* ── Sort / filter / UI state ── */
  const [sort, setSort]             = useState<SortMode>('match');
  const [filters, setFilters]       = useState<SearchFilters>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [authOpen, setAuthOpen]     = useState(false);
  const [gender, setGender]         = useState<Gender>('Women');
  const [comingSoon, setComingSoon] = useState(false);

  const showComingSoon = () => {
    setComingSoon(true);
    setTimeout(() => setComingSoon(false), 2200);
  };

  /* ── Cart ── */
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const handleQuickView = (product: Product) => { setQuickViewProduct(product); };

  /* Prevent body scroll when modal is open */
  useEffect(() => {
    if (quickViewProduct) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'unset'; };
    }
  }, [quickViewProduct]);

  const sentinelRef  = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 320);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* ── Cycling placeholder ── */
  useEffect(() => {
    if (inputFocused || inputValue) return;
    const id = setInterval(() => {
      setPhVisible(false);
      setTimeout(() => { setPhIdx(i => (i + 1) % PLACEHOLDERS.length); setPhVisible(true); }, 280);
    }, 3600);
    return () => clearInterval(id);
  }, [inputFocused, inputValue]);

  const displayProducts = sortProducts(rawProducts, sort);
  const bookmarkCount   = rawProducts.filter(p => p.isBookmarked).length;
  const hasResults      = loading || rawProducts.length > 0;

  const activeFilterCount = [
    filters.brand,
    (filters.minPrice != null || filters.maxPrice != null) ? '1' : null,
    ...(filters.tags ?? []),
  ].filter(Boolean).length;

  /* ── Fetcher ── */
  const fetchText = useCallback(async (
    q: string, f: SearchFilters, pageNum: number, reset: boolean,
  ) => {
    if (!q) return;
    if (reset) setLoading(true); else setLoadingMore(true);
    try {
      const r = await searchProducts(q, pageNum);
      setTotal(r.total); setPage(pageNum); setHasNext(r.has_next);
      if (reset) setRawProducts(r.products);
      else       setRawProducts(prev => [...prev, ...r.products]);
    } catch { /* silent */ } finally {
      if (reset) setLoading(false); else setLoadingMore(false);
    }
  }, []);

  /* ── Initial load ── */
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (initialQuery) fetchText(initialQuery, {}, 1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Re-fetch on query / filter change ── */
  const prevQueryRef   = useRef(query);
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    const qChanged = query !== prevQueryRef.current;
    const fChanged = JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);
    prevQueryRef.current   = query;
    prevFiltersRef.current = filters;
    if (qChanged || fChanged) {
      if (query) fetchText(query, filters, 1, true);
      else { setRawProducts([]); setTotal(0); setHasNext(false); }
    }
  }, [query, filters, fetchText]);

  /* ── Infinite scroll ── */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNext && !loadingMore && !loading) {
        fetchText(query, filters, page + 1, false);
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNext, loadingMore, loading, page, query, filters, fetchText]);

  /* ── Handlers ── */
  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = inputValue.trim();
    if (!t) return;
    setQuery(t);
    router.replace(`/results?q=${encodeURIComponent(t)}`, { scroll: false });
  };

  const handleBookmark = useCallback((id: string) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setRawProducts(prev => prev.map(p => p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p));
    toggleBookmark(id).catch(() =>
      setRawProducts(prev => prev.map(p => p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  }, [user]);

  const clearAll = () => {
    setInputValue('');
    setQuery('');
    setRawProducts([]);
    setTotal(0);
    setHasNext(false);
    router.replace('/results', { scroll: false });
  };

  const hasInput = !!inputValue;

  /* ── Search pill JSX (shared between centered and bottom states) ── */
  const pill = (
    <form onSubmit={handleTextSearch}>
      <div
        className={`flex items-center ${!inputFocused ? 'animate-pill-breathe' : ''}`}
        style={{
          background: 'rgba(30, 27, 23, 0.93)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 100,
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '6px 6px 6px 20px',
          boxShadow: inputFocused
            ? '0 0 0 2px #C4A882, 0 8px 32px rgba(0,0,0,0.25), 0 20px 50px rgba(0,0,0,0.15)'
            : undefined,
          transform: inputFocused ? 'translateY(-2px) scale(1.006)' : 'translateY(0) scale(1)',
          transition: 'box-shadow 0.25s ease, transform 0.35s cubic-bezier(0.19,1,0.22,1)',
        }}
      >
        {/* Search icon */}
        <Search size={16} style={{ marginRight: 8, color: 'rgba(255,255,255,0.92)', flexShrink: 0 }} />

        {/* Camera icon — coming soon */}
        <button
          type="button"
          onClick={showComingSoon}
          title="Image search (coming soon)"
          className="shrink-0 active:scale-90"
          style={{ marginRight: 14, lineHeight: 0 }}
        >
          <Camera size={16} style={{ color: 'rgba(255,255,255,0.28)' }} />
        </button>

        {/* Divider */}
        <div
          className="shrink-0 self-stretch"
          style={{ width: 1, background: 'rgba(255,255,255,0.09)', margin: '5px 16px 5px 0' }}
        />

        {/* Text input */}
        <div className="relative flex-1 min-w-0" style={{ marginRight: 8 }}>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder=""
            className="w-full bg-transparent outline-none"
            style={{
              color: 'rgba(255,255,255,0.88)',
              caretColor: '#C4A882',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}
          />
          {!inputValue && (
            <span
              key={phIdx}
              className="absolute inset-0 flex items-center pointer-events-none select-none"
              style={{
                color: inputFocused ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.36)',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                opacity: phVisible ? 1 : 0,
                transform: phVisible ? 'translateY(0)' : 'translateY(-5px)',
                transition: 'opacity 0.28s ease, transform 0.3s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              {PLACEHOLDERS[phIdx]}
            </span>
          )}
        </div>

        {/* Clear */}
        {hasInput && (
          <button
            type="button"
            onClick={clearAll}
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.09)', marginRight: 4 }}
          >
            <X size={11} style={{ color: 'rgba(255,255,255,0.45)' }} />
          </button>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-90"
          style={{
            background: loading || inputFocused ? '#C4A882' : 'rgba(255,255,255,0.10)',
            boxShadow: loading || inputFocused ? '0 4px 14px rgba(196,168,130,0.45)' : 'none',
            transition: 'background 0.22s ease, box-shadow 0.22s ease',
          }}
        >
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(255,255,255,0.25)', borderTopColor: 'white' }} />
          ) : (
            <ArrowRight size={15} className="text-white" />
          )}
        </button>
      </div>

      {/* Amber sweep bar */}
      <div className="relative mx-3 mt-1.5 rounded-full overflow-hidden"
        style={{ height: 2, opacity: loading ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        <div className="absolute top-0 h-full rounded-full" style={{
          width: '42%',
          background: 'linear-gradient(90deg, transparent, #C4A882 40%, #E8C99A 60%, transparent)',
          animation: 'searchSweep 1.35s ease-in-out infinite',
        }} />
      </div>
    </form>
  );

  const trending = (
    <AnimatePresence>
      {inputFocused && !inputValue && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 right-0 z-50 rounded-2xl overflow-hidden"
          style={{
            top: 'calc(100% + 8px)',
            background: 'rgba(26, 23, 20, 0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.32)',
          }}
        >
          <div className="px-3 pt-3 pb-2">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] mb-1.5 px-2"
              style={{ color: 'rgba(255,255,255,0.28)' }}>
              Trending searches
            </p>
            {TRENDING.map((item, i) => (
              <motion.button
                key={item.query}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                onMouseDown={() => {
                  setInputValue(item.query);
                  setQuery(item.query);
                  router.replace(`/results?q=${encodeURIComponent(item.query)}`, { scroll: false });
                }}
                className="w-full flex items-center gap-3 py-2 px-2 rounded-xl text-left transition-colors"
                style={{ color: 'rgba(255,255,255,0.78)' }}
                whileHover={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <span className="text-base leading-none">{item.emoji}</span>
                <span className="flex-1 text-[13px] font-medium">{item.query}</span>
                <CornerDownLeft size={11} style={{ color: 'rgba(255,255,255,0.22)', flexShrink: 0 }} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ══════════════════════════════════════════════════════════
     Render
  ══════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: '100dvh', background: '#F2EDE4' }}>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* ── Nav ── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4"
        style={{
          height: NAV_H,
          background: 'rgba(242,237,228,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(212,196,168,0.25)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push('/')}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E0D4] active:scale-90 transition-all"
          >
            <ArrowLeft size={15} className="text-[#1A1A1A]" />
          </button>
          <Logo size="xs" />
        </div>

        <div className="flex items-center gap-2">
          {bookmarkCount > 0 && (
            <div className="flex items-center gap-1.5 text-white text-[11px] font-semibold rounded-full px-2.5 py-1"
              style={{ background: '#1A1A1A' }}>
              <BookmarkCheck size={11} />{bookmarkCount}
            </div>
          )}

          {user ? (
            <button onClick={() => setAuthOpen(true)}
              className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center font-black text-white text-[10px] transition-all hover:scale-105 active:scale-95"
              style={{ background: '#1A1A1A' }} title={user.email}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                : ([user.first_name, user.last_name].filter(Boolean).map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase())
              }
            </button>
          ) : (
            <button onClick={() => setAuthOpen(true)}
              className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all hover:bg-[#1A1A1A] hover:text-white active:scale-95"
              style={{ border: '1.5px solid #1A1A1A', color: '#1A1A1A', letterSpacing: '0.08em' }}>
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* ── Filter bar — only when results ── */}
      {hasResults && (
        <>
          <div
            className="flex items-center gap-2 px-4 py-2.5"
            style={{ borderBottom: '1px solid rgba(212,196,168,0.2)' }}
          >
            {/* Gender toggle */}
            <div className="flex rounded-full p-[3px] shrink-0" style={{ background: 'rgba(0,0,0,0.06)' }}>
              {(['Women', 'Men'] as Gender[]).map(g => (
                <button
                  key={g}
                  onClick={() => g === 'Men' ? showComingSoon() : setGender(g)}
                  className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-200"
                  style={{
                    background: gender === g ? '#1A1A1A' : 'transparent',
                    color: gender === g ? 'white' : '#9B9B9B',
                    boxShadow: gender === g ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Result count */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="h-3 w-20 rounded-full animate-pulse" style={{ background: '#EDE9E1' }} />
              ) : rawProducts.length > 0 ? (
                <p className="text-[11.5px] font-medium truncate" style={{ color: '#9B9B9B' }}>
                  {total.toLocaleString()} {total === 1 ? 'result' : 'results'}
                  {query && <> · <span style={{ color: '#6B6B6B', fontWeight: 700 }}>&ldquo;{query}&rdquo;</span></>}
                </p>
              ) : null}
            </div>

            {/* Sort pills */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSort(opt.id)}
                  className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold active:scale-95"
                  style={{
                    color: sort === opt.id ? 'white' : '#6B6B6B',
                    transition: 'color 0.18s ease',
                    background: sort === opt.id ? 'transparent' : '#EAE5DC',
                  }}
                >
                  {sort === opt.id && (
                    <motion.div
                      layoutId="sort-pill-bg"
                      className="absolute inset-0 rounded-full"
                      style={{ background: '#1A1A1A', boxShadow: '0 0 0 2px rgba(196,168,130,0.40), 0 4px 14px rgba(0,0,0,0.18)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1">{opt.icon}<span>{opt.label}</span></span>
                </button>
              ))}
            </div>

            {/* Filter button */}
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 active:scale-95 shrink-0"
              style={{ background: activeFilterCount > 0 ? '#1A1A1A' : '#EAE5DC', color: activeFilterCount > 0 ? 'white' : '#6B6B6B' }}
            >
              <SlidersHorizontal size={11} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                  style={{ background: 'rgba(255,255,255,0.22)' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="px-4 py-1.5 flex gap-1.5 flex-wrap"
              style={{ borderBottom: '1px solid rgba(212,196,168,0.15)' }}>
              {filters.brand && (
                <button onClick={() => setFilters(f => ({ ...f, brand: undefined }))}
                  className="flex items-center gap-1 px-2.5 py-1 text-white text-[10.5px] font-semibold rounded-full hover:opacity-80 active:scale-95"
                  style={{ background: '#1A1A1A' }}>
                  {filters.brand}<X size={8} className="opacity-60" />
                </button>
              )}
              {(filters.minPrice != null || filters.maxPrice != null) && (
                <button onClick={() => setFilters(f => ({ ...f, minPrice: undefined, maxPrice: undefined }))}
                  className="flex items-center gap-1 px-2.5 py-1 text-white text-[10.5px] font-semibold rounded-full hover:opacity-80 active:scale-95"
                  style={{ background: '#1A1A1A' }}>
                  {filters.minPrice != null ? `$${filters.minPrice}` : ''}
                  {filters.minPrice != null && filters.maxPrice != null ? '–' : ''}
                  {filters.maxPrice != null ? `$${filters.maxPrice}` : ''}
                  <X size={8} className="opacity-60" />
                </button>
              )}
              {(filters.tags ?? []).map(t => (
                <button key={t}
                  onClick={() => setFilters(f => ({ ...f, tags: (f.tags ?? []).filter(x => x !== t) }))}
                  className="flex items-center gap-1 px-2.5 py-1 text-white text-[10.5px] font-semibold rounded-full capitalize hover:opacity-80 active:scale-95"
                  style={{ background: '#1A1A1A' }}>
                  {t}<X size={8} className="opacity-60" />
                </button>
              ))}
              <button onClick={() => setFilters({})}
                className="px-2.5 py-1 text-[10.5px] font-medium rounded-full hover:text-[#1A1A1A] active:scale-95"
                style={{ border: '1px solid rgba(212,196,168,0.6)', color: '#9B9B9B' }}>
                Clear all
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Product grid (extra bottom padding for fixed pill) ── */}
      {hasResults && (
        <main style={{ padding: '16px 14px 120px' }}>
          {loading ? (
            <MasonrySkeletonGrid cols={5} />
          ) : displayProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center gap-4 py-28"
            >
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, -6, 6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl select-none"
              >🔍</motion.div>
              <div className="text-center">
                <p className="font-black text-[#1A1A1A] text-base" style={{ letterSpacing: '-0.02em' }}>
                  No results found
                </p>
                <p className="text-sm max-w-xs mt-1" style={{ color: '#9B9B9B' }}>
                  Try a different search or clear your filters.
                </p>
              </div>
              {activeFilterCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.28, type: 'spring', stiffness: 400, damping: 25 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilters({})}
                  className="px-4 py-2 text-sm font-bold text-[#1A1A1A] rounded-full hover:bg-[#E8E0D4]"
                  style={{ border: '1.5px solid #D4C4A8' }}
                >
                  Clear filters
                </motion.button>
              )}
            </motion.div>
          ) : (
            <>
              <MasonryGrid
                products={displayProducts}
                onBookmark={handleBookmark}
                onMoreLikeThis={() => {}}
                onQuickView={handleQuickView}
              />
              <div ref={sentinelRef} className="h-4" />
              {loadingMore && (
                <div className="flex justify-center py-5">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: '#C4A882', animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              {!hasNext && !loadingMore && rawProducts.length > 0 && (
                <p className="text-center text-[11px] py-6 font-medium" style={{ color: '#CCCCCC' }}>
                  All {total.toLocaleString()} results shown
                </p>
              )}
            </>
          )}
        </main>
      )}

      {/* ══ SEARCH PILL — centered when empty, fixed bottom when results ══ */}
      <AnimatePresence mode="wait">
        {!hasResults ? (
          <motion.div
            key="centered"
            style={{
              position: 'fixed',
              top: NAV_H,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 16px',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <p className="text-[13px] font-medium mb-4 pointer-events-none select-none"
              style={{ color: '#BBBBBB' }}>
              Describe what you&apos;re looking for
            </p>
            <div className="relative w-full pointer-events-auto" style={{ maxWidth: 640 }}>
              {pill}
              {trending}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="bottom"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              padding: '10px 16px 14px',
              background: 'transparent',
              pointerEvents: 'auto',
            }}
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
          >
            <div className="relative max-w-2xl mx-auto">
              {pill}
              {trending}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input — always in DOM */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { e.target.value = ''; }}
      />

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        activeCount={activeFilterCount}
      />

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-24 right-5 z-40 w-11 h-11 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-transform"
          style={{ background: '#1A1A1A', boxShadow: '0 4px 20px rgba(0,0,0,0.22)' }}
        >
          <ArrowUp size={15} className="text-white" />
        </button>
      )}

      {/* Coming Soon toast */}
      <AnimatePresence>
        {comingSoon && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 8,  scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 px-5 py-3 rounded-full text-white text-[12px] font-bold"
            style={{ background: '#1A1A1A', boxShadow: '0 8px 32px rgba(0,0,0,0.28)', whiteSpace: 'nowrap' }}
          >
            <span style={{ fontSize: 15 }}>🚀</span>
            Coming soon
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setQuickViewProduct(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999999,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            />
            {/* Modal */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                zIndex: 1000000,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: 'min(100%, 420px)',
                  height: 'min(100%, 80vh)',
                  aspectRatio: '4/5',
                  backgroundColor: '#F2EDE4',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  pointerEvents: 'auto',
                  zIndex: 1000001,
                }}
              >
                {/* Image Container */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                }}>
                  {quickViewProduct.imageUrl ? (
                    <Image
                      src={quickViewProduct.imageUrl}
                      alt={quickViewProduct.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(145deg, #EDE8E0 0%, #DDD5C6 100%)',
                    }}>
                      <Zap size={60} style={{ color: '#9B8877', opacity: 0.4 }} />
                    </div>
                  )}
                  
                  {/* Gradient overlay - subtle */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.1) 100%)',
                  }} />

                  {/* Close button - top right */}
                  <button
                    onClick={() => setQuickViewProduct(null)}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    <X size={18} style={{ color: '#1A1A1A' }} />
                  </button>

                  {/* Bookmark button - bottom left */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) {
                        setAuthOpen(true);
                      } else {
                        handleBookmark(quickViewProduct.id);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {quickViewProduct.isBookmarked ? (
                      <BookmarkCheck size={18} style={{ color: '#C4A882' }} />
                    ) : (
                      <Bookmark size={18} style={{ color: '#1A1A1A' }} />
                    )}
                  </button>

                  {/* Discount badge - top left */}
                  {quickViewProduct.originalPrice && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                    }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 900,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '6px 12px',
                        borderRadius: '50px',
                        backgroundColor: 'rgba(26, 26, 26, 0.85)',
                        color: 'white',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}>
                        -{Math.round((1 - quickViewProduct.price / quickViewProduct.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}

                  {/* View Details button - bottom right */}
                  <button
                    onClick={() => {
                      localStorage.setItem(`browseai:product:${quickViewProduct.id}`, JSON.stringify(quickViewProduct));
                      router.push(`/product/${quickViewProduct.id}`);
                      setQuickViewProduct(null);
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '16px',
                      padding: '8px 16px',
                      fontSize: '11px',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      borderRadius: '50px',
                      backgroundColor: 'rgba(26, 26, 26, 0.9)',
                      color: 'white',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center" style={{ height: '100dvh', background: '#F2EDE4' }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: '#C4A882', animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
