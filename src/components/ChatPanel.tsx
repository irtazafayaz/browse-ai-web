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
    <div className="flex flex-col h-full" style={{ background: '#F2EDE4' }}>

      {/* ── Header ── */}
      <div className="shrink-0 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center">
              <span className="text-white text-xs font-black tracking-tighter">B</span>
            </div>
            <div>
              <p className="font-black text-[#1A1A1A] text-sm tracking-tight leading-none">Browse AI</p>
              <p className="text-[10px] text-[#8B7355] font-semibold uppercase tracking-widest leading-none mt-0.5">Stylist</p>
            </div>
          </div>
          {/* Live dot */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-[#8B8B8B] font-semibold tracking-widest uppercase">Live</span>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-[#D4C4A8] to-transparent" />
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto chat-scroll px-4 pb-2 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-10 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
              <Sparkles size={22} className="text-[#C4A882]" />
            </div>
            <div>
              <p className="font-black text-[#1A1A1A] text-sm tracking-tight">Your AI stylist</p>
              <p className="text-[#8B8B8B] text-xs leading-relaxed mt-1 max-w-[160px] mx-auto">
                Tell me what you&apos;re looking for in plain English
              </p>
            </div>
            {/* Prompt suggestions */}
            <div className="flex flex-col gap-2 w-full mt-2">
              {['"baggy jeans in earthy tones"', '"maroon wide leg under $150"', '"elevated basics, minimal"'].map(s => (
                <button
                  key={s}
                  onClick={() => onSend(s.replace(/"/g, ''))}
                  className="text-left text-xs text-[#6B6B6B] px-3 py-2 rounded-xl border border-[#E0DDD6] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.6)' }}
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
              <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0">
                <span className="text-[#C4A882] text-[9px] font-black">B</span>
              </div>
            )}
            <div
              className={`max-w-[78%] px-3.5 py-2.5 text-xs leading-relaxed rounded-2xl font-medium ${
                msg.sender === 'user'
                  ? 'bg-[#1A1A1A] text-white rounded-br-sm'
                  : 'text-[#1A1A1A] rounded-bl-sm'
              }`}
              style={{
                background: msg.sender === 'user'
                  ? '#1A1A1A'
                  : 'rgba(255,255,255,0.80)',
                boxShadow: msg.sender === 'user'
                  ? '0 4px 14px rgba(26,26,26,0.28)'
                  : '0 2px 8px rgba(0,0,0,0.07)',
                backdropFilter: msg.sender === 'ai' ? 'blur(8px)' : undefined,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 animate-msg-in">
            <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0">
              <span className="text-[#C4A882] text-[9px] font-black">B</span>
            </div>
            <div
              className="rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center"
              style={{ background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
            >
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#8B7355] animate-bounce"
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
              className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all duration-200"
              style={{
                background: chip.isSelected ? '#1A1A1A' : 'rgba(255,255,255,0.7)',
                color: chip.isSelected ? 'white' : '#1A1A1A',
                borderColor: chip.isSelected ? '#1A1A1A' : '#D4C4A8',
                transform: chip.isSelected ? 'scale(1.03)' : 'scale(1)',
                boxShadow: chip.isSelected ? '0 4px 12px rgba(0,0,0,0.22)' : 'none',
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
          className="flex items-center gap-2 rounded-2xl px-4 py-3 transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            border: inputFocused
              ? '1.5px solid rgba(26,26,26,0.35)'
              : '1.5px solid rgba(212,196,168,0.6)',
            boxShadow: inputFocused
              ? '0 0 0 3px rgba(26,26,26,0.06), 0 4px 16px rgba(0,0,0,0.08)'
              : '0 2px 8px rgba(0,0,0,0.06)',
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
            className="flex-1 bg-transparent outline-none text-sm text-[#1A1A1A] placeholder-[#AAAAAA] font-medium"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0"
            style={{
              background: input.trim() && !isTyping ? '#1A1A1A' : 'transparent',
              color: input.trim() && !isTyping ? 'white' : '#CCCCCC',
              transform: input.trim() && !isTyping ? 'scale(1)' : 'scale(0.88)',
              boxShadow: input.trim() && !isTyping ? '0 4px 12px rgba(0,0,0,0.22)' : 'none',
            }}
          >
            <ArrowUp size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}
