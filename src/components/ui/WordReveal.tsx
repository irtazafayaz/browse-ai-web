export default function WordReveal({
  text,
  baseDelay = 0,
  className = "",
}: {
  text: string;
  baseDelay?: number;
  className?: string;
}) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i} className="clip-wrap">
          <span
            className={`word-reveal ${className}`}
            style={{ animationDelay: `${baseDelay + i * 85}ms` }}
          >
            {word}
            {i < text.split(" ").length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </>
  );
}
