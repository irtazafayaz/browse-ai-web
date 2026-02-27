'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import {
  ArrowLeft, BookmarkCheck, PanelLeft, LayoutGrid,
  MessageCircle, X, Sparkles, SlidersHorizontal,
  ArrowUpDown, TrendingUp, DollarSign, Star,
} from 'lucide-react';
import ChatPanel from '@/components/ChatPanel';
import MasonryGrid from '@/components/MasonryGrid';
import { ChatMessage, FilterChip, Product } from '@/lib/types';
import { getProducts, searchProducts as apiSearch, toggleBookmark } from '@/lib/api';

/* ══════════════════════════════════════
   Types
══════════════════════════════════════ */
type LayoutMode = 'sidebar' | 'dialog';
type SortMode = 'match' | 'price-asc' | 'price-desc' | 'trending';

/* ══════════════════════════════════════
   Shared sub-components
══════════════════════════════════════ */

function BookmarksPill({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div
      className="flex items-center gap-1.5 text-white text-xs font-semibold rounded-full px-3 py-1.5 animate-scale-in"
      style={{ background: '#1A1A1A', boxShadow: '0 4px 12px rgba(0,0,0,0.22)' }}
    >
      <BookmarkCheck size={12} />
      {count} saved
    </div>
  );
}

/* 2-option layout toggle */
function LayoutToggle({ current, onChange }: { current: LayoutMode; onChange: (m: LayoutMode) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-full p-1" style={{ background: '#EDE9E1', border: '1px solid #DDD9D0' }}>
      <button
        onClick={() => onChange('sidebar')}
        title="Sidebar layout"
        className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          background: current === 'sidebar' ? '#1A1A1A' : 'transparent',
          color: current === 'sidebar' ? 'white' : '#8B8B8B',
        }}
      >
        <PanelLeft size={13} />
      </button>
      <button
        onClick={() => onChange('dialog')}
        title="Dialog layout"
        className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          background: current === 'dialog' ? '#1A1A1A' : 'transparent',
          color: current === 'dialog' ? 'white' : '#8B8B8B',
        }}
      >
        <LayoutGrid size={13} />
      </button>
    </div>
  );
}

/* Sort chip row */
const SORT_OPTIONS: { id: SortMode; label: string; icon: React.ReactNode }[] = [
  { id: 'match',      label: 'Best match',   icon: <Star size={10} /> },
  { id: 'trending',   label: 'Trending',     icon: <TrendingUp size={10} /> },
  { id: 'price-asc',  label: 'Price ↑',      icon: <DollarSign size={10} /> },
  { id: 'price-desc', label: 'Price ↓',      icon: <DollarSign size={10} /> },
];

function SortBar({
  sort, onSort, count, query,
}: {
  sort: SortMode;
  onSort: (s: SortMode) => void;
  count: number;
  query: string;
}) {
  return (
    <div className="flex items-center gap-3 animate-fade-slide-up" style={{ animationDuration: '0.5s' }}>
      {/* Result count + query */}
      <div className="flex-1 min-w-0">
        {query && (
          <h1
            className="font-black text-[#1A1A1A] text-lg tracking-tight truncate"
            style={{ letterSpacing: '-0.03em' }}
          >
            &ldquo;{query}&rdquo;
          </h1>
        )}
        <p className="text-xs text-[#9B9B9B] mt-0.5 font-medium">
          {count} {count === 1 ? 'result' : 'results'}
        </p>
      </div>

      {/* Sort chips */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <ArrowUpDown size={11} className="text-[#AAAAAA]" />
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSort(opt.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-semibold transition-all duration-200 active:scale-95"
            style={{
              background: sort === opt.id ? '#1A1A1A' : '#EDE9E1',
              color: sort === opt.id ? 'white' : '#6B6B6B',
              border: sort === opt.id ? '1px solid #1A1A1A' : '1px solid transparent',
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Active filter chips */
function FilterRow({ filters, onToggle }: { filters: FilterChip[]; onToggle: (id: string) => void }) {
  const active = filters.filter(f => f.isSelected);
  if (active.length === 0) return null;
  return (
    <div className="flex gap-1.5 flex-wrap animate-fade-in">
      {active.map(f => (
        <button
          key={f.id}
          onClick={() => onToggle(f.id)}
          className="px-2.5 py-1 text-white text-[11px] font-semibold rounded-full flex items-center gap-1 transition-all duration-200 hover:opacity-80 active:scale-95"
          style={{ background: '#1A1A1A', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
        >
          {f.label}
          <X size={9} className="opacity-60" />
        </button>
      ))}
    </div>
  );
}

/* Sort helper */
function sortProducts(products: Product[], sort: SortMode): Product[] {
  const arr = [...products];
  switch (sort) {
    case 'price-asc':  return arr.sort((a, b) => a.price - b.price);
    case 'price-desc': return arr.sort((a, b) => b.price - a.price);
    case 'trending':   return arr.sort((a, b) => b.id.localeCompare(a.id)); // newest IDs
    default:           return arr; // 'match' — keep server order
  }
}

/* ══════════════════════════════════════
   Shared props type
══════════════════════════════════════ */
interface SharedLayoutProps {
  products: Product[];
  messages: ChatMessage[];
  filters: FilterChip[];
  isTyping: boolean;
  initialQuery: string;
  sort: SortMode;
  bookmarkCount: number;
  onBookmark: (id: string) => void;
  onMoreLikeThis: (p: Product) => void;
  onSend: (text: string) => void;
  onToggleFilter: (id: string) => void;
  onSortChange: (s: SortMode) => void;
  onBack: () => void;
  layoutNode: React.ReactNode;
}

/* Shared top bar */
function TopBar({
  onBack, bookmarkCount, layoutNode, chatToggle, chatDot,
}: {
  onBack: () => void;
  bookmarkCount: number;
  layoutNode: React.ReactNode;
  chatToggle?: React.ReactNode;
  chatDot?: boolean;
}) {
  return (
    <header
      className="shrink-0 flex items-center justify-between px-4 py-3 z-20 animate-fade-in"
      style={{
        background: 'rgba(242,237,228,0.94)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(212,196,168,0.35)',
        boxShadow: '0 1px 0 rgba(212,196,168,0.3)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[#E8E0D4] active:scale-90"
        >
          <ArrowLeft size={16} className="text-[#1A1A1A]" />
        </button>
        <div className="flex items-center gap-2 cursor-default">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: '#1A1A1A' }}
          >
            <span className="text-white text-[9px] font-black tracking-wider">B</span>
          </div>
          <span className="font-black text-[#1A1A1A] text-sm" style={{ letterSpacing: '-0.02em' }}>
            Browse AI
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <BookmarksPill count={bookmarkCount} />
        {layoutNode}
        {chatToggle}
      </div>
    </header>
  );
}

/* Product grid wrapper */
function ProductGrid({ products, sort, onBookmark, onMoreLikeThis }: {
  products: Product[];
  sort: SortMode;
  onBookmark: (id: string) => void;
  onMoreLikeThis: (p: Product) => void;
}) {
  const sorted = sortProducts(products, sort);
  return <MasonryGrid products={sorted} onBookmark={onBookmark} onMoreLikeThis={onMoreLikeThis} />;
}

/* ══════════════════════════════════════
   Layout A — Classic left sidebar
══════════════════════════════════════ */
function LayoutSidebar({
  products, messages, filters, isTyping, initialQuery,
  sort, bookmarkCount, onBookmark, onMoreLikeThis,
  onSend, onToggleFilter, onSortChange, onBack, layoutNode,
}: SharedLayoutProps) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#F2EDE4' }}>
      <TopBar
        onBack={onBack}
        bookmarkCount={bookmarkCount}
        layoutNode={layoutNode}
        chatToggle={
          <button
            onClick={() => setChatOpen(v => !v)}
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[#E8E0D4] active:scale-90 relative"
          >
            <SlidersHorizontal size={15} className="text-[#1A1A1A]" />
            {messages.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#C4A882] rounded-full animate-pulse" />
            )}
          </button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left chat sidebar */}
        <aside
          className={`shrink-0 border-r transition-all duration-300
            lg:relative lg:w-[320px] lg:translate-x-0 lg:z-auto lg:opacity-100
            fixed inset-y-0 left-0 w-[300px] z-30
            ${chatOpen ? 'translate-x-0 shadow-2xl opacity-100' : '-translate-x-full opacity-0 lg:opacity-100'}
          `}
          style={{ background: '#F2EDE4', borderColor: 'rgba(212,196,168,0.4)' }}
        >
          <ChatPanel
            messages={messages}
            filters={filters}
            isTyping={isTyping}
            onSend={text => { onSend(text); setChatOpen(false); }}
            onToggleFilter={onToggleFilter}
          />
        </aside>

        {/* Mobile backdrop */}
        {chatOpen && (
          <div
            className="lg:hidden fixed inset-0 z-20 bg-black/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setChatOpen(false)}
          />
        )}

        {/* Product grid */}
        <main className="flex-1 overflow-y-auto" style={{ padding: '20px 16px 40px' }}>
          <div className="mb-5">
            <SortBar
              sort={sort}
              onSort={onSortChange}
              count={products.length}
              query={initialQuery}
            />
            {filters.some(f => f.isSelected) && (
              <div className="mt-3">
                <FilterRow filters={filters} onToggle={onToggleFilter} />
              </div>
            )}
          </div>
          <ProductGrid
            products={products}
            sort={sort}
            onBookmark={onBookmark}
            onMoreLikeThis={onMoreLikeThis}
          />
        </main>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Layout B — Full grid + dialog chat
══════════════════════════════════════ */
function LayoutDialog({
  products, messages, filters, isTyping, initialQuery,
  sort, bookmarkCount, onBookmark, onMoreLikeThis,
  onSend, onToggleFilter, onSortChange, onBack, layoutNode,
}: SharedLayoutProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen" style={{ background: '#F2EDE4' }}>
      {/* Top bar */}
      <header
        className="shrink-0 px-5 z-20 animate-fade-in"
        style={{
          background: 'rgba(242,237,228,0.94)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(212,196,168,0.35)',
          boxShadow: '0 1px 0 rgba(212,196,168,0.3)',
        }}
      >
        {/* Row 1: nav */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E0D4] active:scale-90 transition-all duration-200"
            >
              <ArrowLeft size={16} className="text-[#1A1A1A]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#1A1A1A' }}>
                <span className="text-white text-[9px] font-black">B</span>
              </div>
              <span className="font-black text-[#1A1A1A] text-sm" style={{ letterSpacing: '-0.02em' }}>Browse AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookmarksPill count={bookmarkCount} />
            {layoutNode}
          </div>
        </div>

        {/* Row 2: query chip + filter chips + refine button */}
        <div className="flex items-center gap-2 overflow-x-auto chat-scroll pb-3">
          {initialQuery && (
            <span
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
              style={{ background: '#1A1A1A', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
            >
              <Sparkles size={10} />
              {initialQuery}
            </span>
          )}
          <FilterRow filters={filters} onToggle={onToggleFilter} />
          <button
            onClick={() => setDialogOpen(true)}
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-dashed transition-all duration-200 ml-auto"
            style={{
              borderColor: '#C0BDB6',
              color: '#8B8B8B',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#1A1A1A';
              (e.currentTarget as HTMLButtonElement).style.color = '#1A1A1A';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#C0BDB6';
              (e.currentTarget as HTMLButtonElement).style.color = '#8B8B8B';
            }}
          >
            <MessageCircle size={11} />
            Refine with AI
          </button>
        </div>
      </header>

      {/* Full-width grid */}
      <main className="flex-1 overflow-y-auto" style={{ padding: '20px 20px 60px' }}>
        <div className="mb-5">
          <SortBar
            sort={sort}
            onSort={onSortChange}
            count={products.length}
            query=""
          />
        </div>
        <ProductGrid
          products={products}
          sort={sort}
          onBookmark={onBookmark}
          onMoreLikeThis={onMoreLikeThis}
        />
      </main>

      {/* Chat dialog */}
      {dialogOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setDialogOpen(false)}
          />
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg rounded-3xl overflow-hidden animate-fade-slide-up"
            style={{
              height: 480,
              boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setDialogOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-all active:scale-90"
                style={{ background: 'rgba(240,237,232,0.95)' }}
              >
                <X size={13} className="text-[#1A1A1A]" />
              </button>
            </div>
            <ChatPanel
              messages={messages}
              filters={filters}
              isTyping={isTyping}
              onSend={text => { onSend(text); setDialogOpen(false); }}
              onToggleFilter={onToggleFilter}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   Main results content
══════════════════════════════════════ */
function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [layout, setLayout] = useState<LayoutMode>('sidebar');
  const [sort, setSort] = useState<SortMode>('match');
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filters, setFilters] = useState<FilterChip[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const initialised = useRef(false);
  const lastQuery = useRef(initialQuery);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    if (!initialQuery) {
      getProducts().then(setProducts).catch(() => {});
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: initialQuery,
      timestamp: new Date(),
    };
    setMessages([userMsg]);
    setIsTyping(true);

    apiSearch(initialQuery, []).then(response => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.displayText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setProducts(response.products);
      if (response.suggestedFilters.length > 0) {
        setFilters(response.suggestedFilters.map((f: string) => ({ id: f, label: f, isSelected: true })));
      }
      setIsTyping(false);
    }).catch(() => setIsTyping(false));
  }, [initialQuery]);

  const handleSend = useCallback(async (text: string) => {
    lastQuery.current = text;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => {
      const history = [...prev, userMsg];
      setIsTyping(true);
      apiSearch(text, history.map(m => ({ sender: m.sender, text: m.text }))).then(response => {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: response.displayText,
          timestamp: new Date(),
        };
        setMessages(h => [...h, aiMsg]);
        setProducts(response.products);
        if (response.suggestedFilters.length > 0) {
          setFilters(response.suggestedFilters.map((f: string) => ({ id: f, label: f, isSelected: true })));
        }
        setIsTyping(false);
      }).catch(() => setIsTyping(false));
      return history;
    });
  }, []);

  const handleToggleFilter = useCallback((id: string) => {
    setFilters(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, isSelected: !f.isSelected } : f);
      const activeLabels = updated.filter(f => f.isSelected).map(f => f.label);
      const query = activeLabels.length > 0 ? activeLabels.join(' ') : (lastQuery.current || initialQuery);
      if (query) {
        apiSearch(query, []).then(r => setProducts(r.products)).catch(() => {});
      } else {
        getProducts().then(setProducts).catch(() => {});
      }
      return updated;
    });
  }, [initialQuery]);

  const handleBookmark = useCallback((id: string) => {
    // Optimistic toggle, then sync with backend
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p));
    toggleBookmark(id).catch(() => {
      // Revert on failure
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p));
    });
  }, []);

  const handleMoreLikeThis = useCallback((product: Product) => {
    handleSend(`More like ${product.name} by ${product.brand}`);
  }, [handleSend]);

  const bookmarkCount = products.filter(p => p.isBookmarked).length;
  const layoutNode = <LayoutToggle current={layout} onChange={setLayout} />;

  const sharedProps: SharedLayoutProps = {
    products, messages, filters, isTyping, initialQuery,
    sort,
    bookmarkCount,
    onBookmark: handleBookmark,
    onMoreLikeThis: handleMoreLikeThis,
    onSend: handleSend,
    onToggleFilter: handleToggleFilter,
    onSortChange: setSort,
    onBack: () => router.push('/'),
    layoutNode,
  };

  if (layout === 'sidebar') return <LayoutSidebar {...sharedProps} />;
  if (layout === 'dialog')  return <LayoutDialog  {...sharedProps} />;
  return null;
}

/* ══════════════════════════════════════
   Page wrapper
══════════════════════════════════════ */
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center" style={{ background: '#F2EDE4' }}>
        <div className="flex gap-2 items-center">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: '#C4A882', animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
