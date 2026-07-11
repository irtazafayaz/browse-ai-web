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
        className="fixed inset-0 z-40 animate-fade-in"
        style={{ background: 'rgba(17,17,17,0.6)' }}
        onClick={onClose}
      />

      {/* Drawer — slides up from bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 animate-fade-slide-up"
        style={{
          background: 'var(--bg)',
          borderTop: '3px solid var(--ink)',
          maxHeight: '82vh',
          overflowY: 'auto',
        }}
      >
        {/* Pull handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1" style={{ background: 'var(--ink)' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '3px solid var(--ink)' }}
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} style={{ color: 'var(--ink-muted)' }} />
            <span className="font-black text-sm" style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}>
              Filters
            </span>
            {activeCount > 0 && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                style={{ background: 'var(--ink)' }}
              >
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--ink-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Filter sections */}
        <div className="px-5 py-5 flex flex-col gap-7">

          {/* Brand */}
          {brands.length > 0 && (
            <section>
              <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--ink-muted)' }}>Brand</p>
              <div className="flex flex-wrap gap-2">
                {brands.map(b => {
                  const selected = local.brand === b;
                  return (
                    <button
                      key={b}
                      onClick={() => setLocal(prev => ({ ...prev, brand: selected ? undefined : b }))}
                      className="px-3 py-1.5 text-[11px] font-semibold transition-all duration-150 ease-out active:scale-95"
                      style={{
                        background: selected ? 'var(--ink)' : 'var(--surface)',
                        color: selected ? 'white' : 'var(--ink-muted)',
                        border: '2px solid var(--ink)',
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
            <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--ink-muted)' }}>Price range</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                placeholder="Min $"
                value={local.minPrice ?? ''}
                onChange={e => setLocal(prev => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
                className="flex-1 px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  border: '3px solid var(--ink)',
                  borderRadius: 0,
                }}
              />
              <span className="text-sm shrink-0 font-medium" style={{ color: 'var(--ink-muted)' }}>—</span>
              <input
                type="number"
                min={0}
                placeholder="Max $"
                value={local.maxPrice ?? ''}
                onChange={e => setLocal(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : undefined }))}
                className="flex-1 px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  border: '3px solid var(--ink)',
                  borderRadius: 0,
                }}
              />
            </div>
          </section>

          {/* Style tags */}
          <section>
            <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--ink-muted)' }}>Style</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map(tag => {
                const selected = (local.tags ?? []).includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="px-3 py-1.5 text-[11px] font-semibold transition-all duration-150 ease-out active:scale-95 capitalize"
                    style={{
                      background: selected ? 'var(--ink)' : 'var(--surface)',
                      color: selected ? 'white' : 'var(--ink-muted)',
                      border: '2px solid var(--ink)',
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
          style={{ borderTop: '3px solid var(--ink)' }}
        >
          <button
            onClick={handleClear}
            className="flex-1 py-3 text-sm font-bold transition-all duration-150 ease-out active:scale-[0.98]"
            style={{ color: 'var(--ink)', background: 'var(--surface)', border: '3px solid var(--ink)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'; }}
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 text-sm font-black text-white transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'var(--ink)', border: '3px solid var(--ink)' }}
          >
            Apply filters
          </button>
        </div>
      </div>
    </>
  );
}
