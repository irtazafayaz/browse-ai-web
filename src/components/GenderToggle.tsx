'use client';
import { useState } from 'react';

export default function GenderToggle() {
  const [selected, setSelected] = useState(0);
  return (
    <div
      className="inline-flex border-brutal-thin"
      style={{ background: 'var(--surface)' }}
    >
      {['Womens', 'Mens'].map((label, i) => (
        <button
          key={label}
          onClick={() => setSelected(i)}
          className="px-5 py-2 text-sm font-semibold uppercase tracking-wide transition-colors duration-150"
          style={{
            background: selected === i ? 'var(--ink)' : 'var(--surface)',
            color: selected === i ? 'var(--surface)' : 'var(--ink)',
            borderLeft: i === 1 ? '2px solid var(--ink)' : undefined,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
