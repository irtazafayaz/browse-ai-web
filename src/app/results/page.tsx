"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { ArrowLeft, BookmarkCheck, ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import MasonryGrid, { MasonrySkeletonGrid } from "@/components/MasonryGrid";
import Logo from "@/components/Logo";
import FilterDrawer from "@/components/FilterDrawer";
import AuthModal from "@/components/AuthModal";
import SearchPill, { PLACEHOLDERS } from "@/components/results/SearchPill";
import QuickViewModal from "@/components/results/QuickViewModal";
import ComingSoonToast from "@/components/results/ComingSoonToast";
import FilterBar from "@/components/results/FilterBar";
import ActiveFilterChips from "@/components/results/ActiveFilterChips";
import { Product, SearchFilters } from "@/lib/types";
import { searchProducts, toggleBookmark } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

type SortMode = "match" | "price-asc" | "price-desc" | "trending";
type Gender = "Women" | "Men";

function sortProducts(products: Product[], sort: SortMode): Product[] {
  const arr = [...products];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "trending":
      return arr.sort((a, b) => b.id.localeCompare(a.id));
    default:
      return arr;
  }
}

const NAV_H = 49;

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const initialQuery = searchParams.get("q") ?? "";

  const [inputValue, setInputValue] = useState(initialQuery);
  const [inputFocused, setInputFocused] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [phIdx, setPhIdx] = useState(0);
  const [phVisible, setPhVisible] = useState(true);

  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [sort, setSort] = useState<SortMode>("match");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [gender, setGender] = useState<Gender>("Women");
  const [comingSoon, setComingSoon] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );
  const [showScrollTop, setShowScrollTop] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showComingSoonToast = () => {
    setComingSoon(true);
    setTimeout(() => setComingSoon(false), 2200);
  };

  useEffect(() => {
    if (quickViewProduct) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [quickViewProduct]);

  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 320);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (inputFocused || inputValue) return;
    const id = setInterval(() => {
      setPhVisible(false);
      setTimeout(() => {
        setPhIdx((i) => (i + 1) % PLACEHOLDERS.length);
        setPhVisible(true);
      }, 280);
    }, 3600);
    return () => clearInterval(id);
  }, [inputFocused, inputValue]);

  const displayProducts = sortProducts(rawProducts, sort);
  const bookmarkCount = rawProducts.filter((p) => p.isBookmarked).length;
  const hasResults = loading || rawProducts.length > 0;
  const activeFilterCount = [
    filters.brand,
    filters.minPrice != null || filters.maxPrice != null ? "1" : null,
    ...(filters.tags ?? []),
  ].filter(Boolean).length;

  const fetchText = useCallback(
    async (q: string, f: SearchFilters, pageNum: number, reset: boolean) => {
      if (!q) return;
      if (reset) setLoading(true);
      else setLoadingMore(true);
      try {
        const r = await searchProducts(q, pageNum);
        setTotal(r.total);
        setPage(pageNum);
        setHasNext(r.has_next);
        if (reset) setRawProducts(r.products);
        else setRawProducts((prev) => [...prev, ...r.products]);
      } catch {
        /* silent */
      } finally {
        if (reset) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [],
  );

  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (initialQuery) fetchText(initialQuery, {}, 1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevQueryRef = useRef(query);
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    const qChanged = query !== prevQueryRef.current;
    const fChanged =
      JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);
    prevQueryRef.current = query;
    prevFiltersRef.current = filters;
    if (qChanged || fChanged) {
      if (query) fetchText(query, filters, 1, true);
      else {
        setRawProducts([]);
        setTotal(0);
        setHasNext(false);
      }
    }
  }, [query, filters, fetchText]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNext && !loadingMore && !loading) {
          fetchText(query, filters, page + 1, false);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNext, loadingMore, loading, page, query, filters, fetchText]);

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = inputValue.trim();
    if (!t) return;
    setQuery(t);
    router.replace(`/results?q=${encodeURIComponent(t)}`, { scroll: false });
  };

  const handleBookmark = useCallback(
    (id: string) => {
      if (!user) {
        setAuthOpen(true);
        return;
      }
      setRawProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p,
        ),
      );
      toggleBookmark(id).catch(() =>
        setRawProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p,
          ),
        ),
      );
    },
    [user],
  );

  const clearAll = () => {
    setInputValue("");
    setQuery("");
    setRawProducts([]);
    setTotal(0);
    setHasNext(false);
    router.replace("/results", { scroll: false });
  };

  const handleTrendingSelect = (q: string) => {
    setInputValue(q);
    setQuery(q);
    router.replace(`/results?q=${encodeURIComponent(q)}`, { scroll: false });
  };

  const searchPillProps = {
    inputFocused,
    setInputFocused,
    inputValue,
    setInputValue,
    phIdx,
    phVisible,
    loading,
    onSubmit: handleTextSearch,
    onClear: clearAll,
    onCameraClick: showComingSoonToast,
    onTrendingSelect: handleTrendingSelect,
  };

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <header
        className="sticky top-0 z-30 flex items-center px-4"
        style={{
          height: NAV_H,
          background: "var(--bg)",
          borderBottom: "3px solid var(--ink)",
        }}
      >
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => router.push("/")}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--bg)] active:scale-90 transition-all duration-150 ease-out"
          >
            <ArrowLeft size={15} className="text-[var(--ink)]" />
          </button>
          <Logo size="xs" onClick={() => router.push("/")} />
        </div>

        <div className="flex-1 flex justify-center px-2 min-w-0">
          <span
            className="text-[12px] truncate max-w-[160px] font-mono-brutal"
            style={{ color: "var(--ink-muted)" }}
          >
            {query}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          {bookmarkCount > 0 && (
            <div
              className="flex items-center gap-1.5 text-white text-[11px] font-semibold border-brutal-thin px-2.5 py-1"
              style={{ background: "var(--ink)" }}
            >
              <BookmarkCheck size={11} />
              {bookmarkCount}
            </div>
          )}
          {user ? (
            <button
              onClick={() => setAuthOpen(true)}
              className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center font-black text-white text-[10px] border-brutal-thin transition-all duration-150 ease-out hover:scale-105 active:scale-95"
              style={{ background: "var(--ink)" }}
              title={user.email}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
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
              onClick={() => setAuthOpen(true)}
              className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all duration-150 ease-out hover:bg-[var(--ink)] hover:text-white active:scale-95"
              style={{
                border: "3px solid var(--ink)",
                color: "var(--ink)",
                letterSpacing: "0.08em",
              }}
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {hasResults && (
        <>
          <FilterBar
            gender={gender}
            onGenderChange={setGender}
            sort={sort}
            onSortChange={setSort}
            activeFilterCount={activeFilterCount}
            onFilterOpen={() => setFilterOpen(true)}
            loading={loading}
            hasProducts={rawProducts.length > 0}
            total={total}
            query={query}
            onComingSoon={showComingSoonToast}
          />
          {activeFilterCount > 0 && (
            <ActiveFilterChips filters={filters} onFiltersChange={setFilters} />
          )}
        </>
      )}

      {hasResults && (
        <main style={{ padding: "16px 14px 120px" }}>
          {loading ? (
            <MasonrySkeletonGrid cols={5} />
          ) : displayProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center justify-center gap-4 py-28"
            >
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, -6, 6, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-5xl select-none"
              >
                🔍
              </motion.div>
              <div className="text-center">
                <p
                  className="font-display text-[var(--ink)] text-base"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  No results found
                </p>
                <p
                  className="text-sm max-w-xs mt-1"
                  style={{ color: "var(--ink-muted)" }}
                >
                  Try a different search or clear your filters.
                </p>
              </div>
              {activeFilterCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.28,
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilters({})}
                  className="px-4 py-2 text-sm font-bold text-[var(--ink)] hover:bg-[var(--bg)]"
                  style={{ border: "3px solid var(--ink)" }}
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
                onQuickView={setQuickViewProduct}
              />
              <div ref={sentinelRef} className="h-4" />
              {loadingMore && (
                <div className="flex justify-center py-5">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 animate-bounce"
                        style={{
                          background: "var(--accent)",
                          animationDelay: `${i * 150}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {!hasNext && !loadingMore && rawProducts.length > 0 && (
                <p
                  className="text-center text-[11px] py-6 font-mono-brutal uppercase"
                  style={{ color: "var(--ink-muted)" }}
                >
                  All {total.toLocaleString()} results shown
                </p>
              )}
            </>
          )}
        </main>
      )}

      <AnimatePresence mode="wait">
        {!hasResults ? (
          <motion.div
            key="centered"
            style={{
              position: "fixed",
              top: NAV_H,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 16px",
              pointerEvents: "none",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <p
              className="text-[13px] font-mono-brutal uppercase mb-4 pointer-events-none select-none"
              style={{ color: "var(--ink-muted)" }}
            >
              Describe what you&apos;re looking for
            </p>
            <div
              className="relative w-full pointer-events-auto"
              style={{ maxWidth: 640 }}
            >
              <SearchPill {...searchPillProps} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="bottom"
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              padding: "10px 16px 14px",
              background: "transparent",
              pointerEvents: "auto",
            }}
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
          >
            <div className="relative max-w-2xl mx-auto">
              <SearchPill {...searchPillProps} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          e.target.value = "";
        }}
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
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-24 right-5 z-40 w-11 h-11 rounded-full flex items-center justify-center border-brutal hover:scale-110 active:scale-90 transition-transform duration-150 ease-out"
          style={{
            background: "var(--ink)",
            boxShadow: "4px 4px 0 var(--ink)",
          }}
        >
          <ArrowUp size={15} className="text-white" />
        </button>
      )}

      <ComingSoonToast visible={comingSoon} />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onBookmark={handleBookmark}
        onViewDetails={(id) => {
          if (quickViewProduct)
            localStorage.setItem(
              `browseai:product:${id}`,
              JSON.stringify(quickViewProduct),
            );
          router.push(`/product/${id}`);
          setQuickViewProduct(null);
        }}
        isAuthed={!!user}
        onAuthRequired={() => setAuthOpen(true)}
      />
    </div>
  );
}

const LoadingDots = () => (
  <div
    className="flex items-center justify-center"
    style={{ height: "100dvh", background: "var(--bg)" }}
  >
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 animate-bounce"
          style={{ background: "var(--accent)", animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  </div>
);

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingDots />}>
      <ResultsContent />
    </Suspense>
  );
}
