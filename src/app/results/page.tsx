'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import {
  ArrowLeft, BookmarkCheck, PanelLeft, LayoutGrid,
  MessageCircle, X, Sparkles, SlidersHorizontal,
} from 'lucide-react';
import ChatPanel from '@/components/ChatPanel';
import ProductCard from '@/components/ProductCard';
import { ChatMessage, FilterChip, Product } from '@/lib/types';
import { mockProducts, searchProducts } from '@/lib/mockData';
import { sendMessage } from '@/lib/aiService';

/* ══════════════════════════════════════
   Types
══════════════════════════════════════ */
type LayoutMode = 'sidebar' | 'dialog';

/* ══════════════════════════════════════
   Shared sub-components
══════════════════════════════════════ */

function BookmarksPill({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div
      className="flex items-center gap-1.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-full px-3 py-1.5 animate-scale-in"
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.22)' }}
    >
      <BookmarkCheck size={12} />
      {count} saved
    </div>
  );
}

/* 2-option layout toggle */
function LayoutToggle({ current, onChange }: { current: LayoutMode; onChange: (m: LayoutMode) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-[#F0EDE8] rounded-full p-1 border border-[#E0DDD6]">
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

/* Filter chips row */
function FilterRow({ filters, onToggle }: { filters: FilterChip[]; onToggle: (id: string) => void }) {
  if (!filters.some(f => f.isSelected)) return null;
  return (
    <div className="flex gap-1.5 flex-wrap">
      {filters.filter(f => f.isSelected).map(f => (
        <button
          key={f.id}
          onClick={() => onToggle(f.id)}
          className="px-2.5 py-1 bg-[#1A1A1A] text-white text-[11px] font-semibold rounded-full flex items-center gap-1 transition-all duration-200 hover:bg-[#333] active:scale-95"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
        >
          {f.label}
          <X size={9} className="opacity-60" />
        </button>
      ))}
    </div>
  );
}

/* Product grid */
function ProductGrid({ products, onBookmark, onMoreLikeThis, cols = 'default' }: {
  products: Product[];
  onBookmark: (id: string) => void;
  onMoreLikeThis: (p: Product) => void;
  cols?: 'default' | 'wide';
}) {
  const gridClass = cols === 'wide'
    ? 'grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3'
    : 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3';

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3 animate-fade-in">
        <span className="text-5xl">🔍</span>
        <p className="font-semibold text-[#1A1A1A]">No results yet</p>
        <p className="text-sm text-[#6B6B6B]">Try describing what you&apos;re looking for</p>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {products.map((p, i) => (
        <div
          key={p.id}
          className="animate-fade-slide-up"
          style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
        >
          <ProductCard product={p} onBookmark={onBookmark} onMoreLikeThis={onMoreLikeThis} />
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════
   Layout A — Classic left sidebar
   (the original design)
══════════════════════════════════════ */
function LayoutSidebar({
  products, messages, filters, isTyping, initialQuery,
  bookmarkCount, onBookmark, onMoreLikeThis, onSend, onToggleFilter, onBack, layoutNode,
}: SharedLayoutProps) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#F7F5F0] overflow-hidden">
      {/* Top bar */}
      <header
        className="shrink-0 flex items-center justify-between px-4 py-3 bg-white/90 border-b border-[#E0DDD6] z-20 animate-fade-in"
        style={{ backdropFilter: 'blur(12px)', boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[#F0EDE8] active:scale-90"
          >
            <ArrowLeft size={16} className="text-[#1A1A1A]" />
          </button>
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <span className="text-white text-[9px] font-bold">B</span>
            </div>
            <span className="font-bold text-[#1A1A1A] text-sm tracking-tight">Browse AI</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BookmarksPill count={bookmarkCount} />
          {layoutNode}
          <button
            onClick={() => setChatOpen(v => !v)}
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[#F0EDE8] active:scale-90 relative"
          >
            <SlidersHorizontal size={15} className="text-[#1A1A1A]" />
            {messages.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#1A1A1A] rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left chat sidebar */}
        <aside
          className={`shrink-0 border-r border-[#E0DDD6] bg-white transition-all duration-300
            lg:relative lg:w-[320px] lg:translate-x-0 lg:z-auto lg:opacity-100
            fixed inset-y-0 left-0 w-[300px] z-30
            ${chatOpen ? 'translate-x-0 shadow-2xl opacity-100' : '-translate-x-full opacity-0 lg:opacity-100'}
          `}
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
        <main className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-5 animate-fade-slide-up" style={{ animationDuration: '0.5s' }}>
            <div>
              <h1 className="font-bold text-[#1A1A1A] text-lg tracking-tight">
                {initialQuery ? `"${initialQuery}"` : 'All Products'}
              </h1>
              <p className="text-xs text-[#8B8B8B] mt-0.5">{products.length} results</p>
            </div>
            <FilterRow filters={filters} onToggle={onToggleFilter} />
          </div>
          <ProductGrid products={products} onBookmark={onBookmark} onMoreLikeThis={onMoreLikeThis} />
        </main>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Layout B — Top filter bar + dialog chat
   Full-width grid, chat opens as a centered dialog
══════════════════════════════════════ */
function LayoutDialog({
  products, messages, filters, isTyping, initialQuery,
  bookmarkCount, onBookmark, onMoreLikeThis, onSend, onToggleFilter, onBack, layoutNode,
}: SharedLayoutProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#F7F5F0]">
      {/* Top bar — two rows */}
      <header
        className="shrink-0 px-5 bg-white/90 border-b border-[#E0DDD6] z-20 animate-fade-in"
        style={{ backdropFilter: 'blur(12px)', boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}
      >
        {/* Row 1: nav */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F0EDE8] active:scale-90 transition-all duration-200"
            >
              <ArrowLeft size={16} className="text-[#1A1A1A]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">B</span>
              </div>
              <span className="font-bold text-[#1A1A1A] text-sm tracking-tight">Browse AI</span>
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
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#1A1A1A] text-white"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
            >
              <Sparkles size={10} />
              {initialQuery}
            </span>
          )}
          <FilterRow filters={filters} onToggle={onToggleFilter} />
          <button
            onClick={() => setDialogOpen(true)}
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-dashed border-[#C0BDB6] text-[#8B8B8B] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all duration-200 ml-auto"
          >
            <MessageCircle size={11} />
            Refine with AI
          </button>
        </div>
      </header>

      {/* Full-width grid */}
      <main className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-[#8B8B8B] font-medium">
            {products.length} results · sorted by match
          </p>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1.5 text-xs text-[#8B7355] font-semibold hover:underline transition-all"
          >
            <Sparkles size={11} />
            Ask AI
          </button>
        </div>
        <ProductGrid products={products} onBookmark={onBookmark} onMoreLikeThis={onMoreLikeThis} cols="wide" />
      </main>

      {/* Chat dialog */}
      {dialogOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setDialogOpen(false)}
          />
          {/* Dialog panel */}
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg rounded-3xl overflow-hidden animate-fade-slide-up"
            style={{
              height: 480,
              boxShadow: '0 32px 80px rgba(0,0,0,0.24), 0 8px 24px rgba(0,0,0,0.10)',
            }}
          >
            {/* Close button */}
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setDialogOpen(false)}
                className="w-7 h-7 bg-[#F0EDE8] rounded-full flex items-center justify-center hover:bg-[#E0DDD6] transition-colors active:scale-90"
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
   Shared props type
══════════════════════════════════════ */
interface SharedLayoutProps {
  products: Product[];
  messages: ChatMessage[];
  filters: FilterChip[];
  isTyping: boolean;
  initialQuery: string;
  bookmarkCount: number;
  onBookmark: (id: string) => void;
  onMoreLikeThis: (p: Product) => void;
  onSend: (text: string) => void;
  onToggleFilter: (id: string) => void;
  onBack: () => void;
  layoutNode: React.ReactNode;
}

/* ══════════════════════════════════════
   Main results content
══════════════════════════════════════ */
function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [layout, setLayout] = useState<LayoutMode>('sidebar');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filters, setFilters] = useState<FilterChip[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const initialised = useRef(false);

  /* Bootstrap with initial query */
  useEffect(() => {
    if (!initialQuery || initialised.current) return;
    initialised.current = true;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: initialQuery,
      timestamp: new Date(),
    };
    setMessages([userMsg]);
    setIsTyping(true);

    sendMessage([], initialQuery).then(response => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.displayText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);

      if (response.suggestedFilters.length > 0) {
        const newFilters = response.suggestedFilters.map(f => ({ id: f, label: f, isSelected: true }));
        setFilters(newFilters);
        setProducts(searchProducts(mockProducts, response.suggestedFilters));
      } else {
        setProducts(searchProducts(mockProducts, initialQuery.toLowerCase().split(/\s+/)));
      }
      setIsTyping(false);
    });
  }, [initialQuery]);

  const handleSend = useCallback(async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => {
      const history = [...prev, userMsg];
      setIsTyping(true);
      sendMessage(history, text).then(response => {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: response.displayText,
          timestamp: new Date(),
        };
        setMessages(h => [...h, aiMsg]);
        if (response.suggestedFilters.length > 0) {
          const newFilters = response.suggestedFilters.map(f => ({ id: f, label: f, isSelected: true }));
          setFilters(newFilters);
          setProducts(searchProducts(mockProducts, response.suggestedFilters));
        }
        setIsTyping(false);
      });
      return history;
    });
  }, []);

  const handleToggleFilter = useCallback((id: string) => {
    setFilters(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, isSelected: !f.isSelected } : f);
      setProducts(searchProducts(mockProducts, updated.filter(f => f.isSelected).map(f => f.id)));
      return updated;
    });
  }, []);

  const handleBookmark = useCallback((id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p));
  }, []);

  const handleMoreLikeThis = useCallback((product: Product) => {
    handleSend(`More like ${product.name} by ${product.brand}`);
  }, [handleSend]);

  const bookmarkCount = products.filter(p => p.isBookmarked).length;

  const layoutNode = <LayoutToggle current={layout} onChange={setLayout} />;

  const sharedProps: SharedLayoutProps = {
    products, messages, filters, isTyping, initialQuery,
    bookmarkCount,
    onBookmark: handleBookmark,
    onMoreLikeThis: handleMoreLikeThis,
    onSend: handleSend,
    onToggleFilter: handleToggleFilter,
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
      <div className="flex h-screen items-center justify-center bg-[#F7F5F0]">
        <div className="flex gap-2 items-center">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
