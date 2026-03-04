'use client';
import { useRouter } from 'next/navigation';

interface LogoProps {
  /** Controls icon + text size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Light mode (cream/dark bg) vs dark mode (dark bg → light text) */
  dark?: boolean;
  /** Hide the text wordmark — just the icon mark */
  markOnly?: boolean;
  /** Override the default navigate-home click */
  onClick?: () => void;
  className?: string;
}

const SCALE = {
  xs: { mark: 18, text: 'text-[10px]',  gap: 'gap-1.5', ls: '-0.02em' },
  sm: { mark: 22, text: 'text-[12px]',  gap: 'gap-1.5', ls: '-0.02em' },
  md: { mark: 30, text: 'text-[15px]',  gap: 'gap-2',   ls: '-0.025em' },
  lg: { mark: 40, text: 'text-[20px]',  gap: 'gap-2.5', ls: '-0.03em' },
};

/* ─────────────────────────────────────────────────────────────
   SVG mark — two-column masonry product grid with an amber
   AI accent dot in the upper-right of the icon.

   ViewBox 36 × 36:
     Left col:  tall tile (5,5  11×16)  + short tile (5,24  11×7)
     Right col: short tile (20,5 11×8) + tall tile  (20,17 11×14)
     Amber dot: cx=28 cy=8 r=3  (overlapping right-short tile → "hot" accent)
───────────────────────────────────────────────────────────────── */
function Mark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background */}
      <rect width="36" height="36" rx="8" fill="#1A1A1A" />

      {/* Left column — tall then short */}
      <rect x="5"  y="5"  width="11" height="16" rx="2.5" fill="white" fillOpacity="0.92" />
      <rect x="5"  y="24" width="11" height="7"  rx="2.5" fill="white" fillOpacity="0.40" />

      {/* Right column — short then tall */}
      <rect x="20" y="5"  width="11" height="8"  rx="2.5" fill="white" fillOpacity="0.50" />
      <rect x="20" y="17" width="11" height="14" rx="2.5" fill="white" fillOpacity="0.82" />

      {/* Amber AI accent dot */}
      <circle cx="28" cy="8" r="3.8" fill="#C4A882" />
    </svg>
  );
}

export default function Logo({
  size = 'md',
  dark = false,
  markOnly = false,
  onClick,
  className = '',
}: LogoProps) {
  const router = useRouter();
  const { mark, text, gap, ls } = SCALE[size];
  const textColor = dark ? 'rgba(255,255,255,0.92)' : '#1A1A1A';

  return (
    <button
      type="button"
      onClick={onClick ?? (() => router.push('/'))}
      className={`inline-flex items-center ${gap} transition-opacity duration-200 hover:opacity-80 active:opacity-60 ${className}`}
      aria-label="Browse AI — home"
    >
      <Mark size={mark} />

      {!markOnly && (
        <span
          className={`font-black leading-none ${text}`}
          style={{ color: textColor, letterSpacing: ls }}
        >
          Browse{' '}
          <span style={{ color: '#C4A882' }}>AI</span>
        </span>
      )}
    </button>
  );
}
