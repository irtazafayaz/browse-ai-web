'use client';

/* The 10 curated Pakistani fashion brands */
export const BRAND_LIST = [
  { name: 'Sana Safinaz',     domain: 'sanasafinaz.com',      url: 'https://sanasafinaz.com' },
  { name: 'Alkaram Studio',   domain: 'alkaramstudio.com',    url: 'https://alkaramstudio.com' },
  { name: 'Gul Ahmed',        domain: 'gulahmedshop.com',     url: 'https://gulahmedshop.com' },
  { name: 'Nishat Linen',     domain: 'nishatlinen.com',      url: 'https://nishatlinen.com' },
  { name: 'Maria B',          domain: 'mariab.pk',            url: 'https://mariab.pk' },
  { name: 'Limelight',        domain: 'limelight.pk',         url: 'https://limelight.pk' },
  { name: 'Generation',       domain: 'generation.com.pk',    url: 'https://generation.com.pk' },
  { name: 'Bonanza Satrangi', domain: 'bonanzasatrangi.com',  url: 'https://bonanzasatrangi.com' },
  { name: 'ONE',              domain: 'beoneshopone.com',     url: 'https://beoneshopone.com' },
  { name: 'Engine',           domain: 'engine.com.pk',        url: 'https://engine.com.pk' },
];

/* Single brand pill — text-only, no external logo requests */
function BrandPill({ name, dark }: { name: string; dark: boolean }) {
  return (
    <span
      className={`font-mono-brutal inline-flex items-center gap-3 font-bold text-sm tracking-widest uppercase mx-8 transition-opacity duration-150 ${
        dark ? 'text-[var(--ink-muted)] opacity-70 hover:opacity-100' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
      }`}
    >
      {/* Initials badge */}
      <span className="tag-brutal shrink-0">
        {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
      </span>

      {name}

      {/* Divider star */}
      <span className={dark ? 'opacity-20' : 'opacity-25'}>✦</span>
    </span>
  );
}

export default function MarqueeBrands({ dark = false }: { dark?: boolean }) {
  const doubled = [...BRAND_LIST, ...BRAND_LIST];
  const borderColor = dark ? 'var(--surface)' : 'var(--ink)';
  return (
    <div
      className="overflow-hidden w-full"
      style={{ borderTop: `3px solid ${borderColor}`, borderBottom: `3px solid ${borderColor}` }}
    >
      <div className="flex animate-marquee whitespace-nowrap py-2" style={{ width: 'max-content' }}>
        {doubled.map((brand, i) => (
          <BrandPill key={i} name={brand.name} dark={dark} />
        ))}
      </div>
    </div>
  );
}
