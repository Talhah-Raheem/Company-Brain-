"use client";

/**
 * Stylized coral/anemone section divider.
 * A thin hairline rule with a small branching coral silhouette centered on top.
 * Drop between page sections to break rhythm without adding heavy chrome.
 */
export default function CoralDivider({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center w-full my-10 ${className}`}
      aria-hidden={!label}
    >
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-foam/18 to-foam/12" />

      <div className="flex items-center gap-3 px-4">
        <Coral />
        {label ? (
          <span className="eyebrow text-foam/45 whitespace-nowrap">{label}</span>
        ) : null}
        <Coral mirrored />
      </div>

      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-foam/18 to-foam/12" />
    </div>
  );
}

function Coral({ mirrored }: { mirrored?: boolean }) {
  return (
    <svg
      width="42"
      height="28"
      viewBox="0 0 42 28"
      aria-hidden
      style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
    >
      {/* base rock */}
      <ellipse cx="21" cy="26" rx="14" ry="2" fill="rgba(125, 211, 252, 0.18)" />
      {/* branches — scientific line-art style */}
      <g
        stroke="rgba(125, 211, 252, 0.75)"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M 21 26 L 21 14 L 17 8" />
        <path d="M 21 14 L 26 10 L 29 5" />
        <path d="M 17 8 L 14 5" />
        <path d="M 17 8 L 20 4" />
        <path d="M 26 10 L 24 6" />
        <path d="M 14 26 L 12 20 L 9 16" />
        <path d="M 12 20 L 15 17" />
        <path d="M 28 26 L 30 20 L 33 17" />
        <path d="M 30 20 L 27 17" />
      </g>
      {/* polyp dots */}
      <g fill="rgba(186, 230, 253, 0.85)">
        <circle cx="17" cy="8" r="1.2" />
        <circle cx="29" cy="5" r="1.1" />
        <circle cx="14" cy="5" r="1" />
        <circle cx="20" cy="4" r="1" />
        <circle cx="9" cy="16" r="1" />
        <circle cx="33" cy="17" r="1.1" />
      </g>
    </svg>
  );
}
