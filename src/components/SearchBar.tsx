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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (focused || value) return;
      setPromptVisible(false);
      await new Promise(r => setTimeout(r, 400));
      setPromptIndex(i => (i + 1) % PROMPTS.length);
      setPromptVisible(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [focused, value]);

  const handleSubmit = () => {
    if (value.trim()) onSubmit(value.trim());
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div
      className="w-full transition-all duration-200"
      style={{ maxWidth }}
    >
      <div
        className={`flex items-center bg-white rounded-full shadow-xl transition-all duration-200 ${
          focused ? 'ring-2 ring-[#1A1A1A]/30 shadow-2xl' : ''
        }`}
        style={{ padding: '6px 6px 6px 20px' }}
      >
        {focused
          ? <Edit3 size={18} className="text-[#1A1A1A] shrink-0" />
          : <Search size={18} className="text-[#6B6B6B] shrink-0" />
        }
        <div className="flex-1 relative mx-3 overflow-hidden">
          {/* Rotating placeholder */}
          {!focused && !value && (
            <span
              className={`absolute inset-0 flex items-center text-[#6B6B6B] italic text-sm pointer-events-none transition-opacity duration-400 ${
                promptVisible ? 'opacity-100' : 'opacity-0'
              }`}
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
          className="w-11 h-11 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0 hover:bg-[#333] transition-all duration-150 hover:shadow-lg hover:shadow-black/20 active:scale-95"
        >
          <ArrowRight size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}
