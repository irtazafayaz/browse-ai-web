'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#E0DDD6]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <span className="font-bold text-[#1A1A1A] text-base tracking-tight">Browse AI</span>
          {/* Subtle live indicator */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-[#8B8B8B] font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12 animate-fade-in">
            <span className="text-4xl">👗</span>
            <p className="font-semibold text-[#1A1A1A] text-sm">Tell me what you&apos;re looking for</p>
            <p className="text-[#6B6B6B] text-xs leading-relaxed">Try &quot;baggy jeans&quot;, &quot;maroon pants&quot;,<br />or &quot;wide leg cargo&quot;</p>
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
                <span className="text-white text-[10px] font-bold">B</span>
              </div>
            )}
            <div
              className={`max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-[#1A1A1A] text-white rounded-br-sm'
                  : 'bg-[#EEECEA] text-[#1A1A1A] rounded-bl-sm'
              }`}
              style={{
                boxShadow: msg.sender === 'user'
                  ? '0 4px 12px rgba(26,26,26,0.25)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-2 animate-msg-in">
            <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">B</span>
            </div>
            <div className="bg-[#EEECEA] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#8B8B8B] animate-bounce"
                  style={{ animationDelay: `${i * 140}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Filter chips */}
      {filters.length > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto chat-scroll border-t border-[#F0EDE8]">
          {filters.map(chip => (
            <button
              key={chip.id}
              onClick={() => onToggleFilter(chip.id)}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
              style={{
                background: chip.isSelected ? '#1A1A1A' : 'white',
                color: chip.isSelected ? 'white' : '#1A1A1A',
                borderColor: chip.isSelected ? '#1A1A1A' : '#E0DDD6',
                transform: chip.isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: chip.isSelected ? '0 4px 10px rgba(0,0,0,0.18)' : 'none',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[#E0DDD6]">
        <div
          className="flex items-center gap-2 bg-[#F7F5F0] rounded-full px-4 py-2 transition-all duration-200"
          style={{
            boxShadow: inputFocused ? '0 0 0 2px rgba(26,26,26,0.15), 0 4px 12px rgba(0,0,0,0.06)' : 'none',
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
            placeholder="Chat to refine..."
            className="flex-1 bg-transparent outline-none text-sm text-[#1A1A1A] placeholder-[#9B9B9B]"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: input.trim() && !isTyping ? '#1A1A1A' : '#E0DDD6',
              color: input.trim() && !isTyping ? 'white' : '#9B9B9B',
              transform: input.trim() && !isTyping ? 'scale(1)' : 'scale(0.92)',
              boxShadow: input.trim() && !isTyping ? '0 4px 10px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
