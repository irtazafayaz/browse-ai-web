'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Send } from 'lucide-react';
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
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
            <span className="text-4xl">👗</span>
            <p className="font-semibold text-[#1A1A1A] text-sm">Tell me what you're looking for</p>
            <p className="text-[#6B6B6B] text-xs leading-relaxed">Try "baggy jeans", "maroon pants",<br />or "wide leg cargo"</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}>
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
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">B</span>
            </div>
            <div className="bg-[#EEECEA] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#6B6B6B] animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Filter chips */}
      {filters.length > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto chat-scroll">
          {filters.map(chip => (
            <button
              key={chip.id}
              onClick={() => onToggleFilter(chip.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border ${
                chip.isSelected
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#1A1A1A] border-[#E0DDD6] hover:border-[#1A1A1A]'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[#E0DDD6]">
        <div className="flex items-center gap-2 bg-[#F7F5F0] rounded-full px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
            placeholder="Chat to refine..."
            className="flex-1 bg-transparent outline-none text-sm text-[#1A1A1A] placeholder-[#6B6B6B]"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ${
              input.trim() && !isTyping
                ? 'bg-[#1A1A1A] text-white hover:bg-[#333]'
                : 'bg-[#E0DDD6] text-[#6B6B6B]'
            }`}
          >
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
