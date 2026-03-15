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
            color: "#7A9E74",
            display: "inline-block",
            animation: visible
              ? "eyebrowIn 0.7s cubic-bezier(0.165,0.84,0.44,1) both"
              : "none",
            opacity: visible ? undefined : 0,
          }}
        >
          {eyebrow}
        </span>
      </div>
      <h2
        className="font-cormorant font-semibold leading-tight tracking-[-0.02em]"
        style={{
          fontSize: "clamp(2rem, 4vw, 3.2rem)",
          fontStyle: "italic",
          color: light ? "#ffffff" : "#0F0F0E",
        }}
      >
        {title.split(" ").map((word, i) => (
          <span key={i} className="clip-wrap">
            <span
              style={{
                display: "inline-block",
                animation: visible
                  ? `lineReveal 0.9s cubic-bezier(0.165,0.84,0.44,1) ${80 + i * 100}ms both`
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
