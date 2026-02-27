'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Edit3 } from 'lucide-react';

const PROMPTS = [
  'baggy linen pants in earthy tones...',
  'something maroon and wide leg...',
  'cargo pants with a relaxed fit...',
  'straight leg jeans, classic blue...',
  'elevated basics under $100...',
  'oversized and effortless...',
];

interface Props {
  onSubmit: (text: string) => void;
  maxWidth?: number;
}

export default function SearchBar({ onSubmit, maxWidth = 680 }: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [promptVisible, setPromptVisible] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (focused || value) return;
      setPromptVisible(false);
      await new Promise(r => setTimeout(r, 380));
      setPromptIndex(i => (i + 1) % PROMPTS.length);
      setPromptVisible(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [focused, value]);

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
        className="flex items-center bg-white rounded-full transition-all duration-300"
        style={{
          padding: '6px 6px 6px 20px',
          boxShadow: focused
            ? '0 0 0 2.5px rgba(26,26,26,0.22), 0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)'
            : '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
          transform: focused ? 'scale(1.012)' : 'scale(1)',
        }}
      >
        <div
          className="shrink-0 transition-all duration-300"
          style={{ transform: focused ? 'rotate(-10deg) scale(1.1)' : 'rotate(0deg) scale(1)' }}
        >
          {focused
            ? <Edit3 size={18} className="text-[#1A1A1A]" />
            : <Search size={18} className="text-[#8B8B8B]" />
          }
        </div>

        <div className="flex-1 relative mx-3 overflow-hidden">
          {/* Rotating placeholder */}
          {!focused && !value && (
            <span
              className="absolute inset-0 flex items-center text-[#9B9B9B] italic text-sm pointer-events-none"
              style={{
                opacity: promptVisible ? 1 : 0,
                transform: promptVisible ? 'translateY(0)' : 'translateY(-4px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
              }}
            >
              {PROMPTS[promptIndex]}
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
            className="w-full bg-transparent outline-none text-[#1A1A1A] text-sm py-3"
            style={{ caretColor: '#1A1A1A' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-11 h-11 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90"
          style={{
            boxShadow: submitting
              ? '0 0 0 6px rgba(26,26,26,0.08)'
              : '0 4px 12px rgba(0,0,0,0.20)',
            transform: submitting ? 'scale(0.92)' : 'scale(1)',
            background: submitting ? '#333' : '#1A1A1A',
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
