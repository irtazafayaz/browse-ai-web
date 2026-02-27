'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { ArrowLeft, SlidersHorizontal, BookmarkCheck } from 'lucide-react';
import ChatPanel from '@/components/ChatPanel';
import ProductCard from '@/components/ProductCard';
import { ChatMessage, FilterChip, Product } from '@/lib/types';
import { mockProducts, searchProducts } from '@/lib/mockData';
import { sendMessage } from '@/lib/aiService';

/* ─── Product grid ─── */
function ProductGrid({ products, onBookmark, onMoreLikeThis }: {
  products: Product[];
  onBookmark: (id: string) => void;
  onMoreLikeThis: (p: Product) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <span className="text-5xl">🔍</span>
        <p className="font-semibold text-[#1A1A1A]">No results yet</p>
        <p className="text-sm text-[#6B6B6B]">Try describing what you&apos;re looking for in the chat</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
      {products.map(p => (
        <ProductCard key={p.id} product={p} onBookmark={onBookmark} onMoreLikeThis={onMoreLikeThis} />
      ))}
    </div>
  );
}

/* ─── Bookmarks pill ─── */
function BookmarksPill({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-full px-3 py-1.5">
      <BookmarkCheck size={12} />
      {count} saved
    </div>
  );
}

/* ─── Main results content ─── */
function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filters, setFilters] = useState<FilterChip[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const initialised = useRef(false);

  /* Bootstrap with initial query — runs once */
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
        const keywords = initialQuery.toLowerCase().split(/\s+/);
        setProducts(searchProducts(mockProducts, keywords));
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

    // Capture current messages + new user message for history
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
      const selected = updated.filter(f => f.isSelected).map(f => f.id);
      setProducts(searchProducts(mockProducts, selected));
      return updated;
    });
  }, []);

  const handleBookmark = useCallback((id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p));
  }, []);

  const handleMoreLikeThis = useCallback((product: Product) => {
    const text = `More like ${product.name} by ${product.brand}`;
    handleSend(text);
    setChatOpen(true);
  }, [handleSend]);

  const bookmarkCount = products.filter(p => p.isBookmarked).length;

  return (
    <div className="flex flex-col h-screen bg-[#F7F5F0] overflow-hidden">
      {/* Top bar */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-[#E0DDD6] z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F7F5F0] transition-colors"
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
          {/* Mobile: toggle chat */}
          <button
            onClick={() => setChatOpen(v => !v)}
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F7F5F0] transition-colors relative"
          >
            <SlidersHorizontal size={15} className="text-[#1A1A1A]" />
            {messages.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#1A1A1A] rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat panel — sidebar on desktop, slide-over on mobile */}
        <aside
          className={`shrink-0 border-r border-[#E0DDD6] bg-white transition-transform duration-300
            lg:relative lg:w-[320px] lg:translate-x-0 lg:z-auto
            fixed inset-y-0 left-0 w-[300px] z-30
            ${chatOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <ChatPanel
            messages={messages}
            filters={filters}
            isTyping={isTyping}
            onSend={text => { handleSend(text); setChatOpen(false); }}
            onToggleFilter={handleToggleFilter}
          />
        </aside>

        {/* Mobile overlay backdrop */}
        {chatOpen && (
          <div
            className="lg:hidden fixed inset-0 z-20 bg-black/30 backdrop-blur-sm"
            onClick={() => setChatOpen(false)}
          />
        )}

        {/* Product grid */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-bold text-[#1A1A1A] text-lg tracking-tight">
                {initialQuery ? `"${initialQuery}"` : 'All Products'}
              </h1>
              <p className="text-xs text-[#6B6B6B] mt-0.5">{products.length} results</p>
            </div>
            {filters.some(f => f.isSelected) && (
              <div className="flex gap-1.5 flex-wrap justify-end max-w-xs">
                {filters.filter(f => f.isSelected).map(f => (
                  <button
                    key={f.id}
                    onClick={() => handleToggleFilter(f.id)}
                    className="px-2.5 py-1 bg-[#1A1A1A] text-white text-[11px] font-semibold rounded-full flex items-center gap-1 hover:bg-[#333] transition-colors"
                  >
                    {f.label}
                    <span className="opacity-60">×</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <ProductGrid products={products} onBookmark={handleBookmark} onMoreLikeThis={handleMoreLikeThis} />
        </main>
      </div>
    </div>
  );
}

/* ─── Page wrapper with Suspense (required for useSearchParams) ─── */
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#F7F5F0]">
        <div className="flex gap-1.5 items-center">
          {[0,1,2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full bg-[#1A1A1A] animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
