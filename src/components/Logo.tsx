'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

const SCALE = { xs: 28, sm: 34, md: 42, lg: 54 };

export default function Logo({ size = 'md', onClick, className = '' }: LogoProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={onClick ?? (() => router.push('/'))}
      className={`inline-flex items-center transition-opacity duration-200 hover:opacity-80 active:opacity-60 ${className}`}
      aria-label="Browse AI — home"
    >
      <Image src="/vista-logo.svg" alt="Browse AI" width={SCALE[size]} height={SCALE[size]} priority />
    </button>
  );
}
