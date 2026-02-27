import { brands } from '@/lib/mockData';

export default function MarqueeBrands() {
  const doubled = [...brands, ...brands];
  return (
    <div className="overflow-hidden w-full">
      <div className="flex animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
        {doubled.map((brand, i) => (
          <span key={i} className="text-[#6B6B6B] font-semibold text-sm tracking-wide mx-6">
            {brand}
            <span className="ml-6 opacity-40">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
