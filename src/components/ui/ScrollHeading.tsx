export default function ScrollHeading({
  eyebrow,
  title,
  light = false,
  visible,
}: {
  eyebrow: string;
  title: string;
  light?: boolean;
  visible: boolean;
}) {
  return (
    <div className="mb-12 text-center">
      <div className="overflow-hidden mb-3">
        <span
          className="text-[10px] font-black tracking-[0.28em] uppercase"
          style={{
            color: "var(--accent)",
            display: "inline-block",
            animation: visible
              ? "eyebrowIn 0.5s cubic-bezier(0.4,0,0.2,1) both"
              : "none",
            opacity: visible ? undefined : 0,
          }}
        >
          {eyebrow}
        </span>
      </div>
      <h2
        className="font-display leading-tight tracking-[-0.02em]"
        style={{
          fontSize: "clamp(2rem, 4vw, 3.2rem)",
          color: light ? "var(--surface)" : "var(--ink)",
        }}
      >
        {title.split(" ").map((word, i) => (
          <span key={i} className="clip-wrap">
            <span
              style={{
                display: "inline-block",
                animation: visible
                  ? `lineReveal 0.6s cubic-bezier(0.4,0,0.2,1) ${80 + i * 100}ms both`
                  : "none",
                opacity: visible ? undefined : 0,
              }}
            >
              {word}
              {i < title.split(" ").length - 1 ? "\u00A0" : ""}
            </span>
          </span>
        ))}
      </h2>
    </div>
  );
}
