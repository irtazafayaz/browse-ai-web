'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import {
  ArrowLeft, BookmarkCheck, ArrowRight, X,
  Search, Camera, SlidersHorizontal,
  TrendingUp, DollarSign, Star, ArrowUp,
  ShoppingBag, CornerDownLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MasonryGrid, { MasonrySkeletonGrid } from '@/components/MasonryGrid';
import Logo from '@/components/Logo';
import FilterDrawer from '@/components/FilterDrawer';
import AuthModal from '@/components/AuthModal';
import { Product, SearchFilters } from '@/lib/types';
import { getProducts, searchProducts, searchByImage, toggleBookmark } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

type SearchMode = 'text' | 'image';
type SortMode   = 'match' | 'price-asc' | 'price-desc' | 'trending';
type Gender     = 'Women' | 'Men';

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

/* SkeletonGrid is now handled by MasonrySkeletonGrid from MasonryGrid.tsx */

const NAV_H = 49;

/* Cycling placeholder suggestions */
const PLACEHOLDERS = [
  'Search for anything…',
  'Try "oversized blazer"…',
  'Try "floral midi dress"…',
  'Try "leather ankle boots"…',
  'Try "cashmere turtleneck"…',
  'Try "wide-leg linen trousers"…',
];

/* Trending suggestions shown in the dropdown */
const TRENDING = [
  { query: 'Oversized blazer',       emoji: '🔥' },
  { query: 'Floral midi dress',      emoji: '🌸' },
  { query: 'Leather ankle boots',    emoji: '👢' },
  { query: 'Wide-leg trousers',      emoji: '✨' },
  { query: 'Cashmere turtleneck',    emoji: '🍂' },
];

/* ═══════════════════════════════════════════════════════════
   Results content
═══════════════════════════════════════════════════════════ */
function ResultsContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user }     = useAuth();
  const initialQuery = searchParams.get('q') ?? '';

  /* ── Search state ── */
  const [mode, setMode]               = useState<SearchMode>('text');
  const [inputValue, setInputValue]   = useState(initialQuery);
  const [inputFocused, setInputFocused] = useState(false);
  const [query, setQuery]             = useState(initialQuery);

  /* ── Image state ── */
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging]     = useState(false);

  /* ── Placeholder cycling ── */
  const [phIdx, setPhIdx]         = useState(0);
  const [phVisible, setPhVisible] = useState(true);

  /* ── Icon pop on mode switch ── */
  const [iconPopping, setIconPopping] = useState<SearchMode | null>(null);

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
  const [cartCount, setCartCount] = useState(0);
  const handleAddToCart = (id: string) => { void id; setCartCount(n => n + 1); };

  const sentinelRef  = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Scroll-to-top visibility ── */
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 320);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* ── Cycling placeholder (idle only — stops when typing / focused / image) ── */
  useEffect(() => {
    if (inputFocused || inputValue || imagePreview) return;
    const id = setInterval(() => {
      setPhVisible(false);
      setTimeout(() => {
        setPhIdx(i => (i + 1) % PLACEHOLDERS.length);
        setPhVisible(true);
      }, 280);
    }, 3600);
    return () => clearInterval(id);
  }, [inputFocused, inputValue, imagePreview]);

  /* ── Icon pop helper ── */
  const popIcon = (m: SearchMode) => {
    setIconPopping(m);
    setTimeout(() => setIconPopping(null), 380);
  };

  const displayProducts = sortProducts(rawProducts, sort);
  const bookmarkCount   = rawProducts.filter(p => p.isBookmarked).length;

  const activeFilterCount = [
    filters.brand,
    (filters.minPrice != null || filters.maxPrice != null) ? '1' : null,
    ...(filters.tags ?? []),
  ].filter(Boolean).length;

  /* ══ Fetchers ══ */
  const fetchText = useCallback(async (
    q: string, f: SearchFilters, pageNum: number, reset: boolean,
  ) => {
    if (reset) setLoading(true); else setLoadingMore(true);
    try {
      // When a query is present → BrowseBy AI API (POST /api/products/search/)
      // When browsing with no query → MongoDB product list with filters
      const r = q
        ? await searchProducts(q, pageNum)
        : await getProducts({
            page: pageNum,
            brand: f.brand, min_price: f.minPrice, max_price: f.maxPrice,
            tags: f.tags?.length ? f.tags : undefined,
          });
      setTotal(r.total); setPage(pageNum); setHasNext(r.has_next);
      if (reset) setRawProducts(r.products);
      else       setRawProducts(prev => [...prev, ...r.products]);
    } catch { /* silent */ } finally {
      if (reset) setLoading(false); else setLoadingMore(false);
    }
  }, []);

  const fetchImage = useCallback(async (file: File, pageNum: number, reset: boolean) => {
    if (reset) setLoading(true); else setLoadingMore(true);
    try {
      const r = await searchByImage(file, pageNum);
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
    fetchText(initialQuery, {}, 1, true);
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
    if (mode === 'text' && (qChanged || fChanged)) fetchText(query, filters, 1, true);
  }, [query, filters, mode, fetchText]);

  /* ── Mode switch ── */
  const prevModeRef = useRef(mode);
  useEffect(() => {
    if (mode === prevModeRef.current) return;
    prevModeRef.current = mode;
    if (mode === 'image') {
      if (!imageFile) { setRawProducts([]); setTotal(0); setHasNext(false); }
    } else {
      fetchText(query, filters, 1, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  /* ── Infinite scroll ── */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNext && !loadingMore && !loading) {
        if (mode === 'text') fetchText(query, filters, page + 1, false);
        else if (imageFile)  fetchImage(imageFile, page + 1, false);
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNext, loadingMore, loading, page, mode, query, filters, imageFile, fetchText, fetchImage]);

  /* ══ Handlers ══ */
  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = inputValue.trim();
    if (!t && !imageFile) return;
    if (t) {
      setQuery(t);
      router.replace(`/results?q=${encodeURIComponent(t)}`, { scroll: false });
    }
    if (mode === 'image' && imageFile) fetchImage(imageFile, 1, true);
  };

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setMode('image');
    fetchImage(file, 1, true);
  }, [imagePreview, fetchImage]);

  const handleBookmark = useCallback((id: string) => {
    setRawProducts(prev => prev.map(p => p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p));
    toggleBookmark(id).catch(() =>
      setRawProducts(prev => prev.map(p => p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  }, []);

  const clearAll = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setInputValue('');
    setQuery('');
    setMode('text');
    router.replace('/results', { scroll: false });
    fetchText('', {}, 1, true);
  };

  const hasInput = !!inputValue || !!imagePreview;
  const pillDark = inputFocused || isDragging || (!!imagePreview && !inputFocused);

  /* ══════════════════════════════════════════════════════════
     Render
  ══════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: '100dvh', background: '#F2EDE4' }}>

      {/* ══════════════════════════════════
          STICKY NAV
      ══════════════════════════════════ */}
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
          {/* Cart badge */}
          <motion.button
            className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E0D4] transition-colors"
            whileTap={{ scale: 0.9 }}
            title="Cart"
          >
            <ShoppingBag size={15} className="text-[#1A1A1A]" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 22 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                  style={{ background: '#C4A882' }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {bookmarkCount > 0 && (
            <div className="flex items-center gap-1.5 text-white text-[11px] font-semibold rounded-full px-2.5 py-1"
              style={{ background: '#1A1A1A' }}>
              <BookmarkCheck size={11} />{bookmarkCount}
            </div>
          )}
          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
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

      {/* ══════════════════════════════════
          FLOATING SEARCH PILL
          — single unified pill, both icons visible
      ══════════════════════════════════ */}
      <div
        className="sticky z-20 px-4 py-3 pointer-events-none"
        style={{ top: NAV_H }}
      >
        <div className="relative max-w-2xl mx-auto pointer-events-auto animate-search-drop">
          <form
            onSubmit={handleTextSearch}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleImageFile(f);
            }}
          >
            {/* ── Search pill ── */}
            <div
              className={`flex items-center ${!inputFocused && !isDragging ? 'animate-pill-breathe' : ''}`}
              style={{
                background: 'rgba(30, 27, 23, 0.93)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 100,
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '6px 6px 6px 20px',
                gap: 0,
                /* Override CSS breathe anim with focused/drag shadow */
                boxShadow: inputFocused
                  ? '0 0 0 2px #C4A882, 0 8px 32px rgba(0,0,0,0.25), 0 20px 50px rgba(0,0,0,0.15)'
                  : isDragging
                    ? '0 0 0 2px #C4A882, 0 8px 28px rgba(0,0,0,0.22)'
                    : undefined,
                transform: inputFocused || isDragging ? 'translateY(-2px) scale(1.006)' : 'translateY(0) scale(1)',
                transition: 'box-shadow 0.25s ease, transform 0.35s cubic-bezier(0.19,1,0.22,1)',
              }}
            >
              {/* Search icon — springs when switching to text mode */}
              <button
                type="button"
                onClick={() => { setMode('text'); setImageFile(null); setImagePreview(null); popIcon('text'); }}
                className={`shrink-0 active:scale-90 ${iconPopping === 'text' ? 'animate-icon-pop' : ''}`}
                style={{ marginRight: 8, lineHeight: 0 }}
                title="Text search"
              >
                <Search
                  size={16}
                  style={{
                    color: mode === 'text' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.28)',
                    transition: 'color 0.18s ease',
                  }}
                />
              </button>

              {/* Camera icon — coming soon */}
              <button
                type="button"
                onClick={() => { showComingSoon(); popIcon('image'); }}
                title="Image search (coming soon)"
                className={`shrink-0 active:scale-90 ${iconPopping === 'image' ? 'animate-icon-pop' : ''}`}
                style={{ marginRight: 14, lineHeight: 0 }}
              >
                {imagePreview ? (
                  <div
                    className="w-6 h-6 rounded-full overflow-hidden"
                    style={{
                      border: '1.5px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 0 0 2px rgba(196,168,130,0.4)',
                      animation: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
                    }}
                  >
                    <img src={imagePreview} alt="uploaded" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <Camera
                    size={16}
                    style={{
                      color: mode === 'image' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.28)',
                      transition: 'color 0.18s ease',
                    }}
                  />
                )}
              </button>

              {/* Divider */}
              <div
                className="shrink-0 self-stretch"
                style={{ width: 1, background: 'rgba(255,255,255,0.09)', margin: '5px 16px 5px 0' }}
              />

              {/* Text input + animated placeholder overlay */}
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
                {/* Cycling placeholder — visible only when input is empty & idle */}
                {!inputValue && !imagePreview && (
                  <span
                    key={phIdx}
                    className="absolute inset-0 flex items-center pointer-events-none select-none animate-ph-in"
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
                    {isDragging ? 'Drop image here…' : PLACEHOLDERS[phIdx]}
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

              {/* Submit — amber on focus, spinner when loading */}
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
                  <div
                    className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.25)', borderTopColor: 'white' }}
                  />
                ) : (
                  <ArrowRight size={15} className="text-white" />
                )}
              </button>
            </div>

            {/* ── Amber sweep bar — appears while loading ── */}
            <div
              className="relative mx-3 mt-1.5 rounded-full overflow-hidden"
              style={{
                height: 2,
                opacity: loading ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
            >
              <div
                className="absolute top-0 h-full rounded-full"
                style={{
                  width: '42%',
                  background: 'linear-gradient(90deg, transparent, #C4A882 40%, #E8C99A 60%, transparent)',
                  animation: 'searchSweep 1.35s ease-in-out infinite',
                }}
              />
            </div>
          </form>

          {/* ── Trending suggestions dropdown ── */}
          <AnimatePresence>
            {inputFocused && !inputValue && !imagePreview && (
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

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleImageFile(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════
          SORT + FILTER BAR
      ══════════════════════════════════ */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ borderBottom: '1px solid rgba(212,196,168,0.2)' }}
      >
        {/* Gender toggle */}
        <div
          className="flex rounded-full p-[3px] shrink-0"
          style={{ background: 'rgba(0,0,0,0.06)' }}
        >
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
              {query && mode === 'text' && (
                <> · <span style={{ color: '#6B6B6B', fontWeight: 700 }}>&ldquo;{query}&rdquo;</span></>
              )}
              {imagePreview && mode === 'image' && (
                <> · <span style={{ color: '#6B6B6B', fontWeight: 700 }}>visual search</span></>
              )}
            </p>
          ) : null}
        </div>

        {/* Sort pills — shared layoutId background slides between active pill */}
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
                  style={{
                    background: '#1A1A1A',
                    boxShadow: '0 0 0 2px rgba(196,168,130,0.40), 0 4px 14px rgba(0,0,0,0.18)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                {opt.icon}
                <span>{opt.label}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Filter button */}
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 active:scale-95 shrink-0"
          style={{
            background: activeFilterCount > 0 ? '#1A1A1A' : '#EAE5DC',
            color: activeFilterCount > 0 ? 'white' : '#6B6B6B',
          }}
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

      {/* ── Active filter chips ── */}
      {activeFilterCount > 0 && (
        <div className="px-4 py-1.5 flex gap-1.5 flex-wrap"
          style={{ borderBottom: '1px solid rgba(212,196,168,0.15)' }}>
          {filters.brand && (
            <button onClick={() => setFilters(f => ({ ...f, brand: undefined }))}
              className="flex items-center gap-1 px-2.5 py-1 text-white text-[10.5px] font-semibold rounded-full transition-all hover:opacity-80 active:scale-95"
              style={{ background: '#1A1A1A' }}>
              {filters.brand}<X size={8} className="opacity-60" />
            </button>
          )}
          {(filters.minPrice != null || filters.maxPrice != null) && (
            <button onClick={() => setFilters(f => ({ ...f, minPrice: undefined, maxPrice: undefined }))}
              className="flex items-center gap-1 px-2.5 py-1 text-white text-[10.5px] font-semibold rounded-full transition-all hover:opacity-80 active:scale-95"
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
              className="flex items-center gap-1 px-2.5 py-1 text-white text-[10.5px] font-semibold rounded-full capitalize transition-all hover:opacity-80 active:scale-95"
              style={{ background: '#1A1A1A' }}>
              {t}<X size={8} className="opacity-60" />
            </button>
          ))}
          <button onClick={() => setFilters({})}
            className="px-2.5 py-1 text-[10.5px] font-medium rounded-full transition-all hover:text-[#1A1A1A] active:scale-95"
            style={{ border: '1px solid rgba(212,196,168,0.6)', color: '#9B9B9B' }}>
            Clear all
          </button>
        </div>
      )}

      {/* ══════════════════════════════════
          PRODUCT GRID
      ══════════════════════════════════ */}
      <main style={{ padding: '16px 14px 80px' }}>
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
            >
              🔍
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-center"
            >
              <p className="font-black text-[#1A1A1A] text-base" style={{ letterSpacing: '-0.02em' }}>
                No results found
              </p>
              <p className="text-sm text-center max-w-xs mt-1" style={{ color: '#9B9B9B' }}>
                {mode === 'text'
                  ? 'Try a different search or clear your filters.'
                  : 'Upload a photo to find similar products.'}
              </p>
            </motion.div>
            {activeFilterCount > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.28, type: 'spring', stiffness: 400, damping: 25 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilters({})}
                className="mt-1 px-4 py-2 text-sm font-bold text-[#1A1A1A] rounded-full transition-colors hover:bg-[#E8E0D4]"
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
              onAddToCart={handleAddToCart}
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

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        activeCount={activeFilterCount}
      />

      {/* ── Scroll-to-top button ── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-6 right-5 z-40 w-11 h-11 rounded-full flex items-center justify-center animate-scroll-top-in hover:scale-110 active:scale-90 transition-transform"
          style={{
            background: '#1A1A1A',
            boxShadow: '0 4px 20px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.12)',
          }}
        >
          <ArrowUp size={15} className="text-white" />
        </button>
      )}

      {/* ── Coming Soon toast ── */}
      <AnimatePresence>
        {comingSoon && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 8,  scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 px-5 py-3 rounded-full text-white text-[12px] font-bold"
            style={{
              background: '#1A1A1A',
              boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 15 }}>🚀</span>
            Coming soon
          </motion.div>
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
