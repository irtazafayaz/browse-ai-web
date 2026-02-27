'use client';
import { useState, useEffect } from 'react';
import { getBrands } from '@/lib/api';

export default function MarqueeBrands({ dark = false }: { dark?: boolean }) {
  const [brands, setBrands] = useState<string[]>([]);
  useEffect(() => { getBrands().then(setBrands).catch(() => {}); }, []);
  const doubled = [...brands, ...brands];
  return (
    <div className="overflow-hidden w-full">
      <div className="flex animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
        {doubled.map((brand, i) => (
          <span
            key={i}
            className={`font-bold text-sm tracking-widest uppercase mx-8 transition-opacity duration-300 ${
              dark ? 'text-[#555555] hover:text-[#CCCCCC]' : 'text-[#8B8B8B] hover:text-[#1A1A1A]'
            }`}
          >
            {brand}
            <span className={`ml-8 ${dark ? 'opacity-20' : 'opacity-30'}`}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
