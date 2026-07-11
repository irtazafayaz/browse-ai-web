'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Edit3 } from 'lucide-react';
import { getPrompts } from '@/lib/api';

const DEFAULT_PROMPTS = [
  'baggy linen pants in earthy tones...',
  'something maroon and wide leg...',
  'cargo pants with a relaxed fit...',
];

interface Props {
  onSubmit: (text: string) => void;
  maxWidth?: number;
}

export default function SearchBar({ onSubmit, maxWidth = 680 }: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [prompts, setPrompts] = useState<string[]>(DEFAULT_PROMPTS);
  const [promptIndex, setPromptIndex] = useState(0);
  const [promptVisible, setPromptVisible] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getPrompts().then(p => { if (p.length > 0) setPrompts(p); }).catch(() => {}); }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (focused || value) return;
      setPromptVisible(false);
      await new Promise(r => setTimeout(r, 380));
      setPromptIndex(i => (i + 1) % prompts.length);
      setPromptVisible(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [focused, value, prompts.length]);

  const handleSubmit = () => {
    if (!value.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit(value.trim());
      setSubmitting(false);
    }, 180);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="w-full transition-all duration-300" style={{ maxWidth }}>
      <div
        className="flex items-center bg-white border-brutal shadow-brutal-sm"
        style={{
          padding: '6px 6px 6px 20px',
          boxShadow: focused ? '4px 4px 0 var(--ink)' : '2px 2px 0 var(--ink)',
        }}
      >
        <div
          className="shrink-0 transition-all duration-300"
          style={{ transform: focused ? 'rotate(-10deg) scale(1.1)' : 'rotate(0deg) scale(1)' }}
        >
          {focused
            ? <Edit3 size={18} className="text-[var(--ink)]" />
            : <Search size={18} className="text-[var(--ink-muted)]" />
          }
        </div>

        <div className="flex-1 relative mx-3 overflow-hidden">
          {/* Rotating placeholder */}
          {!focused && !value && (
            <span
              className="absolute inset-0 flex items-center text-[var(--ink-muted)] italic text-sm pointer-events-none"
              style={{
                opacity: promptVisible ? 1 : 0,
                transform: promptVisible ? 'translateY(0)' : 'translateY(-4px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
              }}
            >
              {prompts[promptIndex]}
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKey}
            className="w-full bg-transparent outline-none text-[var(--ink)] text-sm py-3"
            style={{ caretColor: 'var(--ink)' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-11 h-11 rounded-full border-brutal-thin shadow-brutal-sm flex items-center justify-center shrink-0"
          style={{
            background: 'var(--ink)',
            boxShadow: submitting ? '0 0 0 var(--ink)' : undefined,
            transform: submitting ? 'translate(2px, 2px) scale(0.92)' : undefined,
          }}
        >
          <ArrowRight
            size={16}
            className="text-white transition-transform duration-200"
            style={{ transform: submitting ? 'translateX(2px)' : 'translateX(0)' }}
          />
        </button>
      </div>
    </div>
  );
}
