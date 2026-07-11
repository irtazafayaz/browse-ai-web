'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import { ChatMessage, FilterChip } from '@/lib/types';

interface Props {
  messages: ChatMessage[];
  filters: FilterChip[];
  isTyping: boolean;
  onSend: (text: string) => void;
  onToggleFilter: (id: string) => void;
}

export default function ChatPanel({ messages, filters, isTyping, onSend, onToggleFilter }: Props) {
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <div className="shrink-0 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--ink)] flex items-center justify-center">
              <span className="text-white text-xs font-black tracking-tighter">B</span>
            </div>
            <div>
              <p className="font-black text-[var(--ink)] text-sm tracking-tight leading-none">Browse AI</p>
              <p className="text-[10px] text-[var(--warn)] font-semibold uppercase tracking-widest leading-none mt-0.5">Stylist</p>
            </div>
          </div>
          {/* Live dot */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
            <span className="text-[10px] text-[var(--ink-muted)] font-semibold tracking-widest uppercase">Live</span>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-[var(--warn)] to-transparent" />
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto chat-scroll px-4 pb-2 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-10 animate-fade-in">
            <div className="w-14 h-14 bg-[var(--ink)] flex items-center justify-center border-brutal-thin shadow-brutal-sm">
              <Sparkles size={22} className="text-[var(--warn)]" />
            </div>
            <div>
              <p className="font-black text-[var(--ink)] text-sm tracking-tight">Your AI stylist</p>
              <p className="text-[var(--ink-muted)] text-xs leading-relaxed mt-1 max-w-[160px] mx-auto">
                Tell me what you&apos;re looking for in plain English
              </p>
            </div>
            {/* Prompt suggestions */}
            <div className="flex flex-col gap-2 w-full mt-2">
              {['"baggy jeans in earthy tones"', '"maroon wide leg under $150"', '"elevated basics, minimal"'].map(s => (
                <button
                  key={s}
                  onClick={() => onSend(s.replace(/"/g, ''))}
                  className="text-left text-xs text-[var(--ink-muted)] px-3 py-2 border-brutal-thin border-[var(--bg)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-all ease-out duration-150"
                  style={{ background: 'var(--surface)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex animate-msg-in ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}
            style={{ animationDelay: `${Math.min(i * 30, 120)}ms` }}
          >
            {msg.sender === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-[var(--ink)] flex items-center justify-center shrink-0">
                <span className="text-[var(--warn)] text-[9px] font-black">B</span>
              </div>
            )}
            <div
              className={`max-w-[78%] px-3.5 py-2.5 text-xs leading-relaxed font-medium border-brutal-thin shadow-brutal-sm ${
                msg.sender === 'user'
                  ? 'text-white'
                  : 'text-[var(--ink)]'
              }`}
              style={{
                background: msg.sender === 'user'
                  ? 'var(--ink)'
                  : 'var(--surface)',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 animate-msg-in">
            <div className="w-6 h-6 rounded-full bg-[var(--ink)] flex items-center justify-center shrink-0">
              <span className="text-[var(--warn)] text-[9px] font-black">B</span>
            </div>
            <div
              className="px-4 py-3 flex gap-1.5 items-center border-brutal-thin shadow-brutal-sm"
              style={{ background: 'var(--surface)' }}
            >
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[var(--warn)] animate-bounce"
                  style={{ animationDelay: `${i * 140}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Filter chips ── */}
      {filters.length > 0 && (
        <div className="px-4 py-2.5 flex gap-2 overflow-x-auto chat-scroll">
          {filters.map(chip => (
            <button
              key={chip.id}
              onClick={() => onToggleFilter(chip.id)}
              className="shrink-0 px-3 py-1.5 text-[11px] font-bold border-brutal-thin transition-all ease-out duration-150"
              style={{
                background: chip.isSelected ? 'var(--ink)' : 'var(--surface)',
                color: chip.isSelected ? 'white' : 'var(--ink)',
                borderColor: 'var(--ink)',
                boxShadow: chip.isSelected ? '2px 2px 0 var(--ink)' : 'none',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="shrink-0 px-4 pb-4 pt-2">
        <div
          className="flex items-center gap-2 px-4 py-3 transition-all ease-out duration-150"
          style={{
            background: 'var(--surface)',
            border: '3px solid var(--ink)',
            boxShadow: inputFocused
              ? '4px 4px 0 var(--ink)'
              : '2px 2px 0 var(--ink)',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            disabled={isTyping}
            placeholder="Refine your search..."
            className="flex-1 bg-transparent outline-none text-sm text-[var(--ink)] placeholder-[var(--ink-muted)] font-medium"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="w-8 h-8 flex items-center justify-center transition-all ease-out duration-150 shrink-0"
            style={{
              background: input.trim() && !isTyping ? 'var(--ink)' : 'transparent',
              color: input.trim() && !isTyping ? 'white' : 'var(--ink-muted)',
              boxShadow: input.trim() && !isTyping ? '2px 2px 0 var(--ink)' : 'none',
            }}
          >
            <ArrowUp size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}
