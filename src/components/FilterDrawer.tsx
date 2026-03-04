'use client';
import { useState, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { getBrands } from '@/lib/api';
import { SearchFilters } from '@/lib/types';

const COMMON_TAGS = [
  'slim', 'wide-leg', 'baggy', 'cargo', 'straight',
  'cropped', 'high-rise', 'stretch', 'denim', 'classic',
];

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  activeCount: number;
}

export default function FilterDrawer({ open, onClose, filters, onChange, activeCount }: FilterDrawerProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [local, setLocal] = useState<SearchFilters>(filters);

  useEffect(() => {
    getBrands().then(setBrands).catch(() => {});
  }, []);

  // Sync local state when drawer opens
  useEffect(() => {
    if (open) setLocal(filters);
  }, [open, filters]);

  const toggleTag = (tag: string) => {
    setLocal(prev => {
      const tags = prev.tags ?? [];
      return { ...prev, tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag] };
    });
  };

  const handleApply = () => {
    onChange(local);
    onClose();
  };

  const handleClear = () => {
    const empty: SearchFilters = {};
    setLocal(empty);
    onChange(empty);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer — slides up from bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 animate-fade-slide-up"
        style={{
          background: '#F2EDE4',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          maxHeight: '82vh',
          overflowY: 'auto',
        }}
      >
        {/* Pull handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#D4C4A8' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid rgba(212,196,168,0.5)' }}
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-[#6B6B6B]" />
            <span className="font-black text-[#1A1A1A] text-sm" style={{ letterSpacing: '-0.01em' }}>
              Filters
            </span>
            {activeCount > 0 && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                style={{ background: '#C4A882' }}
              >
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#E8E0D4] rounded-full transition-colors"
          >
            <X size={14} className="text-[#6B6B6B]" />
          </button>
        </div>

        {/* Filter sections */}
        <div className="px-5 py-5 flex flex-col gap-7">

          {/* Brand */}
          {brands.length > 0 && (
            <section>
              <p className="text-[10px] font-black tracking-[0.18em] uppercase text-[#6B6B6B] mb-3">Brand</p>
              <div className="flex flex-wrap gap-2">
                {brands.map(b => {
                  const selected = local.brand === b;
                  return (
                    <button
                      key={b}
                      onClick={() => setLocal(prev => ({ ...prev, brand: selected ? undefined : b }))}
                      className="px-3 py-1.5 text-[11px] font-semibold rounded-full transition-all duration-200 active:scale-95"
                      style={{
                        background: selected ? '#1A1A1A' : '#EDE9E1',
                        color: selected ? 'white' : '#4B4B4B',
                        border: selected ? '1px solid #1A1A1A' : '1px solid transparent',
                      }}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Price range */}
          <section>
            <p className="text-[10px] font-black tracking-[0.18em] uppercase text-[#6B6B6B] mb-3">Price range</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                placeholder="Min $"
                value={local.minPrice ?? ''}
                onChange={e => setLocal(prev => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
                className="flex-1 px-3 py-2.5 text-sm text-[#1A1A1A] outline-none transition-all"
                style={{
                  background: '#EDE9E1',
                  border: '1.5px solid #D4C4A8',
                  borderRadius: 0,
                }}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'; }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#D4C4A8'; }}
              />
              <span className="text-[#AAAAAA] text-sm shrink-0 font-medium">—</span>
              <input
                type="number"
                min={0}
                placeholder="Max $"
                value={local.maxPrice ?? ''}
                onChange={e => setLocal(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : undefined }))}
                className="flex-1 px-3 py-2.5 text-sm text-[#1A1A1A] outline-none transition-all"
                style={{
                  background: '#EDE9E1',
                  border: '1.5px solid #D4C4A8',
                  borderRadius: 0,
                }}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1A1A1A'; }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#D4C4A8'; }}
              />
            </div>
          </section>

          {/* Style tags */}
          <section>
            <p className="text-[10px] font-black tracking-[0.18em] uppercase text-[#6B6B6B] mb-3">Style</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map(tag => {
                const selected = (local.tags ?? []).includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="px-3 py-1.5 text-[11px] font-semibold rounded-full transition-all duration-200 active:scale-95 capitalize"
                    style={{
                      background: selected ? '#1A1A1A' : '#EDE9E1',
                      color: selected ? 'white' : '#4B4B4B',
                      border: selected ? '1px solid #1A1A1A' : '1px solid transparent',
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Action buttons */}
        <div
          className="px-5 pb-8 pt-3 flex gap-3"
          style={{ borderTop: '1px solid rgba(212,196,168,0.4)' }}
        >
          <button
            onClick={handleClear}
            className="flex-1 py-3 text-sm font-bold text-[#1A1A1A] transition-all duration-200 hover:bg-[#E8E0D4] active:scale-[0.98]"
            style={{ border: '1.5px solid #D4C4A8' }}
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 text-sm font-black text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ background: '#1A1A1A' }}
          >
            Apply filters
          </button>
        </div>
      </div>
    </>
  );
}
