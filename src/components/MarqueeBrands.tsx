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
      className={`inline-flex items-center gap-3 font-bold text-sm tracking-widest uppercase mx-8 transition-opacity duration-300 ${
        dark ? 'text-[#555555] hover:text-[#CCCCCC]' : 'text-[#8B8B8B] hover:text-[#1A1A1A]'
      }`}
    >
      {/* Initials badge */}
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black shrink-0"
        style={{
          background: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
          color: dark ? '#888' : '#666',
          letterSpacing: 0,
        }}
      >
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
  return (
    <div className="overflow-hidden w-full">
      <div className="flex animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
        {doubled.map((brand, i) => (
          <BrandPill key={i} name={brand.name} dark={dark} />
        ))}
      </div>
    </div>
  );
}
