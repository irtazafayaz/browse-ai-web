export default function CharReveal({
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
      {text.split("").map((char, i) =>
        char === " " ? (
          <span key={i} style={{ display: "inline-block", width: "0.26em" }} />
        ) : (
          <span key={i} className="clip-wrap">
            <span
              className={`char-reveal ${className}`}
              style={{ animationDelay: `${baseDelay + i * 32}ms` }}
            >
              {char}
            </span>
          </span>
        )
      )}
    </>
  );
}
