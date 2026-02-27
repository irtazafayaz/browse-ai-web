'use client';
import { useState } from 'react';

export default function GenderToggle() {
  const [selected, setSelected] = useState(0);
  return (
    <div className="flex p-1 rounded-full gap-1" style={{ background: '#ECE9E3' }}>
      {['Womens', 'Mens'].map((label, i) => (
        <button
          key={label}
          onClick={() => setSelected(i)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            selected === i
              ? 'bg-[#1A1A1A] text-white shadow-md'
              : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
